// Lint a ticket breakdown before it is published: file names, header lines, ids, blocking edges,
// Files and Proof lines, requirement codes, open points and coverage. Prints one line per problem; exits 1 when there is any.
//
//   node check-tickets.mts [tickets dir] [--epic <slug>] [--spec <spec-index.md>] [--covers R1.1,R1.2]
//
// Defaults: tickets dir `.work/tickets`, spec `.work/spec-index.md` when it exists. Problems are reported for the
// named epic only, or, with no epic, for every folder but `tracked/` and `external/`. Exit 0 means no problem.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Ticket = {
  id: string;
  nn: number | undefined;
  file: string;
  epic: string;
  type: string;
  status: string;
  requirements: string[];
  blockedBy: string[];
  criteria: number;
};

export type Options = { epic?: string; spec?: string; covers?: string[] };

const HEADERS = ['Type', 'Parent', 'Requirements', 'Blocked by', 'Status', 'New infrastructure'];
// Every ticket that builds something says where it lands and what shows it done.
const WORK_HEADERS = ['Files', 'Proof'];
const TYPES = new Set(['feature', 'task', 'bug', 'spike']);
const STATUSES = new Set(['ready', 'in-progress', 'in-review', 'done', 'dropped']);
const ID = /[A-Za-z][A-Za-z0-9]*-\d+/;
const FILE = new RegExp(`^(?:(\\d{2})-)?(${ID.source})-[a-z0-9-]+\\.md$`);
const IDS = new RegExp(`${ID.source}|#\\d+`, 'g');
const NONE = /^none\b/i;

const header = (text: string, name: string): string | undefined =>
  text.match(new RegExp(`^\\*\\*${name}:\\*\\*[ \\t]*(.*)$`, 'm'))?.[1].trim();

// Codes split on commas or spaces; a parenthesised note like "(partial)" is dropped. Every other token is
// kept, so a mistyped code is reported as not in the spec index instead of vanishing.
const codes = (value: string | undefined): string[] =>
  !value || NONE.test(value) ? [] : value.replace(/\([^)]*\)/g, ' ').split(/[,\s]+/).filter(Boolean);

// The first marker in a status cell decides it, so "✅ D-3 (was ⚠️)" counts as decided.
const marker = (status: string): string | undefined => status.match(/✅|⚠️|❌/)?.[0];

// Requirement code to its status cell, from every table row of the spec index whose first cell is a code.
export const readSpec = (text: string): Map<string, string> => {
  const spec = new Map<string, string>();
  for (const line of text.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2 || cells[0] === 'ID' || /^-+$/.test(cells[0]) || /\s/.test(cells[0])) continue;
    spec.set(cells[0], cells[cells.length - 1]);
  }
  return spec;
};

// Folders `implement-ticket` writes for tickets from elsewhere; their names follow the other tracker.
const OUTSIDE = new Set(['tracked', 'external']);

// Which folders get problems reported: the epic when one is named, else every folder but OUTSIDE.
// Tickets elsewhere are still read, so blockers that point at them resolve.
export const inScopeDir = (epic: string | undefined) => (relDir: string): boolean =>
  epic ? relDir === epic : !OUTSIDE.has(relDir.split(/[\\/]/)[0]);

export const readTickets = (dir: string, inScope: (relDir: string) => boolean = () => true): { tickets: Ticket[]; problems: string[] } => {
  const tickets: Ticket[] = [];
  const problems: string[] = [];
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((p) => p.endsWith('.md') && statSync(join(dir, p)).isFile())
    .sort();
  for (const rel of files) {
    const file = join(dir, rel);
    const name = basename(rel);
    const m = name.match(FILE);
    const report = inScope(dirname(rel));
    if (!m) {
      if (report) problems.push(`${file}: file name is not <NN>-<ID>-<slug>.md`);
      continue;
    }
    const text = readFileSync(file, 'utf8');
    const blockedBy = header(text, 'Blocked by') ?? '';
    const t: Ticket = {
      id: m[2],
      nn: m[1] === undefined ? undefined : Number(m[1]),
      file,
      epic: dirname(rel),
      type: header(text, 'Type') ?? '',
      status: (header(text, 'Status') ?? '').split(/\s+/)[0],
      requirements: codes(header(text, 'Requirements')),
      blockedBy: NONE.test(blockedBy) ? [] : blockedBy.match(IDS) ?? [],
      // Acceptance criteria sit above the first `## ` section; checkboxes in `## Test plan` do not count.
      criteria: (text.split(/^## /m)[0].match(/^\s*- \[[ xX]\]/gm) ?? []).length,
    };
    tickets.push(t);
    if (!report) continue;
    const title = text.match(/^# (\S+?):/m)?.[1];
    if (title !== t.id) problems.push(`${file}: title line is not "# ${t.id}: <title>"`);
    for (const h of HEADERS) if (header(text, h) === undefined) problems.push(`${file}: missing **${h}:** line`);
    if (t.type !== 'spike')
      for (const h of WORK_HEADERS) if (!header(text, h)) problems.push(`${file}: missing or empty **${h}:** line`);
    if (!TYPES.has(t.type)) problems.push(`${file}: Type "${t.type}" is not feature, task, bug or spike`);
    if (!STATUSES.has(t.status)) problems.push(`${file}: Status "${t.status}" is not ready, in-progress, in-review, done or dropped`);
    if (t.type !== 'spike' && t.criteria === 0) problems.push(`${file}: no acceptance criterion (- [ ] line)`);
  }
  return { tickets, problems };
};

export const checkTickets = (dir: string, opts: Options = {}): string[] => {
  const scopeDir = inScopeDir(opts.epic);
  const inScope = (t: Ticket): boolean => scopeDir(t.epic);
  const { tickets, problems } = readTickets(dir, scopeDir);
  const byId = new Map<string, Ticket>();
  for (const t of tickets) {
    const seen = byId.get(t.id);
    if (seen && (inScope(t) || inScope(seen))) problems.push(`${t.file}: id ${t.id} is also used by ${seen.file}`);
    else if (!seen) byId.set(t.id, t);
  }
  const byNn = new Map<string, Ticket>();
  for (const t of tickets.filter((t) => t.nn !== undefined && scopeDir(t.epic))) {
    const key = `${t.epic}/${t.nn}`;
    const seen = byNn.get(key);
    if (seen) problems.push(`${t.file}: number ${String(t.nn).padStart(2, '0')} is also used by ${seen.file}`);
    else byNn.set(key, t);
  }
  const spec = opts.spec && existsSync(opts.spec) ? readSpec(readFileSync(opts.spec, 'utf8')) : undefined;
  const live = (t: Ticket): boolean => t.status !== 'dropped';

  // Every ticket reachable through Blocked by, for the spike check.
  const blockers = (t: Ticket, seen = new Set<string>()): Set<string> => {
    for (const b of t.blockedBy) {
      if (seen.has(b)) continue;
      seen.add(b);
      const bt = byId.get(b);
      if (bt) blockers(bt, seen);
    }
    return seen;
  };

  for (const t of tickets.filter(inScope)) {
    for (const b of t.blockedBy) {
      if (b.startsWith('#')) continue;
      const bt = byId.get(b);
      if (b === t.id) problems.push(`${t.file}: blocked by itself`);
      else if (!bt) problems.push(`${t.file}: blocked by ${b}, which has no ticket file`);
      else if (live(t) && !live(bt)) problems.push(`${t.file}: blocked by ${b}, which is dropped`);
      else if (bt.epic === t.epic && bt.nn !== undefined && t.nn !== undefined && bt.nn >= t.nn)
        problems.push(`${t.file}: blocked by ${b}, which is numbered after it (blockers first)`);
    }
    if (!spec || !live(t)) continue;
    for (const c of t.requirements) {
      const status = spec.get(c);
      if (status === undefined) problems.push(`${t.file}: requirement ${c} is not in the spec index`);
      else if (t.type !== 'spike' && marker(status) === '⚠️') {
        // A `#n` blocker lives on another tracker; it may be the spike, so it is not reported.
        const spike = [...blockers(t)].some((b) => b.startsWith('#') || byId.get(b)?.type === 'spike');
        if (!spike) problems.push(`${t.file}: needs open requirement ${c} (${status}) but no spike blocks it`);
      } else if (t.type !== 'spike' && marker(status) === '❌' && !t.blockedBy.length) {
        // An outside party cannot be answered by a spike, but the wait must still show as a blocker.
        problems.push(`${t.file}: needs blocked requirement ${c} (${status}) but nothing blocks it`);
      }
    }
  }

  // Blocking cycles, reported once each.
  const state = new Map<string, 'open' | 'done'>();
  const reported = new Set<string>();
  const walk = (t: Ticket, path: string[]): void => {
    state.set(t.id, 'open');
    for (const b of t.blockedBy) {
      const bt = byId.get(b);
      if (!bt) continue;
      if (state.get(b) === 'open') {
        const cycle = [...path.slice(path.indexOf(b)), b];
        const key = [...cycle].sort().join();
        if (!reported.has(key) && cycle.some((id) => inScope(byId.get(id)!))) {
          reported.add(key);
          problems.push(`${t.file}: blocking cycle ${cycle.join(' -> ')}`);
        }
      } else if (!state.has(b)) walk(bt, [...path, b]);
    }
    state.set(t.id, 'done');
  };
  for (const t of tickets) if (!state.has(t.id)) walk(t, [t.id]);

  for (const c of opts.covers ?? []) {
    if (!tickets.some((t) => inScope(t) && live(t) && t.requirements.includes(c)))
      problems.push(`${opts.epic ? join(dir, opts.epic) : dir}: requirement ${c} has no ticket`);
  }
  return problems;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const i = args.indexOf(name);
    return i === -1 ? undefined : args.splice(i, 2)[1];
  };
  const epic = flag('--epic');
  const covers = flag('--covers')?.split(',').map((c) => c.trim()).filter(Boolean);
  const given = flag('--spec');
  if (given && !existsSync(given)) {
    console.error(`check-tickets: spec index ${given} does not exist`);
    process.exit(1);
  }
  const spec = given ?? '.work/spec-index.md';
  const dir = args[0] ?? '.work/tickets';
  if (!existsSync(dir)) {
    console.error(`check-tickets: ${dir} does not exist`);
    process.exit(1);
  }
  const problems = checkTickets(dir, { epic, spec, covers });
  if (problems.length) {
    console.log(`check-tickets: ${problems.length} problem(s)`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
  console.log(`check-tickets: ${epic ? `epic ${epic}` : dir} agrees with the ticket rules`);
}
