# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations. Commands that write are printed for you to run under `micromanagement` and run by the skill under `empowerment`: see `Tracker and pull request writes` in `workflow.md`.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.


## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Types, parents and blocking

- **Type**: one label per issue, named `epic`, `feature`, `task`, `bug` or `spike`. Where the organization has native issue types, use those and label only `epic` and `spike`.
- **Epic and tickets**: the epic is a parent issue; each ticket is a sub-issue of it (see **Make an issue a sub-issue of a parent**).
- **Blocking**: GitHub's native issue dependencies. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric database id (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, not the `#number`). Where dependencies are unavailable, put a `Blocked by: #<n>, #<n>` line at the top of the body.
- **Status**: open issue means `ready` or `in-progress`; a `in-progress` label marks the one being worked. Closed means `done` (or `dropped` with a closing comment saying so).
