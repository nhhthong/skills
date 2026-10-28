# Refresh

The upkeep pass for a `verify-<app>` skill. A feature map goes stale as soon as the app changes, so this pass covers every feature from source and drives every feature live, not only the ones recent commits touched.

## Outcome

End with exactly one, and say which:

- **clean**: every feature got source and live coverage, and nothing needed fixing.
- **changed**: proven corrections to the skill, its feature map or its helpers.
- **blocked**: coverage could not finish, or a proven fix could not be applied safely. Say exactly what blocked it.

## Edit scope

Edit only the verify skill's own folder: its `SKILL.md`, `features/` and the helper scripts it owns. Never edit product code here. When the app no longer does what the map describes, decide which it is: the map is wrong (fix the map), or the app regressed (report it to the user; never hide a regression by rewriting the map to match it).

## Pass

1. **Find the target.** The project skill with Launch and Drive sections and a `features/` folder, usually `.claude/skills/verify-*/`. Several: ask which. None: stop and suggest `/dev:setup-verify` with no argument.
2. **Index.** Read `features/README.md` and list the feature files beside it. Fix missing, extra, duplicate and dead entries.
3. **Source wave.** One read-only subagent per feature file, all in one message, on the `explore` entry of the `Models:` line in `workflow.md`. Each explains how the feature works from source, flags likely drift with `file:line`, and returns one recipe to verify it live. Subagents never drive the app and never edit files. Return: summary, source entry points, likely drift or "none", recipe.
4. **Reconcile.** Every feature file has a returned summary. Merge recipes that share an app state. Spot-check each cited drift. Look at the commits since the skill last changed for user-facing features the map lacks; name the source path before calling one missing.
5. **Live pass**, required even when the source looks clean. You do all the driving, following the skill's own launch model: one long-lived instance driven in turn for a server or UI, or a fresh session per drive for a short-lived CLI. Drive every feature at least once, and keep three rules the whole pass:
   - **Doctor first.** Run Doctor before the first drive, on each fresh session, and again after any drive that failed or surprised you. When Doctor cannot see the problem (a stuck screen on a healthy process), reset to a known state or relaunch.
   - **Evidence survives.** Check that the evidence captured so far is still at its named location after every cleanup.
   - **Nothing outlives its drive.** Clean what a failed drive started, whether its session is stuck, exited or shared; on a shared instance, clean the residue, not the instance.

   A Doctor failure caused by the skill itself is drift: fix it and retry once before calling the pass blocked. A feature you cannot reach is `verified-unreachable` only with the prerequisite it needs (a login, an entitlement, an OS, outside state) and the route you tried; a prerequisite the map does not mention is drift.
6. **Triage** each problem: a wrong or missing description is **map drift** (fix it); behaviour that works but the harness cannot drive is a **harness gap** (fix it, under the Helpers rule in [SKILL.md](SKILL.md)); behaviour that is broken is a **product gap** (report it, change nothing). Drive every harness fix live again before keeping it.
7. **Close.** Tear down after the last drive. Re-read every changed file. Reply with the outcome, the features driven, the `verified-unreachable` ones with their prerequisite, the drift fixed and the product gaps found.

Adapted from pstack (Lauren Tan, MIT): `maintain-verification-skill`.
