---
name: help
description: Show what each skill does, in one line each.
argument-hint: "A group (clarify, plan, ...), a skill name, or nothing for all"
disable-model-invocation: true
---

Show the user the skill catalog in [SKILLS.md](SKILLS.md). Print the lines as they are; do not rewrite or expand them.

- No argument: print every group, with its heading.
- A group prefix (`clarify`, `test`, ...): print only that group.
- A skill name: print its line, then its `description` from its own `SKILL.md`.

Skills share a prefix per job, so typing `/dev:` plus the prefix lists the group. If the user's word matches no group or skill, say so and print the group names. If a skill folder exists that the catalog does not list, add its `description` as a last line and tell the user the catalog is behind.

End with one line: `/dev:ask-me <what you want to do>` picks the skill for you.
