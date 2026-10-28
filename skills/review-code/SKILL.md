---
name: review-code
description: "Review the changes since a fixed point on separate axes: Standards, Spec and, for risky changes, Impact (what breaks outside the diff) and Adversary (attempts to break it, kept only when a run proves them)."
argument-hint: "A commit, branch or tag to compare against, or a ticket id"
disable-model-invocation: true
---

Review of the changes since a fixed point the user supplies, uncommitted work included, on separate axes:

- **Standards**: does the code conform to this repo's documented coding standards?
- **Spec**: does the code faithfully implement the originating issue / spec?
- **Impact** (risky changes only): what does the change break outside the diff, and is the fact it is safe because of proven?
- **Adversary** (risky changes only): what input or timing breaks the change? Only findings a command proves are kept.

Each axis runs as a **parallel sub-agent** (Adversary as 2 or 3 of them) so they don't pollute each other's context, then this skill judges and aggregates their findings.

Read this repo's configuration: `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/dev:setup-repo`.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`, etc.). A ticket id (`EC-7`) is accepted too: find its file under `.work/tickets/` and use its `**Base:**` line; that ticket file is then also the spec for step 2. If they didn't specify one, or the ticket has no `Base:` line, ask for it.

Capture the diff command once. The review usually runs before the commit, so it compares the **working tree**, not just commits:

- `BASE=$(git merge-base <fixed-point> HEAD)`
- Diff: `git diff $BASE -- . ':(exclude).work'` (commits since the merge-base plus uncommitted changes to tracked files; the tracker directory is left out).
- New files: `git ls-files --others --exclude-standard -- . ':(exclude).work'`. They are not in the diff; the sub-agents read them in full.
- Commits: `git log <fixed-point>..HEAD --oneline` (may be empty when nothing is committed yet).

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and that the diff or the new-file list is non-empty. A bad ref or nothing to review should fail here, not inside parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.), fetched via the workflow in the tracker doc.
2. A path the user passed as an argument.
3. The ticket file under `.work/tickets/` that matches the branch name (its `Requirements` line points into `.work/spec-index.md`), or a spec file under `docs/` or `specs/` matching the branch name or feature.
4. If nothing is found, the **Spec** sub-agent skips and reports "no spec found"; the user can run the review again with the spec's path.

### 3. Identify the standards sources

Search the repo for every file that documents how code should be written. When `CODING_STANDARDS.md` or `CONTRIBUTING.md` exists, it must be on the list, and so must the delivery rules in `workflow.md` (branch names, commit convention, PR size cap, PR template, reviewers).

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** ([SMELLS.md](SMELLS.md)): a fixed set of Fowler code smells (_Refactoring_, ch.3) plus a few failure shapes agents often produce. It applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Read [SMELLS.md](SMELLS.md) now: step 5 pastes it into the Standards prompt.

### 4. Decide whether Impact and Adversary run

This is the one rule for when Impact and Adversary run; other skills point here. Run the **Impact** and **Adversary** axes when the user asked for them, or when the ticket is not tier `check` and any of these holds:

- the ticket's test plan is tier `full`, or the ticket is severe (money, auth, deletes, two writers on one record);
- the diff changes data that leaves the process: a route's request or response, a schema or migration, a message, a file format, a public type.

Skip Impact when the ticket's `Applied:` line already lists `dev:review-impact` for this diff, and reuse that reply. When neither condition holds, skip both and say so in the summary.

### 5. Spawn the sub-agents in parallel

Issue the sub-agent calls together, in the foreground, and collect the reports they return. Spawn the Standards, Spec and Impact sub-agents on the `review` entry of the `Models:` line in `workflow.md`. The Standards and Spec prompts include the finding format from [JUDGMENT.md](JUDGMENT.md), pasted in full; the Impact sub-agent keeps the Reply format of `review-impact`.

**Standards sub-agent prompt** should include:

- The full diff command, the new-file list and the commit list.
- The list of standards-source files you found in step 3, **plus [SMELLS.md](SMELLS.md)** pasted in full (the sub-agent has no other access to it).
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** should include:

- The diff command, the new-file list and the commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

**Impact sub-agent prompt** (when step 4 says so) should include:

- The diff command, the new-file list and the commit list.
- The brief: "Call the Skill tool with `dev:review-impact` on this diff and return its reply."

**Adversary sub-agents** (when step 4 says so): read [ADVERSARY.md](ADVERSARY.md) and spawn them as it says, with the same diff command, new-file list and commit list.

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 6. Judge and aggregate

Sort each axis's findings as [JUDGMENT.md](JUDGMENT.md) says: Act on, Consider, Noted, Dismissed. Check a finding against the code before you dismiss it; a dismissal carries its reason.

Judge the Adversary findings as [ADVERSARY.md](ADVERSARY.md) says first: rerun each command, and drop what does not reproduce.

Present each axis under its own heading (`## Standards`, `## Spec`, `## Impact`, `## Adversary`), with its findings in those four groups. Under `## Impact`, keep the `Safe because` and `Door` lines of the reply as they are, and sort only its Risks; `review-pr` copies those two lines. Do **not** merge or rerank findings across axes, because the axes are deliberately separate (see _Why separate axes_).

End with a one-line summary: Act-on findings per axis, the worst issue _within each axis_ (if any), and whether Impact and Adversary ran or were skipped. Don't pick a single winner across axes: that's the reranking the separation exists to prevent.

## Why separate axes

A change can pass one axis and fail another:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**
- Code that is clean and on spec but changes a response another service parses → **Standards and Spec pass, Impact fail.**
- Code that is safe for every caller but returns the wrong total for an empty cart → **Impact pass, Adversary fail.**

Reporting them separately stops one axis from masking another.
