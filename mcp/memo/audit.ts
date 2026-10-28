// Quality checks for one memo. `memo_post` runs them after every write and returns the
// warnings; `cli.ts audit` runs them over every memo to find data written before they existed.
import type { Row, Store } from './store.ts';

export type Severity = 'error' | 'warn' | 'info';
export interface Finding { code: string; check: string; severity: Severity; message: string }

const LONG_BODY = 600;
const MENTIONS_OPTIONS = /\b(rejected|alternatives?|instead of)\b/i;

/** True when a value carries markup of a malformed tool call, e.g. `text.</rationale>\n<parameter name="x">`. */
export function hasCallMarkup(field: string, value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (/<parameter\s+name=|<\/parameter>/.test(value)) return true;
  // A value that ends with its own closing tag; `body` is exempt so notes can quote HTML.
  return field !== 'body' && value.trimEnd().endsWith(`</${field}>`);
}

/** Checks one memo as returned by `Store.get`. */
export function auditMemo(m: Row): Finding[] {
  const out: Finding[] = [];
  const add = (check: string, severity: Severity, message: string): void => { out.push({ code: m.code, check, severity, message }); };

  for (const f of ['title', 'body', 'rationale']) {
    if (hasCallMarkup(f, m[f])) add('markup', 'error', `${f} contains tool-call markup → rewrite ${f} without it`);
  }
  for (const v of m.alternatives ?? []) {
    if (hasCallMarkup('alternatives', v)) add('markup', 'error', 'alternatives contain tool-call markup → rewrite alternatives');
  }

  if (m.type === 'decision') {
    if (!m.rationale) add('no-rationale', 'warn', 'decision has no rationale → set rationale: why this option was chosen');
    if (!m.alternatives?.length && (MENTIONS_OPTIONS.test(m.body ?? '') || MENTIONS_OPTIONS.test(m.rationale ?? ''))) {
      add('no-alternatives', 'warn', 'text mentions rejected options but alternatives is empty → list them in alternatives');
    }
  }
  if ((m.type === 'attempt' || m.type === 'fix') && !m.issue) {
    add('no-issue', 'warn', `${m.type} is not linked to an issue → post the issue and pass its code as issue`);
  }

  // Info, not warn: much work belongs to no epic, and a warning pushes the agent to invent one.
  if (!m.epic) add('no-epic', 'info', 'no epic → set epic and epic_title when the work belongs to one');
  if (m.epic && !m.epic_title) add('no-title', 'warn', `epic ${m.epic} has no title → pass epic_title`);
  if (m.ticket && !m.ticket_title) add('no-title', 'warn', `ticket ${m.ticket} has no title → pass ticket_title`);
  if (!m.tags?.length) add('no-tags', 'warn', 'no tags → add a few, reusing the top tags from memo_info');
  if (!m.refs?.length) add('no-refs', 'info', 'no refs → add the files, commits or requirement codes it is about');
  if ((m.body ?? '').length > LONG_BODY) {
    add('long-body', 'info', `body is ${m.body.length} characters → one fact per memo; split it if it holds several`);
  }
  return out;
}

const RANK: Record<Severity, number> = { error: 0, warn: 1, info: 2 };

/** Checks every active memo; stale and superseded ones are skipped. */
export function auditAll(store: Store): Finding[] {
  const codes = store.db.prepare('SELECT code FROM memos ORDER BY id').all<{ code: string }>();
  const out: Finding[] = [];
  for (const { code } of codes) {
    const m = store.get(code);
    if (m.status === 'stale' || m.status === 'superseded') continue;
    out.push(...auditMemo(m));
  }
  return out.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
}
