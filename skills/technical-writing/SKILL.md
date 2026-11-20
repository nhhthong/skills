---
name: technical-writing
description: "Write or review docs people read (README, ADR, how-to, PR body, commit message, learning note): pick the doc type, then plain, unambiguous sentences. Use when writing such a doc, or for /technical-writing."
---

# Technical writing

Write so a tired engineer understands on the first read. Apply the four layers below, then `dev:unslop` on the result. For text an agent reads (a `SKILL.md`, `CLAUDE.md`), use `dev:agent-docs` instead.

Three rules sit above the layers:

- **Cut every word that does no work.** If the sentence survives without a word, the word goes.
- **Use the short, everyday word.** "Use", not "utilize". "Do", not "perform".
- **When a rule makes a sentence worse, fix the sentence another way or leave it alone.** A sentence that follows every rule and sounds machine-written has failed.

The codebase is the word list. Write the real symbol, file, flag or command name, not a description of it. Use the terms in `GLOSSARY.md` when the repo has one.

## Vary the rhythm

- Mix sentence lengths. Short sentences land a point. Longer ones carry a fact with its condition.
- Split a sentence that carries two thoughts. Keep a long sentence that carries one.
- Have a view where the doc type allows it. An explanation weighs trade-offs and says what you make of them. A reference stays dry.
- Be specific. Not "schema changes can cause issues" but "a column rename fails the build".

## 1. Pick the doc type first

One document, one type. Ask two questions: does it inform action or understanding, and does it serve learning or work?

| | Learning | Work |
|---|---|---|
| **Action** | Tutorial | How-to |
| **Understanding** | Explanation | Reference |

- **Tutorial.** The learner's success is your job. Say what they will build. Every step gives a visible result; say what they should see. Keep explanation to one clause and a link.
- **How-to.** Steps to a goal a person has. Assume competence. Action only; link the background. Allow forks: "If you want x, do y." Name it by the task: "How to rotate the signing key".
- **Reference.** Facts for lookup: options, limits, errors. No instruction, no opinion, no hedging. Mirror the structure of the thing described. Generate it from code where possible.
- **Explanation.** One bounded topic and a real "why": decisions, history, constraints, alternatives. Opinion belongs here and nowhere else.

Do not mix types. Split and link instead.

## 2. Write to the reader

- Use "you" and the present tense. Use "will" only for things that happen later.
- Say who does what: "the compiler checks", not "is checked".
- Write instructions as commands: "Run `npm test`." Put the condition first: "To delete the branch, run...".
- Put the common case first, exceptions after.
- Never write "simply", "easy" or "quickly" in a procedure, and never "please".
- Link text says where the link goes. Never "click here".
- A heading carries the point, in sentence case. A task heading is a verb phrase ("Create an instance").
- Numbered lists for sequences, bullets for the rest. Introduce a list with a full sentence and keep its items parallel.
- Code, paths and commands go in code font.

## 3. One statement at a time

- One instruction per sentence. Split an instruction over about 20 words, any other sentence over about 25.
- Put a warning before the step it guards.
- Keep "the" and "a": "Remove backup file" reads two ways.
- One word per action, kept throughout: "start" everywhere, not "start" here and "initiate" there.

## 4. No sentence with two readings

- Keep "only" and "not" next to the word they change.
- Break up noun strings: "the proto import budget check script" is "the script that checks the proto-import budget".
- Every "it", "they" and "this" points at one obvious thing. Repeat the noun when in doubt.
- Do not drop verbs: "Phase 1 moves the converters and Phase 2 the runtime" needs a second verb.
- Use periods, not semicolons. No slashes: write "a, b, or both".
- Call each thing by one name everywhere. Skip idioms and Latin abbreviations.

## Pull requests and commits

Every layer but the doc type applies. A PR body is a briefing a reviewer reads in under a minute: link logs and metric tables instead of pasting them. Make every count or file-tree claim true at the commit that lands it, with the command that regenerates it.

## Example

Before:

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

After:

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.
