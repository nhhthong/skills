#!/usr/bin/env node
// Usage: node cli.ts info|export [project_dir]
import { openStore } from './store.ts';
import { resolveProject } from './project.ts';

const [cmd, dir] = process.argv.slice(2) as [string | undefined, string | undefined];
const store = openStore(resolveProject(dir));
if (cmd === 'export') process.stdout.write(`${store.exportMarkdown()}\n`);
else if (cmd === 'info') process.stdout.write(`${JSON.stringify(store.info(), null, 2)}\n`);
else { process.stderr.write('Usage: cli.ts info|export [project_dir]\n'); process.exitCode = 2; }
store.close();
