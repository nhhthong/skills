---
name: session-retro
description: "Conduct a retrospective on a coding session."
disable-model-invocation: true
---

The user has asked for a **retrospective**. You are suggesting improvements to the coding agent's **environment** to improve future runs.

## Steps

1. Call the Skill tool with `dev:agent-docs` for the writing style guide.

2. Read the primary sources for the session the user specifies. This may mean searching through session logs on this machine. If the user doesn't specify a session, default to the current one.

3. Look for candidates for improvement in these categories.

- **Navigation**: how easy was it for the agent to find the right files? Are there hidden dependencies between files? Would a **navigation pointer** make it easier? _Use when_ the session took a long time to find a piece of information.
- **Automated checks**: are there automated checks that could catch errors the agent made? Linting, typing, tests, filesystem linters? Read the repo's own check command first (its `package.json`/build-tool `lint`/`check` scripts, its CI workflow), so a check that already exists but sits unwired or silently broken is the finding, not a reinvention. A repo with no **guardrail** (no pre-commit hook and no CI job running its lint/typecheck/test command) is itself a finding: an un-linted repo is a standing missed opportunity, not a neutral default. _Use when_ the agent made a mistake an automated check could have caught, or the repo has no guardrail at all.
- **Coding standards**: should the **reviewer agent** be given a new rule to enforce? Should an existing rule be removed or clarified? Classify the violation first: a **mechanical** one (a fixed syntactic pattern, a banned API, an import shape, a file-location rule) gets a deterministic check, full stop: a custom rule in the repo's own linter, a new pre-commit hook, or a new CI job, whichever the repo's language and existing guardrail make cheapest. Default to building the check over writing the rule. Reserve `CODING_STANDARDS.md` for genuine **judgement calls** (cross-file consistency, "matches the surrounding style," anything no guardrail could ever substitute for). _Use when_ the reviewer agent failed to catch a mistake.
- **Global AGENTS.md**: are there any steering instructions that should be moved to coding standards (or automated checks) instead? _Use when_ the AGENTS.md file is particularly large - in the repo OR the user's global scope.
- **Tool economy**: did the agent make expensive tool calls that could be streamlined? Is there any custom tooling (CLI's, MCP's) that is particularly token-inefficient? _Use when_ the agent made an expensive tool call.
- **No-ops**: look for instructions in steering files that don't modify the agent's behavior. _Use when_ the steering files are large and unwieldy.
- **Information access**: look for opportunities to increase the agent's access to information. Teeing dev server logs, readonly access to third-party services. _Use when_ a crucial piece of information was not available to the agent.
- **Skill routing**: did a skill exist for the job but never start, or start when it did not fit? The finding is a change to that skill's `description` (`tune description: <path>`), not a new skill. Also look for context the user had to paste that the agent could have fetched itself (a log, a ticket, a doc behind a tool it had). _Use when_ the user named a skill or supplied context by hand.
- **Notes**: did the session lose time to something an earlier session already learned? Check `.work/notes.md` and `workflow.md`: a missing note about where a module lives or what a convention is, an `I-n` line with no `(confirmed)` fix, a delivery rule the agent got wrong. _Use when_ the agent re-discovered a fact or repeated a failed attempt.

4. Group the agent's mistakes into classes; a class counts once it happened twice. Fix each class at the highest level that works: architecture (one owner, one supported way, the wrong import fails), then types, then a lint or check whose error names the fix, then a test, and a written rule last, only for judgement calls. A proposed check comes with proof that it fails on the real past mistake. Done when every candidate from step 3 belongs to a class or is named as a one-off.

   Keep a **rule table** in the repo's `CLAUDE.md` or `AGENTS.md` (in `.work/rules.md` under private storage): one row per rule the agent was corrected on, and the thing that enforces it (`lint: <rule>`, `test: <path>`, `type: <name>`, `check: <script>`, or `written only`). A class that repeats while its row says `written only` is a repeat failure: raise it one level in this retro. A row whose mistake can no longer happen (the check makes it impossible) is deleted, with its enforcer kept.

5. Filter before presenting. Reject a candidate, with its code, when it is: `not durable` (true for this session only), `one source` (seen once, by one lens, with no second sign), `already covered` (a rule, check or skill already says it), `no decision change` (true, but would not have changed what the agent did), or `better as code` (a lint, script or check would enforce it; move it to Backlog as that check).

6. Present the candidates in order of severity as three lists: **Accepted** (with the file it changes), **Rejected** (with the code and the reason), and **Backlog** (worth doing, not now). Wait for the user to pick from Accepted before editing anything.

**Private storage.** When the repo's configuration says `Storage: private` (`.work/config.md`), the repo belongs to a team that has not agreed to these files. Present every suggestion about `CLAUDE.md`, `AGENTS.md`, `CODING_STANDARDS.md`, lint rules and CI as a proposal for the user to take to the team. Edit nothing outside `.work/`.

## Reference

### Implementation vs Review

Remember that all work goes through two stages: implementation and review. The implementation agent has the most **context pressure**. They are responsible for exploration, writing code, and debugging failures.

The review agent has the least context pressure - it receives a diff, so no exploration needed. It often does not need to write code or debug.

This means that the review agent should be responsible for imposing coding standards, not the implementation agent.

### Files

You have access to several files in the repo:

- `CLAUDE.md`/`AGENTS.md`: these files are pushed to the context window of any agent working in this repo. They should be used incredibly sparingly, usually only for **navigation pointers** to other files.
- `CODING_STANDARDS.md`: this file is read during review, not implementation. Add **navigation pointers** to docs folders if the standards file gets more than 1,000 lines long.
- Docs: use docs as references files, pointed to by other files. Look for existing docs before writing new ones.
- Skills: use skills for docs (since their description goes into the agent's context window), or for user-invoked commands. Follow the advice in the `agent-docs` skill.
