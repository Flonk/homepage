You are sorting research notes on dairy products into a milk graph. You decide, for each item, what it becomes; you do not write any graph files.

THE GRAPH
- Read /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/research/products.md first: every product in the graph as a tree (each under what it is made from), then the cheese families used on the map.
- Each node is a file /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/nodes/<id>.json. A product is made from its parent by a process. An example is a named kind of a product (Gouda is an example under cheese, in the family semiHard; Kefir would be a product, Dahi is a product); examples are leaves.

THE ITEMS
Your items are in /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/research/canon.json, by id: {{IDS}}. (Where {{IDS}} names a batch, its ids are that entry of research/triage-batches.json, counting from 0.)
Each item has a name, other names, kinds (dairy or cheese research), the places it was found, its research entries (each with its file and heading, and a one-line "what"), and `matches`: graph nodes it may already be, found by name only (a local name can be another product's, so check). Where the one-line "what" is not enough, open the entry: search its file for its heading.

DECIDE, for each item, one of:
- "enrich": it IS an existing node (product or example): the same thing, not just related, AND it adds something the node lacks: another name, another place for a product made in only a few places, a detail of how it is made, or a source. Give "node": its id. Open nodes/<id>.json to check when unsure. A generic product found in many countries (Butter, Yoghurt, Ice cream) adds nothing by being found in one more: skip it as "nothing-new" unless it brings a name, a making detail or a source the node lacks.
- "example": a named kind of an existing product, not in the graph yet: a regional soured milk under soured milk, a named butter under butter, a sweet under the sweet it is a kind of. Give "parent": the product id. A cheese: give "family": one of the cheese families (or a product cheeses are examples of, such as quark, paneer, ricotta), the one whose making it shares. Choose it from what the notes say of how it is made, firmness and rind; where they say too little to tell, give your best guess and "confidence": "low" (do not default to semiHard).
- "product": made by a way of its own that no product in the graph has, so it needs its own place in the tree. This is rare: most things are examples. Give "parent": the product it is made from.
- "skip": not for the graph. Give "skip": one of
  - "not-dairy": a dish or drink less than half made of milk or what is made from it (a gruel with some sour milk; a stew with yoghurt in it). A dish that is at least half dairy IS dairy (milk rice pudding, aarts, milk tea that is mostly milk).
  - "animal-milk": the plain milk of an animal (goat milk, camel milk), human breast milk included: the graph shows animals as a filter, not as products. Their products are not skipped, and donor milk from a milk bank is the node donorMilk.
  - "too-vague": no named product, only a kind talked about in general ("goat cheese", "hard cheese, industrial").
  - "nothing-new": the same as an existing node but adding nothing to it: an import or export figure, a survey or diet question, a historical mention, one more country for a product made everywhere.
  - "not-here": the notes themselves say it is not made or eaten there and is no product of anywhere else either.
Also say:
- "branded": true if it is a brand, a company's product line or one company's product, rather than a kind of product (Hollandia yoghurt, Bear Brand, a named factory's milk). Decide enrich/example/product for it as for any other; it is only marked.
- "confidence": "high" or "low". Low whenever you are not sure which node, which parent or family, or whether it is a product of its own.
- "why": a few words on your decision.

RULES
- Use only ids that exist: check nodes/<id>.json exists before you give it.
- Do not change any file.
- Decide every item you were given, once.

Return your decisions in the structured output.
