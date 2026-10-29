---
name: plan-ticket-change
description: "Split a ticket in two, cancel it, or reopen a cancelled one, keeping ids, blocking edges, the spec index and notes in step. Starts on request, or on its own under empowerment mode."
argument-hint: "split <ID>, cancel <ID> or reopen <ID>"
---

**Who starts this.** The user asks for it (types it or names it), or `Mode` in `workflow.md` is `empowerment` and the work has reached this step. In any other case, tell the user which command to type, and stop.

Change one ticket that already exists: **split** it, **cancel** it, or **reopen** a cancelled one. Nothing is deleted: a ticket that goes away is `dropped`, never removed, so its id is never reused.

Read this repo's configuration: `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/dev:setup-repo`.

## Steps

### 1. Read the ground

Read the ticket (its file under `.work/tickets/`, or the tracker issue), every ticket that names it in `Blocked by` (`grep -rl "<ID>" .work/tickets`), and the lines of `.work/spec-index.md` that name it (open points, infrastructure). Note its `Status`, `Step`, `Base:` and branch.

Done when you can list the ticket, what blocks it, what it blocks, its requirement codes, and whether work on it has started.

### 2. Propose

- **split**: divide the acceptance criteria into the part that stays and the part that moves. The original id keeps the part that ships first (the work in progress, if any). The moved part becomes a new ticket with the next id (the "Next id" rule in the tracker doc), `Blocked by` the original when it needs the original's code. Each part must still be a vertical slice: verifiable on its own and under the PR size cap. Split the `Requirements` codes, the `Files:` line and the `Proof:` line the same way: each part keeps the files and the proof of its own criteria.
- **cancel**: the reason, and the requirement codes the ticket carried: which ticket covers them now, or that nothing does.
- **reopen**: the ticket must be `dropped`. It goes back to `ready`; check every ticket in its `Blocked by` still exists and is not `dropped`.

For split and cancel, also decide each ticket that was blocked by this one: it now waits on the original, the new ticket, both, another ticket, or nothing.

Show the change as a list of `before → after` lines, one per ticket file, tracker issue or spec index line touched. Then go on to step 3 without waiting. Ask only when the ticket splits two ways that fit equally well. Done when the list is shown.

### 3. Apply

**Local tracker:**

- **split**: rewrite the original's title and criteria (ticked criteria stay ticked), and add under `## Result`: `Split on <date>: <reason>. Moved to <new ID>.` Write the new ticket from the template in [TICKET.md](../plan-tickets/TICKET.md) with `Status: ready`, in the same epic folder, numbered right after the original. If the original's file name no longer matches its title, rename it.
- **cancel**: `Status: dropped`, and the reason under `## Result`.
- **reopen**: `Status: ready`, and a line under `## Result` with the date and the reason.
- Update the `Blocked by` lines and the spec index lines as listed.

**Real tracker:** write the same changes as commands from the tracker doc (create the new issue as a sub-issue of the same epic, edit the original's body, comment the reason, close as dropped, or reopen) in one script, `.work/handoff/ticket-change-<ID>.sh`. Print its path and contents for the user to run, or run it yourself under `Mode: empowerment` (`Tracker and pull request writes` in `workflow.md`).

**Notes:** one `D-n` decision line in `.work/notes.md`: the reason, the option not taken (for example "keep one PR over the cap"), and the original ticket and its epic as tags.

Done when every listed line is applied and `grep -rn "<ID>" .work/` shows no line that disagrees with the change.

### 4. Leave the code to the user

This skill changes tickets, not code.

- **Split of a ticket in progress**: the original keeps its branch and `Base:`. List the changed files (`git status --short`) that belong to the moved part; leave them in place and let the user choose what to do with them.
- **Cancel of a ticket in progress**: name its branch and worktree, and print the `git worktree remove` and `git branch -D` commands. Say plainly when there are uncommitted changes, and never run these commands without the user's confirmation.

End with one line naming the next command: `/dev:implement-ticket <ID>` for the ticket to work next, else `/dev:session-progress`.
