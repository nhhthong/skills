# Changelog

All notable changes to the `dev` plugin. Versions follow [Semantic Versioning](https://semver.org/); the format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

### Renamed

- `/dev:ask` → `/dev:help`, so it no longer reads like `/dev:ask-me`. Type `/dev:help` from now on.
- `skills/ask/CATALOG.md` → `skills/help/SKILLS.md`.
- `skills/setup-need-install/CATALOG.md` → `skills/setup-need-install/TOOLS.md`.

## [0.1.0]

First release: 30 skills, the `memo` MCP server, and the `.work/` layout.

[0.2.0]: https://github.com/nhhthong/skills/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nhhthong/skills/releases/tag/v0.1.0
