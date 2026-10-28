# Epistemics

How sure each claim is, and how to say it. Code shows what it does, not why it exists; the why lives in commits, pull requests, tickets, docs and chat, all incomplete and sometimes wrong. A confident guess misleads the user, because they act on it.

## Tiers

Every claim sits in exactly one tier. The tier sets its section in the reply and its wording.

1. **Direct.** An author wrote why: a pull request body ("this fixes pagination past 1,000 items"), a ticket, a design doc, a commit message, a code comment, a chat message from the author. Word it plainly, cited: "This exists because X ([PR #123])."
2. **Supported.** No single source says it, but several point the same way: the PR title says "perf", the ticket is labelled perf, the tests added with it all use very large inputs. Cite each item: "The evidence points to X: A, B and C."
3. **Inferred.** Your reading of the context, with nothing stating it. Show the chain: "Given A and B, C seems likely because D."
4. **Speculative.** A plausible story on thin evidence, where others fit as well. Mark it a guess and put it with its rivals: "One possibility is X; no source says so."
5. **Unknown.** You searched and found nothing. Name what you searched: "The tracker for `rate limit` and `429`, the 6 pull requests that touched the file since 2023, and `git log -S '100'`: none gives a reason."

## Wording

- "Because", "the reason is", "was designed to", "fixes", "the team decided" claim intent or a result. Use them only with a Direct or Supported citation next to them.
- "Appears to", "likely", "suggests", "is consistent with", "may have been" mark an inference. Use them in Inferred and Speculative.
- Never use "obviously", "clearly", "of course" or "just": each hides a doubt.

## Traps

- **Code is not evidence of its own intent.** "The author chose a functional style" is an observation about code. Claim intent only where an author stated it.
- **Mechanics are not motivation.** A commit that changes `limit = 50` to `limit = 100` shows the change, not the reason. Look for the reason in the message, the pull request, the ticket or the review.
- **Do not rationalise.** Code that makes sense today may have been written for a reason that no longer holds, or by copy and paste. Do not invent a clean reason for messy history, and do not read "nobody mentioned X" as "X was not a concern".
- **The user's guess is a candidate.** "Why do we do this, I assume for performance?" is a hypothesis to test like any other, not one to confirm. When the evidence does not support it, say so and give what it does support.
- **Contradictions stay visible.** When the ticket says "compliance for customer X" and the pull request says "tech-debt cleanup", show both with citations. Both may be true; let the user judge.
- **A gap is a result.** "We don't know" tells the user to ask a person or drop the question. A reply with no Unknown section is suspicious: either the record was unusually complete, or a gap was filled with a guess.

## Before you reply

Check every claim in Found and Inferred: it has a citation or a stated chain, its wording matches its tier, and it does not cite code as evidence of intent. Open at least one citation per source again and confirm it says what the finding claims.

Adapted from pstack (Lauren Tan, MIT): `why/references/epistemics.md`.
