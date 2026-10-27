# Changelog

All notable changes to the `dev` plugin. [Semantic Versioning](https://semver.org/), [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [2.0.1] - 2026-10-27

Fewer stops, more accurate plans. A skill asks only when a criterion is ambiguous or more than one option fits; `session-retro`, `setup-need-install`, `setup-repo` and `Always pause` keep their approvals.

### Added

- `plan-tickets/TWO-WAY.md`: forward and backward drafts of an epic, compared; runs unless the epic is small and plain.
- `plan-tickets/check-tickets.mts`: lints a breakdown (headers, ids, blocking edges, spec codes, spikes, coverage) for the epic being cut.
- Ticket lines `**Files:**` and `**Proof:**`.
- `design-modules/RED-FLAGS.md`: design red flags for code an agent extends.
- Leaves `plan-tickets/WIDE-REFACTOR.md` and `plan-tickets/REAL-TRACKER.md`, loaded only when needed.

### Changed

- `test-plan` asks no approval; a self-check replaces it.
- No stop for typed review, `test-tdd` seams, `plan-tickets` breakdown, `plan-ticket-change` edits, the end of `clarify-grill`, and single-option choices.
- `gh` and `glab` writes are always printed, never run (rule in `workflow.md`).
- `plan-tickets` settles open points that change the breakdown before cutting.
- `implement-ticket` stops when the plan proves wrong; `implement-spec` serialises tickets that share files.

## [2.0.0] - 2026-10-27

Ideas from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan (MIT): proof on the real artifact, rigor by ticket tier, leaf files read on a trigger. Major: `review-code` output and the ticket `## Result` format changed.

### Added

- Skills `review-impact`, `explore-why`, `test-benchmark`, `setup-verify`.
- Leaves `test-plan/PROOF.md`, `implement-ticket/SEQUENCE.md`, `review-code/JUDGMENT.md`, `debug-diagnose/PREMISE.md`, `implement-spec/WORKERS.md`.
- `**Baseline:**` ticket line; `Always pause` in `workflow.md`.
- `npm run check` catches broken links, unreachable leaves and unknown `dev:` names.

### Changed

- `implement-ticket`: rigor follows the tier; `## Result` records proof, verdict, `Applied:` and `skip:` lines.
- `review-code`: Impact axis for risky changes; findings sorted into act on, consider, noted, dismissed.
- `implement-spec`: workers report `PASS`, `ISSUES` or `BLOCKED`; the lead reruns each proof.
- `test-plan`, `test-tdd`, `debug-diagnose`, `review-pr` and others take the same ideas.

## [0.2.0] - 2026-10-14

### Added

- Skills `review-learn` and `plan-ticket-change`.
- `Review: typed | inline` in `workflow.md`; `**Base:**` ticket line.
- `npm run check` keeps skill folders, `plugin.json`, `SKILLS.md`, README and `openai.yaml` in sync.

### Changed

- `review-code` reviews the working tree and accepts a ticket id.
- Spec index decisions use memo codes (`D-n`).
- Commands carry the `/dev:` namespace; Skill calls use `dev:<name>`.

### Fixed

- `memo` server 0.2.0: updates no longer silently drop fields; `memo_post` returns `warnings`; `cli.ts audit` checks old memos.

### Renamed

- `/dev:ask` → `/dev:help`; `CATALOG.md` files → `SKILLS.md` and `TOOLS.md`.

## [0.1.0]

First release: 30 skills, the `memo` MCP server, the `.work/` layout.

[0.2.0]: https://github.com/nhhthong/skills/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nhhthong/skills/releases/tag/v0.1.0
