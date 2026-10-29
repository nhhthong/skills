# Workflow

How work is delivered in this repo, how much the agent decides alone, and where notes live. Skills read this file before they commit, open a PR, or record a note.

## Storage

- **Storage**: `<in-repo | private>`. Private means everything under `.work/` stays out of git (`.git/info/exclude`) and no `GLOSSARY.md`, ADR or `CLAUDE.md` edit is made for the skills.
- **Notes**: decisions, problems, tries, fixes and facts go in `.work/notes.md` (format below), research in `.work/research/`. With `in-repo` they are shared with the team; with `private` they stay local.

## Delivery

- **Delivery**: `<commit | pr>`. `commit` means the work goes onto the current branch. `pr` means a branch and a pull request.
- **Git writes**: follows `Mode`. Under `micromanagement`, skills do not run `git commit`, `git push` or open a pull request: they print the commit message and the exact commands for you to run. Under `empowerment`, they run them (commits and non-force pushes) and report the hashes. A direct request in a session ("commit it") is honoured in both modes; your `.claude/settings.json` permission rules still apply.
- **Tracker and pull request writes**: follows `Mode`. Under `micromanagement`, skills never run a `gh`, `glab` or tracker command that creates, edits, comments on, labels or closes an issue, or opens, edits or merges a pull or merge request: they print it for the user. Under `empowerment`, they run those commands. Reading (`gh issue view`, `gh pr view`, `gh issue list`) is always fine. This line is the single copy of the rule; other files point here.
- **Review**: follows `Mode`. Under `micromanagement` it is `typed`: `implement-ticket` names `/dev:review-code <ID>` next to the commit commands, for you to run before committing. Under `empowerment` it is `inline`: the agent calls `review-code` itself against the ticket's `Base:` commit before delivery.
- **Branch names**: `<pattern, for example type/ticket-id-short-description>`
- **Commit messages**: `<convention, for example Conventional Commits>`
- **PR size cap**: `<for example 400 changed lines, or none>`
- **PR template**: `<path or the sections it needs>`
- **Reviewers**: `<for example 2 for internal/inventory, internal/booking and migrations>`
- **Other rules**: `<for example an ADR is required when a service boundary changes>`
- **Always pause**: deleting data, a migration on a shared database, a force-push, a deploy, a merge into the default or production branch, a message to a customer. A skill stops and asks before any of these, even under `empowerment`. Add the repo's own items here.

## Models

- **Models**: `explore: sonnet; review: sonnet; adversary: opus, sonnet; design: opus, sonnet; implement: inherit`. The model each kind of subagent runs on, as the Agent tool's `model` value (`opus`, `sonnet`, `haiku`, or `inherit` for the session's own). A list means "spread the subagents across these, in turn". Skills read the entry for their kind: `explore` (`explore-how`, `explore-why` searchers, wide searches), `review` (`review-code` Standards, Spec and Impact), `adversary` (`review-code` Adversary), `design` (design-it-twice designers), `implement` (`implement-spec` implementers). A missing entry means `inherit`, except `adversary` and `design`, which spread across `opus` and `sonnet` because their point is to differ. Give the hardest work a stronger model, and spread checkers across models so a verifier does not share its author's blind spots.

Where the repo already states a rule (CONTRIBUTING, a PR template, the project's own spec), the repo's rule wins over any default in a skill. Name the source here and keep it as the single copy.

## Mode

- **Mode**: `<micromanagement | empowerment>`. It decides every line above that says "follows `Mode`".
  - `micromanagement`: where a skill says to ask the user or to wait, it asks and waits. Every git commit, push, issue and pull request write is printed as a command for you to run, and review is named for you to run.
  - `empowerment`: the agent runs with no person present and handles everything itself. Where a skill says to ask, it takes the recommended answer (or the one option the constraints leave) and writes `ASK: <question> -> <answer>` in the ticket's `## Result` (a `note` line in `.work/notes.md` when there is no ticket). A choice that is hard to reverse (a data store, a public API shape, a service boundary, an auth model, how money is handled) is made the same way and recorded with its rejected options, so a person can reverse it later. The agent runs git commits and non-force pushes, opens pull requests, creates and closes issues, and runs `review-code`; it may start the entry-point skills itself (`plan-spec`, `plan-tickets`, `plan-ticket-change`, `implement-ticket`, `implement-spec`, `review-code`, `review-learn`, `session-progress`, `session-handoff`) when the work reaches them, and sets a ticket to `done` as soon as its work is committed (merged, with delivery `pr`). It works the one ticket it was given; when asked for an epic, all tickets or the spec, it takes the ready tickets one after another until none is left.
  - A repo set up before `Mode` existed has no `Mode` line: treat it as `micromanagement`, honour no other setting, and tell the user once to run `/dev:setup-repo` to choose.
  - Both modes stop at the `Always pause` list. Only a person sets `Mode`: no agent edits this line, and `setup-repo` stays typed for that reason.

## Notes

`.work/notes.md` is the one place for what was learned. One line per entry, appended at the bottom:

```
<ID> | YYYY-MM-DD | <kind> | <tags> | <text>
```

- **ID** is a prefix and a number: `D-n` decision, `I-n` issue, `A-n` attempt, `F-n` fix, `N-n` note. The next number is the highest one with that prefix in the file, plus one (`grep -o '^D-[0-9]*' .work/notes.md | sort -t- -k2 -n | tail -1`).
- **kind** is `decision`, `issue`, `attempt`, `fix` or `note`. Tag a note `gotcha`, `lesson`, `structure`, `convention` or `glossary`. Put the ticket or epic in the tags (`T-4`, `epic:login`).
- **text** by kind. Decision: `<title>: <reason>. Rejected: <options>.`; one that replaces another starts with `supersedes D-n:`. Issue: `<normalized error message> :: <symptom>`. Attempt: `for I-n: <what was tried> -> failed|partial|worked`. Fix: `for I-n: <what changed> (unconfirmed|confirmed)`.
- **Never edit a line.** To change an entry, append a line with the same ID; the last line with an ID is its current state. Confirming a fix re-appends its `F-n` line as `(confirmed)`.
- Search with `grep -i <words> .work/notes.md`. An entry's history is `grep -w 'I-3' .work/notes.md` (`-w`, so `I-30` does not match). Mask secrets before writing.
