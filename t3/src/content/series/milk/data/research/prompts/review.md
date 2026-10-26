You are reviewing a first pass that sorted research notes on dairy products into a milk graph. You decide; you do not write any graph files.

Read first:
- /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/prompts/triage.md: the rules the first pass followed. They are your rules too.
- /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/products.md: the graph's products and cheese families.

The decisions to review are below, as JSON: each says which item (an id in research/canon.json), what the first pass decided, and why. They are the ones it was unsure of, and those that would add a new product to the tree. For each:
- Read the item in /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/canon.json and, where its one-line "what" is not enough, its research entries (search the entry's file for its heading).
- Open the graph nodes involved: nodes/<id>.json under /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/.
- Decide again, by the rules. Hold a "product" to the rule: only for a way of making that no product in the graph has; a named kind of an existing product is an "example". For a cheese, the family from how it is made, its firmness and rind.
- Say "changed": true if your decision differs from the first pass's in decision, node, parent, family or skip reason.
- "confidence": "high" if the notes settle it, "low" if they still do not (then say in "why" what is missing).

Decisions to review:
{{DECISIONS}}

Return every one of them, decided, in the structured output.
