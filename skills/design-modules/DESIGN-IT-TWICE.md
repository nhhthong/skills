# Design It Twice

When the user wants to explore alternative interfaces for a chosen deepening candidate, use this parallel sub-agent pattern. Based on "Design It Twice" (Ousterhout): your first idea is unlikely to be the best.

Uses the vocabulary in [SKILL.md](SKILL.md): **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before spawning sub-agents, write a user-facing explanation of the problem space for the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would rely on, and which category they fall into (see [DEEPENING.md](DEEPENING.md))
- A rough illustrative code sketch to ground the constraints, not a proposal, just a way to make the constraints concrete
- A **rubric** of 3 to 6 criteria you can grade each design against (for example: entry points callers must learn, what a test can reach through the interface, where a new requirement would land). The sub-agents never see it; it is your tool in Step 3.

Show this to the user, then immediately proceed to Step 2. The user reads and thinks while the sub-agents work in parallel.

### 2. Spawn sub-agents

Spawn 3+ sub-agents in parallel. Each must produce a **radically different** interface for the deepened module. Spread them across models (the `design` entry of the `Models:` line in `workflow.md`, or `opus` and `sonnet` in turn when none is named): the same model tends to reach for the same shape.

Prompt each sub-agent with a separate technical brief (file paths, coupling details, dependency category from [DEEPENING.md](DEEPENING.md), what sits behind the seam). The brief is independent of the user-facing problem-space explanation in Step 1. Tell each agent to make the best design it can under its constraint and not to hedge toward a middle: the differences are what the comparison uses. Give each agent a different design constraint:

- Agent 1: "Minimize the interface: aim for 1–3 entry points max. Maximise leverage per entry point."
- Agent 2: "Maximise flexibility: support many use cases and extension."
- Agent 3: "Optimise for the most common caller: make the default case trivial."
- Agent 4 (if applicable): "Design around ports & adapters for cross-seam dependencies."

Include both [SKILL.md](SKILL.md) vocabulary and GLOSSARY.md vocabulary in the brief so each sub-agent names things consistently with the architecture language and the project's domain language.

Each sub-agent outputs:

1. Usage first: two or three real call sites from this codebase, written before the interface. The interface is derived from them; when the two disagree, change the interface, not the usage
2. Interface (types, methods, params, plus invariants, ordering, error modes)
3. What the implementation hides behind the seam
4. Dependency strategy and adapters (see [DEEPENING.md](DEEPENING.md))
5. Trade-offs: where leverage is high, where it's thin

### 3. Judge, present and compare

When the designs are back, spawn one read-only **judge** sub-agent with the rubric and the designs, labelled by number only. Run the judge on a different model from your own (you on `opus`, the judge on `sonnet`, or the reverse), so it does not share your bias; when no other model is available, say so. It scores each design criterion by criterion and names a base. Meanwhile, read every design end to end and score it yourself. When you and the judge pick the same base, that confirms it; when you differ, read both rationales before deciding, since one of you is biased or the rubric is ambiguous.

Present designs sequentially so the user can absorb each one, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.

After comparing, give your own recommendation: the base design and why. Then **graft**: walk each other design once for the one or two parts worth porting, and fold them into the base by hand so it stays one coherent design. Designs that converge on one shape are strong agreement: recommend that shape with no graft. Designs that diverge wildly mean Step 1 was under-specified: sharpen the constraints and run Step 2 again rather than averaging them. Be opinionated: the user wants a strong read, not a menu.

Screen the base against [RED-FLAGS.md](RED-FLAGS.md) before recommending it, and every other design before grafting from it: a change that looks right from one file should be right for the whole repo.

The judge, rubric and graft steps are adapted from pstack (Lauren Tan, MIT): `arena`, `architect`.
