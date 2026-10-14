---
name: plan-spec
description: "Turn a source (a requirement document, a roadmap, or the current conversation) into a spec: an index of requirement codes for a structured document, or a full spec for a conversation. No interview, just synthesis."
disable-model-invocation: true
---

This skill takes the source and codebase understanding and produces a spec. Do NOT interview the user; just synthesize what you already know.

Read this repo's configuration: `docs/agents/issue-tracker.md` and `docs/agents/workflow.md` (reached from `CLAUDE.md`), or `.work/config.md` when storage is private. If neither exists, tell the user to run `/dev:setup-repo`.

## Process

1. Pick the branch from the source:

   - **A structured document** (checklists, phases, exit criteria; a roadmap or a numbered requirement list): write a **spec index**. Never copy the document's content into a new file; the document stays the single source.
   - **A conversation, or loose documents**: write a **full spec** with the template below.

2. If the repo has code, explore it to understand the current state, if you haven't already. Use the project's domain vocabulary throughout, and respect any ADRs in the area you're touching. With no code yet, skip this step.

3. Write the spec, then publish it. A spec index goes to `.work/spec-index.md`. A full spec goes to the issue tracker (for a local tracker, `.work/spec.md`). Do not apply any label.

4. Report the open points and who owes each answer. Next step: `/dev:plan-tickets`.

## Spec index

One line per requirement: a stable code, a few words saying where it is in the source, and a status. Codes are `R<group>.<n>`; metrics are `M<n>`. Use the template in [SPEC-INDEX.md](SPEC-INDEX.md).

Three status marks:

- ✅ decided
- ⚠️ open: someone owes an answer
- ❌ blocked by an outside party

Rules:

- Every item in the source gets exactly one code, and every code gets one status. This is the completion criterion.
- A value the source does not state is an **open point**, not a default. A default looks decided and nobody asks again. Write: the question, who owes it, since when, and which requirement or ticket needs it first.
- Where the source contradicts itself (a name used two ways, a decision recorded as open in one place and settled in another), list both readings as an open point and ask. Never pick the newer.
- Decisions made in conversation get one line in `## Decisions`. Record the decision with `memo_post` first, then start the line with the code it returns (`D-n`); never number decisions in the index. When a decision is superseded, change its line to the new code. The full text lives in one place only: the ADR if there is one, else the memo.
- List what the source puts out of scope.
- List the infrastructure the source names, in the order it is first needed, as a table of component, first needed by, and status. Do not decide anything new here; `explore-decide` does that when a ticket first needs a component.

## Full spec

Sketch the seams at which you will test the feature. Existing seams are preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better; the ideal number is one. Check with the user that these seams match their expectations.

<spec-template>

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

</spec-template>
