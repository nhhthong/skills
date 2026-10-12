# Test kinds: which a ticket needs, and what each must cover

Read "Choosing" in full. Read a kind's section only when the kind was chosen. Sources: Microsoft ISE Engineering Playbook (automated testing, consumer-driven contracts, fault injection, performance), OWASP Web Security Testing Guide (security, business logic), Pact documentation (when contract testing fits).

## Choosing

Answer each question against what the ticket's code and the spec show. A ticket usually answers yes to several.

| # | Question about the ticket | Yes when you find | Kind |
|---|---|---|---|
| 1 | Does it hold logic of its own? | a branch, calculation, validation or transformation | `unit` |
| 2 | Does it read or write a real store, queue or file? | a repository, query, migration, message publish | `integration` |
| 3 | Does it add or change a route a client calls? | a handler, router entry, resolver, CLI command | `api` |
| 4 | Does another service we can name call it, or does it call one? | an internal client or SDK, a consumed topic | `contract` |
| 5 | Does it complete a flow the spec names end to end? | the spec's key-flow list includes it | `e2e` |
| 6 | Can the same request arrive twice? | a POST or PUT with side effects, a queue consumer, a webhook | `idempotency` |
| 7 | Can two actors change the same record at once? | a shared row, counter or file with no lock or version check | `concurrency` |
| 8 | Does it cross a trust boundary? | outside input, an auth or ownership check, a secret | `security` |
| 9 | Does the spec say what happens when a dependency fails? | a timeout, retry, fallback or circuit rule | `resilience` |
| 10 | Does the spec state a latency or throughput number? | p95, requests per second | `perf` |
| 11 | Does the spec state an expected load or a limit? | concurrent users, a duration, a maximum | `load`, `stress` |
| 12 | Is it a bug fix or a revert? | a bug issue or a note of kind `bug` | `regression` |
| 13 | Is it toolchain or scaffold? | a ticket that sets up the build | `smoke` |

A yes that does not earn the kind:

- `contract`: the consumer cannot be named (a public API), the other side will not run the contract, or the route only passes requests through. Use `api`.
- `e2e`: the flow is not in the spec's key flows. End-to-end tests are few and slow; cover the pieces with `api`.
- `perf`, `load`, `stress`, `resilience`: the spec has no number or behaviour. Write no test; the missing number is an open point. Never invent a threshold or a fallback.

Transactions and isolation are not a kind of their own: rollback and constraints are `integration` cases; two transactions on one row are `concurrency` cases.

## unit
One class or function through its public signature.
- The happy path with a value from the spec; each boundary the spec names (min, max, max+1, empty, zero); each error the spec lists, asserting the error type or code.
- No database, network, clock or randomness; inject them.

## integration
Several real components together: service, repository and a real database (a container, not a mock).
- Write then read back through the public seam; the transaction rolls back on failure and leaves no partial write; a constraint the schema enforces (unique, foreign key, not null) surfaces as the domain error the spec expects.
- Each test owns its data: a fresh schema, or a transaction rolled back after it.

## api
The endpoint as a client sees it.
- Status, body shape and every field the spec lists; each validation error with its status and message; pagination, filtering and sorting at the limits the spec states.
- Auth outcomes here are status checks only; attacks belong to `security`.

## e2e
A whole flow from the spec's key flows, through the real UI or public API.
- The flow completes; the one failure in the middle that the spec cares about most (a declined payment) leaves the system in the state the spec says.

## contract
The API between two services, driven by the consumer.
- Consumer side: the requests it sends and the responses it relies on, as a contract file.
- Provider side: verifies that contract against the running provider, with its state set up per interaction. Both sides must run, or it is not a contract test.

## idempotency
The same operation delivered more than once.
- Same request (same idempotency key or message id) N times gives one effect and the same reply every time.
- Same key with a different body gives the error the spec defines, never a second effect.
- Redelivery after a crash between the effect and the acknowledgement still gives one effect.
- Assert the state (one row, one charge), never just the status code.

## concurrency
Two or more actors on the same thing at once. Repeat the test at least 20 times, run the race detector (`go test -race`, TSan), and force the interleaving with a barrier or latch.
- **Lost update**: two writers; both changes survive or one gets a conflict error.
- **Double effect**: two identical requests released together give exactly one order, one charge.
- **Invariant**: a balance never negative, a stock count never below zero, under N parallel buyers.
- **Isolation**: a reader never sees another transaction's partial write.
- **Deadlock**: two resources locked in opposite order finish within a timeout.
- **Ordering**: events processed out of order end in the state the spec defines.
- Assert the invariant after all actors finish, never just "no error".

## security
Everything that crosses a trust boundary (OWASP WSTG categories).
- **Authentication**: no token, an expired token, a token signed with the wrong key, `alg: none` are all rejected.
- **Authorization**: user A reads, edits or deletes user B's resource by changing an id (horizontal); each role against each action it must not do (vertical).
- **Session**: logout and expiry invalidate the token; a fixed session id is not accepted.
- **Input**: injection (SQL, NoSQL, command), path traversal, SSRF in a URL field, an oversized payload, an upload of the wrong type, script in a stored field rendered back; all rejected or escaped.
- **Errors**: no stack trace, query text, secret or personal data in a response body or a log line.
- **Business logic**: a step skipped or replayed (pay twice, reuse a one-time code) is refused.

## resilience
A dependency fails the way the spec anticipates: timeout, 5xx, connection refused, slow response.
- Inject the fault at a seam the ticket does not own (a stub server, a fault proxy, a mock of the third-party client), never by mocking the ticket's own code.
- The spec's behaviour holds: the retry count and back-off, the fallback value, the error surfaced to the caller, no partial write; and the system recovers once the dependency is back.

## perf
Latency and throughput of one operation. Only with a number from the spec (p95 under 200 ms, 1,000 requests per second). The command exits non-zero when the threshold is missed.

## load
The system at the load the spec expects (500 concurrent users for N minutes).
- Error rate and latency percentiles stay inside the spec's numbers for the whole run.
- Spike (a sudden jump) or soak (hours) only when the spec names them.

## stress
Beyond the limit.
- The system fails the way the spec allows (a 429, queueing, degraded mode), never by losing or corrupting data, and recovers once the load drops.

## regression
One test per fixed bug, reproducing the bug through a public seam. See it fail before the fix and pass after. Keep it forever.

## smoke
The small fixed suite that says the build is alive: it starts, the health route answers, one read and one write succeed. It lives with the first ticket (the skeleton), and later tickets assume it passes.

## mutation
Only for a severe module the user agreed to cover this way. A mutation tester runs over the classes that hold logic (not DTOs, records or config) and the command exits non-zero below the threshold (80 percent unless the project says otherwise). Surviving mutants are missing tests: add them, never lower the threshold. Ask these four questions about the ticket before proposing it; all four answers go to the user as the reason:
1. **Persists**: does a bug leave wrong state that stays and compounds (a count, balance, quota, stock, seat)?
2. **Silent**: would it go unnoticed until a reconciliation, a customer or an audit?
3. **Hard to undo**: could it be shipped, charged, booked or sent before anyone notices?
4. **Mutable logic**: does the rule live in a hand-written comparison, branch, arithmetic or loop? No when a lock, annotation, database constraint, schema or constant holds it; prove those with `concurrency` or `integration` tests, and prove a constant with a unit test at its exact boundary.

Propose when the fourth answer is yes and at least two of the first three are yes.
