---
name: implement-ticket
description: "Take one ticket from start to delivery: orient in the code, fill the gaps, plan the proof, build, review, deliver and close. Also resumes unfinished work. Starts on request, or on its own under empowerment mode."
argument-hint: "A ticket id, the pasted text of a ticket, `epic <slug>` or `all` (empowerment), or nothing to resume the work in progress"
---

**Who starts this.** The user asks for it (types it or names it), or `Mode` in `workflow.md` is `empowerment` and the work has reached this step. In any other case, tell the user which command to type, and stop.

Take **one ticket** to delivery. The repo's configuration is `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/dev:setup-repo`.

**Load the state with one command**, before reading anything else:

```
node <skills folder>/session-progress/state.mts               # config, git, tickets, open points, next ticket
node <skills folder>/session-progress/state.mts --ticket <ID>  # this ticket, its requirement lines, the notes that bind it
```

`<skills folder>` is the parent of the folder this file was loaded from.

Its output replaces reading the spec index, the notes file and the other tickets. Open one of those files only for a line the output cut short. Without Node, read `workflow.md`, the ticket file, `.work/spec-index.md` and `grep -i` the notes for the ticket id, its epic and its requirement codes.

Every ticket worked has a **local ticket file** under `.work/tickets/`, holding its `Status`, `Step` and `Result`, so a dead session can be resumed. `implement-ticket` creates whatever record it needs; a missing spec index or epic never blocks it.

**Keep the `Step:` line current**: before each step, replace its value with the step you are about to do (`identify`, `orient`, `fill gaps`, `plan proof`, `build`, `review`, `deliver`, `close`).

Under `Mode: empowerment`, where a step says to ask or wait, take the recommended answer and write `ASK: <question> -> <answer>` in `## Result`; the `Always pause` list still stops you.

## Rigor follows the tier

The tier `test-plan` picks in step 3 decides how much runs:

| | `check` | `light` | `full` |
|---|---|---|---|
| Baseline at `Base:` | none | the touched area's tests | the whole suite |
| Build | make the change, run the existing command | `dev:test-tdd` | `dev:test-tdd` |
| Verdict | the command exits 0 | [PROOF.md](../test-plan/PROOF.md) | [PROOF.md](../test-plan/PROOF.md) |
| Review (step 5) | none | one pass by you | `dev:review-code` |

Read [SEQUENCE.md](SEQUENCE.md) only for a sweep or migration, a bug ticket, or work delivered as more than one commit. Call `dev:explore-why` only when step 1 finds code you must change whose shape you do not understand. Name each leaf read and skill called on the `Applied:` line of `## Result`; a step that does not apply gets `skip: <step>: <reason>` there.

## Steps

### 0. Identify the ticket

- **A ticket id.** Read its file (the `--ticket` output names it). A ticket that exists only on the tracker: read it there and write `.work/tickets/tracked/<ID>-<slug>.md` in the template of [TICKET.md](../plan-tickets/TICKET.md), with a `Tracker:` line holding its URL.
- **Pasted ticket text.** Write it as `.work/tickets/external/<ID>-<slug>.md`, with the id it already has: `Type` (a guess you state), `Requirements: none`, `Blocked by: None`, the acceptance criteria from the text, and `Files:` and `Proof:` once step 1 has found them.
- **Nothing.** Resume the ticket the state output lists under `In progress`. With none, say so and suggest `/dev:session-progress`. Read its last `Step:` and `## Result`, compare with `git status` and `git diff --stat`, and **run the tests before writing more code**: the file can be one step behind the working tree. Continue from the recorded step instead of redoing finished ones, and trust a recorded claim only once the rerun proof agrees with it. A ticket at `Status: in-review` whose commit exists is closed as `done`.
- **`epic <slug>` or `all`** (only under `empowerment`). Work the ready tickets one after another (the state output's `Ready` list, lowest number first), each through steps 0 to 7. An in-progress ticket is resumed first. Skip a ticket at `Status: waiting`.

Set `Status: in-progress`. Then **restate the goal** in three lines: what the user wants (the outcome, not the method), the problem in the code today, the smallest change you expect. When what you find later rules out the request as written, stop and say so instead of building around it.

### 1. Orient

The decisions and notes in the `--ticket` output bind this ticket. If the repo has code, find where the work goes: the module, its entry points, the neighbouring tests, the conventions a new file must match. Send a wide search to a subagent when you have one, so your context stays clean. A fact the next session would lose time rediscovering (where a module lives, an unwritten convention, a trap) becomes a `note` line in `.work/notes.md`, tagged with the ticket and `structure`, `convention` or `gotcha`.

Done when you can list the notes that bind the ticket, the files you will touch, and the repo's test command.

### 2. Fill the gaps

- A question a run answers (does the library accept this input, how fast is the slow path): run it, with a throwaway script or `dev:explore-prototype`, instead of asking.
- An ambiguous acceptance criterion: call the Skill tool with "dev:clarify-grill" on the missing part only.
- A choice between options, or a `spike` in `Blocked by`: call the Skill tool with "dev:explore-decide".
- A question only an outside person can answer: build every part of the ticket that does not depend on it, and list the question under `## Result` as `OPEN:`. Under `micromanagement`, also tell the user to type `/dev:clarify-ask`.

### 3. Plan the proof

Call the Skill tool with "dev:test-plan". Done when the plan is in the ticket file under `## Test plan`.

### 4. Build

- **Base.** `Base:` must be a commit that holds everything but this ticket's work. Planning files not yet committed (setup, spec index, tickets) are committed first under `empowerment` (`chore: plan <epic>`), or printed as a commit for the user. Then write `**Base:** <git rev-parse --short HEAD>` and, for tier `light` or `full`, `**Baseline:**` with the result of the plan's baseline command (`green`, `red: <failing checks>`, or `none: no code at Base`). A check red at `Base:` is pre-existing: list it under `## Result` and leave it, unless it hides this ticket's proof; then say so before building.
- **Branch.** With delivery `pr`, work on a branch named by the repo's pattern. With `commit`, stay on the current branch.
- **Bug ticket.** Call the Skill tool with "dev:debug-diagnose" and let it lead.
- **Tier `check`.** Make the change, run the plan's command.
- **Tier `light` or `full`.** Call the Skill tool with "dev:test-tdd" and build one slice at a time at the plan's seams.

Run single test files often and the whole suite once at the end. When a test fails, change the code. A failure from outside the slice (a race, a leaked key, a broken tool) is recorded as a problem: an `I-n` line in `.work/notes.md`, an `A-n` line per approach tried, an `F-n` line once green. Tick each acceptance criterion as it is met.

**When the plan is wrong, stop instead of patching.** The signs: the same workaround appears a second time; the work needs another ticket's scope; a lock, a cast or an always-set optional field is needed where the plan assumed none; the ticket's `Proof:` names a command a later ticket creates. Write what you found under `## Result`, and tell the user to run `/dev:plan-ticket-change` (under `empowerment`, call it yourself and go on). A test file or a helper outside the `Files:` line is not a sign: add it to the line.

A problem found on the way that this ticket does not fix: when it affects other tickets, open a `bug` ticket through the tracker (`Tracker and pull request writes` in `workflow.md`); otherwise an `I-n` line tagged with this ticket.

Done when every criterion is ticked and the proof is green on the current code, run by you in this session.

### 5. Review

- **Tier `check`**: none. Write `skip: review: tier check`.
- **`micromanagement`**: write `skip: review: typed` and name `/dev:review-code <ID>` next to the commit commands.
- **`empowerment`, tier `light`**: read your own diff once (`git diff <Base>`) against the ticket's criteria and the repo's written standards. Fix what breaks a criterion; list the rest under `## Result`. No subagents.
- **`empowerment`, tier `full`**: call the Skill tool with "dev:review-code" and the ticket id. Each Act on finding is fixed, or written under `## Result` with the reason it stays.

### 6. Deliver and close

One commit carries the code and the closed ticket file. Before committing, fill the ticket file:

- `## Result`: the goal in one line, what changed; the proof command, the output lines that decide it, and the verdict (`VERIFIED`, `NOT VERIFIED` or `INCONCLUSIVE`); pre-existing failures; decisions made (`ASK:` lines, `D-n` ids); follow-ups; the `Applied:` line and `skip:` lines. Do not write the commit hash: `git log --grep '<ID>'` finds it.
- `Status`: under `empowerment` with delivery `commit`, `done`. In every other case `in-review`, turned to `done` when the user confirms the commit or merge, or when a later session finds the commit on the branch.
- An `F-n` line confirmed by this ticket is appended again as `(confirmed)`.
- In `.work/spec-index.md`, when it has them: the epic's line in `## Epics` gains this ticket's id and a gist of at most ten words; an `Infrastructure` row this ticket built says so.

Then deliver, as `workflow.md` says. Under `micromanagement`, **do not run `git commit` or `git push`**: print the message and the commands (a direct request in this session to run them is honoured). Under `empowerment`, run them, never with force.

- **commit**: the message in the repo's convention, naming the ticket id; `git add` with the explicit files from `git status`. Under `in-repo` storage that includes `.work/` (tickets, spec, notes, plans) except `.work/proof/`. More than one unit of work: one commit per unit, in the order [SEQUENCE.md](SEQUENCE.md) gives.
- **pr**: check the diff against the PR size cap first; over it, stop and propose a split (`/dev:plan-ticket-change split <ID>`; under `empowerment`, call it yourself). Then the commit as above, `git push -u origin <branch>`, and the command that opens the pull request, with the body from "dev:review-pr". The repo's PR template wins.

A tracker ticket: mirror the status on the tracker after delivery (`Tracker and pull request writes` in `workflow.md`).

### 7. Next

End with one line naming the next command: `/dev:implement-ticket <ID>` for the next ready ticket, else `/dev:session-progress`.

Given `epic <slug>` or `all`: run the state command again and take the next ready ticket. When none is ready but the output lists `Decided, no ticket yet`, call the Skill tool with "dev:plan-tickets" for the next epic and go on. Stop when nothing is ready and nothing decided is left to cut: what remains waits on an open point. Report with the state output, not a new summary.
