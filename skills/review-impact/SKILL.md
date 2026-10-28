---
name: review-impact
description: "Find what a change could break outside its diff, and prove the one fact it is safe because of by running real code. Use for 'what could this break', a blast radius question, a risky diff, or the Impact axis of review-code."
metadata:
  credits:
    skill: blast-radius
    author: Lauren Tan
    organisation: pstack
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/blast-radius/SKILL.md"
---

# Review Impact

Find what a change breaks somewhere else, before it ships. Listing the callers is not the job: a search does that in a second. The job is the breakage a search does not show.

A write-up that sounds right proves nothing. Find the one fact the change's safety depends on, and prove it with the levels in [PROOF.md](../test-plan/PROOF.md).

## Steps

1. **Read the change.** Use the diff command the caller gives (`review-code` passes its own), or `git diff <base> -- . ':(exclude).work'` plus the files `git ls-files --others --exclude-standard -- . ':(exclude).work'` lists. Work not yet committed has new files that `git diff` does not show; they belong to the change. List what the change adds, changes and deletes, and what it now does differently that the diff does not spell out: a default, an order, a timing, an error path. Done when you can say in two lines what behaves differently.

2. **Find the safety fact.** Most changes that look risky are safe because of one fact, such as "this call only drops cache entries that have already expired". Name it in one sentence. If it holds, most risks clear at once, so spend your time here rather than on a long list of maybes. Done when the fact is one sentence.

3. **Look where a search stops.** Done when every place the changed behaviour reaches is listed, or the search that found nothing is named.
   - **Libraries you call**: their source at the version the lockfile pins, and any local patch.
   - **Data that leaves the process**: the JSON a route returns, a database column, a queue message, a file format, another service or language that reads the same bytes.
   - **When code runs**: startup and shutdown, retries, concurrency, caches, the other branch of a feature flag.
   - **Distant callers**: generated code, scripts, migrations, jobs, and tests that pin the old behaviour.
   - **Memory**: `memo_callback` with the module name, for earlier `issue` and `decision` memos about it.

   For a large diff or one that crosses services, give each area to its own subagent and merge their lists. The safety fact and its proof stay with you.

4. **Rate each risk.** For each one: how it breaks, the `file:line`, its chance and its cost (low, medium, high), and the proof level it reached. Never invent a caller or an API. A risk you checked and found fine moves to Cleared with the reason. Done when every place from step 3 is a risk or cleared.

5. **Prove the safety fact.** Write the smallest script or test that calls the real code and fails loudly if the fact is false, run it, and keep the lines of output that decide it. Then break the fact on purpose (for example, let the call drop an entry that has not expired) and see the script go red, as "able to fail" in [PROOF.md](../test-plan/PROOF.md) requires; revert the break. A script that only proves goes to `.work/proof/`. When you cannot get past level 3, the fact is `unproven`; say so. Done when the fact has a level and its evidence.

## Reply

Leave out an empty section. Redact secrets.

```markdown
**What it does:** <the changed behaviour, including the part the diff does not show>

**Safe because:** <the fact>. Level <n>: <command and decisive output, or "unproven: <why>">

**Risks**
- <how it breaks>; `file:line`; chance <low|medium|high>, cost <low|medium|high>; check: <the cheapest check>

**Cleared**
- <what was checked>: <why it is fine>

**Before merge:** <the cheapest test or repro that catches the real bug, with the script path>

**Door:** <one-way | two-way>. **Blast radius:** <one word>
```

`review-pr` copies the `Safe because` and `Door` lines into the pull request's Merge Danger.
