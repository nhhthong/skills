---
name: review-pr
description: "Write a pull request body: a summary visual, before and after evidence, and merge danger. Use when opening a pull request or writing its description."
metadata:
  credits:
    skill: show-me
    author: Dex Horthy
    organisation: Humanlayer
    url: "https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md"
---

Use this template for writing the PR body:

```markdown
## Summary

<diagram, diff-sketch, or tree>

## Evidence

- **Before:** <screenshot/output/failing test run>
  **After:** <screenshot/output/passing test run>

## Merge Danger

**Door:** <one-way or two-way>

**Safe because:** <the fact the change is safe because of, and its proof level, when review-impact ran>

<optional: description>

**Blast Radius:** <one-word description>

<optional: potential ramifications of merge>
```

## Sections

Skip all preambles and keep prose brief. Use the user's domain language from `GLOSSARY.md`.

### Summary

Pick the smallest view that makes the key point clear: pseudocode for logic, a call tree for runtime flow, a component tree for UI, a shallow file tree for a refactor, Mermaid for interaction between components, or a `diff` of one of these when the point is what changes. Read [VISUALS.md](VISUALS.md) for an example of each and when to show a whole block. Use one or a few, never all; place each next to the short text it supports.

### Evidence

Concrete evidence that the change works. Show a before and after.

A change that only adds files or behaviour has no failing "before": write `Before: absent`, show the check that finds it missing, then the same check passing after.

Screenshots are S-tier - when the environment is set up for it and the change is visual.

Execution-based evidence is A-tier. Test results, console output. Show the exact test that now fails and passes, using pseudocode.

Evidence is run on the current code, not described. A ticket's `## Result` already holds the proof command, its output and the verdict ([PROOF.md](../test-plan/PROOF.md)); copy them rather than restating them. A performance number comes with its run count, range and limiter, as `dev:test-benchmark` reports it.

### Merge Danger

When `review-code` ran its Impact axis, or `dev:review-impact` ran on this diff, take the door, the blast radius and the safety fact from its reply instead of judging them again. Otherwise, describe whether it's a one-way or two-way door. You can walk back through two-way doors, but not one-way doors. A PR that is cheap to roll back is lower risk. Changes that involve destructive actions or hard-to-reverse decisions are one-way doors.

The blast radius is the potential impact or scope of the changes introduced by this PR. Consider all possibilities. Examples are layout shift, breakages for consumers, mobile responsiveness, etc.
