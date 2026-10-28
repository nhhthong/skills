# Workflow

How work is delivered in this repo, and where memory lives. Skills read this file before they commit, open a PR, or record a note.

## Storage

- **Storage**: `<in-repo | private>`. Private means everything under `.work/` stays out of git (`.git/info/exclude`) and no `GLOSSARY.md`, ADR or `CLAUDE.md` edit is made for the skills.
- **Memory**: the `memo` MCP server (shipped with this plugin) keeps issues, attempts, fixes, decisions and notes in SQLite at `~/.claude/memo/<project>-<id>.db`. It is outside the repo, so `in-repo` and `private` do not change it. Research notes go in `.work/research/`.

## Delivery

- **Delivery**: `<commit | pr>`. `commit` means the work goes onto the current branch. `pr` means a branch and a pull request.
- **Git writes**: `hand-off`. Skills do not run `git commit`, `git push` or open a pull request. They print the commit message and the exact commands for you to run. Change this to `run` to let skills run the git commands; your `.claude/settings.json` permission rules still apply. A direct request in a session ("commit it") is also honoured for that session.
- **Tracker and pull request writes**: always printed, even under `Git writes: run`. Skills never run a `gh`, `glab` or tracker command that creates, edits, comments on, labels or closes an issue, or opens, edits or merges a pull or merge request: they print it for the user. Reading (`gh issue view`, `gh pr view`, `gh issue list`) is fine. This line is the single copy of the rule; other files point here.
- **Review**: `typed`. `implement-ticket` does not stop for review: it names `/dev:review-code <ID>` next to the commit commands, for you to run before committing. Change this to `inline` to let it run the same review itself, against the ticket's `Base:` commit, before delivery.
- **Branch names**: `<pattern, for example type/ticket-id-short-description>`
- **Commit messages**: `<convention, for example Conventional Commits>`
- **PR size cap**: `<for example 400 changed lines, or none>`
- **PR template**: `<path or the sections it needs>`
- **Reviewers**: `<for example 2 for internal/inventory, internal/booking and migrations>`
- **Other rules**: `<for example an ADR is required when a service boundary changes>`
- **Always pause**: deleting data, a migration on a shared database, a force-push, a deploy, a message to a customer. A skill stops and asks before any of these, even under `Git writes: run`. Add the repo's own items here.

## Models

- **Models**: `explore: sonnet; review: sonnet; adversary: opus, sonnet; design: opus, sonnet; implement: inherit`. The model each kind of subagent runs on, as the Agent tool's `model` value (`opus`, `sonnet`, `haiku`, or `inherit` for the session's own). A list means "spread the subagents across these, in turn". Skills read the entry for their kind: `explore` (`explore-how`, `explore-why` searchers, wide searches), `review` (`review-code` Standards, Spec and Impact), `adversary` (`review-code` Adversary), `design` (design-it-twice designers), `implement` (`implement-spec` implementers). A missing entry means `inherit`, except `adversary` and `design`, which spread across `opus` and `sonnet` because their point is to differ. Give the hardest work a stronger model, and spread checkers across models so a verifier does not share its author's blind spots.

Where the repo already states a rule (CONTRIBUTING, a PR template, the project's own spec), the repo's rule wins over any default in a skill. Name the source here and keep it as the single copy.

## Memory

Tools: `memo_post` writes, `memo_callback` searches, `memo_get` reads one memo, `memo_info` shows the project and counts. Codes: `I-n` issue, `A-n` attempt, `F-n` fix, `D-n` decision, `N-n` note. Each memo can name an `epic` (the epic directory) and a `ticket`.

The project is identified by its first git commit, so a re-clone or a moved folder finds the same memory. Run `node <plugin>/mcp/memo/cli.ts export` to dump it as Markdown for backup or sharing.

### Fallback: `.work/notes.md`

Only when the `memo` server is not running. One line per entry, newest at the bottom, never edited:

```
YYYY-MM-DD | kind | tag, tag | text
```

- `kind` is one of `decision`, `note`, `attempt`, `fix`, `bug`, `glossary`. `bug` lines start with the normalized error message, then ` :: ` and the symptom. `attempt` lines end with `-> failed`, `-> partial` or `-> worked`. `fix` lines end with `(unconfirmed)` or `(confirmed)`.
- To change a line, append a new one that starts with `supersedes YYYY-MM-DD <first words of the old line>:`.
- Search with `grep -i`. Mask secrets before writing.
