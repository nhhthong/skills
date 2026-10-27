# Premise and root cause

Read this when two attempts that share one belief have failed the same check, or when the fix you are about to write is a guard, a retry, a cast or a caught error.

## Attack the premise

Each failed attempt is evidence against the belief it assumed. A third attempt on the same belief spends effort where the evidence already says the cause is not.

1. **Write the premise down**: the one sentence every failed attempt assumed ("the cache is stale", "the request reaches the handler").
2. **Test it before the next fix.** Find an observation that would come out differently if the premise were false, and make it. Look at how the failures are spread (which inputs, which runs, which machines), not only how large they are. Make the check rerunnable.
3. **Follow the evidence.** If it contradicts the premise, the cause is elsewhere: look for what the failures share that the premise did not predict. If it confirms the premise, ask the next "why": the earlier attempts may have treated a consequence.
4. **Record it**: an `attempt` memo whose body starts with `premise: <sentence>` and the outcome of the test.

Start no new fix before the premise is written down and tested.

## Fix the root cause

The symptom is where a wrong state became visible. The root cause is the first place the system did something it should not, or failed to handle a state it should.

- **Ask whether the state is legitimate.** If the system may be in that state, the code that broke on it is the root cause, and handling the state there is the fix. If the state should never exist, a check where it broke hides the bug: find what produced the state.
- **Name the hiding tools.** Guards, retries, swallowed errors, clamped values and discarded state are the usual ways a bug is hidden instead of fixed. Each one in the fix needs the sentence that makes its state legitimate.
- **Restart-only failures** point at persisted state first: config files, caches, lock files, serialized data.
- **Fix the pattern.** Search for every place with the same fault and fix them all, or list the ones you leave.
- **Leave a signal.** When the deciding fact took a deep dig to find, propose the cheap, always-on signal (a log line, a metric, an assertion) that would have shown it at first look.

Adapted from pstack (Lauren Tan, MIT): `principle-attack-the-premise`, `principle-fix-root-causes`.
