# Publishing to a real tracker

For GitHub, GitLab, Linear or any tracker reached through a CLI. Its write commands are printed for the user under `micromanagement` and run by you under `empowerment` (`Tracker and pull request writes` in `workflow.md`); after a run, write each new issue number into its draft's `Tracker:` line.

First write the tickets as drafts in the template of [TICKET.md](TICKET.md) to `.work/plans/<epic-slug>/drafts/`, ids `T-1`, `T-2`… (an existing issue in `Blocked by` stays `#<n>`), and run `node <skill folder>/check-tickets.mts .work/plans/<epic-slug>/drafts --covers <codes>`, fixing what it prints, until it exits 0. Then write one script, `.work/handoff/tickets-<epic-slug>.sh`, that creates the epic's issue when it does not exist yet, then one issue per ticket in dependency order (blockers first) with the commands in the tracker doc and the issue body below, and keeps each new issue number in a variable so later commands reference real identifiers (`t1=$(gh issue create ... | sed 's#.*/##')`). Use the platform's native blocking relationship where it has one; otherwise set each ticket's "Blocked by" to the blocking issues. Make each ticket a sub-issue of its epic, and set its type as the tracker doc says. Print its path and contents for the user to run. Reading the tracker is fine.

## Issue body

Each section below is a `##` heading in the issue.

### Parent

A reference to the parent issue on the tracker (the epic, or the source issue if it was an existing one).

### What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer implementation.

### Requirements

The requirement codes from the spec index, or "none".

### New infrastructure

The component this ticket introduces, or "none".

### Files

The paths this ticket expects to edit, create or delete.

### Proof

What shows it done: a command and its output, a request and its response, a screen state.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

### Blocked by

- A reference to each blocking ticket, or "None (can start immediately)". Omit this section when blockers were set as native edges.
