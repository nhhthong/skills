# Proof

What counts as proof that work is done. One standard for every skill that builds, reviews or reports work; those skills link here.

## Check the real artifact

Run the feature, read the stored value, call the route, open the file the code wrote. The proof is the thing itself, not a sign of it.

These are proxies and prove nothing on their own: "it compiles", a subagent's or tool's report that it is done, a file's modification time, a cached screenshot, a log line that says "success".

When a check fails, or passes more easily than expected, suspect the observation first: the wrong process, port or branch, a stale build, a test that did not run, a filter that matched nothing.

## Proof levels

Each claim the work depends on reaches one of these levels. State the level.

1. **Said.** A claim with nothing behind it.
2. **Pointed.** A real `file:line`, the library's own source at its pinned version, or a search that returns nothing.
3. **Reasoned.** The failing case walked step by step, and shown not to reach.
4. **Ran.** A command or test that calls the real code, fails loudly when the claim is wrong, and was run on the current code. Its output is shown. A test skipped (`t.Skip`, a disabled case, a missing fixture that short-circuits to green) ran nothing: its criterion stays at level 3, not 4, however the suite's exit code reads.
5. **Reproduced.** The running app driven along the user's path, with the evidence kept.

An acceptance criterion needs level 4 or 5.

**Able to fail.** A level 4 proof counts only once you have seen it go red: on the code before the fix, or on a copy of the code broken on purpose (flip the condition, drop the call, return the old value). A check that passes on broken code proves nothing; it stays at level 3 until it fails where it should. Revert the deliberate break, and write in `## Result` how you saw it fail. Tier `check` is exempt: its proof is an existing command, not a new one.

## Verdict

- **VERIFIED**: every criterion has its proof at the required level, run on the current code, with output shown.
- **NOT VERIFIED**: a proof went red, or a criterion has no proof.
- **INCONCLUSIVE**: the proof could not run, ran on the wrong surface or old code, or measured something other than the work. Name what is missing. Inconclusive is not a pass.

## Keep it rerunnable

Write the exact command and the lines of output that decide the verdict into `## Result`, with secrets redacted. A reviewer reruns the command instead of trusting the sentence. A script written only to prove something goes to `.work/proof/` and is named in `## Result`; it becomes a committed test only when the test plan asks for one.

Adapted from pstack (Lauren Tan, MIT): `principle-prove-it-works`, `blast-radius`, and the "able to fail" bar of `create-formal-verification-skill`.
