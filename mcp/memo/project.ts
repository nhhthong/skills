import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

function gitRoot(start: string): string | null {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, '.git'))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function rootCommit(root: string): string | null {
  try {
    const out = execFileSync('git', ['rev-list', '--max-parents=0', 'HEAD'], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.split('\n').filter(Boolean).sort()[0] || null;
  } catch {
    return null;
  }
}

export interface Project {
  id: string;
  slug: string;
  root: string;
  dbPath: string;
  identity: 'git-root-commit' | 'path';
}

export function currentBranch(root: string): string | null {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || null;
  } catch {
    return null;
  }
}

export function memoHome(): string {
  if (process.env.MEMO_HOME) return process.env.MEMO_HOME;
  return join(process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude'), 'memo');
}

/** Identify the project: root commit hash when in git, else hash of the real path. */
export function resolveProject(dir?: string): Project {
  const start = realpathSync(resolve(dir || process.cwd()));
  const root = gitRoot(start) || start;
  const commit = root === start || existsSync(join(root, '.git')) ? rootCommit(root) : null;
  const id = (commit || createHash('sha1').update(root).digest('hex')).slice(0, 12);
  const slug = basename(root).replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 40) || 'project';
  const dbPath = process.env.MEMO_DB || join(memoHome(), `${slug}-${id}.db`);
  return { id, slug, root, dbPath, identity: commit ? 'git-root-commit' : 'path' };
}
