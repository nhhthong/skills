---
name: memo-callback
description: Recall project memory before working: earlier problems, failed attempts, fixes, decisions and lessons for a topic, ticket, epic or file.
argument-hint: "A question or keywords, an epic, or a ticket id"
---

Read project memory through the `memo_callback` tool. It searches a local SQLite database (full-text, ranked by relevance) of issues, attempts, fixes, decisions and notes.

If the `memo_callback` tool does not exist, memory is not installed: `grep -i` `.work/notes.md` instead, and tell the user once that the `memo` server is not running.

## How

1. **Pick the filters.** A question becomes `query` (key words, not a sentence). A ticket id becomes `ticket`, an epic directory becomes `epic`, a path becomes `file`. Use `types` to narrow: `["decision"]` for "why did we...", `["issue","fix"]` for "have we seen this error".
2. **Search.** Call `memo_callback`. If nothing comes back, try fewer or broader words once, then say there is nothing.
3. **Read what matters.** Rows are short. Call `memo_get` with the code for any row you will act on: it returns the body, linked attempts and fixes, refs and history.
4. **Answer in a few lines.** Name each memo by code and title. For an issue, say which attempts failed and whether a fix is `confirmed`. When resuming work on a topic, also say what was tried and did not hold: a fix now `stale`, an issue seen again after its fix (`occurrences` above 1), an approach that failed more than once. Do not suggest an approach marked `failed` again unless the user asks or something it depended on has changed; name that change. Flag a memo that looks out of date against the code.

With no argument, call `memo_info` for the overview (open issues, epics, tickets) and show the last updated memos.

Memory shows what was true when it was written. Before recommending a file, function, flag, version or value a memo names, check it against the repository. When it no longer holds, repair the memory in the same turn: a note or fix gets `status: "stale"` (or an update with the corrected text), a decision gets a new `decision` with `supersedes`. A newer memo that covers the same ground makes the older one `stale`.
