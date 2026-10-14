import { DatabaseSync } from 'node:sqlite';
import type { Project } from './project.ts';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { MIGRATIONS } from './schema.ts';
import { currentBranch } from './project.ts';
import { auditMemo, hasCallMarkup } from './audit.ts';

export const SCHEMA_VERSION = MIGRATIONS.length;
export const TYPES = ['issue', 'attempt', 'fix', 'decision', 'note'];
const PREFIX: Record<string, string> = { issue: 'I', attempt: 'A', fix: 'F', decision: 'D', note: 'N' };
const REF_KINDS = ['file', 'commit', 'req', 'url'];
const STATUS: Record<string, string[]> = {
  issue: ['open', 'resolved', 'wontfix'],
  fix: ['unconfirmed', 'confirmed', 'stale'],
  decision: ['active', 'superseded', 'stale'],
  note: ['active', 'stale'],
};
const TABLE: Record<string, string> = { issue: 'issues', attempt: 'attempts', fix: 'fixes', decision: 'decisions', note: 'notes' };
const NOTE_KINDS = ['convention', 'gotcha', 'lesson', 'structure', 'glossary'];
const OUTCOMES = ['failed', 'partial', 'worked'];
/** Fields that belong to some types only; passing one to another type is an error, never a silent no-op. */
const ONLY_FOR: Record<string, string[]> = {
  signature: ['issue'], outcome: ['attempt'], issue: ['attempt', 'fix'], attempt: ['fix'], pr_ref: ['fix'],
  rationale: ['decision'], alternatives: ['decision'], supersedes: ['decision'], kind: ['note'],
};
/** Fields set once at creation. An update that carries one fails instead of ignoring it. */
const FIXED_ON_UPDATE = ['signature', 'issue', 'attempt', 'supersedes', 'session_id', 'branch'];
/** Text fields checked for tool-call markup that leaked into a value. */
const TEXT_FIELDS = ['title', 'body', 'rationale', 'epic_title', 'ticket_title', 'signature', 'pr_ref'] as const;

export class MemoError extends Error {}
function fail(msg: string): never { throw new MemoError(msg); }
const now = (): string => new Date().toISOString();
const str = (v: unknown): string | null => (v == null || v === '' ? null : String(v));


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
type Param = string | number | bigint | null;
interface Stmt {
  run(...a: Param[]): { lastInsertRowid: number | bigint; changes: number | bigint };
  get<T = Row>(...a: Param[]): T;
  all<T = Row>(...a: Param[]): T[];
}
/** The node:sqlite surface used here, with row types left to the caller. */
interface Db {
  exec(sql: string): void;
  prepare(sql: string): Stmt;
  close(): void;
  readonly isTransaction: boolean;
}

/** Fields accepted by memo_post (and the filters of memo_callback / memo_get). */
export interface PostArgs {
  type?: string; code?: string; title?: string; body?: string; append?: boolean;
  epic?: string; epic_title?: string; ticket?: string; ticket_title?: string;
  tags?: string[]; refs?: { kind: string; value: string }[]; refs_remove?: { kind: string; value: string }[];
  status?: string; signature?: string; issue?: string; attempt?: string; outcome?: string;
  pr_ref?: string; rationale?: string; alternatives?: string[]; supersedes?: string;
  kind?: string; session_id?: string; branch?: string; append_body?: boolean;
}
export interface CallbackArgs {
  query?: string; types?: string[]; epic?: string; ticket?: string; tags?: string[];
  status?: string; file?: string; since?: string; limit?: number; include_inactive?: boolean;
}

export function openStore(project: Project): Store {
  mkdirSync(dirname(project.dbPath), { recursive: true });
  const db = new DatabaseSync(project.dbPath) as unknown as Db;
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;');
  const ver = db.prepare('PRAGMA user_version').get().user_version;
  if (ver > SCHEMA_VERSION) fail(`DB schema ${ver} is newer than this server (${SCHEMA_VERSION}). Update the plugin.`);
  for (let v = ver; v < SCHEMA_VERSION; v++) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  const set = db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  set.run('project_id', project.id);
  set.run('project_root', project.root);
  set.run('project_slug', project.slug);
  return new Store(db, project);
}

export class Store {
  db: Db;
  project: Project;
  _b?: { at: number; v: string | null };

  constructor(db: Db, project: Project) {
    this.db = db;
    this.project = project;
  }

  /** Current git branch, cached 10 s so bulk posts do not spawn git each time. */
  branch(): string | null {
    const t = Date.now();
    if (!this._b || t - this._b.at > 10000) this._b = { at: t, v: currentBranch(this.project.root) };
    return this._b.v;
  }

  tx<T>(fn: () => T): T {
    if (this.db.isTransaction) return fn();
    this.db.exec('BEGIN IMMEDIATE');
    try { const r = fn(); this.db.exec('COMMIT'); return r; }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }

  // ---- lookups -----------------------------------------------------------
  epicId(key?: unknown, title?: unknown): number | null {
    const k = str(key); if (!k) return null;
    this.db.prepare('INSERT INTO epics(key,title,created_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET title=COALESCE(excluded.title,title)').run(k, str(title), now());
    return this.db.prepare('SELECT id FROM epics WHERE key=?').get<{ id: number }>(k).id;
  }

  ticketId(key?: unknown, epicId?: number | null, title?: unknown): number | null {
    const k = str(key); if (!k) return null;
    this.db.prepare(`INSERT INTO tickets(key,title,epic_id,created_at) VALUES(?,?,?,?)
      ON CONFLICT(key) DO UPDATE SET title=COALESCE(excluded.title,title), epic_id=COALESCE(excluded.epic_id,epic_id)`)
      .run(k, str(title), epicId ?? null, now());
    return this.db.prepare('SELECT id FROM tickets WHERE key=?').get<{ id: number }>(k).id;
  }

  byCode(code?: unknown, type?: string): { id: number; type: string; code: string } | null {
    const c = str(code); if (!c) return null;
    const row = this.db.prepare('SELECT id, type, code FROM memos WHERE code=?').get<{ id: number; type: string; code: string } | undefined>(c.toUpperCase());
    if (!row) return fail(`No memo with code ${c}`);
    if (type && row.type !== type) fail(`${row.code} is a ${row.type}, expected ${type}`);
    return row;
  }

  nextCode(type: string): string {
    this.db.prepare('INSERT INTO counters(type,n) VALUES(?,1) ON CONFLICT(type) DO UPDATE SET n=n+1').run(type);
    return `${PREFIX[type]}-${this.db.prepare('SELECT n FROM counters WHERE type=?').get(type).n}`;
  }

  // ---- fts + tags --------------------------------------------------------
  setTags(memoId: number, tags: string[]): void {
    this.db.prepare('DELETE FROM memo_tags WHERE memo_id=?').run(memoId);
    for (const raw of tags) {
      const name = String(raw).trim().toLowerCase();
      if (!name) continue;
      this.db.prepare('INSERT OR IGNORE INTO tags(name) VALUES(?)').run(name);
      const tid = this.db.prepare('SELECT id FROM tags WHERE name=?').get(name).id;
      this.db.prepare('INSERT OR IGNORE INTO memo_tags(memo_id,tag_id) VALUES(?,?)').run(memoId, tid);
    }
  }

  tagsOf(memoId: number): string[] {
    return this.db.prepare('SELECT t.name FROM memo_tags m JOIN tags t ON t.id=m.tag_id WHERE m.memo_id=? ORDER BY t.name').all(memoId).map((r) => r.name);
  }

  reindex(memoId: number): void {
    const m = this.db.prepare('SELECT title, body FROM memos WHERE id=?').get(memoId);
    const extra = this.db.prepare('SELECT rationale FROM decisions WHERE memo_id=?').get(memoId);
    const sig = this.db.prepare('SELECT signature FROM issues WHERE memo_id=?').get(memoId);
    const body = [m.body, extra?.rationale, sig?.signature].filter(Boolean).join('\n');
    this.db.prepare('DELETE FROM memo_fts WHERE rowid=?').run(memoId);
    this.db.prepare('INSERT INTO memo_fts(rowid,title,body,tags) VALUES(?,?,?,?)').run(memoId, m.title, body, this.tagsOf(memoId).join(' '));
  }

  event(memoId: number, action: string, detail = ''): void {
    this.db.prepare('INSERT INTO events(memo_id,at,action,detail) VALUES(?,?,?,?)').run(memoId, now(), action, detail);
  }

  // ---- memo_post ---------------------------------------------------------
  post(a: PostArgs): Row {
    const r = this.tx(() => (a.code ? this.#update(a) : this.#create(a)));
    if (r.deduped || r.updated === false) return r;
    const warnings = auditMemo(this.get(r.code)).filter((f) => f.severity === 'warn').map((f) => `${f.check}: ${f.message}`);
    return warnings.length ? { ...r, warnings } : r;
  }

  #create(a: PostArgs): Row {
    const type = a.type as string;
    if (!TYPES.includes(type)) fail(`type must be one of ${TYPES.join(', ')}`);
    const title = str(a.title); if (!title) fail('title is required');
    this.#validate(type, a);

    if (type === 'issue' && str(a.signature)) {
      const dup = this.db.prepare('SELECT m.id, m.code, i.status FROM issues i JOIN memos m ON m.id=i.memo_id WHERE i.signature=?').get(String(a.signature));
      if (dup) {
        const t = now();
        this.db.prepare('UPDATE issues SET occurrences=occurrences+1, last_seen_at=?, status=CASE WHEN status=\'resolved\' THEN \'open\' ELSE status END WHERE memo_id=?').run(t, dup.id);
        this.db.prepare('UPDATE memos SET updated_at=? WHERE id=?').run(t, dup.id);
        this.event(dup.id, 'seen-again', str(a.body)?.slice(0, 200) ?? '');
        return { code: dup.code, deduped: true, reopened: dup.status === 'resolved' };
      }
    }

    const epic = this.epicId(a.epic, a.epic_title);
    const ticket = this.ticketId(a.ticket, epic, a.ticket_title);
    const t = now();
    const code = this.nextCode(type);
    const id = Number(this.db.prepare(`INSERT INTO memos(code,type,title,body,epic_id,ticket_id,session_id,branch,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`).run(code, type, title, String(a.body ?? ''), epic, ticket, str(a.session_id), str(a.branch) ?? this.branch(), t, t).lastInsertRowid);

    const issueId = type === 'attempt' || type === 'fix' ? this.byCode(a.issue, 'issue')?.id ?? null : null;
    switch (type) {
      case 'issue':
        this.db.prepare('INSERT INTO issues(memo_id,signature,status,last_seen_at) VALUES(?,?,?,?)').run(id, str(a.signature), a.status ?? 'open', t);
        break;
      case 'attempt':
        this.db.prepare('INSERT INTO attempts(memo_id,issue_id,outcome) VALUES(?,?,?)').run(id, issueId, a.outcome ?? 'failed');
        break;
      case 'fix': {
        const attempt = this.byCode(a.attempt, 'attempt')?.id ?? null;
        const status = a.status ?? 'unconfirmed';
        this.db.prepare('INSERT INTO fixes(memo_id,issue_id,attempt_id,status,pr_ref,verified_at) VALUES(?,?,?,?,?,?)')
          .run(id, issueId, attempt, status, str(a.pr_ref), status === 'confirmed' ? t : null);
        if (issueId && status === 'confirmed') this.db.prepare("UPDATE issues SET status='resolved' WHERE memo_id=?").run(issueId);
        break;
      }
      case 'decision': {
        const sup = this.byCode(a.supersedes, 'decision')?.id ?? null;
        this.db.prepare('INSERT INTO decisions(memo_id,rationale,alternatives,status,supersedes_id) VALUES(?,?,?,?,?)')
          .run(id, String(a.rationale ?? ''), JSON.stringify(a.alternatives ?? []), a.status ?? 'active', sup);
        if (sup) {
          this.db.prepare("UPDATE decisions SET status='superseded' WHERE memo_id=?").run(sup);
          this.db.prepare('UPDATE memos SET updated_at=? WHERE id=?').run(t, sup);
          this.event(sup, 'superseded', code);
        }
        break;
      }
      case 'note':
        this.db.prepare('INSERT INTO notes(memo_id,kind,status,verified_at) VALUES(?,?,?,?)').run(id, a.kind ?? 'lesson', a.status ?? 'active', t);
        break;
    }
    this.#attach(id, a);
    this.event(id, 'created');
    return { code, deduped: false };
  }

  #update(a: PostArgs): Row {
    const found = this.byCode(a.code);
    if (!found) return fail('code is required to update');
    const { id, type, code } = found;
    const arg = a as Row;
    if (a.type != null && a.type !== type) fail(`${code} is a ${type}; a memo's type cannot change`);
    for (const k of FIXED_ON_UPDATE) if (arg[k] != null) fail(`${k} cannot be changed on update; it is set when the memo is created`);
    this.#validate(type, a, true);
    const t = now();
    const changed: string[] = [];
    const cur = this.db.prepare('SELECT title, body FROM memos WHERE id=?').get(id);
    if (str(a.title) && a.title !== cur.title) {
      if (type === 'decision') fail('A decision title cannot change. Post a new decision with supersedes.');
      this.db.prepare('UPDATE memos SET title=? WHERE id=?').run(String(a.title), id);
      changed.push('title');
    }
    if (a.body != null && (a.append || a.body !== cur.body)) {
      if (type === 'decision' && !a.append) fail('A decision body changes only with append: true. To change the decision itself, post a new one with supersedes.');
      this.db.prepare('UPDATE memos SET body=? WHERE id=?').run(a.append ? (cur.body ? `${cur.body}\n\n${a.body}` : String(a.body)) : String(a.body), id);
      changed.push('body');
    }
    if (str(a.epic) || str(a.ticket)) {
      const epic = this.epicId(a.epic, a.epic_title);
      const ticket = this.ticketId(a.ticket, epic, a.ticket_title);
      if (epic) { this.db.prepare('UPDATE memos SET epic_id=? WHERE id=?').run(epic, id); changed.push('epic'); }
      if (ticket) { this.db.prepare('UPDATE memos SET ticket_id=? WHERE id=?').run(ticket, id); changed.push('ticket'); }
    }
    if (a.status != null && STATUS[type]) {
      const table = TABLE[type];
      this.db.prepare(`UPDATE ${table} SET status=? WHERE memo_id=?`).run(a.status, id);
      if (type === 'fix') {
        this.db.prepare('UPDATE fixes SET verified_at=? WHERE memo_id=?').run(a.status === 'confirmed' ? t : null, id);
        if (a.status === 'confirmed') {
          this.db.prepare("UPDATE issues SET status='resolved' WHERE memo_id=(SELECT issue_id FROM fixes WHERE memo_id=?)").run(id);
        }
      }
      if (type === 'note') this.db.prepare('UPDATE notes SET verified_at=? WHERE memo_id=?').run(a.status === 'active' ? t : null, id);
      changed.push('status');
    }
    if (a.outcome) { this.db.prepare('UPDATE attempts SET outcome=? WHERE memo_id=?').run(a.outcome, id); changed.push('outcome'); }
    if (str(a.pr_ref)) { this.db.prepare('UPDATE fixes SET pr_ref=? WHERE memo_id=?').run(String(a.pr_ref), id); changed.push('pr_ref'); }
    if (a.rationale != null) { this.db.prepare('UPDATE decisions SET rationale=? WHERE memo_id=?').run(String(a.rationale), id); changed.push('rationale'); }
    if (a.alternatives != null) { this.db.prepare('UPDATE decisions SET alternatives=? WHERE memo_id=?').run(JSON.stringify(a.alternatives), id); changed.push('alternatives'); }
    if (a.kind) { this.db.prepare('UPDATE notes SET kind=? WHERE memo_id=?').run(a.kind, id); changed.push('kind'); }
    changed.push(...this.#attach(id, a));
    if (!changed.length) return { code, updated: false };
    this.db.prepare('UPDATE memos SET updated_at=? WHERE id=?').run(t, id);
    this.event(id, 'updated', changed.join(','));
    return { code, updated: true };
  }

  #validate(type: string, a: PostArgs, update = false): void {
    const arg = a as Row;
    const oneOf = (v: unknown, list: string[], name: string): void => { if (v != null && !list.includes(v as string)) fail(`${name} must be one of ${list.join(', ')}`); };
    for (const [k, types] of Object.entries(ONLY_FOR)) if (arg[k] != null && !types.includes(type)) fail(`${k} applies to ${types.join(' and ')} only`);
    oneOf(a.status, STATUS[type] ?? [], 'status');
    oneOf(a.outcome, OUTCOMES, 'outcome');
    oneOf(a.kind, NOTE_KINDS, 'kind');
    if (a.alternatives != null && !Array.isArray(a.alternatives)) fail('alternatives must be an array of strings');
    for (const r of [...(a.refs ?? []), ...(a.refs_remove ?? [])]) oneOf(r?.kind, REF_KINDS, 'refs[].kind');
    if (str(a.epic_title) && !str(a.epic)) fail('epic_title needs epic (the epic key)');
    if (str(a.ticket_title) && !str(a.ticket)) fail('ticket_title needs ticket (the ticket key)');
    for (const f of TEXT_FIELDS) if (hasCallMarkup(f, arg[f])) fail(`${f} contains tool-call markup; send the value again without it`);
    for (const v of [...(a.alternatives ?? []), ...(a.tags ?? [])]) if (hasCallMarkup('alternatives', v)) fail(`alternatives or tags contain tool-call markup; send the value again without it`);
    if (!update && type === 'fix' && !str(a.issue) && !str(a.title)) fail('fix needs an issue code or a title');
  }

  /** Tags replace the list; refs merge by (kind, value) and refs_remove deletes. Returns the fields that changed. */
  #attach(id: number, a: PostArgs): string[] {
    const changed: string[] = [];
    if (a.tags) { this.setTags(id, a.tags); changed.push('tags'); }
    const has = this.db.prepare('SELECT 1 AS x FROM refs WHERE memo_id=? AND kind=? AND value=?');
    let added = false;
    for (const r of a.refs ?? []) {
      if (has.get<Row | undefined>(id, r.kind, String(r.value))) continue;
      this.db.prepare('INSERT INTO refs(memo_id,kind,value) VALUES(?,?,?)').run(id, r.kind, String(r.value));
      added = true;
    }
    if (added) changed.push('refs');
    let removed = false;
    for (const r of a.refs_remove ?? []) {
      if (Number(this.db.prepare('DELETE FROM refs WHERE memo_id=? AND kind=? AND value=?').run(id, r.kind, String(r.value)).changes)) removed = true;
    }
    if (removed) changed.push('refs_remove');
    this.reindex(id);
    return changed;
  }

  // ---- memo_callback -----------------------------------------------------
  callback(q: CallbackArgs = {}): { count: number; results: Row[] } {
    const limit = Math.min(Math.max(Number(q.limit) || 8, 1), 50);
    const where: string[] = []; const args: Param[] = [];
    const eq = (col: string, v: Param): void => { where.push(`${col} = ?`); args.push(v); };
    if (q.types?.length) { where.push(`m.type IN (${q.types.map(() => '?').join(',')})`); args.push(...q.types); }
    if (str(q.epic)) eq('e.key', String(q.epic));
    if (str(q.ticket)) eq('t.key', String(q.ticket));
    if (q.since) { where.push('m.updated_at >= ?'); args.push(String(q.since)); }
    if (str(q.status)) {
      where.push(`COALESCE(i.status, f.status, d.status, n.status) = ?`); args.push(String(q.status));
    } else if (!q.include_inactive) {
      where.push(`COALESCE(f.status, d.status, n.status, 'ok') NOT IN ('stale','superseded')`);
    }
    for (const tag of q.tags ?? []) {
      where.push('EXISTS (SELECT 1 FROM memo_tags mt JOIN tags tg ON tg.id=mt.tag_id WHERE mt.memo_id=m.id AND tg.name=?)'); args.push(String(tag).toLowerCase());
    }
    if (str(q.file)) {
      where.push("EXISTS (SELECT 1 FROM refs r WHERE r.memo_id=m.id AND r.kind='file' AND r.value LIKE ?)"); args.push(`%${q.file}%`);
    }
    const from = `FROM memos m
      LEFT JOIN epics e ON e.id=m.epic_id LEFT JOIN tickets t ON t.id=m.ticket_id
      LEFT JOIN issues i ON i.memo_id=m.id LEFT JOIN fixes f ON f.memo_id=m.id
      LEFT JOIN decisions d ON d.memo_id=m.id LEFT JOIN notes n ON n.memo_id=m.id`;
    const cols = `m.id, m.code, m.type, m.title, m.updated_at, e.key AS epic, t.key AS ticket,
      COALESCE(i.status, f.status, d.status, n.status, (SELECT outcome FROM attempts WHERE memo_id=m.id)) AS status`;
    const w = where.length ? ` AND ${where.join(' AND ')}` : '';

    const text = str(q.query);
    let rows: Row[] = [];
    if (text) {
      const words = text.match(/[\p{L}\p{N}_]+/gu) ?? [];
      for (const op of ['AND', 'OR']) {
        if (!words.length) break;
        const match = words.map((x) => `"${x}"*`).join(` ${op} `);
        rows = this.db.prepare(`SELECT ${cols}, snippet(memo_fts, 1, '[', ']', '…', 12) AS snip
          FROM memo_fts JOIN memos m ON m.id = memo_fts.rowid ${from.replace('FROM memos m', '')}
          WHERE memo_fts MATCH ?${w} ORDER BY bm25(memo_fts, 5.0, 1.0, 2.0) LIMIT ?`).all(match, ...args, limit);
        if (rows.length) break;
      }
    } else {
      rows = this.db.prepare(`SELECT ${cols} ${from} WHERE 1=1${w} ORDER BY m.updated_at DESC LIMIT ?`).all(...args, limit);
    }
    for (const r of rows) {
      if (r.type === 'issue') {
        r.fixes = this.db.prepare('SELECT m.code, f.status FROM fixes f JOIN memos m ON m.id=f.memo_id WHERE f.issue_id=? ORDER BY m.id').all(r.id).map((x) => `${x.code}(${x.status})`);
        r.attempts = this.db.prepare('SELECT count(*) c FROM attempts WHERE issue_id=?').get(r.id).c;
      }
      delete r.id;
    }
    return { count: rows.length, results: rows };
  }

  // ---- memo_get ----------------------------------------------------------
  get(code: string): Row {
    const m = this.db.prepare(`SELECT m.*, e.key AS epic, e.title AS epic_title, t.key AS ticket, t.title AS ticket_title FROM memos m
      LEFT JOIN epics e ON e.id=m.epic_id LEFT JOIN tickets t ON t.id=m.ticket_id WHERE m.code=?`).get<Row | undefined>(String(code).toUpperCase());
    if (!m) return fail(`No memo with code ${code}`);
    const out: Row = { code: m.code, type: m.type, title: m.title, body: m.body, epic: m.epic, epic_title: m.epic_title, ticket: m.ticket, ticket_title: m.ticket_title, branch: m.branch, created_at: m.created_at, updated_at: m.updated_at };
    const detail = this.db.prepare(`SELECT * FROM ${TABLE[m.type]} WHERE memo_id=?`).get(m.id);
    delete detail.memo_id;
    if (m.type === 'decision') detail.alternatives = JSON.parse(detail.alternatives);
    const codeOf = (id: number | null): string | null => (id ? this.db.prepare('SELECT code FROM memos WHERE id=?').get(id)?.code ?? null : null);
    for (const k of ['issue_id', 'attempt_id', 'supersedes_id']) if (k in detail) { detail[k.replace('_id', '')] = codeOf(detail[k]); delete detail[k]; }
    Object.assign(out, detail);
    if (m.type === 'issue') {
      out.attempts = this.db.prepare("SELECT m.code, m.title, a.outcome FROM attempts a JOIN memos m ON m.id=a.memo_id WHERE a.issue_id=? ORDER BY m.id").all(m.id);
      out.fixes = this.db.prepare('SELECT m.code, m.title, f.status FROM fixes f JOIN memos m ON m.id=f.memo_id WHERE f.issue_id=? ORDER BY m.id').all(m.id);
    }
    if (m.type === 'decision') {
      out.superseded_by = this.db.prepare('SELECT m.code FROM decisions d JOIN memos m ON m.id=d.memo_id WHERE d.supersedes_id=?').all(m.id).map((r) => r.code);
    }
    out.tags = this.tagsOf(m.id);
    out.refs = this.db.prepare('SELECT kind, value FROM refs WHERE memo_id=? ORDER BY id').all(m.id);
    out.events = this.db.prepare('SELECT at, action, detail FROM events WHERE memo_id=? ORDER BY id').all(m.id);
    return out;
  }

  // ---- memo_info ---------------------------------------------------------
  info(): Row {
    const db = this.db;
    const counts = Object.fromEntries(TYPES.map((t) => [t, db.prepare('SELECT count(*) c FROM memos WHERE type=?').get(t).c]));
    return {
      project: { id: this.project.id, root: this.project.root, identity: this.project.identity },
      db: this.project.dbPath,
      schema_version: SCHEMA_VERSION,
      counts,
      open_issues: db.prepare("SELECT m.code, m.title FROM issues i JOIN memos m ON m.id=i.memo_id WHERE i.status='open' ORDER BY i.last_seen_at DESC LIMIT 10").all(),
      active_decisions: db.prepare("SELECT count(*) c FROM decisions WHERE status='active'").get().c,
      epics: db.prepare(`SELECT e.key, e.title, (SELECT count(*) FROM memos WHERE epic_id=e.id) AS memos FROM epics e ORDER BY e.key`).all(),
      tickets: db.prepare(`SELECT t.key, t.title, e.key AS epic, (SELECT count(*) FROM memos WHERE ticket_id=t.id) AS memos FROM tickets t LEFT JOIN epics e ON e.id=t.epic_id ORDER BY t.key LIMIT 100`).all(),
      top_tags: db.prepare('SELECT t.name, count(*) uses FROM memo_tags mt JOIN tags t ON t.id=mt.tag_id GROUP BY t.id ORDER BY uses DESC, t.name LIMIT 15').all(),
      last_activity: db.prepare('SELECT max(updated_at) v FROM memos').get().v,
    };
  }

  /** Markdown dump for backup or sharing. */
  exportMarkdown(): string {
    const rows = this.db.prepare('SELECT code FROM memos ORDER BY id').all();
    const parts = [`# Memo export — ${this.project.slug}\n`];
    for (const { code } of rows) {
      const m = this.get(code);
      parts.push(`## ${m.code} ${m.title}\n`);
      parts.push(`type: ${m.type}${m.epic ? ` | epic: ${m.epic}` : ''}${m.ticket ? ` | ticket: ${m.ticket}` : ''} | updated: ${m.updated_at}`);
      if (m.tags.length) parts.push(`tags: ${m.tags.join(', ')}`);
      if (m.rationale) parts.push(`\nWhy: ${m.rationale}`);
      if (m.body) parts.push(`\n${m.body}`);
      for (const r of m.refs) parts.push(`- ${r.kind}: ${r.value}`);
      parts.push('');
    }
    return parts.join('\n');
  }

  close(): void { this.db.close(); }
}
