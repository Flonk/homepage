You write records of a graph of where milk comes from: the animals milked, from groups of kin down to breeds. Your items are below (ITEMS); do only those. Each item gives a record's id, label, kind, parent, and a taxon or what is already known (a breed's aka, regions, why it matters, a first source).

ITEMS:
{{ITEMS}}

Write each to /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/animals/<id>.json. The file must not exist yet; if it does, skip that item and say so.

THE RULE ABOVE ALL: every figure and every claim has its own sources, and every source is a page you actually opened with WebFetch (or found the figure in through WebSearch's text, which you then say). Never invent a number, a name, a year or a URL. Where you cannot find something, leave the field out and say so in "gaps". A figure you worked out from others (e.g. head milked × yield per head) is allowed only with "estimated": true and the working in its sources' "text".

Research with WebSearch and WebFetch (load them with ToolSearch: "select:WebSearch,WebFetch"). Good sources, best first: FAOSTAT (https://www.fao.org/faostat/), FAO DAD-IS (https://www.fao.org/dad-is/), FAO and IDF reports, national breed registries and herdbooks, breed societies, ICAR, university extension pages (e.g. Oklahoma State's Breeds of Livestock), peer-reviewed papers (PMC, journals), Wikipedia (acceptable, but prefer what it cites). Not: shops, AI-generated sites, recipe blogs. Spend up to about 6 searches and fetches per record.

THE RECORD (JSON, tab-indented). Every "sources" is either {"links": [{"name": short name of the page, "url": ...}, ...], "text": "what was taken from these, and how anything was worked out"} or, only where nothing could be found but the claim is common knowledge you are sure of, {"unsourced": true, "text": "what it rests on"}.

{
  "label": the item's label,
  "aka": [other names, native ones too, up to 6],
  "names": sources for those names,
  "kind": "group" | "species" | "type" | "breed" (as given),
  "parent": as given,
  "taxon": {"name": the scientific name, "rank": "class"|"order"|"suborder"|"family"|"subfamily"|"tribe"|"genus"|"species"|"subspecies", "sources"}   (groups, species, types; a breed only if it has one),
  "about": {"text": 2–3 plain sentences: what it is, where it is kept, what its milk is like or used for; no claims the sources do not make, "sources"},
  "domestication": {"where": the place in words, "regions": [ISO codes of today's countries], "yearsAgo": {"min": years before present, "max": ...}, "text": one sentence, "sources"}   (species; types where the type was domesticated apart, e.g. zebu, swamp buffalo),
  "origin": {"regions": [ISO codes, the first first, at most 4], "place": in words, "formed": {"min": year, "max": year}, "sources"}   (breeds),
  "milk": {"mt": million tonnes of milk a year from it worldwide, "year": the year, "estimated": true if worked out, "sources"}   (species and types: REQUIRED, and ALWAYS for the year 2023, so all are alike. For cattle, water buffalo, goat and sheep, take the figure in /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/herd/faostat-2023.json exactly (tonnes / 1,000,000, rounded to 2 decimals), its link the "source" there, its text naming the item, the year and the flag. For a type, or a species FAOSTAT lumps or leaves out (yak, horse, donkey, reindeer, moose, people; dromedary vs Bactrian within FAOSTAT's "camels", whose 2023 total is in that file too), estimate the 2023 figure from the best sources you can find, "estimated": true, and say how),
  "head": [{"count": number of animals, "year", "where": "world" or an ISO code, "milked": true if only those milked, "estimated": true if worked out, "sources"}, ...]   (species: the world's, for FAOSTAT's species from that file (stocks, and milked as "milked": true); breeds: its population, DAD-IS or a herdbook),
  "yield": {"perLactation": {"min", "max"} in kg, "lactationDays": {"min", "max"}, "perYear": {...} in kg, "where": ISO code if a country's recording, "year", "sources"}   (breeds above all; a species what is usual),
  "composition": {"fat": {"min", "max"} percent, "protein": {...}, "lactose": {...}, "solids": {...}, "sources"}   (its milk; a range where sources differ, {"min": x, "max": x} for one figure; "about": true inside a range if only approximate),
  "purposes": {"purposes": ["dairy"|"dual-purpose"|"meat"|"draught"|"wool"|"fibre"|"riding"|"transport"|"companionship", most important first], "sources"}   (breeds; species),
  "risk": {"status": "not at risk"|"vulnerable"|"endangered"|"critical"|"critical-maintained"|"endangered-maintained"|"extinct"|"unknown", "year", "sources"}   (breeds: FAO DAD-IS's risk status),
  "facts": [{"k": short label, "v": the fact, "sources"}, ...]   (up to 4 more things worth telling, each sourced: a record yield, a protected product made from its milk, a notable history),
  "confidence": "high" | "medium" | "low" (how sure you are of the record as a whole),
  "gaps": "what you looked for and could not find"   (leave out if nothing is missing)
}

Ranges use {"min": n, "max": n} and may add "about": true. Country codes must be in /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/write/countries.json. Leave out any field you have nothing sourced for, except "milk" on a species or type, which is required (estimate if you must, and say how).

People (the "human" species) are milked too: breast milk. Its "milk" is the world's breast milk a year (estimate it from the number of breastfed infants and what each drinks, and say so); no domestication; "purposes" leave out.

After writing each file, check it: from /home/flo/repos/personal/homepage/t3, run `npm run milk:graph -- check animals/<id>` (all your ids at once is fine). Fix every error and check again until all are ok. A record whose parent does not exist yet may say so; that is fine, the parents are being written alongside.

When done, reply with one line per record: its id, ok or not, and its confidence.
