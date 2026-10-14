import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { openStore } from '../store.ts';
import type { Store } from '../store.ts';
import { auditAll, auditMemo } from '../audit.ts';

const mk = (dbPath = join(mkdtempSync(join(tmpdir(), 'memo-')), 't.db')): Store =>
  openStore({ id: 'test', slug: 'test', root: '/tmp/x', identity: 'path', dbPath });
const checks = (s: Store, code: string): string[] => auditMemo(s.get(code)).map((f) => f.check).sort();
const clean = { epic: 'booking', epic_title: 'Booking', ticket: 'EC-7', ticket_title: 'Seat hold', tags: ['redis'], refs: [{ kind: 'file', value: 'hold.go' }] };

test('a complete memo has no finding and no warnings', () => {
  const s = mk();
  const r = s.post({ type: 'decision', title: 'Hold seats in Redis', rationale: 'atomic', alternatives: ['row lock'], ...clean });
  assert.equal(r.warnings, undefined);
  assert.deepEqual(checks(s, 'D-1'), []);
});

test('decision without rationale, and options only in the body', () => {
  const s = mk();
  const r = s.post({ type: 'decision', title: 'Healthcheck via pg_isready', body: 'Rejected: /healthz pinging the database.', ...clean });
  assert.deepEqual(checks(s, 'D-1'), ['no-alternatives', 'no-rationale']);
  assert.deepEqual(r.warnings.map((w: string) => w.split(':')[0]), ['no-rationale', 'no-alternatives']);
});

test('missing epic, tags and refs; a ticket without a title', () => {
  const s = mk();
  s.post({ type: 'note', title: 'Mailpit on 8025', ticket: 'EC-5' });
  assert.deepEqual(checks(s, 'N-1'), ['no-epic', 'no-refs', 'no-tags', 'no-title']);
});

test('attempt or fix without an issue, and a long body', () => {
  const s = mk();
  s.post({ type: 'fix', title: 'Release the key on error', body: 'x'.repeat(700), ...clean });
  s.post({ type: 'attempt', title: 'Retry the insert', outcome: 'failed', ...clean });
  assert.deepEqual(checks(s, 'F-1'), ['long-body', 'no-issue']);
  assert.deepEqual(checks(s, 'A-1'), ['no-issue']);
});

test('info findings are not returned as warnings', () => {
  const s = mk();
  const r = s.post({ type: 'note', title: 'x', epic: 'e', epic_title: 'E', tags: ['t'] });
  assert.equal(r.warnings, undefined);
  assert.deepEqual(checks(s, 'N-1'), ['no-refs']);
});

test('auditAll finds markup written before the check existed, skips stale memos', () => {
  const s = mk();
  s.post({ type: 'decision', title: 'Hold seats in Redis', rationale: 'atomic', alternatives: ['row lock'], ...clean });
  s.post({ type: 'note', title: 'old', status: 'stale', ...clean });
  // Simulate data stored by an older server.
  s.db.prepare('UPDATE decisions SET rationale=? WHERE memo_id=1').run('Atomic.</rationale>\n<parameter name="alternatives">["a"]');
  const all = auditAll(s);
  assert.deepEqual(all.map((f) => `${f.severity} ${f.code} ${f.check}`), ['error D-1 markup']);
});

test('cli audit prints findings and exits 1 on an error', () => {
  const dbPath = join(mkdtempSync(join(tmpdir(), 'memo-cli-')), 'c.db');
  const s = mk(dbPath);
  s.post({ type: 'decision', title: 'Use Redis', rationale: 'r', ...clean });
  s.db.prepare('UPDATE memos SET title=? WHERE id=1').run('Use Redis</title>');
  s.close();
  const cli = new URL('../cli.ts', import.meta.url).pathname;
  const run = (...args: string[]) => spawnSync(process.execPath, [cli, 'audit', ...args], { env: { ...process.env, MEMO_DB: dbPath }, encoding: 'utf8' });
  const text = run();
  assert.equal(text.status, 1);
  assert.match(text.stdout, /ERROR\s+D-1\s+markup/);
  assert.match(text.stdout, /1 error, 0 warnings, 0 info/);
  const json = JSON.parse(run('--json').stdout);
  assert.equal(json.findings[0].check, 'markup');
});
