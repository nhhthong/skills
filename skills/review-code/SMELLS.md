# Smells

The smell baseline the Standards axis always carries, from step 3 of [SKILL.md](SKILL.md): a fixed set of Fowler code smells (_Refactoring_, ch.3) plus a few failure shapes agents often produce. A documented repo standard overrides it, and each smell is a judgement call, never a hard violation.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type (in TypeScript, a branded type: [design-types](../design-types/SKILL.md)).
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.
- **Symptom Fix**: a guard, retry, cast or swallowed error that hides why a bad state happened. → fix where the state is produced, or show the state is legitimate.
- **Half-done State**: an operation that leaves partial results when it runs twice or stops halfway. → make it converge to the same end state, or make the partial state impossible.
- **Legacy Dual Path**: a new internal API added while the old one stays alive with no outside caller. → migrate the callers and delete the old one in the same change.
- **Untraced Input**: outside input reaching a query, shell, file path, HTML or permission check with no validation where it enters. → validate at the boundary; name the path.
- **Proxy Proof**: code or a test that checks a sign of the result (a file time, a cached value, a log line) instead of the result. → check the value itself.
