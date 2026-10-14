// Checks that every place listing the skills agrees with the skill folders.
// Run: node scripts/check-skills.mts  (Node 22.18 or newer, no packages)
//
// Sources of truth: each skills/<name>/SKILL.md frontmatter.
// Checked against: .claude-plugin/plugin.json, skills/<name>/agents/openai.yaml,
// skills/ask/SKILLS.md and README.md.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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

// skills/ask/SKILLS.md: each skill once, with the right (type) or (auto) mark.
const catalog = read('skills/ask/SKILLS.md');
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

if (errors.length) {
  console.error(`check-skills: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-skills: ${names.length} skills agree across SKILL.md, openai.yaml, plugin.json, SKILLS.md and README.md`);
