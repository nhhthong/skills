# Changelog

All notable changes to the `dev` plugin, written for what they solve. [Semantic Versioning](https://semver.org/), [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [2.1.1] - 2026-10-28

Proof gets stricter, understanding and review get deeper, and the instructions get lighter to read.

### Added

- **Understand before you change.** Ask how a part of the code works and get one explanation, built from several angles explored in parallel, with the file and function for each step.
- **Review that tries to break the change.** For risky changes, reviewers on different models attack the change, and only breakages that reproduce on a rerun are reported. No more "this could fail if" guesses.
- **Honest answers about why code is the way it is.** Every claim carries a confidence level, the searches are listed, and what could not be found is said outright instead of guessed.
- **Type discipline for TypeScript work:** impossible states cannot be written, ids cannot be mixed up, outside data is checked once at the edge.
- **Choose the model per kind of helper.** Checkers and authors no longer have to share the same blind spots.
- **A test guide for driving the real app stays true.** Updating it now re-drives every feature, not only the ones recent commits touched, and never edits product code to hide a regression.
- **Retrospectives that stop repeats.** Each corrected mistake is paired with what now prevents it; one-off or already-covered advice is rejected.

### Changed

- **A proof counts only once you have seen it fail**, on the old code or on deliberately broken code. A check that cannot fail proves nothing.
- **Work starts by restating the goal** in three lines, and stops if the evidence rules the request out.
- **Questions a quick run can answer are run, not asked.**
- **A question the docs cannot settle no longer forces a fake answer.** When the choice can be undone, record a provisional decision, keep the question open and say what would settle it.
- **Reviews include new files that are not yet tracked by git.** Before, work that had not been committed could lose its new files from the review.
- **Pull request evidence for changes that only add things** shows "absent", then "present".
- **Performance numbers are checked harder:** how to find the real limit, no winner when a side could not be tuned, a statistical test when runs overlap, and the whole-path share caps the possible gain.
- **Progress reports show what did not hold:** reverted work, problems that returned after a fix, approaches tried twice. Recalled memory names failed approaches before suggesting one again.
- **Long instructions are split into small files read only when needed**, so the agent stays focused (about 200 lines shorter overall).

### Fixed

- **Memory** survives renaming or re-cloning the project folder; repeating a known problem keeps its new tags and references; demoting a confirmed fix reopens its problem; filtering attempts by outcome works; a missing epic no longer pushes agents to invent one.
- **Ticket checking** accepts codes separated by spaces and reports mistyped codes instead of dropping them; work waiting on an outside party needs a visible blocker instead of a question; blockers that live in an outside tracker count; duplicate numbers in one epic are reported; checkboxes inside a test plan no longer count as acceptance criteria.

## [2.0.1] - 2026-10-27

Fewer stops, more accurate plans.

### Added

- Larger work is planned twice, forward and backward, and the two plans are compared.
- Every breakdown is checked before work starts: names, blockers, requirement codes, coverage.
- Tickets say which files they touch and how to prove them.
- Design red flags for code that agents will extend.

### Changed

- Agents ask only when something is ambiguous or a real choice exists; the test plan checks itself instead of asking.
- Writes to GitHub and GitLab are always printed for you to run.
- Open points that change the breakdown are settled before tickets are cut.
- Work stops when the plan proves wrong, and tickets that share files are done one at a time.

## [2.0.0] - 2026-10-27

Proof on the real artifact, and effort that follows the risk of the ticket. Breaking: the review output and the ticket result format changed.

### Added

- Find what a change breaks outside its diff, and prove the fact it is safe because of.
- Find why existing code is shaped as it is, from history, tickets and memory.
- Vet a performance number before it is reported.
- Generate a guide that launches and drives the real app like a user.
- A baseline recorded before work starts, and a list of actions that always need your approval.
- A self-check that catches broken links and unknown references inside the plugin.

### Changed

- A small change gets a small process; stored data, outside callers and money get more.
- Each ticket records its proof, its verdict, and which steps were used or skipped.
- Reviews add an impact check for risky changes, and findings are sorted into act on, consider, noted and dismissed.
- Parallel workers report pass, issues or blocked, and the lead reruns each proof.

## [0.2.0] - 2026-10-14

### Added

- Learning notes for finished work, and splitting, cancelling or reopening a ticket.
- A choice of whether review is run for you or by you; a recorded starting point for each ticket.
- An automatic check that the plugin's lists agree with each other.

### Changed

- Reviews cover uncommitted work and accept a ticket id.
- Decisions in the spec use memory codes; commands carry the `dev` namespace.

### Fixed

- Memory updates no longer drop fields; memory warns about missing detail and can audit old entries.

### Renamed

- The ask command became help.

## [0.1.0]

First release: 30 skills, a local memory server, and the `.work` folder layout.

[0.2.0]: https://github.com/nhhthong/skills/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nhhthong/skills/releases/tag/v0.1.0
