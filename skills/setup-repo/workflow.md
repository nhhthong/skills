# Workflow

How work is delivered in this repo, and where memory lives. Skills read this file before they commit, open a PR, or record a note.

## Storage

- **Storage**: `<in-repo | private>`. Private means everything under `.work/` stays out of git (`.git/info/exclude`) and no `GLOSSARY.md`, ADR or `CLAUDE.md` edit is made for the skills.
- **Memory**: the `memo` MCP server (shipped with this plugin) keeps issues, attempts, fixes, decisions and notes in SQLite at `~/.claude/memo/<project>-<id>.db`. It is outside the repo, so `in-repo` and `private` do not change it. Research notes go in `.work/research/`.

## Delivery

- **Delivery**: `<commit | pr>`. `commit` means the work goes onto the current branch. `pr` means a branch and a pull request.
- **Git writes**: `hand-off`. Skills do not run `git commit`, `git push` or open a pull request. They print the commit message and the exact commands for you to run. Change this to `run` to let skills run them. A direct request in a session ("commit it") is also honoured for that session.
- **Review**: `typed`. `implement-ticket` stops before delivery and asks you to run `/dev:review-code`. Change this to `inline` to let it run the same review itself, against the ticket's `Base:` commit, and go on to delivery.
- **Branch names**: `<pattern, for example type/ticket-id-short-description>`
- **Commit messages**: `<convention, for example Conventional Commits>`
- **PR size cap**: `<for example 400 changed lines, or none>`
- **PR template**: `<path or the sections it needs>`
- **Reviewers**: `<for example 2 for internal/inventory, internal/booking and migrations>`
- **Other rules**: `<for example an ADR is required when a service boundary changes>`
- **Always pause**: deleting data, a migration on a shared database, a force-push, a deploy, a message to a customer. A skill stops and asks before any of these, even under `Git writes: run`. Add the repo's own items here.

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
