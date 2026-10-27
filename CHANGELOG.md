# Changelog

All notable changes to the `dev` plugin. Versions follow [Semantic Versioning](https://semver.org/); the format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.0.0] - 2026-10-27

Adds ideas from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan (MIT): proof on the real artifact, rigor that follows the ticket's tier, and small leaf files read only when a trigger holds. Major version because `review-code` output and the ticket `## Result` format changed. A skill stops for you only when a criterion is ambiguous or more than one option fits; `session-retro`, `setup-need-install`, `setup-repo` and the `Always pause` list keep their approvals.

### Added

- `review-impact` (agent): what a change breaks outside its diff, with the one safety fact proven by running real code.
- `explore-why` (agent): why existing code is shaped as it is, from history, pull requests, tickets and memory; ends with Preserve, Change freely, Avoid and Risk.
- `test-benchmark` (agent): vets a performance number before it is reported or acted on.
- `setup-verify` (you type): generates a project `verify-<app>` skill that drives the real app and keeps evidence; `refresh` updates it.
- Leaf files: `test-plan/PROOF.md` (proof levels 1 to 5; verdicts `VERIFIED`, `NOT VERIFIED`, `INCONCLUSIVE`), `implement-ticket/SEQUENCE.md` (baseline, one checked unit at a time, commit order), `review-code/JUDGMENT.md` (finding format and lead judgment), `debug-diagnose/PREMISE.md` (attack the premise, fix the root cause), `implement-spec/WORKERS.md` (worker brief, report block, check before integration, worktree removal), `plan-tickets/WIDE-REFACTOR.md` (expand-contract) and `plan-tickets/REAL-TRACKER.md` (draft lint, printed script, issue body), split out so `plan-tickets` loads them only when they apply.
- `plan-tickets/TWO-WAY.md`: a forward and a backward draft of the epic from two subagents, compared row by row (both, backward only, forward only, order conflict); runs for every epic that is not small, contained and plain, and stops for `clarify-grill` when the drafts disagree on more than half the tickets. A rubric written before the drafts picks the base; risks are tied to the ticket that carries them.
- `design-modules/RED-FLAGS.md`: design red flags for code an agent extends (leakage, temporal decomposition, split ownership, two ways to do one task, importable internals, hand-synced lists); read by Design It Twice and `design-improve`.
- Ticket header lines `**Files:**` (expected paths) and `**Proof:**` (what shows it done).
- `plan-tickets/check-tickets.mts`: lints a breakdown before it is published: file names, header lines (`Files:` and `Proof:` on every non-spike ticket), unique ids, blocking edges (unknown, dropped, numbered late, cycles), requirement codes against the spec index, a spike before every open requirement, and coverage of the epic's codes.
- `**Baseline:**` ticket header line, and a `Baseline:` line in `light` and `full` test plans.
- `Always pause` line in `workflow.md`.
- `npm run check` fails on broken relative links, leaf files no `SKILL.md` reaches, and unknown `dev:<name>` references.

### Changed

- Skills never run `gh` or `glab` writes (issues, pull requests, comments), even under `Git writes: run`: they print them. `plan-tickets` and `plan-ticket-change` write them to a script in `.work/handoff/`.
- Fewer stops: `test-plan` asks no approval at any tier; a self-check stands in for it (every criterion has its proof, every expected value its source, every `Contained` yes its `file:line`). Also tier `check` test plans, typed review (`implement-ticket` names `/dev:review-code <ID>` next to the commit commands), `test-tdd` seams, the `plan-tickets` breakdown, `plan-ticket-change` edits, the end of `clarify-grill`, a single-option `explore-decide`, the `wizard` stage list, `review-learn` on an unfinished ticket and `review-code` with no spec go on without asking. `implement-spec` removes merged, clean worktrees itself.
- `plan-tickets`: an open point whose answer changes the breakdown is settled through `explore-decide` or `explore-prototype` before cutting; one that only changes a value stays a spike.
- `implement-ticket`: stops and points to `plan-ticket-change` when the plan proves wrong (a repeated workaround, files outside `Files:`, the same deviation in two tickets). `implement-spec` runs frontier tickets with overlapping `Files:` one after the other.
- `implement-ticket`: rigor follows the test-plan tier; tier `check` runs no baseline. Triggers call `explore-why`, `review-impact` and `test-benchmark` only when their condition holds. `## Result` records the proof output, the verdict, an `Applied:` line and `skip:` lines.
- `review-code`: a third axis, Impact, runs for risky changes; the smell baseline gains five agent failure shapes; each finding is sorted into act on, consider, noted or dismissed.
- `review-pr`: Merge Danger comes from the Impact reply; evidence is copied from the ticket's proof.
- `implement-spec`: implementers report `PASS`, `ISSUES` or `BLOCKED` with head and proof; the lead reruns each proof before integration and checks worktrees before removal.
- `test-plan`: a "Contained" yes needs a `file:line` or an empty caller search; no new test beats a bad one; `verify-<app>` counts as proof.
- `test-tdd`: a new test must fail for the right reason; tests change only when the expected behaviour changed.
- `debug-diagnose`: premise check after two failed attempts on one belief; perf numbers go through `test-benchmark`.
- `explore-decide`, `plan-tickets`, `design-modules` (judge, rubric and graft in Design It Twice), `session-retro`, `session-handoff`, `session-progress` and `ask-me` take the same ideas where they apply.

## [0.2.0] - 2026-10-14

Fixes from a field report: six tickets (EC-4 to EC-9) taken to delivery in a Go repo with `Storage: in-repo`, `Delivery: pr`.

### Added

- `review-learn` (you type): writes a short learning note for a finished ticket or epic to `.work/learn/`: summary, spec, expected outcome, case study, install, and the implementation with one Mermaid diagram per part. Every line traces to the ticket, the spec index, memory or the diff.
- `plan-ticket-change` (you type): split a ticket in two, cancel it, or reopen a cancelled one. It takes the next id, moves acceptance criteria, rewires `Blocked by`, updates the spec index and records the reason as a `decision` memo. It changes no code; branch and worktree removal is printed for you to run.
- `Review` setting in `workflow.md`: `typed` (default, unchanged behaviour) or `inline`. With `inline`, `implement-ticket` and `implement-spec` run the two-axis review themselves instead of stopping for `/dev:review-code`.
- `**Base:**` ticket header line: `implement-ticket` writes the commit the work starts from. `review-code` uses it as the fixed point.
- `npm run check` (`scripts/check-skills.mts`, no install needed): fails when the skill folders, `.claude-plugin/plugin.json`, `skills/help/SKILLS.md`, `README.md` and each `agents/openai.yaml` disagree, or a description is over 250 characters. `npm test` runs it first.

### Changed

- `review-code` reviews the working tree, not only commits: uncommitted changes and new files are included, `.work/` is left out. It accepts a ticket id as the fixed point and reads that ticket's `Base:` line.
- Spec index decisions use the memo code (`D-n`) instead of their own numbering, so one decision has one id. A superseded decision's line moves to the new code. Existing spec indexes keep working as they are.
- `memo-post` asks for `ticket_title` and `epic_title` next to `ticket` and `epic`, so listings show titles instead of bare keys.
- Every command printed for the user carries the plugin namespace (`/dev:implement-ticket`, not `/implement-ticket`).
- Every Skill tool call names the skill in full (`dev:clarify-grill`, not `clarify-grill`).
- `implement-ticket` points to `/dev:plan-ticket-change split` when a diff is over the PR size cap.
- Shorter descriptions for `explore-decide`, `design-modules`, `wizard` and `plan-tickets` (each now under 250 characters). `review-pr` has a description that says what it does.

### Fixed

Hotfix to the `memo` server (server version 0.1.0 → 0.2.0; the plugin stays 0.2.0), from a second field report.

- Updating a decision's `alternatives` is stored. It used to answer `updated: true` and change nothing.
- An update that carries a field it cannot apply (`supersedes`, `signature`, `issue`, `attempt`, a field of another type, a different `type`) is refused with the field's name instead of being ignored. The history records only the fields that changed.
- A decision's `title` cannot change and its `body` only grows with `append: true`, as the `memo-post` rule always said. `rationale`, `alternatives`, epic, ticket, tags and refs can still be corrected.
- A value holding tool-call markup (`<parameter name=`, `</parameter>`, or a field's own closing tag such as `</rationale>`) is refused.
- `refs` on an update are merged with the existing ones instead of replacing them; `refs_remove` deletes some.
- `memo_post` returns `warnings` for an incomplete memo: a decision without a rationale or with rejected options only in its body, no epic, no tags, an epic or ticket without a title, an attempt or fix without an issue. `memo_get` now returns `epic_title` and `ticket_title`.
- `node mcp/memo/cli.ts audit [--json]` runs the same checks over every memo, to find data written before this fix.
- `memo-post`: rewritten rule 5 to match the server, one rule to fix `warnings` at once, and when to split a body. `memo-callback`: a memo found wrong against the repository is marked `stale` or superseded in the same turn. `implement-ticket`: a test that fails for a reason outside the slice is recorded as an `issue`, `attempt` and `fix`, not as a note.

### Renamed

- `/dev:ask` → `/dev:help`, so it no longer reads like `/dev:ask-me`. Type `/dev:help` from now on.
- `skills/ask/CATALOG.md` → `skills/help/SKILLS.md`.
- `skills/setup-need-install/CATALOG.md` → `skills/setup-need-install/TOOLS.md`.

## [0.1.0]

First release: 30 skills, the `memo` MCP server, and the `.work/` layout.

[0.2.0]: https://github.com/nhhthong/skills/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nhhthong/skills/releases/tag/v0.1.0
