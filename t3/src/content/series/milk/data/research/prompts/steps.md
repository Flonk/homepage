You rewrite the processing steps on arrows of a graph of what is made from milk, so a reader who knows nothing about dairy understands every card. Each arrow is a process file (processes/<id>.json): what it is made from (`from`), what it makes (`to`), and its steps (`processing.steps`, and for a process making several things, `legs.<id>.processing.steps`), each drawn as a card. Your arrows are below (ITEMS); do only those.

ITEMS:
{{ITEMS}}

Data: /home/flo/repos/personal/homepage/t3/src/content/series/milk/data. The step schema, with every step type and field, is /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/schemas/steps.ts. How a card is drawn from a step is in /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/render/ProcessingStep.ts: read it, so you know what the card already says before you write its note.

HOW A CARD READS

A card has a title line and a note. The title line is drawn from the step's fields: its name, then its parts between dots, "🔥 COOK · ≥30 min · ≥90 °C", "🧂 BRINE · 20% salt", "➕ ADD · annatto". The note is one sentence under it, in `note`. Never repeat in the note what the title line already says.

THE NOTE

1. A note is a whole sentence, present tense, passive, naming what is worked on: "The cheese is put into brine." "The curd is cooked in its whey." "Holes are pierced into the cheese, so flies lay their eggs inside." Never a fragment ("In the whey.", "Up to 0.35 mL per litre, for the orange colour.").
2. Say what is done to what, and why only where the reader would not guess it: "Annatto, a seed dye, is added to the milk, up to 0.35 mL per litre, which gives the cheese its orange colour." One sentence: the schema refuses two run together, so a why is joined on with "which", "so" or a semicolon.
3. Any word a reader would not know is said in plain words, or left out: annatto is "annatto, a seed dye"; Piophila casei is "the cheese fly"; "thermophilic" is "heat-loving"; no "RH", "aw", "DE", "TS", "CFU", no Latin unless it is also said plainly. Microbe names stay in the ferment's `adds` (drawn small, under the title); the note says in plain words what they do.
4. No note where the title line says it all. "🔥 COOK · ≥30 min · ≥90 °C" with "In the whey." is worse than no note; either no note, or "The curd is cooked in its whey."
5. British spelling, as the rest of the graph (colour, mould, flavour).

THE STEPS

6. Salting is instantaneous: a salt step has no `temperature`, `seconds` or `humidity`. A brining of days is salting, then the time it spends in brine is not a step of its own unless it changes the cheese; if it does, that is a ripening (a ferment, does "ripen") with its time and temperature. Its strength (`strength`, percent salt) stays where it was said.
7. The same for any step that is a thing done, not a thing held: adding, cutting, moulding, piercing, washing, wrapping. Only holds have a time or a temperature: heating, cooling, souring, ripening, drying, coagulating, draining, pressing, smoking, and the like.
7b. Standard steps are said the same everywhere and have no note of their own. Homogenising, churning, spinning in a centrifuge (`separate` by "centrifuge"), the membrane filters (micro, ultra, nano, dia), standardising and boiling down (`evaporate`) have only their fields and `of`, what they are done to where it is not milk ("cream", "dahi", "whey"); their sentence is drawn from their type. Stretching (`stretch`, pasta filata's kneading and pulling in hot water; `into` the shape, "threads", "a ribbon") and smoking (`smoke`; `over` the wood, "beech") are their own types, never `custom`, with no note. Washing curd, and skimming off what rises by itself (cream, curd, a skin, fat by gravity), have no note and no `of`. Pasteurising has the note "The <milk, cream, …> undergoes heat treatment to kill harmful bacteria like Listeria, Salmonella and E. coli."; curdling (`coagulate`) has only `by` (rennet, acid, rennet-acid for slow souring with a little rennet, plant, heat) and, where it is done with something of its own, `with` ("Calotropis leaves", "sour whey"), and `of` where what curdles is not milk ("cream", "whey"); its sentence is drawn from its kind. Acid that makes milk, cream or whey clump (chhena, mascarpone, acid casein) is curdling, a `coagulate` by acid, never `acidify`; `acidify` is only souring or a change of pH where nothing curdles. No `note` and no time or temperature on a curdling, except on the arrows into rennet curd.
8. Every step is a thing a reader can picture, named in plain words: a `custom` step's `name` is a verb or two a reader knows (stretch, smoke, knead, bake), never a trade term ("hydrolyse" is "break down with enzymes" said in the note, its name "break down"). If the schema has a type for it, use the type, not `custom`.
9. Only the steps that make it what it is. Mark `"minor": true` (kept in the data, not drawn) on steps that are true but not needed for it to be this product: packing, filling, bottling, wrapping, labelling; cooling for storage; resting; a filter that only clears; drying a cheese's surface before it ripens. A step without which it would not be this product stays.
10. Only what happens between its parent and it. A step done upstream is deleted, even where the chain does not list it but the parent's nature implies it: anything made from processed cheese starts from finished cheese, so curdling, draining and washing curd are upstream; anything made from butter starts from churned butter. Read the parent node (nodes/<from>.json) to know what it already is.
11. A dish is not a dairy product, and has no steps at all: delete `processing` from the arrow. A dish is anything cooked or mixed as food with dairy in it, not dairy made into dairy: desserts and sweets (basundi, kheer, crème caramel, cheesecake, fudge, milk sweets), puddings, porridges, soups, sauces, drinks mixed with tea or coffee. Its `text` may say what it is in a sentence.

EDITING

- Edit only your items' process files. Never change `from`, `to`, `step`, rankings/, nodes/, or reconciled/. Keep `text` unless it says the same wrong thing a note did (a fragment, an unexplained word); then fix it as little as you can.
- Never add a claim, a number, a microbe or a source that is not already in the file. Rewording is free; new facts are not. A number moved from a salt step into a ripening is not new. Wrong, from earlier runs: "boiled in their whey, which browns them" (nothing said they brown); "a fermented milk of the tarag type" made into "soured milk from the last batch" (a different method); a new note on a step that had none, saying what it does from what you know. If you cannot make a note plain without knowing more than the file says, shorten it or delete it.
- A note about the research, not the food, is deleted: "The source names no agent.", "Not stated.", "What sets the curd is not named."
- Rule 10 again, as it was missed: a ferment out of probiotic yoghurt is upstream (it is soured, with the probiotic, already); likewise a set out of plant-set cheese, a boiling-down out of prim.
- If no steps are left, delete `processing`. Keep `processing.sources`, and `processing.text` unless it describes what you removed.
- Keep the files tab-indented JSON, keys in the order they were.
- Then run: cd /home/flo/repos/personal/homepage/t3 && npm run -s milk:graph -- check <process id> for each. Fix anything it says.

Report one line per arrow: its id and, in a few words, what you changed ("ok" if nothing).
