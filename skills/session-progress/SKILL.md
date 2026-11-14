---
name: session-progress
description: Report where the work stands and how it is broken down into epics and tickets.
argument-hint: "An epic, a ticket id, or nothing for the overview"
---

Give the user a **progress report**: where the work stands, and how it is broken down. This skill only reads. Changing a status belongs to `/dev:implement-ticket`; closing an open point belongs to `explore-decide`.

If the user passed an argument, treat it as the target: an epic or a ticket id.

## Steps

1. **Load the state with one command.** `node <skills folder>/session-progress/state.mts` (`<skills folder>` is the parent of the folder this file was loaded from) prints the config, git, the epics, every ticket's status, the frontier, open points, open issues, the last notes, what looks wrong and the next command. For a ticket target, add `--ticket <ID>`: the ticket's header, open criteria, requirement lines and the notes that bind it. Its output is the report's source; do not re-read the files it summarises.
   - With a real tracker, add its open issues (`gh issue list` or `glab issue list`) for tickets with no local file yet.
   - Without Node: `grep -rEH '^\*\*(Type|Parent|Blocked by|Status|Step):\*\*' .work/tickets`, the `Epics` and `Open points` sections of `.work/spec-index.md`, `git status --short`, `git log -1 --format='%h %s'`, and the last lines of `.work/notes.md`.

   If `.work/` is missing, say the repo has no recorded work and stop.

2. **Pick the depth from the target.** No target: the overview. An epic: its tickets, each with status and what it waits on. A ticket id: its acceptance criteria (met and unmet), its test plan, and the decisions and notes recorded against it.

3. **Add what the command cannot see.** Only when the target or a `Looks wrong` line calls for it:
   - what did not hold: an issue seen again after its fix, an approach that failed twice (`grep -w 'I-<n>' .work/notes.md`), a revert (`git log --oneline --grep='[Rr]evert' -n 10`);
   - a ticket `in-progress` with no commit or note in the last 3 days;
   - a ticket `in-review` while `git status` is clean and the branch has commits: it may have been delivered and never closed;
   - an open point an outside person owes, which goes under `Waiting on you` with the requirement it holds back.

   Report each mismatch. Leave the repair to the skill that owns it.

4. **Choose the next step.** The command's `Next:` line, unless step 3 found something that must come first.

5. **Write the report** in the format below. Counts come from the command's `Tickets:` line, not from memory.

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
