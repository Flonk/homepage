You reconcile arrows of a graph of what is made from milk. Each arrow is a process file: what it is made from (`from`), what it makes (`to`), a few words written on the arrow (`step`), a paragraph (`text`), and its processing steps (`processing.steps`), drawn on the arrow as cards. The graph is a tree from raw milk down; each node is drawn at the end of one arrow. Your arrows are below (ITEMS); do only those, in the order given. Each comes with its CHAIN: the arrows above it, from milk down, already reconciled.

ITEMS:
{{ITEMS}}

Data: /home/flo/repos/personal/homepage/t3/src/content/series/milk/data. A process is processes/<id>.json; a node is nodes/<id>.json (read it for what the product is). The step schema, with every step type and field, is /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/schemas/steps.ts.

For each arrow, read every process file in its chain first, then its own, then the node it leads to. Then answer three questions.

1. IS THE PARENT RIGHT? The arrow's `from` is what the product is drawn made from. The immediate parent matters most; each ancestor above it matters less. The chain is allowed to drift as it goes up: a regional yak cheese drawn under homogenised milk is not literally made from homogenised milk, and that is fine, as the tree groups like with like. Only flag a move when there is an obviously better node already in the graph to put it under (look in nodes/). Never change `from`, `to`, or anything in rankings/ yourself.

2. ARE ITS STEPS ONLY WHAT HAPPENS BETWEEN ITS PARENT AND IT? Research wrote many arrows as a whole recipe from milk. A step already done upstream, in the chain, is not just redundant but wrong here, and goes: stracciatella torn from pasta filata curd lists "coagulate with rennet" and "pasteurise", which happened arrows above, at rennet curd. The same for homogenising on an arrow out of milk that was already homogenised, and so on. Read the chain's steps, not only its names.

3. ARE ITS STEPS THE LEAST THAT STILL MAKES IT WHAT IT IS? The graph is an explainer. A step that is true but not needed for the product to be what it is gets `"minor": true` on it, which keeps it, with its sources, in the data but no longer draws it. Yoghurt is still yoghurt if it is not cooled after it has set: its coolings are minor; heat then ferment, or just ferment, is the arrow. A step without which it would not be this product stays as it is. Where you are unsure (heating before homogenising), leave it, and the verdict is "flagged" (never "ok") with the step named in notes.

The parent's nature counts as upstream too, even where the chain does not list it: anything made from processed cheese starts from finished cheese, so curdling, draining and washing curd are upstream and go. Judge the steps against the parent as it is drawn, never against a parent you would rather it had; if you propose a move, still clean the steps for where it is now.

Packing, filling, bottling, wrapping, labelling and cooling for storage are never what makes a product: always minor.

DISHES: where the product is a dish made with dairy, not a dairy product, its recipe goes entirely: delete `processing` from the process. A dish is anything cooked or mixed as food with dairy in it: desserts and sweets (basundi, kheer, crème caramel, cheesecake, fudge, milk sweets), puddings, porridges, soups, sauces, drinks mixed with tea or coffee. If its node's `about` calls it a dessert, a sweet or a dish, it is one. Keep `step` and `text` (shorten `text` if it walks through the recipe).

Editing, in the arrow's own process file only:
- Delete steps that are wrong. Add `"minor": true` to steps true but not needed (it goes with the step's other fields, e.g. {"type": "heat", "does": "cool", "minor": true}).
- If no steps are left, delete `processing` altogether (it must have at least one step). Otherwise keep `processing.sources` and `processing.text` as they are, unless `processing.text` now describes what you removed; then cut that part.
- If `text` or `step` say something that is wrong for the same reason (the arrow's paragraph telling how the milk was coagulated two arrows up), fix the wording, as little as you can. Do not add claims, sources, or steps.
- A process making several things at once has shared steps on the process and each output's own under `legs`; the same rules apply to each.
- Keep the file tab-indented JSON, its keys in the order they were.
- Then run: cd /home/flo/repos/personal/homepage/t3 && npm run -s milk:graph -- check <process id>. Fix anything it says.

Then write reconciled/<process id>.json (tab-indented):
{
	"verdict": "ok" (nothing changed) | "fixed" (you edited it) | "flagged" (a person must decide: a move, or a step you were unsure of),
	"notes": "what you changed or why it is flagged, in a sentence or two; leave out for a plain ok",
	"move": {"to": "<node id>", "why": "one sentence"}   (only with flagged, only for an obviously better parent),
	"model": "<your model id>",
	"date": "<today, YYYY-MM-DD>"
}
No "hash": it is stamped after you are done.

Report at the end, one line per arrow: its id, verdict, and what you changed.
