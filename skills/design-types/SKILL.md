---
name: design-types
description: "Type discipline for TypeScript: impossible states unrepresentable, branded ids, parse at the boundary, checked values instead of casts, exhaustive switches. Use when reading or editing .ts or .tsx files, or designing a type or signature."
paths: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"]
metadata:
  credits:
    skill: typescript-best-practices, principle-type-system-discipline, principle-boundary-discipline
    author: Lauren Tan
    organisation: pstack
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/typescript-best-practices/SKILL.md"
---

# Design Types

Make the compiler reject what must never happen: impossible states, mixed-up ids, unhandled variants. A rule the compiler enforces needs no comment, no test and no reviewer. The repo's own `tsconfig`, lint rules and conventions win over this skill.

## Principles

- **Make illegal states unrepresentable.** Model the variants, not a bag of optional fields. When a value cannot be built wrong, nothing downstream has to check it.
- **Brand semantic primitives.** `UserId` and `OrderId` are both strings and must not be interchangeable. Validate once where the value is created; trust the type after that.
- **Parse at the boundary.** Outside data (HTTP bodies, JSON, CLI arguments, environment variables, config files, database rows, messages) is `unknown` until a parse function turns it into a domain type. Inside the system, trust the types: no second check deep in a call chain.
- **Derive, do not duplicate.** When a schema, migration, OpenAPI spec or another type owns a shape, derive from it instead of writing a parallel type by hand.
- **Keep logic pure.** Business rules live in functions with no framework, I/O or clock inside; the shell around them is thin and only calls them.

## Rules

| Rule | In short |
|---|---|
| Discriminated unions | Variants carry a literal `kind`. No optional-field bags. |
| Branded types | `type UserId = string & { readonly __brand: 'UserId' }`. A brand comes from a type guard that checks (`(s): s is UserId`), never from `as`. |
| Construct the legal shape | `[T, ...T[]]` for a non-empty list, `start` plus `duration` for a range, instead of a runtime guard. |
| Simplest total type | Keep `T[]` while every use is total. Strengthen it only where the loose type forces a `!`, a cast or a "never happens" throw. |
| `unknown` over `any` | Outside data is `unknown`. `any` turns the checker off. |
| Schema before hand guard | When the repo has a runtime schema library (zod, valibot, io-ts), define the schema and infer the type from it. |
| Check, then type | Check or parse a value, then use its type. An `as` is allowed only right after a check that proves it; elsewhere it is a crash waiting to happen. |
| Narrowing order | Discriminant `switch`, then `in`, then `typeof` or `instanceof`, then a type guard; `as` last. |
| Honest type guards | A guard named `isX` must check what it claims. A lying guard is worse than `as`, because the name says it is safe. |
| Exhaustive switches | `default: { const _exhaustive: never = x; throw new Error(...) }`, so a new variant fails the build. |
| `satisfies` over `as` | Checks a literal against a type without widening it. |
| Derived types | `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof` before a new interface. |
| Object arguments | Two or more parameters of the same type become one object, so the order cannot be swapped. Skip it on hot paths. |

Examples of each: [PATTERNS.md](PATTERNS.md).

## The tests

- Is this data crossing into the system right now? Then parse it. If not, a check here is noise.
- Could a caller pass two of these arguments in the wrong order and still compile? Then brand them or use an object.
- When someone adds a variant next year, does the build fail at every place that must handle it?
