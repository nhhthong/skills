import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolveProject } from '../project.ts';

test('a clone under another folder name finds the same DB', () => {
  const root = mkdtempSync(join(tmpdir(), 'memo-proj-'));
  const git = (cwd: string, ...a: string[]): void => { execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, stdio: 'ignore' }); };
  const first = join(root, 'app');
  execFileSync('git', ['init', '-q', first]);
  writeFileSync(join(first, 'a'), 'a');
  git(first, 'add', 'a');
  git(first, 'commit', '-qm', 'init');
  git(root, 'clone', '-q', first, 'renamed');
  const home = join(root, 'home');
  const before = process.env.MEMO_HOME;
  process.env.MEMO_HOME = home;
  try {
    const a = resolveProject(first);
    mkdirSync(home, { recursive: true });
    writeFileSync(a.dbPath, '');
    const b = resolveProject(join(root, 'renamed'));
    assert.equal(b.id, a.id);
    assert.equal(b.dbPath, a.dbPath);
  } finally {
    if (before === undefined) delete process.env.MEMO_HOME; else process.env.MEMO_HOME = before;
    rmSync(root, { recursive: true, force: true });
  }
});

test('two DBs with one id: the first by name is chosen, every time', () => {
  const root = mkdtempSync(join(tmpdir(), 'memo-proj-'));
  const home = join(root, 'home');
  const dir = join(root, 'plain');
  mkdirSync(home);
  mkdirSync(dir);
  const before = process.env.MEMO_HOME;
  process.env.MEMO_HOME = home;
  try {
    const { id } = resolveProject(dir);
    for (const slug of ['zeta', 'alpha']) writeFileSync(join(home, `${slug}-${id}.db`), '');
    assert.equal(resolveProject(dir).dbPath, join(home, `alpha-${id}.db`));
  } finally {
    if (before === undefined) delete process.env.MEMO_HOME; else process.env.MEMO_HOME = before;
    rmSync(root, { recursive: true, force: true });
  }
});
