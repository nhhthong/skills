---
name: explore-research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Spin up a **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. For a question about a library, framework, SDK, API or CLI tool, start with **Context7** when the session has it: resolve the library name to its id, then query that library's current documentation with the specific question. Note the version the docs describe. When Context7 is absent, or has nothing on the library, read the official docs or the source directly, and say in the findings which route you used.
3. Write the findings to a single Markdown file, citing each claim's source (for Context7, the library and the page it returned).
4. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where. `workflow.md` names the folder (`.work/research/`) when the repo has been set up.
