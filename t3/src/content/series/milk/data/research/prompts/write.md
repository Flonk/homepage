You are writing nodes of a milk graph from research notes. Your work is unit {{UNIT}} of /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/write/units.json (counting from 0). Do only that unit.

PATHS (all under /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/)
- nodes/<id>.json: one node per file.
- research/canon.json: each item by its id ("c0123"): its name, other names, places, and research entries (file and heading).
- research/found/...: the research notes. An entry is the block under "## <heading>" in its file, down to the next "## ".
- research/write/countries.json: the country codes the map knows. Use no others.
- Look at a few existing nodes first for the shape: nodes/abaza.json (a cheese example), nodes/mishtiDoi.json or any node with "example": true that is not a cheese, nodes/kumis.json (a product).

THE TWO KINDS OF UNIT

A. "example" units: each item is a new node to write, at nodes/<id>.json (the "id" given). The file must not exist yet; if it does, stop on that item and report it.
Read every research entry of the item (canon "entries"), then write:
{
  "label": the item's name as people write it (in the Latin script, with the local name in "aka" if it is in another script),
  "example": true,
  "branded": {"significant": false, "why": "..."}   (only if the item says branded: true; significant only if it has a place in a food culture, the why saying so),
  "aka": [its other names, from the canon item and the entries' headings: no duplicates of the label, at most 8],
  "family": the item's family   (cheeses only: exactly as given),
  "regions": [the ISO country codes of where it is made, the main one first, at most 4, only codes in countries.json; a place "IT/IT-88" is the country IT],
  "beasts": [the animals whose milk it is made from, from the entries' "Animal(s)" lines: "cow", "sheep", "goat", "buffalo", "camel", "yak", "horse", "donkey", "reindeer" or "human", biggest share first; leave it out if only cow or not said],
  "about": {
    "text": 1 to 3 sentences, in your own words, plain: what it is, and how it is made where the entries say. No claims the entries do not support, and nothing about what the sources leave out (no "the sources do not say…"): where little is known, write less.,
    "sources": { "links": [ {"name": short name of the page, "url": the URL} ... every URL the entries' "Sources" lines give that supports the text ], "text": "The words on what it is and how it is made, from these." }
  },
  "estimated": true   (only if the item says estimated: true),
  and for a cheese, each only where an entry says it:
  "firm": one of "fresh", "soft", "semi-soft", "semi-hard", "hard", "extra-hard",
  "days": [least, most] days it is ripened, months turned into days (2 to 6 months is [60, 180]; fresh cheese [0, 0]),
  "setting": one of "rennet", "rennet-acid", "acid", "acid-heat", "plant", "heat",
  "rind": one of "washed", "none", "natural", "bloomy", "brine", "other", "waxed",
  "protected": "PDO", "PGI" or "TSG" if the entries say it has such a protected name.
}
Leave out any key you have nothing for. Do not invent a value, a name or a URL. The entries' own "Unsure" lines: keep their doubt in the text ("said to be", "probably").

B. "enrich" units: each item adds to an existing node, nodes/<node>.json (one or more items may add to the same node). Read the node and the item's entries, then edit the node in place, keeping everything already there and its key order:
- "aka": add the item's other names the node lacks (not its label), at most 8 more.
- "regions": only if the node already has "regions": add the countries the item adds (codes in countries.json), so that it holds at most 4 in all; a product made in more countries than that is not regional, so then leave it as it is.
- "facts": add up to 2 facts the node lacks that the entries support, each {"k": a short label, "v": the fact}, for instance how it is made where the node says nothing of it, or what it is called and eaten as in a country.
- "sources": if the node has none, or {"unsourced": true, ...}, set it to the entries' links that support the names and facts you added: {"links": [...], "text": "Its names and facts, from these."}. If it has links already, add the new ones to them.
Never remove or rewrite what is there. Never change "label", "about", "example", "family" or any value already set.

FOR EVERY FILE YOU WRITE OR EDIT
- JSON, tab-indented like the other files.
- Then check it: run, from /home/flo/repos/personal/homepage/t3, the command `npm run milk:graph -- check nodes/<id> ...` with all your files at once. Fix every error it reports and check again until all are ok.

When done, reply with one line: how many files you wrote or edited, and any item you could not do and why.
