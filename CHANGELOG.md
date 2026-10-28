# Changelog

All notable changes to the `dev` plugin. [Semantic Versioning](https://semver.org/), [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [2.1.0] - 2026-10-28

More ideas from pstack (Lauren Tan, MIT).

### Added

- Skills `explore-how` and `design-types` (loads on `.ts` files through `paths`).
- Leaves `review-code/ADVERSARY.md` (subagents on mixed models try to break the change; only findings a rerun proves stay), `explore-why/EPISTEMICS.md` and `SOURCES.md`, `setup-verify/REFRESH.md`.
- `Models:` line in `workflow.md`: the model per kind of subagent.
- `session-retro`: rule table, reject codes, "tune description" finding.

### Changed

- A level-4 proof counts only once seen to fail; `review-impact` breaks its safety fact on purpose.
- `implement-ticket` restates the goal first and runs a check instead of asking when a run can answer.
- Judges and adversaries run on a different model from the author.
- `test-benchmark`, `session-progress`, `memo-callback`, `RED-FLAGS.md` and `test-tdd/tests.md` tightened; `review-pr` template gains `Safe because`.
- Long skill bodies split into leaves read on a trigger: `VISUALS`, `LOOPS`, `TICKET` (shared ticket template), `SMELLS`, `IN-REPO`, `FULL-SPEC`, `TESTABILITY`. Bodies total 2,084 lines (2,289 at 2.0.1, with two new skills).

### Fixed

- `memo`: a renamed clone finds its database; a repeated issue keeps new tags, refs and epic; demoting a confirmed fix reopens its issue; `status` filters attempts; `no-epic` is info.
- `check-tickets.mts`: space-separated codes (unknown tokens are reported), first status marker wins, ❌ needs a blocker, `#n` blockers count as spikes, duplicate numbers reported, test-plan checkboxes are not criteria.

## [2.0.1] - 2026-10-27

Fewer stops, more accurate plans. `session-retro`, `setup-need-install`, `setup-repo` and `Always pause` keep their approvals.

### Added

- `plan-tickets/TWO-WAY.md`, `WIDE-REFACTOR.md`, `REAL-TRACKER.md`; `check-tickets.mts` lints a breakdown.
- Ticket lines `**Files:**` and `**Proof:**`; `design-modules/RED-FLAGS.md`.

### Changed

- Skills ask only on an ambiguous criterion or more than one fitting option; `test-plan` self-checks.
- `gh` and `glab` writes are always printed (rule in `workflow.md`).
- `plan-tickets` settles open points that change the breakdown before cutting.
- `implement-ticket` stops when the plan proves wrong; `implement-spec` serialises tickets that share files.

## [2.0.0] - 2026-10-27

Ideas from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan (MIT): proof on the real artifact, rigor by tier, leaves read on a trigger. Major: `review-code` output and the ticket `## Result` format changed.

### Added

- Skills `review-impact`, `explore-why`, `test-benchmark`, `setup-verify`.
- Leaves `PROOF.md`, `SEQUENCE.md`, `JUDGMENT.md`, `PREMISE.md`, `WORKERS.md`.
- `**Baseline:**` ticket line; `Always pause` in `workflow.md`.
- `npm run check` catches broken links, unreachable leaves, unknown `dev:` names.

### Changed

- `implement-ticket`: rigor follows the tier; `## Result` records proof, verdict, `Applied:` and `skip:`.
- `review-code`: Impact axis; findings sorted into act on, consider, noted, dismissed.
- `implement-spec`: workers report `PASS`, `ISSUES` or `BLOCKED`; the lead reruns each proof.

## [0.2.0] - 2026-10-14

### Added

- Skills `review-learn`, `plan-ticket-change`.
- `Review: typed | inline` in `workflow.md`; `**Base:**` ticket line.
- `npm run check` keeps folders, `plugin.json`, `SKILLS.md`, README and `openai.yaml` in sync.

### Changed

- `review-code` reviews the working tree and accepts a ticket id.
- Spec index decisions use memo codes (`D-n`); commands carry the `/dev:` namespace.

### Fixed

- `memo` 0.2.0: updates no longer drop fields; `memo_post` returns `warnings`; `cli.ts audit` checks old memos.

### Renamed

- `/dev:ask` to `/dev:help`; `CATALOG.md` files to `SKILLS.md` and `TOOLS.md`.

## [0.1.0]

First release: 30 skills, the `memo` MCP server, the `.work/` layout.

[0.2.0]: https://github.com/nhhthong/skills/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nhhthong/skills/releases/tag/v0.1.0
