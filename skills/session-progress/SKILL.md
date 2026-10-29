---
name: session-progress
description: Report where the work stands and how it is broken down into epics and tickets.
argument-hint: "An epic, a ticket id, or nothing for the overview"
---

Give the user a **progress report**: where the work stands, and how it is broken down. This skill only reads. Changing a status belongs to `/dev:implement-ticket`; closing an open point belongs to `explore-decide`.

If the user passed an argument, treat it as the target: an epic or a ticket id.

## Steps

1. **Gather the state.**
   - Tickets: `grep -rEH '^\*\*(Type|Parent|Blocked by|Status|Step):\*\*' .work/tickets` gives every ticket's header lines. With a real tracker, add its open issues (`gh issue list` or `glab issue list`) for tickets that have no local file yet.
   - Open points: the `Open points` and `Infrastructure` sections of `.work/spec-index.md`, and every ticket of type `spike` whose `Status` is not `done`.
   - Git: the current branch, `git status --short`, and `git log -1 --format='%h %s'`. Read the branch name pattern from `workflow.md` to match branches to tickets.
   - `.work/notes.md` for the ticket in progress: open issues (`I-n` lines with no `(confirmed)` fix) and recent decisions. Then what did not hold: an issue seen again after its fix, an approach that failed twice (`grep -w 'I-<n>' .work/notes.md`).
   - Reverts: `git log --oneline --grep='[Rr]evert' -n 10` on the current branch and its base. For a question about what was learned or decided, search `.work/notes.md` with `grep -i`.

   If `.work/` is missing, say the repo has no recorded work and stop. Done when every epic and every ticket of the epic in progress has a status you can quote from a file.

2. **Pick the depth from the target.**
   - No target: the overview.
   - An epic: its tickets, each with status and what it waits on.
   - A ticket id: read that ticket's file too, then report its acceptance criteria (met and unmet), its test plan, and the decisions and notes recorded against it.

3. **Look for what looks wrong.** Compare the sources against each other and list every mismatch:
   - a ticket `in-progress` with no matching branch, or with no commit or note in the last 3 days;
   - a ticket `done` while a ticket in its `Blocked by` is still open;
   - an open point that blocks a ticket which is already `ready` or `in-progress`;
   - a ticket `in-review` while `git status` is clean and the branch has commits: it may have been delivered and never closed;
   - a ticket `done` whose commit was reverted, or whose `## Result` verdict is not `VERIFIED`.

   Report each one. Leave the repair to the skill that owns it.

4. **Choose the next step.** The first of these that applies: resume the ticket that is `in-progress` (`/dev:implement-ticket <ID>`); the lowest-numbered `ready` ticket whose blockers are all `done` (`/dev:implement-ticket <ID>`); an open point to settle (`explore-decide`); the next epic to cut (`/dev:plan-tickets`).

5. **Check the numbers.** Before writing, count the tickets per status again from the files and compare with your tables. A count you cannot reproduce is not reported.

6. **Write the report** in the format below.

## Report format

Every status in the report is quoted from a ticket file or the tracker. A fact with no source is named as missing.

```markdown
**Where we are:** <one sentence: the epic in progress, tickets done out of total, the current ticket and its step>

**Breakdown**
| Epic | Status | Tickets |
|---|---|---|
| <title> | <status> | <done>/<total>, or "not cut yet" |

**Epic in progress: <title>**
| Ticket | Status | Title | Waits on |
|---|---|---|---|

**Current ticket: <ID> <title>**
- Step: <the Step line>. Next action: <what the ticket's Result or the last note says>
- Branch: <name>. Uncommitted files: <n>. Last commit: <hash and subject>

**Open points**
- <id>: <the question>. Owed by <who> since <date>. Blocks <ticket or requirement>.

**Waiting on you**
- <a call only the user can make: a choice, an approval, a commit or merge to run, access the agent lacks>. Pick: <the agent's recommendation>. Risk: <what it changes, even when low>.

**Problems** (at most 5, worst first)
- <what did not hold: a reverted fix, an issue back after its fix, an approach that failed twice>. Source: <note ID or commit>

**Looks wrong**
- <the mismatch, and which two sources disagree>

**Next:** <the command from step 4>
```

Each ticket line in a table carries exactly one state, from its `Status:` line and git: `ready`, `blocked by <id>`, `in-progress <branch>`, `verified, uncommitted`, `in-review`, `done <commit>`, `reverted <commit>` or `dropped`.

Leave out a section that has nothing in it. The overview fits on one screen: about 30 lines. For a ticket target, replace **Breakdown** and the epic table with that ticket's acceptance criteria, test plan, decisions and notes.
