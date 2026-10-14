---
name: plan-tickets
description: Break a plan, spec, or the current conversation into epics and tracer-bullet tickets, each with its type, requirements and blocking edges, published to the configured tracker.
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it. When the source has no structure yet, cut **epics** first.

Read this repo's configuration: `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/dev:setup-repo`.

Every item is an **issue** with a `type`: `epic` (a parent that groups a region of work), `feature` (a new behaviour, cut through every layer), `task` (work that changes no behaviour a user sees), `bug`, or `spike` (a question to answer before work can start). "Ticket" means a `feature`, `task` or `bug` issue that this skill cuts and `implement-ticket` picks up.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments. Read `.work/spec-index.md` if it exists.

### 2. Cut epics only when the source lacks them

- The source already divides the work into phases with completion criteria (a roadmap): each phase is an epic. Write nothing for the epics, say you skipped the step, and cut tickets for the phase being worked next.
- No such structure: group the requirements into 4 to 10 epics by area of the business, not by directory. The first epic is a runnable skeleton (toolchain, scaffold, one smoke check). Show the epics as a table and get the user's approval before going on.

Cut tickets only for the epic about to be worked. Later epics stay as lines in the spec index until their turn.

### 3. Explore the codebase (optional)

If the repo has code and you have not explored it, do so to understand the current state. Ticket titles and descriptions should use the project's domain glossary vocabulary (or the `glossary` notes in memory: `memo_callback` with type `note`), and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 4. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window, and under the PR size cap in `workflow.md` if there is one
- Any prefactoring should be done first
- Tests belong to the ticket whose behaviour they prove, and an ADR belongs to the ticket that needs the decision. Never cut a ticket whose only job is "write tests" or "write the ADR".
- Fold small chores of the same kind (config, ignore files, a Makefile target) into one ticket.

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Infrastructure arrives with the first ticket that needs it.** Do not cut an "infrastructure first" ticket for components nothing uses yet. When a ticket touches a component that the spec index does not yet list as in place (a queue, a cache, a new service), call the Skill tool with "dev:explore-decide" for its infrastructure branch, then write that component's acceptance criteria into the same ticket and record it in the ticket's `New infrastructure` line.

**Open points.** A requirement still marked ⚠️ in the spec index: the first ticket that needs it lists a `spike` issue for that open point in its `Blocked by`. Cut the spike with the question as its body. `implement-ticket` closes it through `explore-decide` before any code is written.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand-contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Type**: `feature`, `task`, `bug` or `spike`
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?

Iterate until the user approves the breakdown. A good ticket crosses the layers, can be verified on its own, and fits one session.

### 6. Publish the tickets to the configured tracker

Publish the approved tickets. **How** depends on the tracker `/dev:setup-repo` configured; the tickets are the same either way, only the shape of the blocking edges changes:

- **Local files** → write one file per ticket under `.work/tickets/<epic-slug>/<NN>-<ID>-<slug>.md`, numbered from `01` in dependency order (blockers first). Get each ID by the "Next id" rule in the tracker doc. Use the per-ticket file template below: one ticket per file, never a single combined file.
- **A real issue tracker (GitHub, GitLab, Linear, ...)** → publish one issue per ticket in dependency order (blockers first) so each ticket's blocking edges can reference real identifiers. Use the platform's native blocking relationship where it has one; otherwise set each ticket's "Blocked by" to the blocking issues. Make each ticket a sub-issue of its epic, and set its type as the tracker doc says.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT close or modify any parent issue.

<local-ticket-template>

# <ID>: <Ticket title>

**Type:** <feature | task | bug | spike>
**Parent:** <epic id>
**Requirements:** <codes from the spec index, or "none">
**Blocked by:** <ticket ids, or "None (can start immediately)">
**Status:** ready
**New infrastructure:** <component, or "none">
**Step:** <added by /dev:implement-ticket; leave empty>
**Base:** <added by /dev:implement-ticket; leave empty>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

## Test plan (added by /dev:implement-ticket)

## Result

</local-ticket-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (the epic, or the source issue if it was an existing one).

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer implementation.

## Requirements

The requirement codes from the spec index, or "none".

## New infrastructure

The component this ticket introduces, or "none".

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None (can start immediately)". Omit this section when blockers were set as native edges.

</issue-template>

In either form, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
