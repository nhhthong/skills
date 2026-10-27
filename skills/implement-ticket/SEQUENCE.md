# Sequence

Work in small units, each ending in a state you can check. Order the commits so the history proves the work.

## Baseline

Tier `light` and `full` only. A test plan with no `Baseline:` line, written before version 2.0.0, gets `skip: baseline: no Baseline line in the plan` in `## Result`. Before the first change, at the `Base:` commit, run the `Baseline:` command from the ticket's `## Test plan`. Write the result under the `Base:` line:

- `**Baseline:** green`
- `**Baseline:** red: <each failing test or check>`

A check that is red at `Base:` was broken before this ticket. List it under `## Result` as pre-existing and leave it as it is, unless the ticket is about it. When a pre-existing failure hides the proof this ticket needs, tell the user before you build.

## One unit at a time

In a sweep, a migration, or a run of similar edits, each unit is a bracket: a known-good state, one change, the check, then the next unit. A unit that goes red is fixed or reverted before the next one starts. A script or codemod that makes the edits still gets the check after each unit, or after each batch the test plan names.

## Commit order

Print the commits in the order that makes the history an argument. Each commit builds on its own.

- **Bug.** First the test that reproduces the bug (red), then the fix (green). This needs the repo to accept a commit with a red test; when `workflow.md` or CI rules it out, print one commit and paste the red-then-green output in `## Result`.
- **Refactor before a feature.** First the subtraction (dead code removed, one-caller wrappers inlined), then the reshape, then the feature.
- **Wide change.** Expand, migrate in batches, contract, as `plan-tickets` cuts it.

A ticket that is one unit is one commit.

Adapted from pstack (Lauren Tan, MIT): `principle-sequence-verifiable-units`, `principle-subtract-before-you-add`.
