import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { openStore } from '../store.ts';
import type { Store } from '../store.ts';

const mk = (): Store =>  openStore({ id: 'test', slug: 'test', root: '/tmp/x', identity: 'path', dbPath: join(mkdtempSync(join(tmpdir(), 'memo-')), 't.db') });

test('issue → attempt → fix links and resolves', () => {
  const s = mk();
  const i = s.post({ type: 'issue', title: 'Login 500 on empty password', body: 'TypeError: cannot read length', signature: 'login-empty-pw', epic: 'auth', ticket: 'EC-7', tags: ['auth'] });
  assert.equal(i.code, 'I-1');
  const a = s.post({ type: 'attempt', title: 'Guard in controller', issue: 'I-1', outcome: 'failed' });
  assert.equal(a.code, 'A-1');
  const f = s.post({ type: 'fix', title: 'Validate in schema', issue: 'I-1', attempt: 'A-1', status: 'confirmed', pr_ref: '#12' });
  assert.equal(f.code, 'F-1');
  const g = s.get('I-1');
  assert.equal(g.status, 'resolved');
  assert.equal(g.attempts[0].code, 'A-1');
  assert.equal(g.fixes[0].status, 'confirmed');
  assert.equal(s.get('F-1').issue, 'I-1');
});

test('issue signature dedups and reopens', () => {
  const s = mk();
  s.post({ type: 'issue', title: 'x', signature: 'sig' });
  s.post({ type: 'fix', title: 'y', issue: 'I-1', status: 'confirmed' });
  const again = s.post({ type: 'issue', title: 'x', signature: 'sig' });
  assert.deepEqual(again, { code: 'I-1', deduped: true, reopened: true });
  const g = s.get('I-1');
  assert.equal(g.occurrences, 2);
  assert.equal(g.status, 'open');
});

test('decision supersede hides old one from callback', () => {
  const s = mk();
  s.post({ type: 'decision', title: 'Use REST', rationale: 'simple', alternatives: ['GraphQL'] });
  s.post({ type: 'decision', title: 'Use GraphQL', rationale: 'clients', supersedes: 'D-1' });
  assert.equal(s.get('D-1').status, 'superseded');
  assert.equal(s.get('D-1').superseded_by[0], 'D-2');
  const r = s.callback({ query: 'REST GraphQL' });
  assert.deepEqual(r.results.map((x) => x.code), ['D-2']);
  assert.equal(s.callback({ query: 'REST', include_inactive: true }).count, 1);
});

test('full-text: ranking, prefix, diacritics, OR fallback, filters', () => {
  const s = mk();
  s.post({ type: 'note', kind: 'gotcha', title: 'Timezone bug in báo cáo', body: 'Dùng UTC khi lưu', ticket: 'EC-9', tags: ['date'], refs: [{ kind: 'file', value: 'src/report/date.ts' }] });
  s.post({ type: 'note', title: 'Unrelated', body: 'nothing here' });
  assert.equal(s.callback({ query: 'bao cao utc' }).results[0].code, 'N-1');
  assert.equal(s.callback({ query: 'timez' }).count, 1);
  assert.equal(s.callback({ query: 'timezone zzzz' }).count, 1);
  assert.equal(s.callback({ ticket: 'EC-9' }).count, 1);
  assert.equal(s.callback({ tags: ['date'] }).count, 1);
  assert.equal(s.callback({ file: 'report/date' }).count, 1);
  assert.equal(s.callback({ query: '"; DROP TABLE memos; --' }).count, 0);
});

test('update appends and validates', () => {
  const s = mk();
  s.post({ type: 'note', title: 'a', body: 'one' });
  s.post({ code: 'N-1', body: 'two', append: true, status: 'stale' });
  assert.equal(s.get('N-1').body, 'one\n\ntwo');
  assert.equal(s.get('N-1').status, 'stale');
  assert.throws(() => s.post({ type: 'note', title: 'b', kind: 'bogus' }), /kind must be/);
  assert.throws(() => s.post({ type: 'attempt', title: 'b', issue: 'I-9' }), /No memo/);
  assert.throws(() => s.post({ type: 'attempt', title: 'b', issue: 'N-1' }), /expected issue/);
});

test('info lists epics and tickets; speed on 20k rows', () => {
  const s = mk();
  s.tx(() => { for (let i = 0; i < 20000; i++) s.post({ type: 'note', title: `note ${i} cache`, body: `body ${i} lorem ipsum ${i % 97}`, ticket: `T-${i % 50}`, epic: `E-${i % 5}` }); });
  const t0 = performance.now();
  for (let i = 0; i < 50; i++) s.callback({ query: 'lorem 42', limit: 10 });
  const per = (performance.now() - t0) / 50;
  assert.ok(per < 25, `callback ${per.toFixed(1)}ms`);
  const info = s.info();
  assert.equal(info.counts.note, 20000);
  assert.equal(info.epics.length, 5);
});

test('stdio server speaks MCP', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'memo-srv-'));
  const p = spawn(process.execPath, [new URL('../server.ts', import.meta.url).pathname], { env: { ...process.env, MEMO_DB: join(dir, 's.db') }, cwd: dir });
  const lines: any[] = []; let buf = '';
  p.stdout.on('data', (d: Buffer) => { buf += d; let i: number; while ((i = buf.indexOf('\n')) >= 0) { lines.push(JSON.parse(buf.slice(0, i))); buf = buf.slice(i + 1); } });
  const call = (id: number, method: string, params?: object) => p.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  const wait = async (n: number) => { for (let i = 0; i < 100 && lines.length < n; i++) await new Promise((r) => setTimeout(r, 50)); };
  call(1, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '0' } });
  p.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized"}\n');
  call(2, 'tools/list');
  call(3, 'tools/call', { name: 'memo_post', arguments: { type: 'note', title: 'hello', body: 'world' } });
  call(4, 'tools/call', { name: 'memo_callback', arguments: { query: 'hello' } });
  call(5, 'tools/call', { name: 'memo_get', arguments: { code: 'X-1' } });
  await wait(5);
  p.stdin.end();
  assert.equal(lines[0].result.serverInfo.name, 'memo');
  assert.deepEqual(lines[1].result.tools.map((t: { name: string }) => t.name), ['memo_post', 'memo_callback', 'memo_get', 'memo_info']);
  assert.equal(JSON.parse(lines[2].result.content[0].text).code, 'N-1');
  assert.equal(JSON.parse(lines[3].result.content[0].text).count, 1);
  assert.equal(lines[4].result.isError, true);
});
