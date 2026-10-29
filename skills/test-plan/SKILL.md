---
name: test-plan
description: Choose the minimum proof a ticket needs before code is written: a command that already exists, one test, or tests per risk. Use at the start of a ticket, when asked what tests a change needs, or when a change might need no test at all.
---

# Test Plan

A ticket needs the **proof** that fits its risk, and no more. Proof is a command that goes red when the work is wrong: a build, a lint rule, a smoke check, or a test.

The question that picks the amount: *would a mistake show itself the moment someone looks, and would reverting the commit undo it?* Then a command that already exists is enough. A mistake that can sit silent and cost something later earns a test. What counts as proof, and how sure a claim is, is defined once in [PROOF.md](PROOF.md).

## Steps

1. **Read the ground.** Read the ticket (acceptance criteria, `Requirements`, its `Files:` and `Proof:` lines). Find the repo's test setup: commands in manifests, CI config and `.claude/rules/`, and two neighbouring test files for the local style. A project skill named `verify-<app>` (made by `/dev:setup-verify`) is a proof too: it drives the running app, for tickets that change what a user sees or does. Done when you can name the repo's test command and a test file to imitate, or say that none exists.

2. **Pick the tier.** Answer three questions about the ticket:
   - **Seen**: does a mistake show the moment someone looks (a colour, a layout, a label, a config value that fails the build)?
   - **Undone by code alone**: does reverting the commit put everything back, with nothing stored, sent, migrated or charged?
   - **Contained**: does it leave every trust boundary, shared record and other ticket's behaviour as it was? A yes here needs proof level 2 from [PROOF.md](PROOF.md): the `file:line` of each caller of what changed, or a search for callers that returns none. A yes you cannot point to is a no.

   | Answers | Tier | Proof |
   |---|---|---|
   | Three yes, and a command that already exists goes red when the work is wrong | `check` | That command. Write no test |
   | Three yes, and one behaviour is worth keeping | `light` | One test for that behaviour |
   | Any no | `full` | Tests per risk (step 3) |

   A ticket can need no test at all (a rename, documentation, dependency-free config). Say so in one line with the reason, and stop.

   A ticket is **severe** when a bug in it would corrupt shared data, grant access it should not, or destroy something. Money, auth, deletes and two writers on one record are the usual shapes. Severe tickets are always `full`, and each test must be seen failing before it passes (the `test-tdd` loop does this: test first).

3. **For `full`, choose kinds by risk.** Run through the questions in [LEVELS.md](LEVELS.md) under "Choosing", against what step 1 found in the code and the spec. Each yes is a kind of test. Read only the sections of LEVELS.md for the kinds you chose. A kind with no trigger in the code or spec is left out silently; a kind whose trigger exists but is not needed goes in `Not applicable` with the reason.

4. **Keep the architecture rules proven.** When the project states a rule that breaks silently if misconfigured (a lint rule that blocks one service from importing another, a service reading only its own schema), the ticket that sets it up includes a check that the rule fires: a deliberate violation must fail. This holds even in the first phase.

5. **Take expected values from outside the code.** A number from the spec, a worked example, a literal. A test that recomputes the expected value with the code's own logic passes by construction. When the spec gives no source for a value, the value is an open point: call the Skill tool with "dev:explore-decide" or ask the user, and write no test for it yet. A performance, load or stress test needs a number from the spec; with none, write no test and say what is missing. With one, the measurement follows `dev:test-benchmark`.

6. **Respect what the repo has.** Use the framework, naming and layout the repo already uses. A ticket small enough to be proven by another ticket's test may declare `covered by <ID>` instead of adding its own. No new test beats a bad one: when the only test you could write would mostly check mocks, depend on timing, or need heavy setup for a small change, use the closest command that runs the real code instead (a script, a curl, a CLI call) and say why in the plan.

7. **Mutation testing.** Propose it only for a severe module that is already stable, and ask first. Never add it silently.

8. **Check the plan yourself, then go on.** No approval is asked: these checks stand in for it. Before writing a line of code, confirm:
   - every acceptance criterion names the row or the command that proves it, and the ticket's `Proof:` line is one of them;
   - every expected value names its source (rule 5), and a value with no source is an open point, not a guess;
   - each yes in step 2 has its evidence: a `Contained` yes cites `file:line` or an empty caller search;
   - every kind chosen in step 3 points to the code or spec line that triggered it.

   Fix what fails yourself. Ask the user only when a criterion is ambiguous or two plans fit equally well; under `Mode: empowerment`, pick the plan you recommend and write an `ASK:` line. Put the plan in the ticket file under `## Test plan` (for a tracker ticket, in its local working file) and show it; the user may stop you. Done when the plan is written and every check holds.

## Plan format

`check`:

```
Tier: check
Proof: <command> exits 0
```

`light` and `full`:

```
Tier: <light | full>
Seams: <the public boundaries the tests observe, one line each>
Baseline: <command run at Base before the first change: the touched area's tests for light, the whole suite for full>

| What | Kind | Proof | Expected value comes from |
|---|---|---|---|
| <behaviour> | <kind> | <test name or command> | <spec section, worked example, literal> |

Not applicable:
- <kind>: <reason>
```

A seam is the public boundary a test observes: a function signature, a route, a CLI command, a message, a page. Tests live at seams and never reach into internals. The `test-tdd` skill uses the seams you list here without asking again.
