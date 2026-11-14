# Spec index template

Write to `.work/spec-index.md`. Keep it a pointer to the source, never a copy of it.

```markdown
# <Project name>: spec index

Source: `<source file>`, kept unchanged. Indexed on <date>.
Markers: ✅ decided · ⚠️ open · ❌ blocked by an outside party.

## Requirements
| ID | Where in the source | Status |
|---|---|---|
| R1.2 | Phase 1, "Atomic hold with TTL" | ⚠️ O-1 |

## Epics
- <epic-slug>: <requirement codes>. <not cut | cut | done | waits on O-n>. <ticket ids, each with a gist of at most ten words, added as tickets close>

## Metrics
| ID | Metric | Target | Status |
|---|---|---|---|

## Open points
- ⚠️ O-1: <the question>. Owed by <who> since <date>. Needed before <requirement or ticket>.

## Decisions
- <notes ID, for example D-3>: <one line>. ADR: <path, only if one exists>.

## Infrastructure
| Component | First needed by | Status |
|---|---|---|

## Out of scope
- <taken from the source>
```

The index is what a new session loads instead of the source: keep it to one line per item. `## Epics` is written by `/dev:plan-tickets` and kept current by `/dev:implement-ticket` as tickets close; leave out a section that has nothing in it (`Metrics`, `Decisions`, `Infrastructure`).

A constraint the source does not number (a "technical constraints" list) gets the group `R0`: `R0.1`, `R0.2`.

An open point holds back only the requirement it names. One that the agent can settle becomes a `spike` ticket when `/dev:plan-tickets` cuts a ticket that needs it; closing the spike produces a decision, and the open point's line changes to ✅ with the decision's id. One that an outside person owes (the source says "not decided yet", "X owes it") gets no ticket and no spike: its requirement stays ⚠️ or ❌ until that person answers.
