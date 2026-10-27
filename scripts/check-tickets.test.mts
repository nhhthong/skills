import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkTickets } from '../skills/plan-tickets/check-tickets.mts';

type T = { id: string; nn: string; type?: string; status?: string; req?: string; blocked?: string; criteria?: boolean };

const ticket = (t: T): string => `# ${t.id}: Title

**Type:** ${t.type ?? 'feature'}
**Parent:** E-1
**Requirements:** ${t.req ?? 'none'}
**Blocked by:** ${t.blocked ?? 'None (can start immediately)'}
**Status:** ${t.status ?? 'ready'}
**New infrastructure:** none
**Files:** src/sync.ts
**Proof:** npm test -- sync passes

**What to build:** something.

${t.criteria === false ? '' : '- [ ] It works'}
`;

const SPEC = `| ID | Where in the source | Status |
|---|---|---|
| R1.1 | Phase 1, "Receive" | ✅ |
| R1.2 | Phase 1, "Dedupe" | ⚠️ O-1 |
`;

const repo = (tickets: T[], epic = 'sync'): { dir: string; spec: string } => {
  const root = mkdtempSync(join(tmpdir(), 'tickets-'));
  const dir = join(root, 'tickets');
  mkdirSync(join(dir, epic), { recursive: true });
  for (const t of tickets) writeFileSync(join(dir, epic, `${t.nn}-${t.id}-title.md`), ticket(t));
  const spec = join(root, 'spec-index.md');
  writeFileSync(spec, SPEC);
  return { dir, spec };
};

const SCRIPT = new URL('../skills/plan-tickets/check-tickets.mts', import.meta.url).pathname;

const messages = (problems: string[]): string[] => problems.map((p) => p.slice(p.indexOf(': ') + 2)).sort();

test('a clean breakdown has no problem', () => {
  const { dir, spec } = repo([
    { id: 'T-1', nn: '01', type: 'spike', req: 'R1.2', criteria: false },
    { id: 'T-2', nn: '02', req: 'R1.1' },
    { id: 'T-3', nn: '03', req: 'R1.2', blocked: 'T-1, T-2' },
  ]);
  assert.deepEqual(checkTickets(dir, { spec, covers: ['R1.1', 'R1.2'] }), []);
});

test('unknown, dropped and late blockers', () => {
  const { dir } = repo([
    { id: 'T-1', nn: '01', blocked: 'T-2' },
    { id: 'T-2', nn: '02' },
    { id: 'T-3', nn: '03', status: 'dropped' },
    { id: 'T-4', nn: '04', blocked: 'T-3, T-9, #12' },
  ]);
  assert.deepEqual(messages(checkTickets(dir)), [
    'blocked by T-2, which is numbered after it (blockers first)',
    'blocked by T-3, which is dropped',
    'blocked by T-9, which has no ticket file',
  ]);
});

test('a blocking cycle is reported once', () => {
  const { dir } = repo([
    { id: 'T-1', nn: '01', blocked: 'T-3' },
    { id: 'T-2', nn: '02', blocked: 'T-1' },
    { id: 'T-3', nn: '03', blocked: 'T-2' },
  ]);
  const cycles = checkTickets(dir).filter((p) => p.includes('cycle'));
  assert.equal(cycles.length, 1);
});

test('open requirement without a spike, unknown code, and missing coverage', () => {
  const { dir, spec } = repo([
    { id: 'T-1', nn: '01', req: 'R1.2' },
    { id: 'T-2', nn: '02', req: 'R9.9' },
  ]);
  assert.deepEqual(messages(checkTickets(dir, { spec, covers: ['R1.1'] })), [
    'needs open requirement R1.2 (⚠️ O-1) but no spike blocks it',
    'requirement R1.1 has no ticket',
    'requirement R9.9 is not in the spec index',
  ]);
});

test('bad headers, type, status, criteria and file name', () => {
  const { dir } = repo([{ id: 'T-1', nn: '01', type: 'story', status: 'wip', criteria: false }]);
  writeFileSync(join(dir, 'sync', 'notes.md'), 'scratch');
  writeFileSync(join(dir, 'sync', '02-T-2-x.md'), '# T-2: No headers\n\n- [ ] one');
  assert.deepEqual(messages(checkTickets(dir)), [
    'Status "" is not ready, in-progress, in-review, done or dropped',
    'Status "wip" is not ready, in-progress, in-review, done or dropped',
    'Type "" is not feature, task, bug or spike',
    'Type "story" is not feature, task, bug or spike',
    'file name is not <NN>-<ID>-<slug>.md',
    'missing **Blocked by:** line',
    'missing **New infrastructure:** line',
    'missing **Parent:** line',
    'missing **Requirements:** line',
    'missing **Status:** line',
    'missing **Type:** line',
    'missing or empty **Files:** line',
    'missing or empty **Proof:** line',
    'no acceptance criterion (- [ ] line)',
  ]);
});

test('--epic limits the report to one epic and the CLI exits 1 on a problem', () => {
  const { dir } = repo([{ id: 'T-1', nn: '01', blocked: 'T-9' }]);
  mkdirSync(join(dir, 'other'));
  writeFileSync(join(dir, 'other', '01-T-5-x.md'), ticket({ id: 'T-5', nn: '01', blocked: 'T-8' }));
  assert.equal(checkTickets(dir, { epic: 'other' }).length, 1);
  const cli = spawnSync(process.execPath, [SCRIPT, dir, '--epic', 'sync'], { encoding: 'utf8' });
  assert.equal(cli.status, 1);
  assert.match(cli.stdout, /blocked by T-9/);
});

test('older epics and tickets from other trackers do not block a new epic', () => {
  const { dir, spec } = repo([{ id: 'T-2', nn: '01', req: 'R1.1', blocked: 'EC-1' }]);
  mkdirSync(join(dir, 'auth'));
  writeFileSync(join(dir, 'auth', '01-EC-1-login.md'), '# EC-1: Login\n\n**Type:** feature\n**Status:** done\n\n- [x] works\n');
  for (const [folder, name] of [['tracked', '123-flaky-ci.md'], ['external', 'PROJ-9-crash.md']]) {
    mkdirSync(join(dir, folder));
    writeFileSync(join(dir, folder, name), '# no headers at all\n');
  }
  assert.deepEqual(checkTickets(dir, { epic: 'sync', spec, covers: ['R1.1'] }), []);
  assert.deepEqual(messages(checkTickets(dir, { spec })).filter((m) => m.includes('123') || m.includes('PROJ-9')), []);
  assert.ok(checkTickets(dir).some((p) => p.includes('auth')), 'without --epic, older epics are still checked');
});

test('a --spec path that does not exist fails instead of skipping the checks', () => {
  const { dir } = repo([{ id: 'T-1', nn: '01' }]);
  const cli = spawnSync(process.execPath, [SCRIPT, dir, '--spec', join(dir, 'missing.md')], { encoding: 'utf8' });
  assert.equal(cli.status, 1);
  assert.match(cli.stderr, /does not exist/);
});
