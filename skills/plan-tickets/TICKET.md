# Ticket

The file template for one ticket. `plan-tickets` writes it, `implement-ticket` writes it for a tracked or pasted ticket, and `plan-ticket-change` writes it for a split. [check-tickets.mts](check-tickets.mts) lints it.

```markdown
# <ID>: <Ticket title>

**Type:** <feature | task | bug | spike>
**Parent:** <epic id>
**Requirements:** <codes from the spec index, or "none">
**Blocked by:** <ticket ids, or "None (can start immediately)">
**Status:** ready
**New infrastructure:** <component, or "none">
**Files:** <paths this ticket expects to edit, create or delete, comma-separated>
**Proof:** <what shows it done: a command and its output, a request and its response, a screen state>
**Step:** <added by /dev:implement-ticket; leave empty>
**Base:** <added by /dev:implement-ticket; leave empty>
**Baseline:** <added by /dev:implement-ticket; leave empty>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

## Test plan (added by /dev:implement-ticket)

## Result
```

Outside the `Files:` line, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
