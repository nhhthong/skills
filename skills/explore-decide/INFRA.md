# Infrastructure choices

Read this only when the decision concerns infrastructure: a database, a cache, a queue, hosting, CI, observability, or the shape of the first runnable skeleton.

## Start from what the source states

A stack the source already names is decided. Do not research it again. Research only the parts it leaves open.

Ask for constraints the source does not give and the choice depends on, one question for all of them: expected load, availability target, budget, data region, compliance. Skip any the source answers.

## The first time: a minimal skeleton

Pick the smallest set that runs and can be proven: toolchain, scaffold, one smoke check. Everything else arrives with the first ticket that needs it.

Keep the table `Infrastructure` in `.work/spec-index.md` current:

| Component | First needed by | Status |
|---|---|---|
| PostgreSQL | EC-3 (seat map) | in place |
| Redis | EC-7 (seat hold) | later |
| Kafka | EC-12 (outbox) | later |

A component with no ticket that needs it stays `later`. `plan-tickets` reads this table when it cuts tickets.

## Each component

For the component the current ticket needs:
- The scaffold or install command, build and test commands, required version and recommended layout, taken from the component's own documentation with the date read.
- The test that proves it works in the ticket (for a database: a migration applies and a read-back succeeds).
- A cost estimate when the component is a paid service: unit price from the provider's pricing page, multiplied by the load the spec gives.

## Architecture rules

When the choice implies a rule (each service reads only its own schema, no service imports another's internals), write the rule down with how it is proven. `test-plan` turns that proof into a check that fires on a deliberate violation.

## Steps only a human can do

Creating cloud accounts, setting secrets in CI, clicking through a provider dashboard: list them in the ticket under `New infrastructure`, and suggest `/dev:wizard` for generating a script that walks the user through them.
