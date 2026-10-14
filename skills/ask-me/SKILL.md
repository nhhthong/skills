---
name: ask-me
description: Say what you want to do; get the skill to run and in what order.
argument-hint: "What you want to do, in your own words"
disable-model-invocation: true
---

Pick the skills for the user's situation from [the skill catalog](../ask/SKILLS.md). Do not run them: skills the user types cannot be started from here, so give the commands.

1. **Read the situation.** If the argument leaves out something that changes the answer, ask one question, not a list. The usual unknowns: is there code already, is there a ticket or only an idea, is this a first session or a return.
2. **Choose 1 to 3 skills**, in the order to run them. Prefer `type` skills; they are the entry points. Mention an `auto` skill only when it is the real answer (for example `debug-diagnose` for a bug), because the agent starts it on its own.
3. **Reply** with the command lines, each followed by one short reason:

```text
/dev:setup-repo         once per repo
/dev:clarify-grill-docs settle the design first
```

Common routes:
- Idea or roadmap, no code: `setup-repo`, `clarify-grill-docs`, `plan-spec`, `plan-tickets`, `implement-ticket`.
- A ticket in a large repo: `setup-repo` (private storage), `implement-ticket` with the ticket id or pasted text.
- Back after a break: `session-progress`, then `implement-ticket` with no argument.
- A bug: describe it; `debug-diagnose` starts on its own.
- Before committing: `review-code`.
- A ticket too big for one PR, or no longer needed: `plan-ticket-change`.
- Unsure what was asked of you: `clarify-explain`. Question for someone else: `clarify-ask`.

If nothing fits, say so and suggest `/dev:ask` to browse.
