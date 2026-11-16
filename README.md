<div align="center">

<img src="resources/banner.png" alt="Skills for Standard Developer: clarify, plan, implement, prove, review" width="100%">

<br>

[![Claude Code plugin](https://img.shields.io/badge/Claude_Code-plugin-D97757?logo=anthropic&logoColor=white)](https://code.claude.com/docs/en/plugins)
[![Version](https://img.shields.io/badge/version-2.3.0-2F5BFF)](CHANGELOG.md)
[![Skills](https://img.shields.io/badge/skills-35-6A3DF0)](#skills)
[![Node.js](https://img.shields.io/badge/node-%E2%89%A522.18-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org)

**From an empty folder, or one ticket in a large codebase, to a delivery you can prove.**

[Quick start](#quick-start) · [How it works](#how-it-works) · [Resume in a new session](#resume-in-a-new-session) · [Skill catalog](#skills) · [Changelog](CHANGELOG.md)

</div>

---

## Overview

`dev` is a Claude Code plugin of 35 small skills: agree on what to build, cut it into tickets, build each against a proof, review it, and leave a record the next session can pick up.

- **Proof, not claims.** A ticket is done when a command on the real code prints `VERIFIED`, after it was seen failing.
- **Process sized to risk.** A one-line change runs the existing build; stored data, outside callers and money get tests per risk and a deeper review.
- **Cheap to resume.** Notes, tickets and a spec index live under `.work/`; one command prints where the work stands.
- **Your autonomy.** `micromanagement` asks and prints git commands for you; `empowerment` decides, logs each choice as `ASK:` and commits. Both stop before deleting data, shared migrations, deploys and customer messages.

## Quick start

```bash
claude plugin marketplace add nhhthong/skills
claude plugin install dev@nhhthong-skills
```

Then, in your project:

```text
/dev:setup-repo                      once per repo: storage, delivery, tracker, mode
/dev:implement-ticket <ticket text>  take one ticket to a verified commit
/dev:ask-me <what you want to do>    not sure? get the skills to run, in order
```

New idea or spec: `setup-repo` → `clarify-grill-docs` → `plan-spec` → `plan-tickets` → `implement-ticket`. Back after a break: `session-progress`, then `implement-ticket`.

## Resume in a new session

```bash
node skills/session-progress/state.mts               # config, git, epics, tickets, open points, next command
node skills/session-progress/state.mts --ticket T-4  # one ticket, its requirement lines, the notes that bind it
```

## Skills

Prefix every name with `/dev:`. **You type** skills run only when called; **agent** skills also start on their own.

<details>
<summary>All 35 skills</summary>

**Setup**: prepare a repo, a machine and a way to drive the app

- [`setup-repo`](skills/setup-repo/SKILL.md) (you type): Choose storage, delivery, issue tracker and domain docs.
- [`setup-need-install`](skills/setup-need-install/SKILL.md) (you type): Recommend helper tools to add.
- [`setup-verify`](skills/setup-verify/SKILL.md) (you type): Generate a skill that drives the real app; `refresh` updates it.

**Clarify**: agree on what to build

- [`clarify-grill-docs`](skills/clarify-grill-docs/SKILL.md) (you type): Interview until the design settles; record terms and decisions.
- [`clarify-ask`](skills/clarify-ask/SKILL.md) (you type): Turn a question into a questionnaire for someone else.
- [`clarify-explain`](skills/clarify-explain/SKILL.md) (you type): Re-pitch a message that did not land.
- [`clarify-grill`](skills/clarify-grill/SKILL.md) (agent): The interview: rounds of questions with recommended answers.
- [`clarify-domain`](skills/clarify-domain/SKILL.md) (agent): Challenge terms, record each term and decision once.

**Explore**: answer a question before building

- [`explore-decide`](skills/explore-decide/SKILL.md) (agent): Research a technical choice, recommend one option.
- [`explore-how`](skills/explore-how/SKILL.md) (agent): Explain how a part of the code works.
- [`explore-research`](skills/explore-research/SKILL.md) (agent): Cited findings from primary sources.
- [`explore-prototype`](skills/explore-prototype/SKILL.md) (agent): Throwaway prototype for a design question.
- [`explore-why`](skills/explore-why/SKILL.md) (agent): Why code is shaped this way, known kept apart from inferred.

**Plan**: from source to tickets

- [`plan-spec`](skills/plan-spec/SKILL.md) (agent): Spec index or full spec; open points stay open.
- [`plan-tickets`](skills/plan-tickets/SKILL.md) (agent): Epics and tracer-bullet tickets, linted; large epics drafted two ways.
- [`plan-ticket-change`](skills/plan-ticket-change/SKILL.md) (agent): Split, cancel or reopen a ticket.

**Implement**: build

- [`implement-ticket`](skills/implement-ticket/SKILL.md) (agent): One ticket to a printed commit; resumes.
- [`implement-spec`](skills/implement-spec/SKILL.md) (agent): A whole spec with parallel subagents.

**Test**: right-sized proof

- [`test-plan`](skills/test-plan/SKILL.md) (agent): The minimum proof a ticket needs.
- [`test-tdd`](skills/test-tdd/SKILL.md) (agent): Red-green, one slice at a time.
- [`test-benchmark`](skills/test-benchmark/SKILL.md) (agent): Vet a performance number before reporting it.

**Debug**: find the cause of a hard bug

- [`debug-diagnose`](skills/debug-diagnose/SKILL.md) (agent): Red loop, hypotheses, fix, recorded attempts.

**Review**: check the work

- [`review-code`](skills/review-code/SKILL.md) (agent): Standards and Spec, plus Impact and Adversary when something already reads the changed data.
- [`review-impact`](skills/review-impact/SKILL.md) (agent): What a change breaks outside its diff, proven by running code.
- [`review-learn`](skills/review-learn/SKILL.md) (agent): Learning note for a finished ticket or epic.
- [`review-pr`](skills/review-pr/SKILL.md) (agent): PR body: summary visual, evidence, merge danger.

**Design**: deep modules, clean seams, honest types

- [`design-improve`](skills/design-improve/SKILL.md) (you type): Find modules to deepen and walk through one.
- [`design-modules`](skills/design-modules/SKILL.md) (agent): Vocabulary for deep modules and seams, with red flags.
- [`design-types`](skills/design-types/SKILL.md) (agent): TypeScript type discipline; loads on `.ts` files.

**Session**: status, handoff, retrospective

- [`session-progress`](skills/session-progress/SKILL.md) (agent): Where the work stands and what is next, from one command.
- [`session-handoff`](skills/session-handoff/SKILL.md) (agent): A document another agent can continue from.
- [`session-retro`](skills/session-retro/SKILL.md) (you type): Improve the agent's environment, most severe first.

**Other**: navigation, manual steps, writing for agents

- [`ask-me`](skills/ask-me/SKILL.md) (you type): Say what you want, get the skills to run.
- [`wizard`](skills/wizard/SKILL.md) (you type): A script for steps only a human can do.
- [`agent-docs`](skills/agent-docs/SKILL.md) (agent): Write skills, `CLAUDE.md` and other agent documents.

</details>

</details>

## Development

```bash
npm install && npm test   # skill consistency check, then the script tests
```

Node.js 22.18+ is needed only for the ticket linter, the state command and `npm test`; without it the skills read the files directly.

## More

[CHANGELOG](CHANGELOG.md) · [CREDITS](CREDITS.md)
