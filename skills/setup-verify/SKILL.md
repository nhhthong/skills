---
name: setup-verify
description: "Generate a project skill that launches the real app, drives a feature the way a user does and keeps the evidence, then prove it by running it once. Pass 'refresh' to bring an existing one back in line with the code."
argument-hint: "Nothing to create one, or 'refresh' to update the existing one"
disable-model-invocation: true
metadata:
  credits:
    skill: create-verification-skill, maintain-verification-skill
    author: Lauren Tan
    organisation: pstack
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md"
---

# Setup Verify

Write a project skill, `verify-<app>`, that an agent reads cold, mid-ticket, to prove a change on the running app: launch it, drive a feature as a user would, and keep the evidence. It is proof level 5 in [PROOF.md](../test-plan/PROOF.md).

Read the repo's storage setting first (`docs/agents/workflow.md`, or `.work/config.md` when private):

- Write to `.claude/skills/verify-<app>/` in the repo.
- `private`: also add `.claude/skills/verify-<app>/` to `.git/info/exclude`, so nothing new reaches teammates.

With the argument `refresh`, read [REFRESH.md](REFRESH.md) and follow it instead of the steps below.

## Steps

1. **Read the repo, not the user.** Answer from the code, and ask only what you cannot observe. Done when each answer names its source file or the question for the user.
   - **Surface**: what a user touches: a web UI, a CLI, an API, a desktop or mobile app. Pick the main one; note the others.
   - **Run**: the repo's own start command (package scripts, Makefile, README), with its ports, environment variables, seed data and login.
   - **Drive**: a harness the repo already has (Playwright or Cypress specs, HTTP clients, CLI fixtures) before a generic one: a browser for web, a PTY or `tmux` session for a CLI, plain HTTP for a service.
   - **Observe**: what can be captured: screenshots, terminal transcripts, response bodies, logs, exit codes, database rows.
   - **Isolate**: whether two instances can run side by side (ports, data directories). When they cannot, the skill says so and refuses to drive an instance it did not start.

   When the checkout does not build or start as it is, fix that first or report exactly what fails; a skill written against a broken base teaches wrong steps.

2. **Write the skill.** A `SKILL.md` with `name: verify-<app>` and a description that names the app, the surface and when to use it, then these sections, each filled from step 1 with no placeholder left:
   - **Launch**: the command, the sign that the app is usable (not only that a process answers), and how to stop it. It reaches a usable state from an empty data directory, migrations and seed data included.
   - **Doctor**: one read-only check that the running instance is worth driving: process up, the right build, the port owned by this run, login valid.
   - **Drive**: the harness recipe with the repo's real selectors, routes or commands. Prefer stable handles (labels, `data-` attributes, route paths, prompt strings) over coordinates.
   - **Evidence**: what to capture and where it goes. The real user path, not test-only endpoints; the action and the resulting state; side effects (files, rows, messages) next to what is visible; mocks only where a production boundary already isolates the outside system. When the safe path is a dry-run or test mode, observe what it really skips (files, network, git refs) instead of trusting its name.
   - **Cleanup**: stop only what this run started, never by process name. Evidence survives cleanup, in the place the skill names.
   - **Helpers**: every script the skill ships is executable, and the skill body shows how to call it. A helper the reader must reverse-engineer is not a helper.

   For a short-lived CLI, Launch means a fresh isolated session per drive, not one long-lived instance.

   Done when every section names real commands from this repo.

3. **Seed the feature map.** A `features/` folder beside the skill: a `README.md` index and one file per user-facing feature, three to five to start, found from routes, commands, menus or docs. Each file has four sections: `Sub-features`, `How to get to it`, `Driving it`, `Gotchas`. When the seed data lacks what a journey needs, the journey reports the failure and the reason goes in `Gotchas`; never weaken the journey to make it pass. The map is the repo's source of truth for verification: a proof that drives one convenient entry point is incomplete when the map lists others. Done when each feature file names an end state that proves the feature works.

4. **Prove the skill.** Run its own instructions once, end to end: launch, doctor, drive one mapped feature, capture evidence, clean up, then confirm the evidence still exists. Fix what fails, and run cleanup after every failed try. A skill never run is a draft. When you proved it in a stand-in for the real target (a container instead of a fresh machine, a local stack instead of a remote one), list every setup step the stand-in did that the target will not: those steps stay unverified until a run on the real target covers them. Done when one feature was driven and its evidence survived cleanup.

Reply with the skill's path, the feature driven in step 4 and where its evidence is.
