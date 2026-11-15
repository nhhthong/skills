// Print where the work stands from `.work/`, so a new session loads it with one command instead of many reads.
//
//   node state.mts [work dir]                  the overview: config, git, epics, tickets, open points, next command
//   node state.mts [work dir] --ticket <ID>    the brief for one ticket: header, blockers, open criteria,
//                                              its requirement lines and the notes that bind it
//
// Default work dir: `.work`. Reads only; exits 1 when the work dir or the ticket is missing.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTickets, type Ticket } from '../plan-tickets/check-tickets.mts';

const NOTE_MAX = 320;
const OPEN = new Set(['ready', 'in-progress', 'in-review', 'waiting']);

const readIf = (path: string): string => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const header = (text: string, name: string): string =>
  text.match(new RegExp(`^\\*\\*${name}:\\*\\*[ \\t]*(.*)$`, 'm'))?.[1].trim() ?? '';
const title = (text: string): string => text.match(/^# \S+?:\s*(.*)$/m)?.[1].trim() ?? '';
const clip = (s: string, max = NOTE_MAX): string => (s.length > max ? `${s.slice(0, max)}…` : s);
const word = (s: string): RegExp => new RegExp(`(^|[^\\w.-])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-]|\\.\\d)`);

// The body of a `## <name>` section, without its heading.
export const section = (text: string, name: string): string => {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => new RegExp(`^## ${name}\\b`, 'i').test(l));
  if (start === -1) return '';
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n').trim();
};

export type Note = { id: string; date: string; kind: string; tags: string; text: string };

// Notes are append-only: the last line with an id is its current state.
export const readNotes = (text: string): Note[] => {
  const byId = new Map<string, Note>();
  for (const line of text.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 4 || !/^[A-Z]-\d+$/.test(cells[0])) continue;
    byId.delete(cells[0]);
    // A line one cell short (tags and text run together) is kept rather than hidden.
    const [tags, text] = cells.length === 4 ? ['', cells[3]] : [cells[3], cells.slice(4).join(' | ')];
    byId.set(cells[0], { id: cells[0], date: cells[1], kind: cells[2], tags, text });
  }
  return [...byId.values()];
};

const noteLine = (n: Note): string => clip(`${n.id} | ${n.kind} | ${n.tags} | ${n.text}`);

// An issue is open until a fix for it is confirmed.
export const openIssues = (notes: Note[]): Note[] =>
  notes.filter((n) => n.kind === 'issue' && !notes.some((f) => f.kind === 'fix' && word(n.id).test(f.text) && /\(confirmed\b/.test(f.text)));

type Row = { code: string; where: string; status: string };
export const readRequirements = (spec: string): Row[] => {
  const rows: Row[] = [];
  // Only the requirement and metric tables hold codes; an epics or infrastructure table does not.
  const tables = [section(spec, 'Requirements'), section(spec, 'Metrics')].join('\n').trim() || spec;
  for (const line of tables.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2 || cells[0] === 'ID' || /^-+$/.test(cells[0]) || /\s/.test(cells[0]) || !cells[0]) continue;
    rows.push({ code: cells[0], where: cells.slice(1, -1).join(' | '), status: cells[cells.length - 1] });
  }
  return rows;
};

const git = (cwd: string, ...args: string[]): string => {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

const config = (root: string, work: string): string => {
  const text = readIf(join(root, 'docs/agents/workflow.md')) || readIf(join(work, 'config.md'));
  if (!text) return 'Config: none found (run /dev:setup-repo)';
  const value = (name: string): string => text.match(new RegExp(`\\*\\*${name}\\*\\*:\\s*\`([^\`]+)\``))?.[1] ?? 'not set';
  return `Config: Mode ${value('Mode')} · Delivery ${value('Delivery')} · Storage ${value('Storage')}`;
};

// The first marker in a status cell decides it, so "✅ D-3 (was ⚠️)" counts as decided.
const marker = (status: string): string => status.match(/✅|⚠️|❌/)?.[0] ?? '';

const blockersOf = (t: Ticket, byId: Map<string, Ticket>): string[] =>
  t.blockedBy.filter((b) => !b.startsWith('#') && byId.get(b)?.status !== 'done' && byId.get(b)?.status !== 'dropped');

const label = (t: Ticket, root: string): string => `${t.id} ${title(readFileSync(t.file, 'utf8'))} (${relative(root, t.file)})`;

export const overview = (work: string): string => {
  const root = dirname(resolve(work));
  const out: string[] = [config(root, work)];
  const branch = git(root, 'rev-parse', '--abbrev-ref', 'HEAD');
  if (branch) {
    const dirty = git(root, 'status', '--short').split('\n').filter(Boolean);
    out.push(`Git: ${branch} · ${dirty.length} uncommitted${dirty.length ? ` (${dirty.slice(0, 4).map((l) => l.trim()).join(', ')}${dirty.length > 4 ? ', …' : ''})` : ''} · last ${git(root, 'log', '-1', '--format=%h %s') || 'no commit'}`);
  }

  const ticketsDir = join(work, 'tickets');
  const tickets = existsSync(ticketsDir) ? readTickets(ticketsDir).tickets : [];
  const byId = new Map(tickets.map((t) => [t.id, t]));
  const count = new Map<string, number>();
  for (const t of tickets) count.set(t.status, (count.get(t.status) ?? 0) + 1);
  out.push(`Tickets: ${tickets.length ? [...count].map(([s, n]) => `${n} ${s}`).join(', ') : 'none cut'}`);

  const spec = readIf(join(work, 'spec-index.md'));
  const epics = section(spec, 'Epics');
  if (epics) out.push('', 'Epics:', epics);

  const list = (name: string, rows: string[]): void => { if (rows.length) out.push('', `${name}:`, ...rows.map((r) => `- ${r}`)); };
  const active = tickets.filter((t) => t.status === 'in-progress' || t.status === 'in-review');
  list('In progress', active.map((t) => {
    const text = readFileSync(t.file, 'utf8');
    const open = (text.split(/^## /m)[0].match(/^\s*- \[ \]/gm) ?? []).length;
    return `${label(t, root)} · ${t.status} · Step: ${header(text, 'Step') || 'none'} · ${open}/${t.criteria} criteria open`;
  }));
  const ready = tickets.filter((t) => t.status === 'ready');
  const frontier = ready.filter((t) => blockersOf(t, byId).length === 0);
  list('Ready', frontier.map((t) => label(t, root)));
  list('Blocked', ready.filter((t) => blockersOf(t, byId).length).map((t) => `${t.id} by ${blockersOf(t, byId).map((b) => `${b} (${byId.get(b)?.status ?? 'no file'})`).join(', ')}`));
  list('Waiting on an outside answer', tickets.filter((t) => t.status === 'waiting').map((t) => label(t, root)));

  const rows = readRequirements(spec);
  const ticketed = new Set(tickets.filter((t) => t.status !== 'dropped').flatMap((t) => t.requirements));
  const uncut = rows.filter((r) => marker(r.status) === '✅' && !ticketed.has(r.code)).map((r) => r.code);
  if (uncut.length) out.push('', `Decided, no ticket yet: ${uncut.join(' ')}`);
  list('Open requirements', rows.filter((r) => marker(r.status) !== '✅' && marker(r.status) !== '').map((r) => `${r.code} ${r.status}: ${r.where}`));
  const points = section(spec, 'Open points').split('\n').filter((l) => /⚠️|❌/.test(l)).map((l) => l.replace(/^[-*]\s*/, ''));
  list('Open points', points);

  const notes = readNotes(readIf(join(work, 'notes.md')));
  list('Open issues', openIssues(notes).map(noteLine));
  list('Last notes', notes.slice(-5).map(noteLine));

  const wrong: string[] = [];
  if (active.length > 1) wrong.push(`${active.length} tickets are in progress at once: ${active.map((t) => t.id).join(', ')}`);
  for (const t of tickets) {
    if (t.status === 'done') {
      const open = t.blockedBy.filter((b) => OPEN.has(byId.get(b)?.status ?? ''));
      if (open.length) wrong.push(`${t.id} is done but its blocker ${open.join(', ')} is not`);
      const text = readFileSync(t.file, 'utf8');
      if (t.type !== 'spike' && !/\bVERIFIED\b/.test(text.slice(Math.max(0, text.search(/^## Result/m))).replace(/NOT VERIFIED/g, ''))) wrong.push(`${t.id} is done but its Result has no VERIFIED verdict`);
    }
  }
  list('Looks wrong', wrong);

  const next = active[0] ? `/dev:implement-ticket ${active[0].id} (resume at Step: ${header(readFileSync(active[0].file, 'utf8'), 'Step') || 'none'})`
    : frontier[0] ? `/dev:implement-ticket ${frontier[0].id}`
    : uncut.length ? '/dev:plan-tickets (decided requirements have no ticket)'
    : points.length ? 'nothing left to work: what remains waits on the open points above, each owed by the person it names'
    : tickets.length ? 'nothing left to work' : '/dev:plan-spec or /dev:plan-tickets';
  out.push('', `Next: ${next}`);
  return out.join('\n');
};

export const brief = (work: string, id: string): string | undefined => {
  const root = dirname(resolve(work));
  const ticketsDir = join(work, 'tickets');
  const tickets = existsSync(ticketsDir) ? readTickets(ticketsDir).tickets : [];
  const t = tickets.find((x) => x.id.toLowerCase() === id.toLowerCase());
  if (!t) return undefined;
  const byId = new Map(tickets.map((x) => [x.id, x]));
  const text = readFileSync(t.file, 'utf8');
  const head = text.split(/^## /m)[0];
  const out: string[] = [`# ${t.id}: ${title(text)}`, `File: ${relative(root, t.file)} · Epic: ${t.epic}`];
  for (const h of ['Type', 'Requirements', 'Status', 'Step', 'Base', 'Baseline', 'Files', 'Proof']) {
    const v = header(text, h);
    if (v) out.push(`${h}: ${v}`);
  }
  out.push(`Blocked by: ${t.blockedBy.length ? t.blockedBy.map((b) => `${b} (${byId.get(b)?.status ?? 'no file'})`).join(', ') : 'nothing'}`);
  const what = head.match(/^\*\*What to build:\*\*[ \t]*(.*)$/m)?.[1];
  if (what) out.push('', `What to build: ${what}`);
  const criteria = head.split('\n').filter((l) => /^\s*- \[[ xX]\]/.test(l));
  if (criteria.length) out.push('', `Criteria (${criteria.filter((l) => /\[ \]/.test(l)).length} open of ${criteria.length}):`, ...criteria);

  const rows = readRequirements(readIf(join(work, 'spec-index.md'))).filter((r) => t.requirements.includes(r.code));
  if (rows.length) out.push('', 'Requirements (spec index):', ...rows.map((r) => `- ${r.code} ${r.status}: ${r.where}`));

  // Notes that bind the ticket: tagged or worded with its id, its epic or one of its requirement codes,
  // plus the repo-wide facts every ticket needs.
  const keys = [t.id, ...t.requirements].map(word);
  const notes = readNotes(readIf(join(work, 'notes.md')));
  const bound = notes.filter((n) => keys.some((k) => k.test(n.tags) || k.test(n.text)) || n.tags.includes(`epic:${t.epic}`));
  const wide = notes.filter((n) => !bound.includes(n) && /\b(gotcha|convention|structure)\b/.test(n.tags));
  if (bound.length) out.push('', 'Notes for this ticket:', ...bound.map((n) => `- ${noteLine(n)}`));
  if (wide.length) out.push('', 'Repo facts:', ...wide.map((n) => `- ${noteLine(n)}`));

  const result = section(text, 'Result');
  if (result && t.status !== 'done') out.push('', 'Result so far:', ...result.split('\n').slice(-15));
  return out.join('\n');
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--ticket');
  const id = i === -1 ? undefined : args.splice(i, 2)[1];
  const work = args[0] ?? '.work';
  if (!existsSync(work)) {
    console.error(`state: ${work} does not exist: the repo has no recorded work`);
    process.exit(1);
  }
  if (i !== -1) {
    const text = id ? brief(work, id) : undefined;
    if (!text) {
      console.error(`state: no ticket file for ${id ?? '(no id given)'} under ${join(work, 'tickets')}`);
      process.exit(1);
    }
    console.log(text);
  } else console.log(overview(work));
}
