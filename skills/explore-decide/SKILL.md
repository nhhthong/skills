---
name: explore-decide
description: Research a technical choice and recommend one option. Use when two or more reasonable options exist, an open point or spike blocks a ticket, a library's API is uncertain, or a ticket needs infrastructure not yet in place.
---

# Decide

Turn a choice into a recommendation the user can accept with one word. The user chooses; you do the research.

## Steps

1. **State the question** in one line. Done when it fits on one line and names what it blocks.

2. **Look for an earlier answer.** Call `memo_callback` (types `decision`, `note`) and check the ADR titles (`docs/adr/`) for the topic, and read the spec index's decisions. A decision that still binds ends the skill: report it and ask only whether to reopen it.

3. **Research.** Library behaviour: use Context7 if the session has it, otherwise the library's official docs. Anything deeper: call the Skill tool with "dev:explore-research" and wait for the result, because the choice is blocking the work. Every claim carries its source. When documentation cannot answer because only a run can (does the library accept this input, how slow is this path), run it: a throwaway script, or call the Skill tool with "dev:explore-prototype", and keep the output as the evidence. If the question concerns infrastructure, read [INFRA.md](INFRA.md) now. When the choice changes existing code whose shape you do not understand (a guard, a retry, a flag, an odd boundary), call the Skill tool with "dev:explore-why" first: its constraints bind the options.

4. **Compare 2 to 3 options** against the constraints in the spec, the ticket and the repo (existing stack, team skills, hosting). An option the constraints rule out is dropped with the reason. When options are compared on speed or throughput, measure them and call the Skill tool with "dev:test-benchmark": a number from one untuned side decides nothing.

5. **Recommend one.** Word it so that "yes" accepts it. Give the reason in a sentence, and the single biggest cost of the choice. "None of these" and "do not build it" are acceptable recommendations: give your real judgement, not the answer the question leans towards.

6. **Wait for the user's choice.** When the constraints leave only one option, record it and go on without waiting. A choice that is hard to reverse (a data store, a public API shape, a service boundary, an auth model, how money is handled) is never made without the user, even when they are away: leave the dependent work blocked, keep the question open in the spec index, and say which ticket waits.

7. **Record it once.** Call the Skill tool with "dev:clarify-domain" for the recording rules: one `decision` in memory (`memo_post`, with `rationale` and `alternatives`); an ADR when the three ADR conditions hold or the project's documents require one; the full text in exactly one of them. Then:
   - Close the `spike` ticket that carried the question (`Status: done`, with the decision's id in `## Result`).
   - Change the spec index's open point to ✅ with the decision's id.

   Done when the decision exists in one place, and the spike and open point point to it.

   When research and a run still cannot settle the question and the choice is reversible, record a provisional decision (its body starts with `provisional:` and names what is missing). Leave the spike at `Status: ready` and the open point at ⚠️, each pointing to the decision's id and to what would settle it, and say which ticket waits. Do not close what the evidence did not settle.

Next step: say which ticket the decision unblocks, and `/dev:implement-ticket <ID>` to continue.
