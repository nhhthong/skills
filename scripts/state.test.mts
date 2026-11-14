import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { brief, openIssues, overview, readNotes, readRequirements, section } from '../skills/session-progress/state.mts';

type T = { id: string; nn: string; epic?: string; type?: string; status?: string; req?: string; blocked?: string; ticked?: boolean; result?: string };

const ticket = (t: T): string => `# ${t.id}: Title of ${t.id}

**Type:** ${t.type ?? 'feature'}
**Parent:** ${t.epic ?? 'sync'}
**Requirements:** ${t.req ?? 'none'}
**Blocked by:** ${t.blocked ?? 'None (can start immediately)'}
**Status:** ${t.status ?? 'ready'}
**New infrastructure:** none
**Files:** src/sync.ts
**Proof:** npm test passes
**Step:** build

**What to build:** the behaviour of ${t.id}.

- [${t.ticked ? 'x' : ' '}] It works
- [ ] It keeps working

## Test plan

- [ ] not a criterion

## Result
${t.result ?? ''}
`;

const SPEC = `# Demo: spec index

## Requirements
| ID | Where in the source | Status |
|---|---|---|
| R1.1 | Phase 1, "Receive" | ✅ |
| R1.2 | Phase 1, "Dedupe" | ✅ D-1 (was ⚠️ O-1) |
| R1.3 | Phase 1, "Export" | ✅ |
| R2.1 | Phase 2, "Limit" | ⚠️ O-2 |

## Epics
| Epic | Requirements | Status |
|---|---|---|
| sync | R1.1 R1.2 | cut |

## Open points
- ✅ O-1: settled by D-1.
- ⚠️ O-2: the limit. Owed by product.
`;

const NOTES = `# Notes
D-1 | 2026-01-01 | decision | T-2, R1.2 | Dedupe by id: simplest. Rejected: hash.
I-1 | 2026-01-02 | issue | T-1 | ECONNRESET :: flaky port
F-1 | 2026-01-02 | fix | T-1 | for I-1: new port per test (unconfirmed)
I-2 | 2026-01-03 | issue | T-2 | database is locked :: second writer
F-1 | 2026-01-04 | fix | T-1 | for I-1: new port per test (confirmed)
N-1 | 2026-01-04 | note | gotcha | use a quoted glob with node --test
N-2 | 2026-01-05 | note | T-12 | belongs to another ticket
`;

const repo = (tickets: T[]): string => {
  const root = mkdtempSync(join(tmpdir(), 'state-'));
  const work = join(root, '.work');
  mkdirSync(join(root, 'docs/agents'), { recursive: true });
  writeFileSync(join(root, 'docs/agents/workflow.md'), '- **Mode**: `empowerment`. x\n- **Storage**: `in-repo`\n- **Delivery**: `commit`\n');
  for (const t of tickets) {
    const dir = join(work, 'tickets', t.epic ?? 'sync');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${t.nn}-${t.id}-slug.md`), ticket(t));
  }
  writeFileSync(join(work, 'spec-index.md'), SPEC);
  writeFileSync(join(work, 'notes.md'), NOTES);
  return work;
};

test('notes: the last line with an id is its state, and a confirmed fix closes its issue', () => {
  const notes = readNotes(NOTES);
  assert.equal(notes.filter((n) => n.id === 'F-1').length, 1);
  assert.match(notes.find((n) => n.id === 'F-1')!.text, /\(confirmed\)/);
  assert.deepEqual(openIssues(notes).map((n) => n.id), ['I-2']);
});

test('requirements come from the requirement table only, and a section stops at the next heading', () => {
  assert.deepEqual(readRequirements(SPEC).map((r) => r.code), ['R1.1', 'R1.2', 'R1.3', 'R2.1']);
  assert.equal(section(SPEC, 'Open points').split('\n').length, 2);
  assert.equal(section(SPEC, 'Missing'), '');
});

test('overview: counts, resume first, frontier, blocked, uncut and open requirements', () => {
  const work = repo([
    { id: 'T-1', nn: '01', status: 'done', req: 'R1.1', result: 'Verdict: VERIFIED' },
    { id: 'T-2', nn: '02', status: 'in-progress', req: 'R1.2', blocked: 'T-1' },
    { id: 'T-3', nn: '03', blocked: 'T-2' },
    { id: 'T-4', nn: '04' },
    { id: 'T-5', nn: '05', type: 'spike', status: 'waiting' },
  ]);
  const out = overview(work);
  assert.match(out, /Config: Mode empowerment · Delivery commit · Storage in-repo/);
  assert.match(out, /Tickets: 1 done, 1 in-progress, 2 ready, 1 waiting/);
  assert.match(out, /In progress:\n- T-2 Title of T-2 .* Step: build · 2\/2 criteria open/);
  assert.match(out, /Ready:\n- T-4 /);
  assert.match(out, /Blocked:\n- T-3 by T-2 \(in-progress\)/);
  assert.match(out, /Waiting on an outside answer:\n- T-5 /);
  assert.match(out, /Decided, no ticket yet: R1\.3\n/);
  assert.match(out, /Open requirements:\n- R2\.1 ⚠️ O-2/);
  assert.match(out, /Open points:\n- ⚠️ O-2/);
  assert.doesNotMatch(out, /O-1: settled/);
  assert.match(out, /Open issues:\n- I-2 /);
  assert.doesNotMatch(out, /Looks wrong/);
  assert.match(out, /Next: \/dev:implement-ticket T-2 \(resume at Step: build\)/);
});

test('overview: next is the frontier, then cutting, and a done ticket without a verdict looks wrong', () => {
  const ready = overview(repo([{ id: 'T-1', nn: '01', status: 'done', req: 'R1.1', result: 'NOT VERIFIED' }, { id: 'T-2', nn: '02' }]));
  assert.match(ready, /Next: \/dev:implement-ticket T-2\n?$/);
  assert.match(ready, /Looks wrong:\n- T-1 is done but its Result has no VERIFIED verdict/);
  const cut = overview(repo([{ id: 'T-1', nn: '01', status: 'done', req: 'R1.1', result: 'VERIFIED' }]));
  assert.match(cut, /Next: \/dev:plan-tickets/);
});

test('brief: the ticket, its blockers, open criteria, requirement lines and only the notes that bind it', () => {
  const work = repo([
    { id: 'T-1', nn: '01', status: 'done', req: 'R1.1', result: 'VERIFIED' },
    { id: 'T-2', nn: '02', status: 'in-progress', req: 'R1.2', blocked: 'T-1', ticked: true, result: 'ASK: order -> by id' },
  ]);
  const out = brief(work, 't-2')!;
  assert.match(out, /^# T-2: Title of T-2/);
  assert.match(out, /Blocked by: T-1 \(done\)/);
  assert.match(out, /Criteria \(1 open of 2\)/);
  assert.match(out, /- R1\.2 ✅ D-1 \(was ⚠️ O-1\): Phase 1, "Dedupe"/);
  assert.match(out, /Notes for this ticket:\n- D-1 .*\n- I-2 /);
  assert.match(out, /Repo facts:\n- N-1 /);
  assert.doesNotMatch(out, /N-2|I-1 /);
  assert.match(out, /Result so far:\nASK: order -> by id/);
  assert.equal(brief(work, 'T-99'), undefined);
});
