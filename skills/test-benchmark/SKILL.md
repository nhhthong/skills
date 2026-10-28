---
name: test-benchmark
description: "Vet a performance number before you report it or act on it: what limits it, whether both sides were tuned, errors, repeat runs and end-to-end share. Use when you measure a speedup, a regression, a latency or a throughput."
metadata:
  credits:
    skill: benchmark-checklist
    author: Lauren Tan
    organisation: pstack
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/benchmark-checklist/SKILL.md"
---

# Test Benchmark

A performance number is a claim. Answer each question below with evidence from a run, not with a guess about the code.

For a quick ballpark the user asked for, one run is enough: still answer questions 4 and 7, and say it is one run. A choice between options is never a ballpark.

## Before you run

- Write the claim you expect to make, in the words you would ship: "export is 30% faster at p50 on the 60k-row dataset". The questions test that sentence.
- Read the measurement script: what it times, what it counts, what it ignores.
- Check the machine's load (`uptime`, `nproc`). When something else is running and cannot be stopped, alternate the two sides so both see the same noise, and say so.

## The questions

1. **Why not twice as good?** Name the limiter: a core, a lock, the disk, the network, or the load generator itself. Find it with a profiler or system counters in a run you do not report (profiling slows the work): `pidstat -u -r -d 1`, `node --cpu-prof`, `py-spy record`, `perf record`, `strace -c`. Then map the hot spot to source. A limiter guessed from reading code is not a limiter. When a change does not move the number, the limiter explains why: the work was not where the time goes.
2. **Was each side tuned?** Run every side the way production runs it: release build, production flags, pools, batching, indexes, warm or cold caches as production has them, the same versions and data. A side on default settings means you compared configurations, not implementations. When the limiter is a setting (a pool size, a buffer, a flag), that side is untuned. Tune it and measure again before naming a winner. When a side cannot be tuned, there is no winner: narrowing the claim ("faster on defaults") does not rescue a decision to adopt it.
3. **Does it break a limit?** Do the arithmetic: bytes per second against disk and network bandwidth, operations per second against cores. A result past a limit measured something else: a cache, a no-op, a bug.
4. **Did it error?** Count failures and non-success responses, and check the outputs are correct, not only present. Rejections are fast; timeouts are slow. When the script does not count errors, add the count.
5. **Does it repeat?** At least 5 runs per side, alternating (A, B, A, B) so warm-up and drift favour neither. Report the median and the range. A gap smaller than the run-to-run spread is no measurable difference. When the ranges overlap and the call still matters, run more and compare with a rank-sum test (Mann-Whitney U) instead of the medians alone.
6. **Does it matter?** Next to a micro result, measure the end-to-end path a user waits on, with realistic data and concurrency, and give the micro result as a share of the whole. The share caps the gain: removing a part that takes 10% of the path makes the whole at most about 11% faster, and a 2x speedup of a helper that takes 1% is invisible.
7. **Did the work happen?** Confirm the work ran inside the timed region: the request reached the server, the rows were written, the result was used. Lazy code, unawaited promises and timeouts produce numbers for work that never ran.

## Reply

Lead with the verdict: faster, slower, no measurable difference, or inconclusive. Then the number with its unit, the run count, the range and the limiter, for example: "p50 41 ms to 33 ms, median of 7 runs per side, range 32 to 35 ms, bound by JSON parsing on one core."

The verdict is inconclusive when you cannot name the limiter, a side ran untuned, or questions 4 and 7 have no answer. Name what is missing. Keep the raw runs in `.work/proof/` and point to them. A pull request carries one headline number; the rest stays in the proof file.
