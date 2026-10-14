---
name: setup-need-install
description: Check which helper tools are already on this machine, look at the project, and recommend which of the known tools to install (library docs, code graph, token saver, lean-code rules, UI design skills, browser automation).
disable-model-invocation: true
---

# Setup: Need Install

Recommend helper tools that fit this machine and this project, and install the ones the user approves. The tools and their install commands are in [TOOLS.md](TOOLS.md). This skill adds nothing to that list by itself.

Read-only until step 5: detection changes nothing.

## Steps

### 1. Detect the machine

Collect, with read-only commands:

- Installed plugins: `claude plugin list`. If the command is missing, read `enabledPlugins` in `~/.claude/settings.json`.
- MCP servers: `claude mcp list` (it starts each server to check its health, so allow a few seconds), plus `.mcp.json` in the project.
- Installed skills: the folder names in `~/.claude/skills`, `.claude/skills` and `~/.agents/skills`.
- Programs: `command -v` for `node`, `npm`, `npx`, `git`, `curl`, `codebase-memory-mcp`, `playwright-cli`, `caveman`, and `node --version`.

Match the results against each catalog entry's **installed signal**. Done when every catalog entry is marked `installed`, `partly` (one route present, others missing) or `missing`.

### 2. Detect the project

In the current directory, read-only:

- Size: `git ls-files | wc -l` (tracked files). Treat under 200 as small, 200 to 2,000 as medium, over 2,000 as large. These cut-offs are rules of thumb: state the number, not just the label. Without git, count files outside `node_modules`, `.git`, `vendor`.
- Languages: the most common extensions among tracked files.
- Dependencies: manifests (`package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `pom.xml`, `Cargo.toml`, `composer.json`) and roughly how many external libraries they list.
- Web UI: dependencies in `package.json` (react, vue, svelte, next, nuxt, astro, angular, tailwind), or `.html`, `.css`, `.tsx`, `.vue` files.
- Browser tests: `playwright.config.*`, `cypress/`, a `test:e2e` script, `@playwright/test` in dependencies.
- An empty or near-empty folder with only a spec or roadmap.
- The repo's storage setting (`.work/config.md` or `docs/agents/workflow.md`) when `/dev:setup-repo` has run: under `Storage: private`, nothing may be added to the repo.

Done when you can state, in two lines, what kind of project this is.

### 3. Recommend

For each catalog entry that is `missing` or `partly`, apply its **fit** rule to what steps 1 and 2 found and label it **Recommend**, **Optional** or **Skip**, with one sentence that cites the finding ("1,840 tracked files and no code graph" rather than "useful for big repos"). List the tools already installed in one line, and name any pair of installed tools that overlap, as the catalog notes.

### 4. Ask once

Show the recommendation as a table: tool, label, reason, what installing changes (machine only, or this repo), and the command. Then ask one multi-select question for which to install, with the **Recommend** rows first. Tools labelled **Skip** are listed only if the user asks.

### 5. Install what was approved

For each approved tool, in the catalog's order:

- A command that only installs a package or plugin (`claude plugin ...`, `claude mcp add ...`, `npm install -g ...`, `npx skills add ...`) is run by you after the approval, and its output reported.
- A command that pipes a download into a shell (`curl ... | bash`, `irm ... | iex`) is **not** run by you. Give the command to the user to run with the `!` prefix, and name the one-line check to read the script first.
- A command that is interactive (it opens a browser to sign in, asks questions, or creates an API key) is also handed to the user with the `!` prefix, with a line saying what it will ask.
- A command that changes the project (`npm init playwright@latest`) is run only when the repo's storage is not `private`; otherwise tell the user it would add files to a shared repo and leave it to them.

After each, re-run the matching detection from step 1. A failure is reported with the command's last lines, and the README of the tool is re-read before any retry, because install commands change.

### 6. Report

One block: installed (and verified), handed to the user, skipped with the reason, and what needs a restart of the Claude Code session. If the `memo_post` tool exists, record a `note` tagged `tooling` listing what was installed. Next step: `/dev:setup-repo` if the repo has not been set up.
