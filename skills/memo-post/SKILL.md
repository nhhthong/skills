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
| A choice and why | `decision` | `rationale`, `alternatives` (what was rejected), `supersedes` |
| A lesson, convention, gotcha, term | `note` | `kind` (`convention`, `gotcha`, `lesson`, `structure`, `glossary`) |

Always set `epic` (the epic directory name) with `epic_title`, and `ticket` (the ticket id) with `ticket_title` (the title line of its ticket file), when the work has them. Without the titles, listings show only the keys. Add `refs` (`file`, `commit`, `req`, `url`) for the files and requirement codes involved, and a few `tags`. Reuse tags that exist: `memo_info` lists the top ones.

## Rules

1. **Check first.** Call `memo_callback` with the title's key words. If a memo already says this, update it: pass its `code` (and `append: true` to add to the body). Do not write a second copy.
2. **One fact per memo.** Title is one searchable line. Body holds the detail: exact error text, the command, the reason.
3. **Issues dedupe by `signature`.** Posting the same signature again counts another occurrence and reopens a resolved issue. That is correct: a returning bug is news.
4. **A fix is `unconfirmed` until proven.** Confirm with `memo_post` and `code: "F-n", status: "confirmed"`. Confirming a fix resolves its issue.
5. **Decisions are not edited.** To change one, post a new `decision` with `supersedes`. The old one is kept as history and hidden from search.
6. **Mark outdated memories.** If a note or fix turns out wrong, set `status: "stale"`.
7. **Mask secrets.** Never store tokens, passwords or customer data. Do not record chores that git or the tracker already shows.

Reply with the codes written (for example `I-4, A-6`) and nothing more.
