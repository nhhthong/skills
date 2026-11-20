---
name: unslop
description: "Cut AI tells from text people read: filler, hedging, AI vocabulary, mannered prose, decorative formatting. Use when writing or editing a PR body, commit message, note, README or reply, or when asked to unslop."
---

# Unslop

Edit text to remove AI patterns. Scan for the patterns below, then rewrite. Keep the meaning and the intended tone. For text an agent reads (a `SKILL.md`, `CLAUDE.md`), use `dev:agent-docs` instead.

## Patterns to find and fix

### Content

1. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...". Delete them, or expand them with a real source.
2. **Vague attributions.** "Experts believe", "Industry reports suggest". Name the source or delete the claim.

### Language

3. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, robust, seamless, showcase, tapestry, testament, underscore, vibrant. Use plain words.
4. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". Say "is" or "has".
5. **"Not just X, but Y."** State the point directly.
6. **Rule of three.** Do not force ideas into groups of three. Use the real number.
7. **Synonym cycling.** One thing gets one name, repeated.
8. **False ranges.** "from X to Y" where X and Y are not on a scale. List the items.

### Style

9. **Em dashes.** Do not use them. End the sentence or use a comma.
10. **Colons as connectors.** A colon is fine before a list or an example, not as a mid-sentence hinge.
11. **Boldface overuse.** Do not bold every name or acronym.
12. **Inline-header lists.** "**Performance:** Performance improved..." repeats itself. Turn it into prose. A bold lead-in that names the item and is followed by new detail is fine.
13. **Title Case Headings.** Use sentence case.
14. **Decorative emojis.** Remove them from headings and bullets.
15. **Curly quotes.** Use straight quotes.

### Chat artifacts

16. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Certainly!". Remove them.
17. **Sycophancy.** "Great question! You're absolutely right!" Answer directly.

### Filler

18. **Filler phrases.** "In order to" is "to". "Due to the fact that" is "because". Delete "It is important to note that".
19. **Hedging.** "could potentially possibly" is "may".
20. **Generic conclusions.** "The future looks bright." State a plan or a fact, or stop.

### Jargon

21. **Abstract metaphor nouns.** Substrate, wedge, vector (for "way"), locus, nexus, primitive (as a noun), harness (as a metaphor), surface (as in "API surface"), bedrock, scaffolding (as a metaphor), paradigm, gold-plating, ratchet (as a metaphor), evacuate (for moving code), endgame, north star, flywheel. Use the concrete word.

### Plain speech

22. **Say what it does, not how it feels.** "SQL you can read" names a feeling. "`.toSQL()` returns the exact string sent to the database" names the mechanism. If a sentence could appear unchanged in another project's docs, it says nothing about this one: cut it.
23. **Split dense sentences.** If the reader has to backtrack, break the sentence in two. One idea per sentence.
24. **Active voice.** "Queries are validated" becomes "the compiler validates queries". Passive is fine only when the actor is unknown or does not matter.
25. **Cut adverbs.** "Significantly improves" becomes the measured change. An adverb propping up a verb means the verb is wrong.
26. **Plain words.** "Utilize" and "leverage" are "use", "facilitate" is "help", "numerous" is "many".
27. **Mannered prose.** Aphorisms, rhetorical fragments, personified code ("the plan holds it"), figurative verbs ("rides along"). Say what you mean.
28. **Over-compression.** Dropped articles, verbless fragments, arrows and private abbreviations. "Bad date → exit 2, no write" becomes "The parser rejects a bad date, exits with code 2, and writes nothing."

A new offender for rule 21 goes into this file, with its plain replacement.
