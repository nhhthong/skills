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

Be a careful investigator: keep what a source says apart from what you infer from it.

## Steps

1. **Name the target and the question.** The target is a piece of code, a pattern or a decision; the question is what you need to know about it (why the retry, why this boundary, is this dead). When the request is vague, state your reading in one line and go on. Done when both fit on one line each.

2. **Anchor in the code.** Collect, before searching wider:
   - the file paths and line ranges, and the key symbols;
   - `git blame -L <start>,<end> <file>` for the last commits that touched the lines;
   - `git log --follow --oneline -- <file>` for the history through renames, and `git log -1 --format=%B <commit>` for the full messages;
   - pull request numbers in merge commits, and their bodies and review comments (`gh pr view <n> --comments`, or `glab mr view` for GitLab);
   - ticket ids in the messages and branch names.

   Done when the anchor lists the commits, pull requests and tickets that touched the target.

3. **Search each source.** Search memory and source control yourself. When more than two other sources are reachable, give each its own subagent, in parallel, with the anchor and the question; each returns findings with their citation or "nothing found".
   - **Memory**: `memo_callback` with the module and the symbols, for `decision`, `issue` and `fix` memos; ADR titles in `docs/adr/`; `.work/spec-index.md` decisions.
   - **Source control**: the pull requests and commit messages from step 2, read in full. Trace back past the latest commit: the current shape is often the sum of older decisions.
   - **Every other source the session can reach**: an issue tracker (Jira, Linear, GitHub Issues), long-form docs (Confluence, Notion), team chat, error tracking (Sentry), observability. Read the session's tool list to find them. A source with no tool is a gap, not a skip: name it.

   Defensive code (null checks, retries, timeouts, rate limits, feature flags) gets error tracking and incident history searched first. Done when every source returned findings or "nothing found", or is named as a gap.

4. **Separate what you know.** Sort every finding:
   - **Found**: a source says it. Cite it: commit, pull request, ticket, memo code, link.
   - **Inferred**: follows from what was found. Say what it follows from.
   - **Unknown**: no source answers it.

   When two explanations fit, list both with what would tell them apart. A gap stays in Unknown. Done when every finding sits in one group with its citation or its basis.

## Reply

```markdown
**Question:** <one line>

**Found**
- <fact>: <citation>

**Inferred**
- <inference>: from <which findings>

**Unknown**
- <what no source answers>

**Sources:** <one line per source: what was searched, and what it returned, "nothing", or "no tool">
```

When the question comes before a change, end with the constraints the change must keep:

- **Preserve**: behaviour that exists for a reason found above.
- **Change freely**: what no reason binds.
- **Avoid**: an approach a past attempt or decision already ruled out.
- **Risk**: what could break if the reason was misread.

Record a reason that took real digging as a `note` with `memo_post` (kind `lesson` or `structure`), so the next session finds it in step 3.
