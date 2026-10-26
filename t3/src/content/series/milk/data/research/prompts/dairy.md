You are researching the dairy products of ONE country: {{COUNTRY}} (ISO code {{CODE}}).
Your job is to find every dairy product made or eaten there and write each down with its sources. Do not stop early. A good result for a country with any dairy or pastoral tradition is 20–60 products; even small countries usually have 10+.

WHAT COUNTS
- Anything made from milk of ANY animal: cow (incl. zebu), water buffalo, goat, sheep, camel, yak, horse (mare), donkey, reindeer, and human milk (donor milk, milk banks, cultural uses).
- Every kind EXCEPT cheese (another researcher covers cheese).
- Both traditional/home/pastoral AND industrial/supermarket products. Regional or ethnic variants count as separate entries if they have their own name. Brands only as examples of a kind (e.g. "evaporated milk: brands X, Y").

CHECKLIST — before you stop, you must have searched for EACH of these kinds by name for {{COUNTRY}} (e.g. "{{COUNTRY}} yoghurt", "{{COUNTRY}} butter"), in English and in the country's language(s):
  fresh/raw milk · heat-treated milk (pasteurised, UHT) · evaporated/condensed milk · milk powder · flavoured milk · fermented/sour milk · yoghurt · drinkable yoghurt and yoghurt drinks · kefir-like drinks · alcoholic milk drinks · butter · ghee/clarified butter/butter oil · cream and soured cream · milk skin/clotted cream · whey and buttermilk products · dried milk products (dried curd that is not cheese, milk cakes) · milk sweets and desserts · milk jam/caramel · ice cream and frozen milk desserts · milk tea and milk drinks · dishes where milk is the main ingredient · infant formula made in the country · human donor milk · milk of each animal kept there (goat, sheep, camel, buffalo, yak, mare, donkey, reindeer) · non-food uses (medicine, ritual, cosmetics).

HOW TO SEARCH — work through ALL of these, not just the first that works:
1. English Wikipedia: the cuisine article for {{COUNTRY}} (titled "<demonym> cuisine" or "Cuisine of {{COUNTRY}}"), the cuisine pages of its peoples, "List of dairy products", "List of fermented milk products", and the article of every product you find (they link to more). Also the Wikipedia in the country's own language(s).
2. The country's own language(s): work out its official and widely spoken languages, translate "milk", "dairy", "yoghurt", "butter", "cream", "fermented milk", "milk sweets" into each, and search with those terms (native script and transliteration).
3. Per people and region: its pastoral, nomadic or herding peoples and its main dairy regions.
4. Per animal: "{{COUNTRY}} goat milk", "camel milk {{COUNTRY}}", and so on for each animal kept there.
5. Scientific papers — these often describe exactly how a product is made:
   - Europe PMC (free full text, no browser check): search with
     https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<terms>&format=json&resultType=lite
     and read a paper's full text with
     https://www.ebi.ac.uk/europepmc/webservices/rest/<PMCID>/fullTextXML
   - PubMed search pages, and open-access journal pages (MDPI, Frontiers, African Journals Online, SciELO, J-STAGE, journal sites).
   Search for e.g. "traditional fermented dairy products {{COUNTRY}}", "milk processing <people>", a product's name.
6. Food heritage: the country's geographical-indication lists and culinary heritage programmes.
7. Government and industry: the agriculture ministry, national dairy board or association, FAO dairy pages for the country, large dairy companies' product pages, supermarket listings.
8. Food writing and travel: food blogs, recipe sites, news features, travel guides and ethnographic writing describing what people make.
9. Neighbours and diaspora: products shared with neighbouring countries — check whether each is also made in {{COUNTRY}}.
10. Follow every lead: when a source names a product you don't have yet, search for that product by name.
Keep going until the checklist is done and two different search approaches in a row turn up nothing new.

READING PDFs: if a page is a PDF, or comes back as unreadable binary, download it and read its text in the shell:
  curl -sL -m 60 -o /tmp/{{CODE}}-dairy.pdf "<url>" && /nix/store/80q9cnqf0wvs86qn57d2dlgh4y9jax97-poppler-utils-26.06.0/bin/pdftotext -l 40 /tmp/{{CODE}}-dairy.pdf - | head -c 60000
A PDF read this way counts as opened.

SITES TO SKIP: these block automated access or ask not to be crawled; do not use them, and if any other site returns 403, a captcha, a cookie wall or a "not a robot" page, move on and do not retry it: Google Scholar, ResearchGate, TasteAtlas, Atlas Obscura, Slow Food (fondazioneslowfood.com), UNESCO intangible heritage (ich.unesco.org).

RULES
- Only write a product up as an entry if you OPENED a page (or read a PDF) that mentions it. Record that page's URL. A search-result snippet is not a source. Never invent a product, a fact or a URL.
- Anything you saw only in snippets, or could not open, goes under "Unconfirmed leads" at the end — never in an entry.
- If sources disagree or you're unsure (e.g. whether it's really made here), say so in the entry rather than leaving it out.
- Put things in your own words; no long quotes.

WRITE YOUR RESULT to
  /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/found/dairy/{{CODE}}.md
in exactly this shape:

  # {{COUNTRY}} ({{CODE}}) — dairy
  Searched: <one line per approach you tried, and what it yielded>

  ## <Main name> (<local names, with language and script>; other names)
  - Animal(s): <which milks>
  - Kind: <fermented milk / butter / drink / sweet / …>
  - What it is: <1–3 sentences>
  - How it is made: <steps you found, with temperatures/times if a source gives them>
  - Where / who: <region, people, home or industrial>
  - Sources: <URL> — <what this page supports>; <URL> — …
  - Unsure: <only if something is doubtful>

  (one block per product)

  ## Unconfirmed leads
  - <name or claim> — <where you saw it (snippet, unreadable page)> — <URL if any>

When done, reply with one line: the number of products, the number of unconfirmed leads, and the file path.
