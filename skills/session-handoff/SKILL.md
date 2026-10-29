---
name: session-handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows) - not the current workspace.

Stop at a safe point first: finish or back out of the step in progress, and start nothing new. Then write the document so a cold agent can resume:

- **Intent**: what the work is for, in one or two lines.
- **Where it stopped**: the step, what is verified (with the proof command) and what is not.
- **On disk or only in this conversation**: changed files and their state (`git status --short`), and anything decided here that no file records yet.
- **First action on resume**: one concrete command or step.
- **Gotchas**: what cost this session time.

Skills do not commit. When the tree holds uncommitted work, print the `git add` and `git commit -m "wip: <what>"` commands for the user instead of running them.

Include a "suggested skills" section in the document, naming the skills the next session needs by their full name: an agent skill as `dev:<name>` (for example `dev:debug-diagnose`), a skill only the user can type as `/dev:<name>` (for example `/dev:implement-ticket`).

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
