---
name: setup-repo
description: "Configure this repo for the engineering skills: where memory lives (in the repo or private), how work is delivered (commit or PR), the issue tracker, and the domain doc layout. Run once per repo before the other engineering skills."
disable-model-invocation: true
---

# Setup Repo

Scaffold the per-repo configuration that the engineering skills assume:

- **Storage**: whether the skills' files live in the repo (`in-repo`) or stay out of git (`private`)
- **Delivery**: whether finished work goes onto the current branch (`commit`) or through a branch and pull request (`pr`), and the repo's own rules for it. Skills hand the git writes to you by default: they print the commit message and the commands, and never commit or push themselves
- **Issue tracker**: where issues live (GitHub, GitLab, local Markdown under `.work/`, or anything else you describe)
- **Domain docs**: where `GLOSSARY.md` and ADRs live (`in-repo` only)

Storage and delivery are two independent settings. A new project can be `in-repo` and still need `pr`; a shared company repo is usually `private` and `pr`.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo. Read whatever exists; don't assume:

- `git remote -v`, `.git/config`, and `git shortlog -sn HEAD | head`: is this a GitHub or GitLab repo, and does anyone else commit to it?
- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section?
- `.work/`, `docs/agents/`, `GLOSSARY.md`, `GLOSSARY-MAP.md`, `docs/adr/`: has setup run before?
- Delivery conventions already written down: `CONTRIBUTING.md`, `.github/pull_request_template.md`, `CODEOWNERS`, CI config, and any requirement document at the root (a roadmap or spec often has a "how we work" section).
- Monorepo signals: `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. Their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what is present and what is missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches. Skip a section when exploration already settled it.

**Section A: Storage.**

> Explainer: `in-repo` commits the Markdown files (`.work/`, `GLOSSARY.md`, ADRs, `docs/agents/`) so the whole team shares them. `private` adds `.work/` to `.git/info/exclude` and changes nothing else in the repo, so nothing reaches teammates.

Recommend `private` when other people commit to the repo or it has a `CONTRIBUTING.md`; otherwise `in-repo`.

**Section B: Delivery.**

> Explainer: `commit` puts the work on the current branch. `pr` works on a branch and ends in a pull request. Either way the skills print the commit message and the commands for you to run; they do not run `git commit` or `git push`.

Recommend `pr` when exploration found a PR template, `CODEOWNERS`, protected-branch hints or a written branch rule; otherwise `commit`. For `pr`, collect the repo's own rules and copy them into `workflow.md` with their source: branch naming, commit convention, PR size cap, PR template, reviewers, anything that must accompany a PR (an ADR, a rollback plan). Ask only for what the repo does not state. These rules always win over a skill's default.

**Section C: Issue tracker.**

> Explainer: The "issue tracker" is where epics and tickets live. Skills like `plan-tickets`, `plan-spec` and `implement-ticket` read from and write to it. Pick the place you actually track work for this repo.

Default posture: if a `git remote` points at GitHub, propose GitHub; at GitLab, propose GitLab. Otherwise, or if the user prefers, offer:

- **GitHub**: issues live in GitHub Issues (uses the `gh` CLI)
- **GitLab**: issues live in GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown**: tickets live as files under `.work/tickets/` (good for new projects, solo work, and repos where tickets live in another system)
- **Other** (Jira, Linear, etc.): ask the user to describe the workflow in one paragraph; record it as freeform prose. The user pastes a ticket's text into `/dev:implement-ticket`, which writes it to a local ticket file.

For local markdown, also ask for the ticket id prefix. Recommend the prefix the requirement document already uses (for example `EC`), else `T`.

**Section D: Domain docs.** Skip when storage is `private`: terms and decisions go to memory instead (`glossary` notes and `decision` memos). When `in-repo`, default to **single-context** (one `GLOSSARY.md` and `docs/adr/` at the repo root) and write it without asking. Offer **multi-context** (a root `GLOSSARY-MAP.md`) only when exploration found monorepo signals.

### 3. Confirm and edit

Show the user a draft of:

- For `in-repo`: the `## Agent skills` block for `CLAUDE.md` / `AGENTS.md`, and the contents of `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, `docs/agents/workflow.md`.
- For `private`: the contents of `.work/config.md` and the line that will be added to `.git/info/exclude`.

Let them edit before writing.

### 4. Write

**In-repo.** Read [IN-REPO.md](IN-REPO.md) and write what it says: the `## Agent skills` block in `CLAUDE.md` or `AGENTS.md`, and `docs/agents/issue-tracker.md`, `domain.md` and `workflow.md` from the seed templates.

**Private.** Write one file, `.work/config.md`, with three sections (`## Issue tracker`, `## Domain docs`, `## Workflow`) taken from the same templates, with `Storage: private`. Append `.work/` to `.git/info/exclude`. Touch nothing else: no `CLAUDE.md`, no `GLOSSARY.md`, no ADRs, no `docs/agents/`.

**Both.** Create `.work/`. For `local` tracker also create `.work/tickets/`. Call `memo_info` to check that memory works: it names the project and the database file under `~/.claude/memo/`. If the tool is missing, the `memo` server did not start (it needs Node 22.18 or newer); create `.work/notes.md` with the first line `# Notes (format: see workflow.md)` as the fallback and say so.

### 5. Verify and point to the next step

- `private`: run `git status --short`. It must show no file created by this skill. If it does, fix the exclude rule.
- `in-repo`: run `git status --short`. It must show only the files this skill meant to write.

Tell the user setup is complete. Skills find their configuration in `docs/agents/*.md` (reached from `CLAUDE.md`) or in `.work/config.md`. They can edit those files directly later; re-run this skill only to switch settings or start over.

Next steps: with no source yet, `/dev:clarify-grill-docs`; with a requirement document, `/dev:plan-spec`; with a ticket in hand, `/dev:implement-ticket`.
