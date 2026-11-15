# Workflow

The settings skills read before they commit, open a PR or record a note. What each setting means is in the skills; this file holds only this repo's values. Where the repo already states a rule (CONTRIBUTING, a PR template), that rule wins: name its source here.

- **Mode**: `<micromanagement | empowerment>`. Only a person changes this line.
- **Storage**: `<in-repo | private>`
- **Delivery**: `<commit | pr>`
- **Commit messages**: `<convention, for example Conventional Commits>`
- **Always pause**: deleting data, a migration on a shared database, a force-push, a deploy, a merge into the default or production branch, a message to a customer. Add the repo's own items.
- **Models**: `explore: sonnet; review: sonnet; adversary: opus, sonnet; design: opus, sonnet; implement: inherit`

Delivery `pr` only (delete these lines for `commit`):

- **Branch names**: `<pattern, for example type/ticket-id-short-description>`
- **PR size cap**: `<for example 400 changed lines, or none>`
- **PR template**: `<path or the sections it needs>`
- **Reviewers**: `<who reviews what>`
- **Other rules**: `<for example an ADR when a service boundary changes>`

## What Mode decides

| | `micromanagement` | `empowerment` |
|---|---|---|
| A skill says ask or wait | Ask and wait | Take the recommended answer, write `ASK: <question> -> <answer>` in the ticket's `## Result` (a `note` line when there is no ticket) |
| Git writes (`git commit`, non-force `git push`) | Printed for you to run | Run by the agent |
| Tracker and pull request writes (`gh`, `glab`) | Printed; reading is always fine | Run by the agent |
| Review | Named for you: `/dev:review-code <ID>` | Run by the agent before delivery |
| Entry-point skills (`plan-*`, `implement-*`, `review-code`, `review-learn`) | You type them | The agent starts them when the work reaches them |
| Ticket `done` | When you confirm the commit or merge | In the commit that delivers it (with `pr`: once merged) |

Both modes stop at `Always pause`. A direct request in a session ("commit it") is honoured in both. No `Mode` line means `micromanagement`. Under `empowerment` a choice that is hard to reverse (a data store, a public API shape, a service boundary, an auth model, how money is handled) is still made, with its rejected options recorded so a person can reverse it.

`Models` is the Agent tool's `model` value per kind of subagent; a list means spread the subagents across those models; a missing entry means `inherit`.

## Notes

`.work/notes.md`, one line per entry, appended, never edited:

```
<ID> | YYYY-MM-DD | <kind> | <tags> | <text>
```

- **ID**: `D-n` decision, `I-n` issue, `A-n` attempt, `F-n` fix, `N-n` note; the next number is the highest with that prefix plus one.
- **tags**: the ticket or epic (`T-4`, `epic:login`), requirement codes, and for a note one of `gotcha`, `lesson`, `structure`, `convention`, `glossary`.
- **text**: decision `<title>: <reason>. Rejected: <options>.` (a replacement starts `supersedes D-n:`); issue `<error message> :: <symptom>`; attempt `for I-n: <tried> -> failed|partial|worked`; fix `for I-n: <change> (unconfirmed|confirmed)`.
- To change an entry, append a line with the same ID: the last line with an ID is its current state.
- Search with `grep -i <words> .work/notes.md`; mask secrets before writing.
