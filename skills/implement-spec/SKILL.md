---
name: implement-spec
description: "Implement the result of /dev:plan-spec and /dev:plan-tickets in code. Starts on request, or on its own under empowerment mode."
---

**Who starts this.** The user asks for it (types it or names it), or `Mode` in `workflow.md` is `empowerment` and the work has reached this step. In any other case, tell the user which command to type, and stop.

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

Read this repo's configuration: `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/dev:setup-repo`.

The goal is the entire spec implemented on a single **integration branch**, with every ticket resolved the way the issue tracker closes work.

**Git writes follow `Mode`** (`Tracker and pull request writes` in `workflow.md`). Creating branches and worktrees is always fine. Under `micromanagement`, everything that commits, merges or pushes is printed as a script for the user to run, and so are the pull request commands. Under `empowerment` (`Git writes: run`) you run them. The steps below say what changes under `run`.

Under `Mode: empowerment`, the merger subagent merges each frontier, so the loop runs to the end of the spec.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and the diff of earlier tickets. Don't duplicate information already available via pointers.

**Local tickets live in the main checkout.** `.work/` is not committed in `private` storage, so a worktree does not contain it. Give every subagent the **absolute path** to the main checkout's `.work/` (tickets, spec index, notes) and tell it to read and update ticket `Status:` lines there, never in its worktree.

**Implementer subagents** should be run in the background where possible for maximum concurrency. Read [WORKERS.md](WORKERS.md) before step 4: how to spawn them, the report each one returns, and the check you run before integration.

## Steps

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. Read the delivery rules in `workflow.md`. If delivery is `pr` and the repo has a PR size cap, the integration branch cannot be one PR for the whole spec: plan one PR per ticket branch instead, or let the user split it.

4. Use **implementer subagents** to implement each ticket on the current **frontier**, each in its own worktree on its own branch based on the integration branch. Two frontier tickets whose `Files:` lines share a path run one after the other, not in parallel: their merge would conflict. Each implementer subagent:
   - reads the ticket's test plan, or calls the Skill tool with `dev:test-plan` to write one, and runs the proof command directly when the ticket's tier is `check`;
   - calls the Skill tool with `dev:test-tdd` to build the ticket when the plan calls for tests;
   - leaves its changes uncommitted, and ends with the report block from [WORKERS.md](WORKERS.md).

   Under `run`: each implementer commits in its worktree and merges the integration branch tip into its own branch before reporting done.

5. **Hand off the integration.** Once the frontier's implementers are done and checked as [WORKERS.md](WORKERS.md) says, print one script for the user that covers the verified tickets: for each worktree, `git -C <worktree> add -A` and `git -C <worktree> commit` with that ticket's message, then on the integration branch `git merge --no-ff <ticket branch>`. Save it to `.work/handoff/integration-<n>.sh` as well. Tickets blocked by this frontier need the merged code, so stop here and tell the user to run the script and then `/dev:implement-spec` again to start the next frontier.

   Under `run`: a **merger subagent** merges each completed ticket into the integration branch, and if that changes the frontier you kick off the next implementers straight away.

6. Repeat steps 4 and 5 until every ticket is done.

7. Once all tickets are merged, review the integration branch against the commit it was created from. Under `micromanagement` (`Review: typed`), tell the user to run `/dev:review-code <that commit>`. Under `empowerment` (`Review: inline`), call the Skill tool with "dev:review-code" and that commit. With the findings in hand, fix them in a single **implementer subagent** and hand off that change the same way.

8. Print the closing commands: `git push -u origin <integration branch>`, and for `pr` delivery the command that opens the pull request (one per ticket branch when the PR size cap applies), with the body from the Skill tool called with `dev:review-pr`. Under `run`, push after the first merge; the pull request commands are still printed.

9. Remove the worktrees as [WORKERS.md](WORKERS.md) says.
