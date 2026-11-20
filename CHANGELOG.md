# Changelog

Built on [Matt Pocock's skills](https://github.com/mattpocock/skills); v2 ideas from [Lauren Tan's pstack](https://github.com/cursor/plugins/tree/main/pstack). [Semantic Versioning](https://semver.org/).

## [2.3.0] - 2026-11-14

Cheaper and unblocked. Found by running the skills on three small projects (a transfer service, a webhook receiver, a CRUD API) with fresh sessions on two models, scored by black-box tests. No breaking change: a repo set up with 2.2.0 keeps working, and its longer `workflow.md` stays valid.

- `session-progress`: new `state.mts`. One command prints config, git, epics, ticket statuses, the frontier, open points, open issues and the next command; `--ticket <ID>` prints one ticket with its requirement lines and the notes that bind it. `implement-ticket` and `session-progress` start from it instead of reading the spec index, the notes and every ticket.
- `setup-repo`: the `workflow.md` template holds settings, one Mode table and the notes format (3.3 KB, was 6.7 KB); `pr`-only lines are deleted for delivery `commit`; under `empowerment` the setup is committed.
- `implement-ticket`: 11.4 KB, was 13.3 KB. One commit carries the code and the closed ticket (no second "close" commit, no hash in the file); `Base:` is taken after the planning files are committed; `Baseline: none` for an empty repo; tier `light` gets one review pass by the agent, `review-code` runs for tier `full`; `all` cuts the next epic when nothing is ready; a `Proof:` that needs a later ticket's command is a planning error.
- `plan-tickets`: a source of up to about 12 requirements is one epic, and the scaffold rides with the first real ticket (no skeleton epic). Two-way planning runs for large or entangled epics and only with subagents. An open point holds back only its requirement; one an outside person owes gets no ticket and no spike. Planning files are committed under `empowerment`.
- `plan-spec`: `## Epics` in the spec index, one line per epic, kept current as tickets close; `R0.n` for unnumbered constraints; a detail the source is silent on is decided by the ticket that meets it, not raised as an open point.
- `explore-decide`: what each mode does with a choice is one list (the hard-to-reverse rule no longer reads two ways); a provisional decision closes its spike; new status `waiting` for a spike an outside person must answer.
- `review-code`: Impact and Adversary run when something already reads the changed data, not for a new route nothing calls; without subagents the axes run in turn.
- `test-plan`: a scaffold ticket is `light` with a smoke test.
- `check-tickets.mts`: accepts `Status: waiting`.
- `unslop` and `technical-writing` (new): rules for text people read. `review-pr` and `review-learn` write by `technical-writing`; `clarify-ask` by `unslop`.

## [2.2.0] - 2026-10-29

Simpler: one notes file, no server, two working modes. Breaking: `memo-post`, `memo-callback` and `help` are removed. Old memory is not read: export it first with the previous version (`node mcp/memo/cli.ts export`) and paste what you need into `.work/notes.md`. A repo set up before `Mode` existed runs as `micromanagement` until you run `/dev:setup-repo`.

- `setup-repo`: asks `Mode` once. `micromanagement` prints every git, issue and pull request command and asks at each real choice. `empowerment` takes recommended answers (logged as `ASK:`), runs those commands (never a force-push) and the review itself; `Always pause` still stops it. Stays typed so the agent cannot grant itself the mode.
- `implement-ticket`: under `empowerment`, works one ticket, or `epic <slug>` / `all` as a loop; sets `done` once committed.
- `plan-spec`, `plan-tickets`, `plan-ticket-change`, `implement-spec`, `review-code`, `review-learn`: the agent can start them under `empowerment` only; `session-progress`, `session-handoff` any time.
- `clarify-grill`: hands its list back to the calling skill instead of ending the task.
- `implement-spec`: implementers return their notes in the report; the lead appends them, so parallel workers cannot take the same ID.
- Every skill that used the `memo` server (`debug-diagnose`, `explore-decide`, `explore-why`, `implement-ticket`, `plan-spec`, `session-progress`...) reads and appends `.work/notes.md`, with ids (`D-1`, `I-2`, `F-3`).
- `help` removed; the catalog moved next to `ask-me`. Node 22.18+ is needed only for the ticket checker.

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
