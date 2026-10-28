# Red flags

Screen a design, or a stretch of existing code, against these before you recommend it. Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. A good design is one where a change that looks right from one file is right for the whole repo.

A red flag is a reason to revise or reject the shape, not a rule to apply blindly. Shallow modules and pass-throughs are covered by the deletion test in [SKILL.md](SKILL.md).

- **Information leakage.** One internal decision (a representation, a policy, a wire format) shows up in several modules, so changing it needs coordinated edits. Re-exported transport or storage types are leakage: parse outside data into domain types behind the interface.
- **Temporal decomposition.** Modules split by when code runs (load, validate, transform, save) instead of by what they know, so one representation and its invariants repeat across every stage. Group by the knowledge a module protects.
- **Split ownership.** More than one module writes the same state, or keeps its own copy. An agent editing one writer cannot see the others, and their rules drift. Give each piece of state one owner; the rest read it or ask the owner.
- **Two ways to do one task.** An agent copies whichever way it finds first, so both keep gaining callers. Keep one, move the callers, delete the other in the same change.
- **Importable internals.** A caller can import what should be private, so the shortest path that compiles makes it part of the interface. Make it unreachable from outside, so such an import fails the build.
- **Hand-synced lists.** The same items are listed in two or more places, and adding one means editing each. Keep one list and derive the rest; when a list cannot be derived, make the build fail when they disagree.
- **Callers must know the rules.** Using the interface correctly needs knowledge of its internals (call order, a flag to set first), or its types need casts or always-set optional fields to compile.
- **Added before subtracting.** The design adds a layer, a flag or a new path next to code that should have been removed or simplified first. Delete what the new requirement makes dead, then see what is left to build.
- **Patched instead of redesigned.** The shape only makes sense as history: each requirement bolted onto the last. Ask what you would build if every current requirement had been known on day one; when that answer is much smaller, propose it.
- **A temporary shim with no end.** A compatibility path, adapter or flag is kept "for now" with no ticket or date to remove it. Aim at the end state; a shim needs its removal planned in the same breakdown.
- **Too much to hold.** A reader cannot say in 30 seconds what a function does: count the layers to trace and the state to keep in mind. When a change makes the count go up, it needs a reason that outweighs it.

Adapted from pstack (Lauren Tan, MIT): `architect/references/design-red-flags.md`, and the principles `subtract-before-you-add`, `redesign-from-first-principles`, `outcome-oriented-execution` and `minimize-reader-load`.
