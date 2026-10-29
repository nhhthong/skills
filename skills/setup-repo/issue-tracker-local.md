# Issue tracker: Local Markdown

Epics, tickets and the spec index for this repo live as Markdown files in `.work/`.

## Layout

```
.work/
├── spec-index.md                      # requirement codes, open points, decisions, infrastructure order
├── tickets/<epic-slug>/<NN>-<ID>-<slug>.md
├── plans/<epic-slug>/                 # two-way planning drafts and their comparison, from /dev:plan-tickets
├── research/                          # cited research notes
├── learn/                             # learning notes from /dev:review-learn
└── notes.md                           # decisions, problems, tries, fixes and facts (see workflow.md)
```

## Conventions

- One directory per epic under `.work/tickets/`. Only the epic being worked has ticket files; later epics stay as lines in `spec-index.md` until `/dev:plan-tickets` cuts them.
- One file per ticket, never a single combined file. `NN` is the order within the epic, numbered from `01`, blockers first.
- `ID` is the ticket id: the prefix below plus a number, for example `EC-7`. Prefix: `<PREFIX>`.
- **Next id**: the highest number in any ticket file name across all epics, plus one. Compute it by listing `.work/tickets/`; never reuse a number.
- A ticket pasted from another system (Jira, Linear) gets a file too, named after its own id, so `/dev:implement-ticket` has one shape to read.
- Header lines at the top of each file: `Type`, `Parent`, `Requirements`, `Blocked by`, `Status`, `New infrastructure`, `Files`, `Proof`. `Status` takes `ready`, `in-progress`, `in-review`, `done` or `dropped`.
- Comments and conversation history append to the bottom of the file under a `## Comments` heading.

## When a skill says "publish to the issue tracker"

Create a new file under `.work/tickets/<epic-slug>/` (creating the directory if needed). A spec index goes to `.work/spec-index.md`; a full spec to `.work/spec.md`.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path, or find it by id with `ls .work/tickets/*/ | grep <ID>`.

## Blocking and the frontier

A ticket is unblocked when every ticket in its `Blocked by` line has `Status: done`. The frontier is the set of tickets with `Status: ready` and no open blocker; the lowest `NN` wins.
