---
name: implement-ticket
description: Take one ticket from start to delivery: orient in the code, fill the gaps, plan the proof, build, review, deliver and close. Also resumes unfinished work.
argument-hint: "A ticket id, the pasted text of a ticket, or nothing to resume the work in progress"
disable-model-invocation: true
---

Take **one ticket** to delivery. Read this repo's configuration first: `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/dev:setup-repo`.

Every ticket worked has a **local ticket file** under `.work/tickets/`. The file holds the ticket's `Status`, `Step` and `Result`, so a session that dies can be resumed. `implement-ticket` creates whatever record it needs; a missing spec index or epic never blocks it.

**Write the `Step:` line before starting each step**, naming the step you are about to do (`identify`, `orient`, `fill gaps`, `plan proof`, `build`, `review`, `deliver`, `close`). The last `Step:` line says where a dead session stopped.

## Rigor follows the tier

The tier that `test-plan` picks in step 3 (`check`, `light`, `full`) decides how much of the process below runs. A small change gets a small process: tier `check` runs no baseline, its proof is the plan's existing command, and its verdict is `VERIFIED` when that command exits 0 on the current code, `NOT VERIFIED` when it fails, and `INCONCLUSIVE` when it could not run.

Read a leaf only when its condition holds:

- Tier `light` or `full`, or a subagent reports work as done: [PROOF.md](../test-plan/PROOF.md).
- Tier `light` or `full`, a sweep or migration, a bug ticket, or work you will deliver as more than one commit: [SEQUENCE.md](SEQUENCE.md).

Call a skill only when its condition holds:

- Step 1 finds code you must change whose shape you do not understand (a guard, a retry, a flag, an odd boundary): `dev:explore-why`.
- Before step 5, when the Impact rule in step 4 of [review-code](../review-code/SKILL.md) holds: `dev:review-impact` on the diff since `Base:`.

Name each leaf you read and each skill you called on the `Applied:` line of `## Result`. A step that does not apply to this ticket gets a `skip: <step>: <reason>` line there instead of silent omission.

## Steps

### 0. Identify the ticket

- **A ticket id.** Read its file in `.work/tickets/`. If the ticket exists only on the tracker, read it there and write a local file for it at `.work/tickets/tracked/<ID>-<slug>.md` in the template of [TICKET.md](../plan-tickets/TICKET.md), with a `Tracker:` line holding its URL.
- **Pasted ticket text** (from Jira or anywhere else). Write it as a ticket file at `.work/tickets/external/<ID>-<slug>.md`, using the id it already has. Fill `Type` (a guess you state), `Requirements: none`, `Blocked by: None`, the acceptance criteria from the text, and `Files:` and `Proof:` once step 1 has found them.
- **Nothing.** Resume: find the ticket with `Status: in-progress` or `in-review` (`grep -rl` over `.work/tickets/`). With none, say so and suggest `/dev:session-progress`. With one, read its last `Step:` and `## Result`, compare with `git status` and `git log`, and **run the tests again before writing more code**: the file can be one step behind the working tree. The ticket file is the record: continue from it rather than redoing finished steps, and trust its claims only once the rerun proof agrees with them. A ticket waiting at `Step: review` goes on from step 5; one at `Status: in-review` whose commit now exists is closed as `done`.

Set `Status: in-progress`. Then **restate the goal** in your first message, in three lines: what the user wants (the outcome, not the method), the problem in the code today, and the smallest change you expect. When what you find later rules out the request as written, stop and say so instead of building around it.

Done when you can state the ticket's id, its title and the goal (and, when resuming, the step you will continue from).

### 1. Orient

Read `CLAUDE.md`, `CONTRIBUTING.md`, the ticket, `.work/spec-index.md` and the glossary (or the `glossary` notes in memory). Call `memo_callback` with the ticket id, then with the module, requirement codes and error messages; the decisions and gotchas it returns bind this ticket.

If the repo has code, find where the work goes. Send wide searches to a subagent so your context stays clean: the module, its entry points, the neighbouring tests, the conventions a new file must match. A fact that would cost the next session time to rediscover (where a module lives, which convention is unwritten, a trap) becomes a `note` line in `.work/notes.md`.

Done when you can list: the decisions and notes that bind the ticket, the files you will touch, and the repo's test command.

### 2. Fill the gaps

- A question that running something answers (does the library accept this input, which layout reads better, how fast is the slow path): find out by running it, with a throwaway script or `dev:explore-prototype`, instead of asking the user.
- Acceptance criteria that are ambiguous: call the Skill tool with "dev:clarify-grill" on the missing part only.
- A choice between options, or an open point or `spike` in `Blocked by`: call the Skill tool with "dev:explore-decide".
- A question only an outside person can answer: tell the user to type `/dev:clarify-ask` for that person, and carry on with every part of the ticket that does not depend on the answer.

Done when no acceptance criterion is ambiguous, or the ones that remain are named as blocked and the user has agreed to proceed without them.

### 3. Plan the proof

Call the Skill tool with "dev:test-plan". Done when the plan is in the ticket file under `## Test plan` and its self-check in step 8 of `test-plan` holds.

### 4. Build

- **Branch.** Follow `workflow.md`. With delivery `pr`, work on a branch named by the repo's pattern: creating the branch is fine; committing is not. With `commit`, stay on the current branch. Before the first change, write `**Base:** <git rev-parse HEAD>` under the ticket's header lines: it is the fixed point the review compares against. For tier `light` or `full`, record the baseline as [SEQUENCE.md](SEQUENCE.md) says.
- **Bug ticket.** Call the Skill tool with "dev:debug-diagnose" and let it lead; it records attempts in the notes.
- **Tier `check`.** Make the change, then run the proof command from the plan.
- **Tier `light` or `full`.** Call the Skill tool with "dev:test-tdd" and build one slice at a time at the plan's seams.

Run the typecheck regularly, single test files often, and the whole suite once at the end. When a test fails, change the code. When it fails for a reason outside the slice you are building (a leaked key, a race with a container, a query that returns the wrong row), record it as a problem, not a note: an `issue` with `memo_post`, an `attempt` for each approach tried, and a `fix` once it is green. Tick each acceptance criterion in the ticket file as it is met.

**When the plan is wrong, stop instead of patching.** The signs: the same workaround shape appears a second time; the work needs files outside the ticket's `Files:` line or another ticket's scope; a lock, a cast or an always-set optional field is needed where the plan assumed none; a second ticket of the epic deviates from the plan the same way the first did. Write what you found under `## Result`, say which tickets it changes, and tell the user to run `/dev:plan-ticket-change` (or `/dev:plan-tickets` for the epic). One odd edge case is not a sign; a repeated shape is.

A problem found on the way that is not fixed in this ticket (a defect in other code, a broken environment): if it affects other tickets or needs someone else, open a `bug` ticket for it through the tracker (for a real tracker, print the command: `Tracker and pull request writes` in `workflow.md`); otherwise record it with `memo_post` as an `issue` linked to this ticket.

Done when every acceptance criterion is ticked and the proof is green on the current code, run by you in this session. For tier `light` or `full`, the verdict is `VERIFIED` by [PROOF.md](../test-plan/PROOF.md).

### 5. Review

Read `Review` in `workflow.md` (missing means `typed`).

- **`typed`**: `/dev:review-code` is a skill you type, so you cannot call it. Do not stop: write `skip: review: typed` under `## Result`, go on to delivery, and name `/dev:review-code <ID>` next to the commit commands, so the user can run it before committing (it reads the ticket's `Base:` line as the fixed point). Tier `check` gets no suggestion: the diff is small enough to read.
- **`inline`**: read [the review-code skill](../review-code/SKILL.md) and run its process yourself, with the ticket's `Base:` commit as the fixed point and the ticket file as the spec. Show the aggregated report, then go on.

Done when each Act on finding is either fixed or written under `## Result` with the reason it stays, or the review is skipped. The review is input for the human reviewer, not an approval.

### 6. Deliver

Follow `workflow.md`. **Skills do not run `git commit` or `git push`.** Print them for the user, unless `workflow.md` says `Git writes: run` or the user asks you in this session to run them. The command that opens the pull request is always printed (`Tracker and pull request writes` in `workflow.md`).

- **commit**: print the commit message in the repo's convention, then the commands in order: `git add` with the explicit files from `git status` (leave out `.work/`), then `git commit` with that message. When the work is more than one unit, print one commit per unit in the order [SEQUENCE.md](SEQUENCE.md) gives.
- **pr**: check the diff against the PR size cap first; if it is over, stop, propose how to split the ticket, and tell the user to run `/dev:plan-ticket-change split <ID>` to apply it. Then print the branch check, the commit message and commands as above, `git push -u origin <branch>`, and the command that opens the pull request. Call the Skill tool with "dev:review-pr" for the body and print it. The repo's PR template wins over the skill's template.

Done when the message and the commands are printed (or, under `Git writes: run`, you have a commit hash).

### 7. Close

- Set `Status: in-review`: the work is complete and waits for the user to commit or merge it. Set `Status: done` when the user confirms the commit or the merge, or when a later `/dev:implement-ticket` or `/dev:session-progress` finds the commit on the branch.
- Fill `## Result`: the goal in one line, then what changed; the proof command, the output lines that decide it, and the verdict (`VERIFIED`, `NOT VERIFIED` or `INCONCLUSIVE`); pre-existing failures from the baseline; the commit message and commands you printed (or the PR or commit); the decisions made; the follow-ups; the `Applied:` line and any `skip:` lines.
- Turn a `fix` note from `(unconfirmed)` to `(confirmed)` by appending a new line.
- Add `note` lines for anything the next session would lose time without.
- A tracker ticket: mirror the status on the tracker and close it only after delivery is confirmed. Print those commands for the user (`Tracker and pull request writes` in `workflow.md`).

End with one line naming the next command: `/dev:implement-ticket <ID>` for the next ready ticket whose blockers are done, else `/dev:session-progress`.
