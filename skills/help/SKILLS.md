# Skill catalog

One line per skill: what it does, and when to reach for it. `type` = you type the command. `auto` = the agent starts it when it fits; you can type it too. It is the single list that `help` and `ask-me` read. `npm run check` fails when it, `.claude-plugin/plugin.json`, the README or a skill's frontmatter disagree.

## setup
- `/dev:setup-repo` (type): choose where memory lives, delivery, tracker, domain docs. Use once per repo, first.
- `/dev:setup-need-install` (type): check installed helper tools, recommend which to add. Use on a new machine or project.
- `/dev:setup-verify` (type): generate a project skill that drives the real app and keeps evidence. Use once per app, `refresh` after big UI or CLI changes.

## clarify
- `/dev:clarify-grill-docs` (type): interview you until the design is settled, recording terms and decisions. Use when you have an idea but not a design.
- `/dev:clarify-ask` (type): turn a question you cannot answer alone into a questionnaire for someone else. Use when the answer is in another person's head.
- `/dev:clarify-explain` (type): re-pitch the last message in plain terms. Use when you did not understand the agent.
- `/dev:clarify-grill` (auto): the interview itself, rounds of questions with a recommended answer.
- `/dev:clarify-domain` (auto): challenge terms against the glossary, record each term and decision once.

## explore
- `/dev:explore-decide` (auto): research a technical choice and recommend one option. Use when stuck between options.
- `/dev:explore-how` (auto): explain how a part of this codebase works: flow, pieces, where they live, traps. Use for "how does X work".
- `/dev:explore-research` (auto): investigate a question in primary sources, save cited findings. Use for library, API or docs questions.
- `/dev:explore-prototype` (auto): build a throwaway prototype to answer a design question.
- `/dev:explore-why` (auto): find why existing code is shaped the way it is, from history, tickets and memory. Use before changing code you do not understand.

## plan
- `/dev:plan-spec` (type): index a spec by requirement code, or write one from a conversation. Use when you have a source document or settled design.
- `/dev:plan-tickets` (type): cut epics and tracer-bullet tickets with blocking edges. Use after the spec.
- `/dev:plan-ticket-change` (type): split, cancel or reopen a ticket. Use when a ticket is too big or no longer needed.

## implement
- `/dev:implement-ticket` (type): take one ticket to a printed commit message and commands; resumes unfinished work. Use to do a ticket, or to continue.
- `/dev:implement-spec` (type): implement a whole spec with parallel subagents. Use when the tickets are ready and independent.

## test
- `/dev:test-plan` (auto): choose the minimum proof a ticket needs.
- `/dev:test-tdd` (auto): red-green-refactor one slice at a time.
- `/dev:test-benchmark` (auto): vet a performance number before you report or act on it.

## debug
- `/dev:debug-diagnose` (auto): build a loop that fails on the bug, then find and fix the cause. Use for a bug you cannot explain.

## review
- `/dev:review-code` (type): review a diff on Standards and Spec, plus Impact and Adversary for risky changes, in parallel. Use before you commit.
- `/dev:review-impact` (auto): find what a change breaks outside its diff and prove why it is safe. Use for a risky diff or "what could this break".
- `/dev:review-learn` (type): write a learning note with Mermaid diagrams for a finished ticket or epic. Use after delivery, to share what was built.
- `/dev:review-pr` (auto): shape a pull request body with evidence. Use when opening a PR.

## design
- `/dev:design-improve` (type): scan the code for modules to deepen. Use when the code feels tangled.
- `/dev:design-modules` (auto): the vocabulary for deep modules and seams.
- `/dev:design-types` (auto): type discipline for TypeScript; loads when you work on `.ts` files.

## session
- `/dev:session-progress` (type): where the work stands, what is open, what to do next. Use when you come back.
- `/dev:session-handoff` (type): compact the conversation for another agent. Use before you stop or switch.
- `/dev:session-retro` (type): suggest improvements to the agent's setup after a session.

## memo
- `/dev:memo-post` (auto): record an issue, attempt, fix, decision or lesson.
- `/dev:memo-callback` (auto): search earlier issues, fixes, decisions and notes. Use to ask "have we seen this".

## other
- `/dev:wizard` (type): generate a script that walks you through steps only a human can do.
- `/dev:agent-docs` (auto): write skills, `CLAUDE.md` and other documents agents read.
- `/dev:help` (type): list these skills. `/dev:ask-me` (type): say what you want to do, get the command to run.
