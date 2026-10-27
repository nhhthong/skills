# Judgment

How reviewer sub-agents report findings, and how the lead turns their reports into a verdict.

## Finding format

Paste this section into every reviewer sub-agent's prompt.

Each finding has:

1. **Severity**: `critical` (breaks behaviour, loses data or opens a security hole), `warning` (a design or correctness problem that will cause pain), or `nit` (style, naming, small improvement).
2. **Location**: `file:line` or the function name.
3. **Finding**: what is wrong, in concrete terms.
4. **Evidence**: why it is a problem: the call chain that reaches it, the spec line it breaks, the standard it violates. An assertion is not evidence.
5. **Suggestion** (optional): what to do instead, only when you have a concrete alternative.

Do not restate what the code does, and do not praise it. "No findings" is a valid report; an empty review is better than an inflated one.

## Sorting findings

The lead sorts every finding of an axis into one group, with a one-line reason:

- **Act on**: a real problem for correctness, security or maintainability, given what the ticket is for. It would block the change.
- **Consider**: legitimate, but whether it is worth fixing now is unclear. The user decides.
- **Noted**: valid but not actionable now.
- **Dismissed**: wrong, a nit, or missing context.

## Filters

- **Nitpick gravity.** A reviewer with no real problem to report tends to inflate nits. A report of only nits means the code is fine: say so.
- **Hypothetical or actual.** "What if this is null" counts only when a real caller can pass null. Trace the call site; reviewers working from a diff often cannot.
- **Preference.** "I would have done it differently" without a concrete problem is dismissed, with that reason.
- **Missing context.** Code the diff did not touch, a pattern the rest of the repo uses, a constraint the reviewer could not see: dismiss gracefully.
- **Keep the dangerous ones.** A correctness or security finding stays unless you can show the path does not happen, even when only one reviewer raised it.

Adapted from pstack (Lauren Tan, MIT): `interrogate` (`reviewer-prompt.md`, `lead-judgment.md`).
