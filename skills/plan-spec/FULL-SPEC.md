# Full spec

The branch of [SKILL.md](SKILL.md) for a conversation or loose documents: sketch the seams, then fill this template.

Sketch the seams at which you will test the feature. Existing seams are preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better; the ideal number is one. Check with the user that these seams match their expectations.

```markdown
## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A numbered list of user stories covering the feature. Size the list to the feature: a small feature needs a handful, a large one needs many. Each story is in the format:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase), when there is code

## Open Points

Each undecided item as a question, who owes the answer, and since when.

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

```
