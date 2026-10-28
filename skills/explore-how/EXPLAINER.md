# Explainer

The brief each explorer gets, and the shape of the final explanation.

## Explorer brief

Give each explorer the question, its one angle, and this:

> Other explorers cover other slices of the same area in parallel. Go deep on your angle only. Read the code; do not guess from names. Return exactly these sections:
>
> - **Components**: each type, module or service in your slice, with its path and one sentence on what it does.
> - **Flow**: the steps in order. For each: the function and file that runs, what it does, what it calls next, and the data passed on.
> - **Boundaries**: where your slice meets the rest of the code: its inputs and outputs.
> - **Non-obvious**: what works differently from how it looks, or is easy to get wrong.
> - **Files read**: every file you opened.
> - **Open questions**: what you could not trace, said plainly.

## Explanation

Use these sections; leave out one that has nothing to say.

- **Overview**: one or two paragraphs. What it is, what it does, why it exists. A reader can stop here and know whether to read on.
- **Key concepts**: the few types or ideas the rest depends on, defined briefly.
- **How it works**: the longest section. What starts the flow, each step, where the data goes, the decision points. Write prose, not pseudocode, and name the `file:symbol` of each step. Add a Mermaid diagram only when the flow crosses several components or the data changes shape in stages; skip it when the prose already shows the flow.
- **Where things live**: the short list of files and folders someone needs to start working here.
- **Gotchas**: surprising behaviour and traps. Point to `explore-why` for the history behind one, instead of guessing it.
- **Open questions**: what no explorer could trace.

Write concretely: "`OrderService.place` calls `Payments.charge`", not "the service delegates to the client". When something is complex, say why. When it is simple, keep it short.

Adapted from pstack (Lauren Tan, MIT): `how/references/explorer-prompt.md` and `explainer-prompt.md`.
