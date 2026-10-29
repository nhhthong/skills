---
name: explore-how
description: "Explain how a part of this codebase works: its flow, its pieces, where they live and what is easy to get wrong. Use for 'how does X work', a walkthrough before changing code, or 'where should this live'. For why it is so, use explore-why."
metadata:
  credits:
    skill: how
    author: Lauren Tan
    organisation: pstack
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/how/SKILL.md"
---

# Explore How

Build the mental model a senior engineer needs to start working in an area of this repo: enough to change it safely, not a tour of every line. `explore-why` answers why the code is shaped this way; `explore-research` answers questions about outside libraries and docs.

All exploration is read-only. Each subagent gets the model the `Models:` line in `workflow.md` names for `explore` (none named: inherit).

## Steps

1. **Size the question.** When the scope is vague, state your reading in one line and go on; the user can redirect.
   - **Simple** (one module, one function, a narrow question): explore and explain it yourself, or in one subagent when the reading would fill your context. Go to step 3.
   - **Wide** (a subsystem across many files or services, a feature that cuts across layers, an architecture overview): go to step 2.

   When in doubt, take the simple path. Done when the size is chosen.

2. **Explore in angles.** Split the question into 2 to 4 angles, each a distinct slice (the request path, the storage, the background jobs, the error handling). Spawn one subagent per angle in a single message, each with the explorer brief from [EXPLAINER.md](EXPLAINER.md). Done when every explorer has returned its report.

3. **Explain.** Merge the reports into one explanation in the shape [EXPLAINER.md](EXPLAINER.md) gives. Where two reports disagree, read the code and settle it. Keep the explorers' open questions visible. Done when every claim about the flow names its `file:symbol`, and nothing in the reply contradicts the code.

Record a fact that took real tracing (where a flow starts, a hidden dependency, a trap) as a `note` line in `.work/notes.md` (tag `structure` or `gotcha`), so the next session finds it.
