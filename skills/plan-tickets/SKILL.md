---
name: plan-tickets
description: "Break a plan, spec, or the current conversation into epics and tracer-bullet tickets, each with its type, requirements and blocking edges, published to the configured tracker. Starts on request, or on its own under empowerment mode."
---

# To Tickets

**Who starts this.** The user asks for it (types it or names it), or `Mode` in `workflow.md` is `empowerment` and the work has reached this step. In any other case, tell the user which command to type, and stop.

Break a plan, spec, or conversation into **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it. When the source has no structure yet, cut **epics** first.

Read this repo's configuration: `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/dev:setup-repo`.

Every item is an **issue** with a `type`: `epic` (a parent that groups a region of work), `feature` (a new behaviour, cut through every layer), `task` (work that changes no behaviour a user sees), `bug`, or `spike` (a question to answer before work can start). "Ticket" means a `feature`, `task` or `bug` issue that this skill cuts and `implement-ticket` picks up.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments. Read `.work/spec-index.md` if it exists, else `.work/spec.md` (a full spec's `R<n>.<n>` codes work the same way for `Requirements:` and `--covers`).

### 2. Cut epics only when the source lacks them

- The source already divides the work into phases with completion criteria (a roadmap): each phase is an epic. Write nothing for the epics, say you skipped the step, and cut tickets for the phase being worked next.
- No such structure: group the requirements into 4 to 10 epics by area of the business, not by directory. The first epic is a runnable skeleton (toolchain, scaffold, one smoke check). Show the epics as a table and go on. Ask only when two groupings fit equally well.

Cut tickets only for the epic about to be worked. Later epics stay as lines in the spec index until their turn.

### 3. Explore the codebase (optional)

If the repo has code and you have not explored it, do so to understand the current state. Ticket titles and descriptions should use the project's domain glossary vocabulary (or the `glossary` notes in `.work/notes.md`), and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 4. Draft vertical slices

Break the work into **tracer bullet** tickets.

**Two ways for anything but a small epic.** Cut the epic with [TWO-WAY.md](TWO-WAY.md), a forward and a backward draft compared, unless every one of these is a clear yes:

- **Small**: you expect three tickets or fewer.
- **One place**: every requirement lands in one module or package of this repo.
- **Nothing crosses**: no caller, service, partner API, queue, webhook, email or file outside the repo sends to it or receives from it.
- **Nothing stored changes shape**: no new table, column, migration, file format, cache key or backfill.
- **Nothing new or open**: no component missing from the spec index's `Infrastructure` table, and no requirement marked ⚠️ or ❌.
- **Nothing severe**: no money, auth, permissions, personal data, deletes, schedules, retries, ordering, or two writers on one record.

A question you cannot answer from the spec or the code counts as no. The user asking for it also runs it. A skip still goes in step 5 as one line: `Two-way: skipped, <the facts that made it small>`. The rules below hold for every draft, the two subagents' included.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window, and under the PR size cap in `workflow.md` if there is one
- Any prefactoring should be done first
- Tests belong to the ticket whose behaviour they prove, and an ADR belongs to the ticket that needs the decision. Never cut a ticket whose only job is "write tests" or "write the ADR".
- Fold small chores of the same kind (config, ignore files, a Makefile target) into one ticket.

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

Number the tickets **riskiest unknown first**: a spike, a ticket that brings new infrastructure, or one whose approach is least certain comes before routine work that does not depend on it. A wrong assumption found in ticket 2 costs less than one found in ticket 9.

**Infrastructure arrives with the first ticket that needs it.** Do not cut an "infrastructure first" ticket for components nothing uses yet. When a ticket touches a component that the spec index does not yet list as in place (a queue, a cache, a new service), call the Skill tool with "dev:explore-decide" for its infrastructure branch, then write that component's acceptance criteria into the same ticket and record it in the ticket's `New infrastructure` line.

**Open points.** Sort each requirement still marked ⚠️ in the spec index before cutting:

- **Its answer changes the breakdown**: which tickets exist, what blocks what, or which component is built (webhook or polling, one service or two). Settle it now, so no ticket is cut on a guess: call the Skill tool with "dev:explore-decide", or with "dev:explore-prototype" when only a run can tell. Keep the evidence (branch, commit, output) with the decision.
- **Its answer only changes a value inside a ticket** (a timeout, a label, a limit): the first ticket that needs it lists a `spike` issue for it in its `Blocked by`. Cut the spike with the question as its body. `implement-ticket` closes it through `explore-decide` before any code is written.

**Wide refactors** are the exception to vertical slicing: when one mechanical change (rename a column, retype a shared symbol) breaks call sites across the codebase so that no slice can land green, cut it as [WIDE-REFACTOR.md](WIDE-REFACTOR.md) says.

### 5. Show the breakdown

Present the proposed breakdown as a numbered list, after the two-way summary or skip line. For each ticket, show:

- **Title**: short descriptive name
- **Type**: `feature`, `task`, `bug` or `spike`
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work
- **Proof**: what shows it done

Check it yourself before publishing:

- The granularity: no ticket too coarse to fit one session, none too fine to verify on its own.
- The blocking edges: each ticket depends only on tickets that genuinely gate it.
- What should be merged or split further.

Then go on to step 6 without waiting. Ask the user only when a requirement is ambiguous or two breakdowns fit equally well; under `Mode: empowerment` in `workflow.md`, take the breakdown you recommend and write an `ASK:` line for it. A good ticket crosses the layers, can be verified on its own, and fits one session.

### 6. Publish the tickets to the configured tracker

Publish the tickets. **How** depends on the tracker `/dev:setup-repo` configured; the tickets are the same either way, only the shape of the blocking edges changes:

- **Local files** → write one file per ticket under `.work/tickets/<epic-slug>/<NN>-<ID>-<slug>.md`, numbered from `01` in dependency order (blockers first). Get each ID by the "Next id" rule in the tracker doc. Use the template in [TICKET.md](TICKET.md): one ticket per file, never a single combined file. Then run [check-tickets.mts](check-tickets.mts) from this skill's folder: `node <skill folder>/check-tickets.mts .work/tickets --epic <epic-slug> --covers <the epic's requirement codes, comma-separated>`. Fix every line it prints and run it again until it exits 0.
- **A real issue tracker (GitHub, GitLab, Linear, ...)** → lint the drafts, then print a script for the user, as [REAL-TRACKER.md](REAL-TRACKER.md) says.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT close or modify any parent issue.
