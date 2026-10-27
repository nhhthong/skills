# Two-way planning

Two subagents cut the same epic from opposite ends, and you compare. Each direction misses a different thing:

- **Forward** (from the code as it is to the goal) orders work well and reuses what exists, but finds a missing prerequisite (a contract, a component, data to backfill, an access right) only when it reaches it.
- **Backward** (from the proof that each requirement is done, back to the code) finds what must exist first, but tends to rebuild what the code already has.

Where they disagree is where the plan is weakest.

Work in `.work/plans/<epic-slug>/`: `brief.md`, `forward.md`, `backward.md`, `compare.md`.

## 1. Ground once

Write `brief.md`, the only input both subagents get:

- the epic's goal in two lines, and its requirement codes with their spec index line and status;
- the decisions and notes that bind it (`memo_callback` with the epic and the module names);
- the code map from step 3: modules, entry points, test commands, what already exists for this epic;
- the constraints: the vertical-slice rules in step 4 of [SKILL.md](SKILL.md), the PR size cap, the spec index's `Infrastructure` table.

No ticket ideas in the brief: a draft there anchors both directions to it.

Then write the **rubric** at the top of `compare.md`, before either draft exists. The subagents never see it; it picks the base in step 4. Grade each draft on:

- **Coverage**: every requirement has a ticket whose `Proof` shows it done.
- **Grounding**: fewest assumptions with no source in the brief.
- **Risk first**: the riskiest unknown sits in the first tickets.
- **Slices**: each ticket is verifiable alone, fits one session and stays under the PR size cap.
- **Reuse**: it builds on what the code already has instead of rebuilding it.

Add a criterion the epic needs (ordering, backfill, a migration window). Done when every requirement of the epic is in the brief with its source, and the rubric is written.

## 2. Fan out

Spawn both subagents in one message, in the background, with the brief's path and their own output file. Neither sees the other's output.

- **Forward**: "Start from the code as it is. Cut the smallest runnable slice toward the goal, then the next one that builds on it, until every requirement in the brief is met."
- **Backward**: "Start from the end. For each requirement, write the evidence that proves it done: a command and its output, a request and its response, a screen. Then ask what must already exist for that evidence to pass: data, a contract, a component, an access right, a decision. Repeat until you reach what the code already has. Then group the result into tickets in the order it must be built."

Tell both: "Make the best plan you can from your direction. Do not hedge toward what another planner might write: the differences are what the comparison uses." Both return the same format:

```markdown
## Tickets
- F1 | <title> | <feature, task, bug or spike> | Requirements: <codes> | Blocked by: <F-ids or none> | Files: <expected paths> | Proof: <command or observation> | Assumes: <what it takes as already true>

## Assumptions
- <every fact the plan takes as true without a source in the brief>

## Considered and rejected
- <a cut or an order it weighed, and why it lost>
```

Number forward tickets `F1…` and backward tickets `B1…`. When one subagent returns nothing, plan from the other and say the comparison did not run. Done when both files exist, or the dropout is named.

## 3. Compare

Match the tickets by requirement code and proof, not by title. Sort every ticket into one row:

| Row | Means | Do |
|---|---|---|
| **Both** | The two directions agree | Keep |
| **Backward only** | A prerequisite the forward pass would hit late | Add it, inside the first ticket that needs it when it is infrastructure (step 4 rule) |
| **Forward only** | Possibly scaffolding the end state does not need | Keep it only if a requirement or a later ticket needs it; otherwise drop it, with the reason |
| **Order conflict** | The two disagree on what blocks what | Keep the edge one ticket truly needs: the other's code, data or decision. Drop the other |

Then compare the `Assumptions` lists. An assumption one side makes and the other contradicts, or that no source in the brief supports, becomes an open point in the spec index, sorted by the **Open points** rule in step 4 of [SKILL.md](SKILL.md): settled now when its answer changes the breakdown, a `spike` in `Blocked by` when it only changes a value.

**When fewer than half the tickets land in Both, stop.** The epic is under-specified: averaging two plans hides the gap. Name the requirements where they diverge, call the Skill tool with "dev:clarify-grill" on those only, and run this leaf again.

Done when every ticket of both drafts sits in one row with its action.

## 4. Merge

Score both drafts against the rubric, criterion by criterion, and take the higher as the base; on a tie, the one with fewer tickets. Fold the other's kept tickets into it by hand, so the result reads as one plan. Number it riskiest unknown first, as step 4 of [SKILL.md](SKILL.md) says.

Write `compare.md`: the rubric scores and the base, the counts per row, each added, dropped or reordered ticket with its row and reason, the new open points, and the risks, each with the ticket that carries it and what to watch while building it. In step 5, show the breakdown with a three-line summary from `compare.md`: what the backward pass added, what was dropped, which edges changed. Done when `compare.md` holds the scores, the base and a reason for every change.

Adapted from pstack (Lauren Tan, MIT): `arena` (shared grounding, independent candidates, pick a base and graft, reframe instead of averaging) and the prototype-first rule of `poteto-mode`'s multi-phase plan.
