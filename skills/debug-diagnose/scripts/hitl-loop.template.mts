#!/usr/bin/env node
// Human-in-the-loop reproduction loop.
// Copy this file, edit the steps below, and run it.
// The agent runs the script; the user follows prompts in their terminal.
// Needs Node 22.18 or newer (runs TypeScript directly) and no packages.
//
// Usage:
//   node hitl-loop.template.mts
//
// Two helpers:
//   await step("<instruction>")             → show instruction, wait for Enter
//   const v = await capture("<question>")   → show question, return the response
//
// At the end, captured values are printed as KEY=VALUE for the agent to parse.
//
// `capture` prints its value back to the terminal, where the agent reads it,
// so capture observations, and leave signing in to the user as a `step`.

import { createInterface } from 'node:readline';

// Pulling lines from one iterator keeps input that arrives early (piped stdin).
const rl = createInterface({ input: process.stdin });
const lines = rl[Symbol.asyncIterator]();
async function readLine(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  const next = await lines.next();
  return next.done ? '' : next.value;
}

async function step(instruction: string): Promise<void> {
  console.log(`\n>>> ${instruction}`);
  await readLine('    [Enter when done] ');
}

async function capture(question: string): Promise<string> {
  console.log(`\n>>> ${question}`);
  return readLine('    > ');
}

// --- edit below ---------------------------------------------------------

await step('Open the app at http://localhost:3000 and sign in.');

const ERRORED = await capture("Click the 'Export' button. Did it throw an error? (y/n)");

const ERROR_MSG = await capture("Paste the error message (or 'none'):");

// --- edit above ---------------------------------------------------------

rl.close();
console.log('\n--- Captured ---');
console.log(`ERRORED=${ERRORED}`);
console.log(`ERROR_MSG=${ERROR_MSG}`);
