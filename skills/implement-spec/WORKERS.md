# Workers

How to spawn implementer subagents, what they report, and how to check them before integration.

## Spawning

- **Model.** Spawn each implementer on the `implement` entry of the `Models:` line in `workflow.md`. A ticket that is severe or tier `full` may go one model stronger; say so in the report.
- **One writer per worktree.** Create each implementer's worktree from the integration branch with an explicit base: `git worktree add -b <ticket-branch> <path> <integration-branch>`. Two implementers never share a worktree or a branch.
- **The whole brief, every time.** Each brief opens with the goal in one line: what the ticket makes true for the user. Then it carries the ticket path, the ticket's tier, an instruction to follow the steps of [implement-ticket](../implement-ticket/SKILL.md) from orient to build (its `Step:`, `Base:` and `## Result` lines included), the absolute path of the main checkout's `.work/`, the test plan, the delivery rules from `workflow.md`, and for a retry the earlier report and branch. Give a retry or a follow-up to a fresh subagent with this brief instead of resuming an old one: chained resumes drop instructions.

## Report

Each implementer ends with exactly this block:

```text
<ID>: PASS | ISSUES | BLOCKED
Head: <worktree path> <git rev-parse HEAD>, <n> uncommitted files
Proof: <command> -> <the output lines that decide it>
Files: <changed files>
Commit message: <message in the repo's convention>
Issues: <each problem it can prove, or "none">
```

A report without `Head` or `Proof` gets one respawn with the same brief. A second miss is a gap, and a gap is not a pass.

## Check before integration

A report is a claim, not proof ([PROOF.md](../test-plan/PROOF.md)). For each `PASS`, run the ticket's proof command yourself in its worktree on the current files, and compare the output with the report. A mismatch makes the ticket `ISSUES`. Only tickets you verified go into the integration script.

## Removing worktrees

Before running `git worktree remove`, check each worktree: is its branch merged into the integration branch, and how many files does `git -C <path> status --short` list. Remove only merged worktrees that list nothing: nothing is lost, the branch keeps every commit. Hold the rest and say why: uncommitted tracked edits are lost on removal, and untracked files are named so the user can keep them.

Adapted from pstack (Lauren Tan, MIT): `swarm`, `principle-separate-before-serializing-shared-state`, and the worktree-cleanup playbook of `poteto-mode`.
