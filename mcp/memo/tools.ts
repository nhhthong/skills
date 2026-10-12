import { MemoError, openStore, TYPES } from './store.ts';
import type { CallbackArgs, PostArgs, Row, Store } from './store.ts';
import { resolveProject } from './project.ts';

const str = { type: 'string' };
const strs = { type: 'array', items: str };
const projectDir = { type: 'string', description: 'Project directory. Omit to use the server working directory.' };

export interface Tool {
  name: string;
  description: string;
  inputSchema: Row;
}

export const TOOLS: Tool[] = [
  {
    name: 'memo_post',
    description: 'Record project memory: an issue (problem met), attempt (approach tried, even failed), fix (what worked), decision (architecture choice with reason) or note (technical lesson). Pass `code` (e.g. I-3) to update an existing memo instead. An issue with a known `signature` is deduplicated and its occurrence count grows.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: TYPES, description: 'Required when creating.' },
        code: { ...str, description: 'Existing memo code to update, e.g. I-3.' },
        title: { ...str, description: 'One line, searchable.' },
        body: { ...str, description: 'Details. Keep exact error text.' },
        append: { type: 'boolean', description: 'On update: append body instead of replacing.' },
        epic: { ...str, description: 'Epic key, e.g. the epic directory name.' },
        epic_title: str,
        ticket: { ...str, description: 'Ticket key, e.g. EC-7.' },
        ticket_title: str,
        tags: strs,
        refs: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['file', 'commit', 'req', 'url'] }, value: str }, required: ['kind', 'value'] } },
        status: { ...str, description: 'issue: open|resolved|wontfix. fix: unconfirmed|confirmed|stale. decision: active|superseded|stale. note: active|stale.' },
        signature: { ...str, description: 'issue only: stable key for dedup, e.g. error class + file.' },
        issue: { ...str, description: 'attempt/fix: code of the issue it belongs to.' },
        attempt: { ...str, description: 'fix: code of the attempt it came from.' },
        outcome: { type: 'string', enum: ['failed', 'partial', 'worked'], description: 'attempt only.' },
        pr_ref: { ...str, description: 'fix only: PR or commit reference.' },
        rationale: { ...str, description: 'decision only: why this was chosen.' },
        alternatives: { ...strs, description: 'decision only: options rejected.' },
        supersedes: { ...str, description: 'decision only: code of the decision this replaces.' },
        kind: { type: 'string', enum: ['convention', 'gotcha', 'lesson', 'structure', 'glossary'], description: 'note only.' },
        session_id: str,
        branch: { ...str, description: 'Defaults to the current git branch.' },
        project_dir: projectDir,
      },
    },
  },
  {
    name: 'memo_callback',
    description: 'Search project memory. Free-text `query` uses full-text search ranked by relevance; filters narrow by type, epic, ticket, tag, status, file. With no query, returns the most recently updated. Stale and superseded memos are hidden unless include_inactive or status is set. Returns short rows; use memo_get for full text.',
    inputSchema: {
      type: 'object',
      properties: {
        query: str,
        types: { type: 'array', items: { type: 'string', enum: TYPES } },
        epic: str, ticket: str, tags: strs,
        status: str,
        file: { ...str, description: 'Substring of a referenced file path.' },
        since: { ...str, description: 'ISO date; only memos updated after it.' },
        limit: { type: 'integer', description: 'Default 8, max 50.' },
        include_inactive: { type: 'boolean' },
        project_dir: projectDir,
      },
    },
  },
  {
    name: 'memo_get',
    description: 'Read one memo in full by code (I-3, A-2, F-1, D-4, N-7): body, details, linked attempts/fixes, tags, refs and change history.',
    inputSchema: { type: 'object', properties: { code: str, project_dir: projectDir }, required: ['code'] },
  },
  {
    name: 'memo_info',
    description: 'Show which project and database memory is using, counts per type, open issues, epics, tickets and top tags. Call first to check the project was identified correctly.',
    inputSchema: { type: 'object', properties: { project_dir: projectDir } },
  },
];

const stores = new Map<string, Store>();
function storeFor(dir?: string): Store {
  const project = resolveProject(dir);
  let s = stores.get(project.dbPath);
  if (!s) { s = openStore(project); stores.set(project.dbPath, s); }
  return s;
}

export function closeAll(): void { for (const s of stores.values()) s.close(); stores.clear(); }

export function callTool(name: string, args: Row = {}): unknown {
  const store = storeFor(args.project_dir);
  switch (name) {
    case 'memo_post': return store.post(args as PostArgs);
    case 'memo_callback': return store.callback(args as CallbackArgs);
    case 'memo_get': return store.get(String(args.code));
    case 'memo_info': return store.info();
    default: throw new MemoError(`Unknown tool ${name}`);
  }
}

export { MemoError };
