# Workflow

How work is delivered in this repo, and where memory lives. Skills read this file before they commit, open a PR, or record a note.

## Storage

- **Storage**: `<in-repo | private>`. Private means everything under `.work/` stays out of git (`.git/info/exclude`) and no `GLOSSARY.md`, ADR or `CLAUDE.md` edit is made for the skills.
- **Notes**: `.work/notes.md`, append-only. Research notes go in `.work/research/`.

## Delivery

- **Delivery**: `<commit | pr>`. `commit` means the work goes onto the current branch. `pr` means a branch and a pull request.
- **Git writes**: `hand-off`. Skills do not run `git commit`, `git push` or open a pull request. They print the commit message and the exact commands for you to run. Change this to `run` to let skills run them. A direct request in a session ("commit it") is also honoured for that session.
- **Branch names**: `<pattern, for example type/ticket-id-short-description>`
- **Commit messages**: `<convention, for example Conventional Commits>`
- **PR size cap**: `<for example 400 changed lines, or none>`
- **PR template**: `<path or the sections it needs>`
- **Reviewers**: `<for example 2 for internal/inventory, internal/booking and migrations>`
- **Other rules**: `<for example an ADR is required when a service boundary changes>`

Where the repo already states a rule (CONTRIBUTING, a PR template, the project's own spec), the repo's rule wins over any default in a skill. Name the source here and keep it as the single copy.

## Notes format

One line per entry in `.work/notes.md`, newest at the bottom, never edited or deleted:

```
YYYY-MM-DD | kind | tag, tag | text
```

- `kind` is one of `decision`, `note`, `attempt`, `fix`, `bug`, `glossary`.
- Tags come from the tags already in the file. Add a new tag only when no existing one fits (`loyalty` and `loyalty-program` are two dead ends for one search).
- `bug` lines start with the normalized error message (no absolute paths, line numbers, ids, timestamps or ports), then ` :: ` and a short symptom.
- `attempt` lines end with `-> failed`, `-> partial` or `-> worked`. `fix` lines end with `(unconfirmed)` until the original loop is green, then a new `fix` line ends with `(confirmed)`.
- To change a `decision` or `note`, append a new line that starts with `supersedes YYYY-MM-DD <first words of the old line>:`. Readers treat the older line as history.
- Mask secrets before writing. Do not record chores or anything git or the tracker already shows.
- Search with `grep -i` over the file.
