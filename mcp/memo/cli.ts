#!/usr/bin/env node
// Usage: node cli.ts info|export|audit [--json] [project_dir]
import { openStore } from './store.ts';
import { resolveProject } from './project.ts';
import { auditAll } from './audit.ts';

const args = process.argv.slice(2);
const [cmd] = args;
const json = args.includes('--json');
const dir = args.slice(1).find((a) => !a.startsWith('--'));
const store = openStore(resolveProject(dir));
if (cmd === 'export') process.stdout.write(`${store.exportMarkdown()}\n`);
else if (cmd === 'info') process.stdout.write(`${JSON.stringify(store.info(), null, 2)}\n`);
else if (cmd === 'audit') {
  // Read-only: lists what is wrong; fixes go through memo_post.
  const findings = auditAll(store);
  const n = (s: string): number => findings.filter((f) => f.severity === s).length;
  const counts = store.info().counts as Record<string, number>;
  if (json) process.stdout.write(`${JSON.stringify({ counts, findings }, null, 2)}\n`);
  else {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const lines = [`memo audit: ${total} memos (${Object.entries(counts).map(([t, c]) => `${c} ${t}`).join(', ')})`, ''];
    for (const f of findings) lines.push(`${f.severity.toUpperCase().padEnd(5)}  ${f.code.padEnd(5)}  ${f.check.padEnd(15)}  ${f.message}`);
    if (findings.length) lines.push('');
    lines.push(`${n('error')} error${n('error') === 1 ? '' : 's'}, ${n('warn')} warning${n('warn') === 1 ? '' : 's'}, ${n('info')} info`);
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  if (n('error')) process.exitCode = 1;
} else { process.stderr.write('Usage: cli.ts info|export|audit [--json] [project_dir]\n'); process.exitCode = 2; }
store.close();
