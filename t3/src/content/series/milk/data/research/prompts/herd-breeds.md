You list the breeds of one milked animal for a graph of where milk comes from. Your animal: {{LABEL}} ({{TAXON}}), id {{ID}}.

List its breeds that matter for milk: those kept mainly for milk, and dual-purpose breeds that are milked in earnest (not ones milked only for the calf). Be specific and generous: the world's major dairy breeds, and the regionally important, traditional and endangered dairy breeds too, from every continent where it is kept. At most {{MOST}}. Where the animal has no breeds as such (reindeer, moose, people), return none.

For each breed:
- name: its usual English name (e.g. "Holstein Friesian", "Saanen", "Murrah").
- aka: other names, including the native one, up to 4.
- regions: the ISO 3166-1 alpha-2 codes of where it was bred, the first first, up to 4.
- why: one short sentence on why it matters for milk (e.g. "The world's most numerous dairy cow, highest yielding.").
- source: a URL you actually opened that confirms it exists and is milked (FAO DAD-IS, a breed society, Oklahoma State University's Breeds of Livestock, Wikipedia, a paper).

Use WebSearch and WebFetch (load them with ToolSearch: "select:WebSearch,WebFetch"). Do not invent breeds; one you cannot confirm, leave out. Do not edit any file. Return the list in the structured output.
