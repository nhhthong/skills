# In-repo

Step 4 of [SKILL.md](SKILL.md) for `Storage: in-repo`: which instruction file gets the `## Agent skills` block, what the block says, and which seed templates become `docs/agents/*.md`.

Pick the file to edit: if `CLAUDE.md` exists, edit it; else if `AGENTS.md` exists, edit it; if neither exists, ask which to create. Never create `AGENTS.md` when `CLAUDE.md` exists (or vice versa). If an `## Agent skills` block already exists, update it in place and don't overwrite the user's edits around it.

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.

### Workflow

[one-line summary: delivery mode and where notes live]. See `docs/agents/workflow.md`.
```

Write the docs files from the seed templates in this skill folder:

- [issue-tracker-github.md](./issue-tracker-github.md), [issue-tracker-gitlab.md](./issue-tracker-gitlab.md), [issue-tracker-local.md](./issue-tracker-local.md) (replace `<PREFIX>` with the chosen prefix)
- [domain.md](./domain.md)
- [workflow.md](./workflow.md) (fill `Storage`, `Delivery` and the delivery rules; keep the default `Models` line unless the user names other models)

For an "other" tracker, write `docs/agents/issue-tracker.md` from scratch using the user's description.
