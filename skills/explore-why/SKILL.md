---
name: explore-why
description: "Find why existing code is shaped the way it is, from git history, pull requests, tickets, memory and the other sources the session can reach, with what is known kept apart from what is inferred. Use before changing code you do not understand."
metadata:
  credits:
    skill: why
    author: Lauren Tan
    organisation: pstack
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/why/SKILL.md"
---

# Explore Why

Find the forces that shaped a piece of code: the bug it answered, the constraint it respects, the decision behind it. `explore-research` answers how something works from primary docs; this skill answers why this code is the way it is.

Be a careful investigator: keep what a source says apart from what you infer from it. Read [EPISTEMICS.md](EPISTEMICS.md) before step 4, and [SOURCES.md](SOURCES.md) before step 3.

## Steps

1. **Name the target and the question.** The target is a piece of code, a pattern or a decision; the question is what you need to know about it (why the retry, why this boundary, is this dead). When the request is vague, state your reading in one line and go on. When the question carries the user's own guess ("I assume it is for performance"), write the guess down as one candidate to test, not the answer. Done when both fit on one line each.

2. **Anchor in the code.** Collect, before searching wider:
   - the file paths and line ranges, and the key symbols;
   - `git blame -L <start>,<end> <file>` for the last commits that touched the lines;
   - `git log --follow --oneline -- <file>` for the history through renames, `git log -S '<exact text>'` for the commit that introduced a value or a call, and `git log -1 --format=%B <commit>` for the full messages;
   - pull request numbers in merge commits, and their bodies and review comments (`gh pr view <n> --comments`, or `glab mr view` for GitLab);
   - ticket ids in the messages and branch names.

   Done when the anchor lists the commits, pull requests and tickets that touched the target.

3. **Search each source.** Search memory and source control yourself. When more than two other sources are reachable, give each its own subagent, in parallel, on the `explore` entry of the `Models:` line in `workflow.md`, with the investigator brief from [SOURCES.md](SOURCES.md): one source per subagent, links into other sources come back as leads, every query is written down.
   - **Memory**: `memo_callback` with the module and the symbols, for `decision`, `issue` and `fix` memos; ADR titles in `docs/adr/`; `.work/spec-index.md` decisions.
   - **Source control**: the pull requests and commit messages from step 2, read in full. Trace back past the latest commit: the current shape is often the sum of older decisions.
   - **Every other source the session can reach**: an issue tracker (Jira, Linear, GitHub Issues), long-form docs (Confluence, Notion), team chat, error tracking (Sentry), observability. Read the session's tool list to find them. A source with no tool is a gap, not a skip: name it.

   Defensive code (null checks, retries, timeouts, rate limits, feature flags) gets error tracking and incident history searched first. Done when every source returned findings or "nothing found", or is named as a gap.

4. **Separate what you know.** Give every finding a tier from [EPISTEMICS.md](EPISTEMICS.md): `Direct` and `Supported` go under Found with their citations, `Inferred` under Inferred with its chain, `Speculative` under Hypotheses, `Unknown` under Unknown with what was searched. Follow a subagent's leads that no one has searched yet. When two explanations fit, list both with the evidence for and against each, and what would tell them apart. Then reopen one citation per source and confirm it says what the finding claims. Done when every finding has a tier, a citation or a chain, and wording that matches its tier.

## Reply

```markdown
**Question:** <one line>

**Found**
- [Direct] <fact>: <citation, with a short quote>
- [Supported] <fact>: <each item and what it adds>

**Inferred**
- <hedged inference>: given <which findings>

**Hypotheses**
- <one-line story>. For: <items>. Against or missing: <what would have to be true but is not>

**Unknown**
- <the question>: searched <where, with which queries>, found <nothing, or only what>

**Sources:** <one line per source: what was searched, and what it returned, "nothing", or "no tool">

**Confidence:** <one or two sentences: which parts rest on Direct evidence and which are inferred or unknown>
```

Leave out Inferred or Hypotheses when empty; Unknown stays, even when it says "nothing open".

When the question comes before a change, end with the constraints the change must keep:

- **Preserve**: behaviour that exists for a reason found above.
- **Change freely**: what no reason binds.
- **Avoid**: an approach a past attempt or decision already ruled out.
- **Risk**: what could break if the reason was misread.

Record a reason that took real digging as a `note` with `memo_post` (kind `lesson` or `structure`), so the next session finds it in step 3.
