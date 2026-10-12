---
name: explore-decide
description: Research a technical choice and bring the options with one recommendation, so the user does not research it. Use when two or more reasonable options exist, an open point blocks a ticket, a library's API is uncertain, or a ticket needs infrastructure that is not in place yet.
---

# Decide

Turn a choice into a recommendation the user can accept with one word. The user chooses; you do the research.

## Steps

1. **State the question** in one line. Done when it fits on one line and names what it blocks.

2. **Look for an earlier answer.** `grep -i` `.work/notes.md` and the ADR titles (`docs/adr/`) for the topic, and read the spec index's decisions. A decision that still binds ends the skill: report it and ask only whether to reopen it.

3. **Research.** Library behaviour: use Context7 if the session has it, otherwise the library's official docs. Anything deeper: call the Skill tool with "explore-research" and wait for the result, because the choice is blocking the work. Every claim carries its source. If the question concerns infrastructure, read [INFRA.md](INFRA.md) now.

4. **Compare 2 to 3 options** against the constraints in the spec, the ticket and the repo (existing stack, team skills, hosting). An option the constraints rule out is dropped with the reason.

5. **Recommend one.** Word it so that "yes" accepts it. Give the reason in a sentence, and the single biggest cost of the choice.

6. **Wait for the user's choice.** A choice that is hard to reverse (a data store, a public API shape, a service boundary, an auth model, how money is handled) is never made without the user, even when they are away: leave the dependent work blocked, keep the question open in the spec index, and say which ticket waits.

7. **Record it once.** Call the Skill tool with "clarify-domain" for the recording rules: one `decision` line in `.work/notes.md`; an ADR when the three ADR conditions hold or the project's documents require one; the full text in exactly one of them. Then:
   - Close the `spike` ticket that carried the question (`Status: done`, with the decision's id in `## Result`).
   - Change the spec index's open point to ✅ with the decision's id.

   Done when the decision exists in one place, and the spike and open point point to it.

Next step: say which ticket the decision unblocks, and `/implement-ticket <ID>` to continue.
