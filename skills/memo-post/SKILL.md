---
name: memo-post
description: Record what was learned in project memory: a problem met, an approach tried (even a failed one), a fix that worked, a decision with its reason, or a technical lesson.
argument-hint: "What to remember (optional: the skill picks it up from the session)"
---

Write to project memory through the `memo_post` tool. The memory is a local SQLite database under `~/.claude/memo/`, one file per project. It is outside the repo, so nothing here is committed.

If the `memo_post` tool does not exist, memory is not installed: append the entry to `.work/notes.md` in the format `workflow.md` describes, and tell the user once that the `memo` server is not running.

## What goes where

| Fact | `type` | Key fields |
| --- | --- | --- |
| A problem, error or surprise | `issue` | `signature` (stable: error class + module, no paths, ids or line numbers) |
| An approach tried, failed or not | `attempt` | `issue`, `outcome` (`failed`, `partial`, `worked`) |
| What solved the problem | `fix` | `issue`, `attempt`, `status` (`unconfirmed` until the original loop is green, then `confirmed`), `pr_ref` |
| A choice and why | `decision` | `rationale` (always: why this option), `alternatives` (every option rejected; the body does not replace it), `supersedes` |
| A lesson, convention, gotcha, term | `note` | `kind` (`convention`, `gotcha`, `lesson`, `structure`, `glossary`) |

Always set `epic` (the epic directory name) with `epic_title`, and `ticket` (the ticket id) with `ticket_title` (the title line of its ticket file), when the work has them. Without the titles, listings show only the keys. Add `refs` (`file`, `commit`, `req`, `url`) for the files and requirement codes involved, and a few `tags`. Reuse tags that exist: `memo_info` lists the top ones. On an update, `refs` are added to the ones already there and `refs_remove` deletes some; `tags` replace the list.

`signature`, `issue`, `attempt` and `supersedes` are set when the memo is created and cannot change later. A field that does not belong to the memo's type is refused.

## Rules

1. **Check first.** Call `memo_callback` with the title's key words. If a memo already says this, update it: pass its `code` (and `append: true` to add to the body). Do not write a second copy.
2. **One fact per memo.** Title is one searchable line. Body holds the detail: exact error text, the command, the reason. A body that covers several topics (ports, environment variables and a healthcheck) is several memos.
3. **Issues dedupe by `signature`.** Posting the same signature again counts another occurrence and reopens a resolved issue. That is correct: a returning bug is news.
4. **A fix is `unconfirmed` until proven.** Confirm with `memo_post` and `code: "F-n", status: "confirmed"`. Confirming a fix resolves its issue.
5. **A decision's choice is not edited.** Its `title` is fixed and its `body` only grows with `append: true`; the server refuses anything else. To change the choice, post a new `decision` with `supersedes`: the old one is kept as history and hidden from search. Correcting `rationale` or `alternatives`, or adding `epic`, `ticket`, `tags` and `refs`, is allowed and recorded in the memo's history.
6. **Mark outdated memories.** If a note or fix turns out wrong, set `status: "stale"`.
7. **Fix `warnings` at once.** A reply with `warnings` names what the memo lacks (no rationale, rejected options only in the body, no epic, tags or titles, a fix with no issue). Send one more `memo_post` with the same `code` and the missing fields.
8. **Mask secrets.** Never store tokens, passwords or customer data. Do not record chores that git or the tracker already shows.

Reply with the codes written (for example `I-4, A-6`) and nothing more.
