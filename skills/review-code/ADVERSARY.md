# Adversary

The Adversary axis tries to break the change, and keeps only what a run proves. It runs under the same rule as Impact (step 4 of [SKILL.md](SKILL.md)). Impact asks what the change reaches; Adversary asks what input or timing makes it fail.

## Spawning

- **2 or 3 adversaries**, each with one lens picked from the diff. Pick the lenses that the change can fail on:
  - **Timing**: concurrency, retries, ordering, a crash halfway, running twice.
  - **Data**: what leaves the process (a response, a column, a message, a file) read by an old or a new reader.
  - **Inputs**: empty, huge, malformed, unicode, negative, duplicate, and the boundaries of each limit.
  - **Failure**: a dependency that times out or errors, a partial write, the rollback path.
- **Mixed models.** Give the adversaries the models the `Models:` line in `workflow.md` names for `adversary`; with none named, run one on `opus` and one on `sonnet`. Different models miss different things. Say which model found each finding.
- **Hands off the tree.** Adversaries do not edit tracked files. A script they write goes to `.work/proof/adversary-<lens>/`, calls the real code, and is run there.

## Brief

Give each adversary the diff command, the new-file list, the ticket's goal and acceptance criteria, its one lens, and this:

> Break this change. A finding needs three things: the command you ran, its output, and the output the goal requires instead. Leave out anything you did not run: style, naming, a risk that needs a future change to happen, "this could fail if". Return each finding as: lens, command, actual output (the decisive lines), expected output, `file:line` of the cause. "No breakage found" with the commands you tried is a valid report.

## Lead judgment

1. **Rerun every command yourself** on the current code. A finding whose output does not reproduce is dropped.
2. **Keep it when the output breaks the goal.** Output that differs but is still what the ticket wants is dropped, with that reason.
3. **Merge findings with one cause** into one, crediting each adversary that found it.
4. Do not pick a winning adversary. Every proven finding stays, sorted into Act on, Consider, Noted as [JUDGMENT.md](JUDGMENT.md) says.

Report under `## Adversary`: each proven finding with its command and decisive output, then one `Dropped:` line per adversary with the count and the reasons (did not reproduce, not a break of the goal, not run).

Adapted from pstack (Lauren Tan, MIT): `interrogate`.
