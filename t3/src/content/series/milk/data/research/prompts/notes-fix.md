You reword notes on processing steps of a graph of what is made from milk. Each line of {{ITEMS}} is: a process id (with ":<id>" after it for a leg), a tab, the step's index in `processing.steps` (in `legs.<id>.processing.steps` for a leg), a tab, its note. The file is /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/processes/<process id>.json.

Rewrite each note into this one shape: THE THING WORKED ON, THEN "is" OR "are", THEN WHAT IS DONE TO IT. Passive, present tense, one sentence.

	The cheese is put into brine.
	Annatto, a seed dye, is added to the milk, which gives the cheese its orange colour.
	The curd is cooked in its whey.
	Holes are pierced into the cheese, so flies lay their eggs inside.
	The filaments are hardened in a bath of salt.
	The cheese is ripened in a warm room, where the bacteria make gas that forms its eyes.

Rules:
- Start with the thing worked on, named: "The cheese", "The curd", "The milk", "The whey", "Each side", "Annatto". Never "It", "This", "In …", "With …", "Up to …", "Only …", "Traditionally …".
- "is" or "are" comes early, before any comma clause about conditions. Conditions and reasons come after: "The cheese is left in its brine for the strong, mature kind."
- Active verbs become passive: "The wheel sits in a cloth" becomes "The wheel is set in a linen cloth inside a wooden hoop, which gives it its concave heel."; "Steel needles pierce the cheese" becomes "The cheese is pierced with steel needles at about six weeks, so air gets in and the mould veins from the centre."
- Use only what the note already says, and what the step's own fields or the file's `text` say. Never add a fact, number, reason or effect. If a note says something that is not a step (what a product is used for, "It works as a filler in wall paint."), delete the note (remove the `note` key).
- Keep it to one sentence: join with "which", "so" or a semicolon, never a full stop in the middle.
- British spelling.

Edit with node (python3 is not installed), keeping the file tab-indented and its keys in order; change only the `note` of the steps listed. Other agents edit other files at the same time: touch only the files in your list. Then run: cd /home/flo/repos/personal/homepage/t3 && npm run -s milk:graph -- check <process id> for each file. Do not commit.

Report nothing but "done" and the count of notes rewritten and deleted.
