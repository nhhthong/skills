// Checks that every place listing the skills agrees with the skill folders.
// Run: node scripts/check-skills.mts  (Node 22.18 or newer, no packages)
//
// Sources of truth: each skills/<name>/SKILL.md frontmatter.
// Checked against: .claude-plugin/plugin.json, skills/<name>/agents/openai.yaml,
// skills/ask-me/SKILLS.md and README.md.
// Also checks the leaves: every relative link in a skill's Markdown resolves, every
// leaf file (a .md beside a SKILL.md) is reachable by links from some SKILL.md, and
// every `dev:<name>` a skill names exists.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SKILLS = join(ROOT, 'skills');
const DESCRIPTION_MAX = 250;

const errors: string[] = [];
const fail = (msg: string): void => { errors.push(msg); };
const read = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

function frontmatter(text: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  const fields: Record<string, string> = {};
  if (!match) return fields;
  for (const line of match[1].split('\n')) {
    const kv = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1');
  }
  return fields;
}

const names = readdirSync(SKILLS, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

// typed = the user must type it (disable-model-invocation: true)
const typed = new Map<string, boolean>();

for (const name of names) {
  const skillPath = `skills/${name}/SKILL.md`;
  if (!existsSync(join(ROOT, skillPath))) { fail(`${skillPath}: missing`); continue; }
  const fm = frontmatter(read(skillPath));
  if (fm.name !== name) fail(`${skillPath}: name is "${fm.name}", folder is "${name}"`);
  const description = fm.description ?? '';
  if (!description) fail(`${skillPath}: no description`);
  if (description.length > DESCRIPTION_MAX) {
    fail(`${skillPath}: description is ${description.length} characters, budget is ${DESCRIPTION_MAX}`);
  }
  const isTyped = fm['disable-model-invocation'] === 'true';
  typed.set(name, isTyped);

  const yamlPath = `skills/${name}/agents/openai.yaml`;
  if (!existsSync(join(ROOT, yamlPath))) { fail(`${yamlPath}: missing`); continue; }
  const yamlTyped = /allow_implicit_invocation:\s*false/.test(read(yamlPath));
  if (yamlTyped !== isTyped) {
    fail(`${yamlPath}: allow_implicit_invocation ${yamlTyped ? 'false' : 'not false'}, but SKILL.md says ${isTyped ? 'typed' : 'auto'}`);
  }
}

// .claude-plugin/plugin.json: the same set of folders.
const manifest = JSON.parse(read('.claude-plugin/plugin.json')) as { skills?: string[] };
const listed = (manifest.skills ?? []).map((p) => p.replace(/^\.\/skills\//, ''));
for (const name of names) if (!listed.includes(name)) fail(`plugin.json: "./skills/${name}" missing`);
for (const name of listed) if (!names.includes(name)) fail(`plugin.json: "./skills/${name}" has no folder`);

// skills/ask-me/SKILLS.md: each skill once, with the right (type) or (auto) mark.
const catalog = read('skills/ask-me/SKILLS.md');
const catalogMarks = new Map<string, string[]>();
for (const m of catalog.matchAll(/`\/dev:([a-z-]+)` \((type|auto)\)/g)) {
  catalogMarks.set(m[1], [...(catalogMarks.get(m[1]) ?? []), m[2]]);
}
for (const name of names) {
  const marks = catalogMarks.get(name) ?? [];
  if (marks.length !== 1) { fail(`SKILLS.md: "${name}" listed ${marks.length} times`); continue; }
  const want = typed.get(name) ? 'type' : 'auto';
  if (marks[0] !== want) fail(`SKILLS.md: "${name}" marked (${marks[0]}), SKILL.md says (${want})`);
}
for (const name of catalogMarks.keys()) if (!names.includes(name)) fail(`SKILLS.md: "${name}" has no folder`);

// README.md: each skill linked once, "(you type)" exactly for typed skills, and the count.
const readme = read('README.md');
for (const name of names) {
  const line = readme.split('\n').find((l) => l.includes(`(skills/${name}/SKILL.md)`));
  if (!line) { fail(`README.md: no line linking skills/${name}/SKILL.md`); continue; }
  const saysTyped = line.includes('(you type)');
  if (saysTyped !== typed.get(name)) {
    fail(`README.md: "${name}" ${saysTyped ? 'says' : 'does not say'} (you type), SKILL.md says ${typed.get(name) ? 'typed' : 'auto'}`);
  }
}
const count = /(\d+) small skills/.exec(readme);
if (!count || Number(count[1]) !== names.length) {
  fail(`README.md: says ${count ? count[1] : 'no'} small skills, there are ${names.length}`);
}

// Leaves: relative links resolve, every leaf is reachable from a SKILL.md, every `dev:<name>` exists.
// Paths are kept in POSIX form so the checks agree on Windows too.
const posix = (p: string): string => p.split(sep).join('/');
const markdown = readdirSync(SKILLS, { recursive: true, encoding: 'utf8' })
  .filter((p) => p.endsWith('.md'))
  .map((p) => posix(join('skills', p)));
// A fenced block, indented or not, holds examples, not links to check.
const FENCE = /^[ \t]*(`{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm;
const LINK = /\]\(([^)\s#]+)(?:#[^)]*)?\)/g;
const links = new Map<string, string[]>();
for (const path of markdown) {
  const prose = read(path).replace(FENCE, '');
  const out: string[] = [];
  for (const m of prose.matchAll(LINK)) {
    const target = m[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    const resolved = posix(relative(ROOT, join(ROOT, dirname(path), target)));
    if (!existsSync(join(ROOT, resolved))) fail(`${path}: link to "${target}" does not resolve`);
    else out.push(resolved);
  }
  links.set(path, out);
  for (const m of prose.matchAll(/\bdev:([a-z][a-z-]*[a-z])(?![-\w])/g)) {
    if (!names.includes(m[1])) fail(`${path}: names "dev:${m[1]}", which is not a skill`);
  }
}
const reached = new Set<string>();
const queue = markdown.filter((p) => p.endsWith('/SKILL.md'));
for (let path = queue.pop(); path !== undefined; path = queue.pop()) {
  if (reached.has(path)) continue;
  reached.add(path);
  queue.push(...(links.get(path) ?? []));
}
for (const path of markdown) {
  if (path.endsWith('/CREDITS.md')) continue;
  if (!reached.has(path)) fail(`${path}: leaf file that no SKILL.md reaches`);
}

if (errors.length) {
  console.error(`check-skills: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-skills: ${names.length} skills agree across SKILL.md, openai.yaml, plugin.json, SKILLS.md and README.md`);
