# Sources

Where to look for the why, how to search each place, and the rules for a subagent that searches one of them.

## The investigator brief

When a source goes to a subagent, its brief carries the question, the anchor from step 2 (files and lines, symbols, commits, pull requests, ticket ids), the one source it owns, that source's section below, and these rules:

- **One source only.** Follow links inside your source (the pull request a commit names, a ticket's parent). A link into another source goes under **Leads**, for that source's searcher; do not chase it.
- **Read the whole item**: every pull request, ticket and thread in full, comments included. The reason is often in a review comment or a follow-up.
- **Quote, do not summarise.** One verbatim quote with its exact location beats a paragraph.
- **Write down every query**, word for word, including the ones that returned nothing. An empty search is a finding.
- **Gather, do not conclude.** Do not answer the question or pick a side. Two items that disagree are both reported.
- Return: `Searched` (queries and items), `Direct` (quote, location, author, date), `Indirect` (what it is, what it suggests, other readings), `Contradictions`, `Gaps`, `Leads`.

Skipping a source needs a written reason, and only two are valid: no tool reaches it, or it is shown to be unrelated to the target.

## Source control and the repo

The source closest to the code, and the one always reachable.

```bash
git log --follow --oneline -- <file>          # history through renames
git log -S '<exact text from the code>' -- <file>   # commits that added or removed this text
git log -G '<regex>' -- <file>                 # the same, for a pattern
git blame -L <start>,<end> <file>
git show <commit>
gh pr view <n> --comments                      # glab mr view <n> --comments on GitLab
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <file>
rg -l '<symbol>' --glob '*test*'               # tests often encode the edge case that caused the change
```

Look also at files changed in the same commits, ADRs (`docs/adr/`), `CHANGELOG.md`, and a revert followed by a "re-apply with …" commit.

## Notes

`grep -i` the module, the symbols and the error text in `.work/notes.md`, for `D-`, `I-`, `F-` and `N-` lines; read the last line of each ID used. `.work/spec-index.md` decisions. A superseded decision is history, not a binding reason: report it as such.

## Issue tracker

Jira, Linear, GitHub or GitLab Issues: the ticket ids from the anchor first, then a keyword search on the symbol, the error text and the feature name. Read the parent, linked and duplicate tickets and every comment. Watch for a ticket closed as "won't fix" next to code that does the fix anyway.

## Long-form docs

Confluence, Notion, Google Docs: design docs, RFCs and postmortems that name the feature or the module. Note each doc's date: a doc written after the code explains it later, not at the time.

## Team chat

Slack and the like: search near the dates of the key commits, in the team's channel and in incident channels. Retention limits are common; a search that returns nothing older than a year says so.

## Error tracking and observability

Sentry, Datadog and the like: the error the code guards against, around the date the guard was added. A spike that ends at the commit's deploy supports "added for this incident"; an error that is merely logged by the code does not show it caused the code.

## Defensive code

For null checks, retries, timeouts, rate limits, feature flags and fallbacks, search every source above for incidents first: `incident`, `sev`, `postmortem`, `outage`, "fix for", "defensive", and the error text.

Adapted from pstack (Lauren Tan, MIT): `why/references/investigator-prompt.md`, `source-playbook.md` and `sources/`.
