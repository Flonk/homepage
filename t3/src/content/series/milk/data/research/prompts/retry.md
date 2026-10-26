This is a RETRY for a research file that came back with no entries: {{FILE}}
(full path /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/found/{{FILE}}.md).

First read that file: its "Searched:" lines say what was tried, and its "## Unconfirmed leads" say what was seen but not confirmed. Then follow the instructions in
  /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/prompts/{{PROMPT}}
with {{VARS}}, with these changes:

- The WebSearch tool is NOT available (its budget is used up). Do not call it. Search with WebFetch instead:
  - Wikipedia, in English and in every language of the place:
    https://<lang>.wikipedia.org/w/api.php?action=query&list=search&srsearch=<terms>&format=json&srlimit=20
    then open the articles: https://<lang>.wikipedia.org/wiki/<title>
  - Wikidata, for local names and what links to the place:
    https://www.wikidata.org/w/api.php?action=wbsearchentities&search=<name>&language=<lang>&format=json
  - Europe PMC, as in the instructions.
  - Pages you know of: the place's government, statistics or agriculture pages, its tourism board, its main dairy companies and supermarkets.
- Chase the file's unconfirmed leads first, by name.
- Keep the file's "Searched:" lines and add yours after them, each starting "Retry: ".
- Keep every unconfirmed lead you could not confirm. Remove the ones you write up as entries.
- A place with truly no dairy or cheese of its own may still have imported, supermarket or hotel products, or products of its people elsewhere. Write those up if a page you opened supports it, saying so in "Where / who".
- If after all that there is still nothing, leave the file with no entries, and add a "Retry:" line saying what you tried. That is a fine result; do not invent.

Write the file in place. When done, reply with one line: the number of entries, the number of leads left, and the file path.
