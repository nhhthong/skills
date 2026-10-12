---
name: clarify-domain
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a GLOSSARY.md, or recording a decision or an ADR.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* `GLOSSARY.md` for vocabulary is not this skill: that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## File structure

Most repos have a single context:

```
/
├── GLOSSARY.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `GLOSSARY-MAP.md` exists at the root, the repo has multiple contexts. The map points to where each one lives:

```
/
├── GLOSSARY-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── GLOSSARY.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── GLOSSARY.md
│       └── docs/adr/
```

Create files lazily: only when you have something to write. If no `GLOSSARY.md` exists, create one when the first term is resolved. If no `docs/adr/` exists, create it when the first ADR is needed.

**Private storage.** When the repo's configuration says `Storage: private` (`.work/config.md`), create neither `GLOSSARY.md` nor `docs/adr/`. Record a resolved term as a `note` of kind `glossary` and a decision as a `decision`, with `memo_post`. The rules below about what deserves a term or a decision still apply.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `GLOSSARY.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update GLOSSARY.md inline

When a term is resolved, update `GLOSSARY.md` right there. Don't batch these up: capture them as they happen. Use the format in [GLOSSARY-FORMAT.md](./GLOSSARY-FORMAT.md).

Record only a term that was just settled because it caused confusion, or that is the project's own. A project usually needs a handful of terms, not a list of every noun in the domain. Before adding one, ask: would a new reader of this code have misread it without the entry?

`GLOSSARY.md` should be totally devoid of implementation details. Do not treat `GLOSSARY.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. The project's own documents can override this: when they require an ADR for a kind of decision (a changed service boundary, for example), write one. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).

### Record every decision once

Every decision that is settled in the session gets a `decision` memo (`memo_post`), whether or not it also gets an ADR. The full text lives in exactly one place: the ADR if there is one, else the memo. Everywhere else (spec index, tickets) write only the decision's id and one line.

Before recording a decision, `grep -i` the notes and the ADR titles for the same topic. If an earlier decision contradicts the new one, show the user both and let them choose. Never decide that the newer one wins. Record the outcome as a new line that starts with `supersedes <date> <first words of the old line>:`; the old line stays as history, and the ADR (if any) gets a status note pointing to the new one.
