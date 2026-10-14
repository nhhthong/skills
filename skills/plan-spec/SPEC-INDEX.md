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

## Metrics
| ID | Metric | Target | Status |
|---|---|---|---|

## Open points
- ⚠️ O-1: <the question>. Owed by <who> since <date>. Needed before <requirement or ticket>.

## Decisions
- <memo code, for example D-3>: <one line>. ADR: <path, only if one exists>.

## Infrastructure
| Component | First needed by | Status |
|---|---|---|

## Out of scope
- <taken from the source>
```

An open point becomes a `spike` ticket when `/dev:plan-tickets` cuts a ticket that needs it. Closing the spike produces a decision, and the open point's line changes to ✅ with the decision's id.
