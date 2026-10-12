---
name: implement-ticket
description: Take one ticket from start to delivery: orient in the code, fill the gaps, plan the proof, build, review, deliver and close. Also resumes unfinished work.
argument-hint: "A ticket id, the pasted text of a ticket, or nothing to resume the work in progress"
disable-model-invocation: true
---

Take **one ticket** to delivery. Read this repo's configuration first: `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/setup-repo`.

Every ticket worked has a **local ticket file** under `.work/tickets/`. The file holds the ticket's `Status`, `Step` and `Result`, so a session that dies can be resumed. `implement-ticket` creates whatever record it needs; a missing spec index or epic never blocks it.

**Write the `Step:` line before starting each step**, naming the step you are about to do (`orient`, `fill gaps`, `plan proof`, `build`, `review`, `deliver`, `close`). The last `Step:` line says where a dead session stopped.

## Steps

### 0. Identify the ticket

- **A ticket id.** Read its file in `.work/tickets/`. If the ticket exists only on the tracker, read it there and write a local file for it at `.work/tickets/tracked/<ID>-<slug>.md` in the ticket template of `plan-tickets`, with a `Tracker:` line holding its URL.
- **Pasted ticket text** (from Jira or anywhere else). Write it as a ticket file at `.work/tickets/external/<ID>-<slug>.md`, using the id it already has. Fill `Type` (a guess you state), `Requirements: none`, `Blocked by: None`, and the acceptance criteria from the text.
- **Nothing.** Resume: find the ticket with `Status: in-progress` or `in-review` (`grep -rl` over `.work/tickets/`). With none, say so and suggest `/session-progress`. With one, read its last `Step:` and `## Result`, compare with `git status` and `git log`, and **run the tests again before writing more code**: the file can be one step behind the working tree. A ticket waiting at `Step: review` goes on from step 5; one at `Status: in-review` whose commit now exists is closed as `done`.

Set `Status: in-progress`. Done when you can state the ticket's id and title (and, when resuming, the step you will continue from).

### 1. Orient

Read `CLAUDE.md`, `CONTRIBUTING.md`, the ticket, `.work/spec-index.md` and the glossary (or the `glossary` lines in `.work/notes.md`). `grep -i` `.work/notes.md` for the ticket's module, requirement codes and error messages; notes bind this ticket.

If the repo has code, find where the work goes. Send wide searches to a subagent so your context stays clean: the module, its entry points, the neighbouring tests, the conventions a new file must match. A fact that would cost the next session time to rediscover (where a module lives, which convention is unwritten, a trap) becomes a `note` line in `.work/notes.md`.

Done when you can list: the decisions and notes that bind the ticket, the files you will touch, and the repo's test command.

### 2. Fill the gaps

- Acceptance criteria that are ambiguous: call the Skill tool with "clarify-grill" on the missing part only.
- A choice between options, or an open point or `spike` in `Blocked by`: call the Skill tool with "explore-decide".
- A question only an outside person can answer: tell the user to type `/clarify-ask` for that person, and carry on with every part of the ticket that does not depend on the answer.

Done when no acceptance criterion is ambiguous, or the ones that remain are named as blocked and the user has agreed to proceed without them.

### 3. Plan the proof

Call the Skill tool with "test-plan". Done when the plan is in the ticket file under `## Test plan` and the user approved it.

### 4. Build

- **Branch.** Follow `workflow.md`. With delivery `pr`, work on a branch named by the repo's pattern (creating the branch is fine; committing is not). With `commit`, stay on the current branch.
- **Bug ticket.** Call the Skill tool with "debug-diagnose" and let it lead; it records attempts in the notes.
- **Tier `check`.** Make the change, then run the proof command from the plan.
- **Tier `light` or `full`.** Call the Skill tool with "test-tdd" and build one slice at a time at the plan's seams.

Run the typecheck regularly, single test files often, and the whole suite once at the end. When a test fails, change the code. Tick each acceptance criterion in the ticket file as it is met.

A problem found on the way that is not fixed in this ticket (a defect in other code, a broken environment): if it affects other tickets or needs someone else, open a `bug` ticket for it through the tracker; otherwise add a `bug` line to `.work/notes.md`.

Done when every acceptance criterion is ticked and the proof is green on the current code.

### 5. Review

`/review-code` is a skill you type, so you cannot call it. Write `Step: review` in the ticket file, then tell the user to run `/review-code` with the branch or commit the work started from as the fixed point (they may choose another review instead, or skip it), and stop. When the user runs `/implement-ticket` again, ask what the review found. Done when each finding is either fixed or written under `## Result` with the reason it stays, or the user says to skip the review. The review is input for the human reviewer, not an approval.

### 6. Deliver

Follow `workflow.md`. **Skills do not run `git commit`, `git push` or open a pull request.** Print them for the user, unless `workflow.md` says `Git writes: run` or the user asks you in this session to run them.

- **commit**: print the commit message in the repo's convention, then the commands in order: `git add` with the explicit files from `git status` (leave out `.work/`), then `git commit` with that message.
- **pr**: check the diff against the PR size cap first; if it is over, stop and propose how to split the ticket. Then print the branch check, the commit message and commands as above, `git push -u origin <branch>`, and the command that opens the pull request. Call the Skill tool with "review-pr" for the body and print it. The repo's PR template wins over the skill's template.

Done when the message and the commands are printed (or, under `Git writes: run`, you have a commit hash or a PR URL).

### 7. Close

- Set `Status: in-review`: the work is complete and waits for the user to commit or merge it. Set `Status: done` when the user confirms the commit or the merge, or when a later `/implement-ticket` or `/session-progress` finds the commit on the branch.
- Fill `## Result`: what changed, the proof and its outcome, the commit message and commands you printed (or the PR or commit), the decisions made, the follow-ups.
- Turn a `fix` note from `(unconfirmed)` to `(confirmed)` by appending a new line.
- Add `note` lines for anything the next session would lose time without.
- A tracker ticket: mirror the status on the tracker and close it only after delivery is confirmed.

End with one line naming the next command: `/implement-ticket <ID>` for the next ready ticket whose blockers are done, else `/session-progress`.
