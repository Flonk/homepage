You check another agent's rewrite of processing steps on arrows of a graph of what is made from milk. Its rules are /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/prompts/steps.md: read them first.

Your arrows are in {{ITEMS}}. For each, compare the file as it was before, {{BEFORE}}/<id>.json, with the file as it is now, /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/processes/<id>.json. Look at every note, `text`, `processing.text`, step and field that differs.

Fix, in the file as it is now (node for JSON edits; python3 is not installed):
1. ANY CLAIM THAT IS NEW: a fact, number, microbe, method, place, colour, reason or effect said now that the file did not say before anywhere (its notes, text, processing.text, step, sources' text). Put the wording back to what it was before, or cut the new part. A note added to a step that had none is new unless every word of it was elsewhere in the file. This is the most important check; be strict.
2. A note that is still a fragment, repeats the card's title line, uses a word a reader would not know without saying it plainly, or talks about the research ("not named", "the source says"): make it a whole plain sentence or delete it, using only what the file said.
3. A salt step that still has temperature, seconds or humidity.
Leave everything else the agent did alone: deleted steps, minor marks, deleted processing are its call.

Then run: cd /home/flo/repos/personal/homepage/t3 && npm run -s milk:graph -- check <id> for each one you changed, and fix what it says. Touch only your arrows' process files.

Report one line per arrow you changed: its id and what you undid or fixed. Nothing for arrows you left.
