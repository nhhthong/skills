# Changelog

Built on [Matt Pocock's skills](https://github.com/mattpocock/skills); v2 ideas from [Lauren Tan's pstack](https://github.com/cursor/plugins/tree/main/pstack). [Semantic Versioning](https://semver.org/).

## [2.1.1] - 2026-10-28

Ideas from Lauren Tan: stricter proof, deeper understanding and review, shorter instructions.

- `explore-how` (new): how code works, explored from parallel angles.
- `explore-why`: confidence tiers; lists searches; admits gaps.
- `design-types` (new): TypeScript types that rule out bad states.
- `review-code`: Adversary axis; only breakages that reproduce.
- `review-impact`: breaks its safety fact on purpose; sees untracked files.
- `review-pr`: "absent, then present" evidence for add-only changes.
- `test-plan`: a proof counts only once seen to fail.
- `test-benchmark`: stricter vetting of speed numbers.
- `test-tdd`: tests must fail when behaviour breaks, survive refactors.
- `implement-ticket`: restates the goal first; runs instead of asking.
- `implement-spec`, `clarify-grill`: workers get goal and tier; a run replaces a question.
- `explore-decide`: provisional decision when docs cannot settle it.
- `setup-repo`: sets the model per kind of helper.
- `setup-verify`: refresh re-drives every feature.
- `session-retro`: rule table pairing each mistake with its enforcer.
- `session-progress`, `memo-callback`: show what did not hold.
- `design-modules`: more red flags; designers and judge on different models.
- `debug-diagnose`, `plan-tickets`, `plan-spec`, `review-pr`, `review-code`, `setup-repo`, `design-modules`: long text split into files read on demand.
- Fixes: memory survives a renamed clone and keeps new tags on repeats; ticket lint accepts spaced codes, reports typos, flags duplicate numbers.

## [2.0.1] - 2026-10-27

Fewer stops, more accurate plans.

- `plan-tickets`: big epics planned forward and backward, compared, linted.
- `implement-ticket`: stops when the plan proves wrong.
- `implement-spec`: tickets sharing files run one at a time.
- `test-plan`: self-checks instead of asking.
- `design-modules`: red flags for code agents extend.

## [2.0.0] - 2026-10-27

Proof on the real artifact; effort follows risk. Breaking: review output and ticket result format.

- `review-impact`, `explore-why`, `test-benchmark`, `setup-verify` (new).
- `test-plan`: proof levels and a verdict.
- `review-code`: Impact axis for risky changes.
- `implement-ticket`: small change, small process.
- `implement-spec`: workers report pass, issues or blocked; proof is rerun.

## [0.2.0] - 2026-10-14

- `review-learn`, `plan-ticket-change` (new).
- `review-code`: reviews uncommitted work; accepts a ticket id.
- Memory fixes; `ask` renamed `help`.

## [0.1.0]

First release: 30 skills, a local memory server, the `.work` layout.

[0.2.0]: https://github.com/nhhthong/skills/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nhhthong/skills/releases/tag/v0.1.0
