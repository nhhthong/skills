---
name: review-learn
description: Write a short learning note for a finished ticket or epic (summary, spec, outcome, case study, install, implementation with Mermaid diagrams), saved under .work/learn/.
argument-hint: "A ticket id, an epic, or nothing for the last finished ticket"
disable-model-invocation: true
---

Turn finished work into a **learning note**: one Markdown file a developer new to this code reads in five minutes and then knows what was built, why it is shaped that way, and where it lives. Write it in professional English, short sentences, present tense.

The note is a summary of what happened, never a design of what could happen: every line traces to a source below. A section with no source says so in one line rather than being filled with a guess.

## Steps

### 1. Pick the target

- **A ticket id**: that ticket.
- **An epic** (its directory under `.work/tickets/`): every ticket in it with `Status: done` or `in-review`, one note for the epic.
- **Nothing**: the ticket with `Status: in-review` or `done` whose file changed last.

A ticket that is not `in-review` or `done` is unfinished work: write the note anyway, and start it with `Unfinished: <Status>`.

Done when you can name the ticket or tickets and the output file: `.work/learn/<ID>-<slug>.md` for a ticket, `.work/learn/<epic-slug>.md` for an epic. If the file exists, update it in place.

### 2. Gather the sources

- **Ticket file**: `What to build`, acceptance criteria (ticked or not), `Requirements`, `New infrastructure`, `## Test plan`, `## Result`, `Base:`.
- **Spec index** (`.work/spec-index.md`): the line of each requirement code, and the open points and decisions that name the ticket.
- **Memory**: `memo_callback` with the ticket id, then `memo_get` for each decision, issue and fix it returns.
- **Code**: the changes since the ticket's `Base:` commit (`git diff <Base>`, plus new files), or the commit named in `## Result`. Read the changed files for the real names: routes, functions, tables, keys, topics, queues. When the change sits inside a flow the note must explain and you have not traced it, call the Skill tool with "dev:explore-how" on that flow.

Done when each section of the template below has a source, or you know it has none.

### 3. Write the note

Use the template. Map each section to its source:

| Section | Source |
|---|---|
| Summary | `What to build` and `## Result`: what the feature does and the guarantee it keeps |
| Spec | requirement codes with their spec index lines; `What to build` when there are none |
| Expected outcome | the acceptance criteria, each marked met or not met |
| Case study | the hardest case the work had to survive: test plan rows of kind `concurrency`, `idempotency`, `security` or `resilience`, `issue` memos, review findings |
| Install | `New infrastructure`, and dependencies added in the diff (manifest, `docker-compose`, migrations) |
| Implementation | the diff, one subsection per part (a route, a worker, a consumer, a migration) |
| Decisions and lessons | `decision` memos and `fix` memos, one line each with the code |

Diagrams:

- One Mermaid diagram per implementation part, at most about 12 nodes, with the real names from the code.
- `sequenceDiagram` for a request crossing components, `flowchart` for branching logic, `stateDiagram-v2` for a status lifecycle.
- In a `flowchart`, wrap any node label that holds `(`, `)`, `:`, `{`, `}`, `<` or `/` in double quotes. In a `sequenceDiagram`, write participant names and messages plain.
- No code blocks other than Mermaid; a route or a signature goes inline in backticks.

Redact every secret. Done when the file is written and every section is filled or marked as having no source.

### 4. Check and report

If `mmdc` is on the PATH, render each Mermaid block once to prove it parses. Otherwise re-read each block against the label rules above.

Reply with the file path and the Summary line.

## Template

See [EXAMPLE.md](EXAMPLE.md) for a filled note.

````markdown
# <ID>: <title>

## Summary
<One or two sentences: what the feature does and the guarantee it keeps.>

## Spec
- <code>: <one line from the spec index>

## Expected outcome
- ✅ <acceptance criterion, as a result>
- ❌ <criterion not met, and why>

## Case study
<The hard case in three to five lines: the situation, what breaks without the fix, how the code prevents it.>

## Install
- <component or dependency, version>: <why it is needed>

## Implementation

### <part: route, worker, consumer, migration>
<One to three lines: what it does and the file it lives in.>

```mermaid
<diagram>
```

## Decisions and lessons
- <D-n>: <one line>
- <F-n>: <the pitfall and its fix, one line>
````
