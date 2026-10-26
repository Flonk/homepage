You are researching the cheeses of ONE region: {{REGION}} ({{REGIONCODE}}), a part of {{COUNTRY}} (ISO code {{CODE}}).
Your job is to find every cheese made in {{REGION}} — including farm, village, valley and monastery cheeses — and write each down with its sources. Other researchers cover the rest of {{COUNTRY}}; stay inside {{REGION}}, but include a cheese made across several regions if it is made here too. Do not stop early: a region with a cheese tradition often has 15–60 cheeses, many of them small and local.

WHAT COUNTS
- Any cheese from milk of ANY animal: cow (incl. zebu), water buffalo, goat, sheep, camel, yak, horse (mare), donkey, reindeer, and mixed milks.
- Both traditional/home/farm/pastoral AND industrial/supermarket cheeses. Regional or ethnic variants and named farm cheeses count as separate entries if they have their own name. Brands only as examples of a kind.

CHECKLIST — before you stop, you must have searched for EACH of these kinds by name for {{REGION}} (e.g. "{{REGION}} fresh cheese", "{{REGION}} goat cheese"), in English and in the country's language(s):
  fresh cheese and curds · cottage/pot/quark-like cheese · whey cheese (ricotta-like, boiled-down whey) · brined cheese · stretched-curd cheese · soft and bloomy-rind · washed-rind · blue · pressed uncooked · pressed cooked/hard/mountain cheese · smoked cheese · dried or hardened curd (herders' sun- or smoke-dried curd) · fried or grilled cheese · cheese cooked in milk or with other foods · cheese made with plant coagulants · processed and spread cheese made in the country · protected (PDO/PGI/GI) cheeses · cheese of each animal kept there (goat, sheep, camel, buffalo, yak, mare, reindeer).

HOW TO SEARCH — work through ALL of these, not just the first that works:
1. Wikipedia in the country's own language(s) and in English: the country's list of cheeses (pick those from {{REGION}}), the article on {{REGION}}'s cuisine or gastronomy, its cheese category if there is one, and the article of every cheese you find (they link to more).
2. The country's own language(s): work out its official and widely spoken languages, translate "cheese", "curd", "fresh cheese", "whey cheese", "goat cheese" into each, and search with those terms (native script and transliteration); also search the local names of the cheese types you find.
3. Inside the region: each of its provinces, departments, valleys, mountain areas and towns known for cheese; local cheese routes, farm-shop and market listings, the regional tourism board.
4. Per animal: "{{REGION}} goat cheese", "sheep cheese {{REGION}}", and so on for each animal kept there.
5. Protected and registered cheeses: the country's geographical-indication register and the EU GI registers (filter to {{REGION}}), regional lists of traditional food products, the region's cheese makers' associations and consortia, cheese competition results and awards.
6. Scientific papers — these often describe exactly how a cheese is made:
   - Europe PMC (free full text, no browser check): search with
     https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<terms>&format=json&resultType=lite
     and read a paper's full text with
     https://www.ebi.ac.uk/europepmc/webservices/rest/<PMCID>/fullTextXML
   - PubMed search pages, and open-access journal pages (MDPI, Frontiers, African Journals Online, SciELO, J-STAGE, journal sites).
   Search for e.g. "traditional cheese {{REGION}}", a cheese's name, "cheese making <people>".
7. Government and industry: the agriculture ministry, national dairy board, FAO dairy pages for the country, dairy companies' cheese pages, cheese shops' catalogues, supermarket listings.
8. Food writing and travel: cheese guides, food blogs, recipe sites, regional tourism pages, ethnographic writing.
9. Neighbouring regions: cheeses shared with the regions around {{REGION}} — check whether each is also made in {{REGION}}.
10. Follow every lead: when a source names a cheese you don't have yet, search for it by name.
Keep going until the checklist is done and two different search approaches in a row turn up nothing new.

READING PDFs: if a page is a PDF, or comes back as unreadable binary, download it and read its text in the shell:
  curl -sL -m 60 -o /tmp/{{REGIONCODE}}-cheese.pdf "<url>" && /nix/store/80q9cnqf0wvs86qn57d2dlgh4y9jax97-poppler-utils-26.06.0/bin/pdftotext -l 40 /tmp/{{REGIONCODE}}-cheese.pdf - | head -c 60000
A PDF read this way counts as opened.

SITES TO SKIP: these block automated access or ask not to be crawled; do not use them, and if any other site returns 403, a captcha, a cookie wall or a "not a robot" page, move on and do not retry it: Google Scholar, ResearchGate, TasteAtlas, Atlas Obscura, Slow Food (fondazioneslowfood.com), UNESCO intangible heritage (ich.unesco.org).

RULES
- Only write a cheese up as an entry if you OPENED a page (or read a PDF) that mentions it. Record that page's URL. A search-result snippet is not a source. Never invent a cheese, a fact or a URL.
- Anything you saw only in snippets, or could not open, goes under "Unconfirmed leads" at the end — never in an entry.
- If sources disagree or you're unsure (e.g. whether it's really made here), say so in the entry rather than leaving it out.
- Put things in your own words; no long quotes.

WRITE YOUR RESULT to
  /home/flo/repos/personal/homepage/t3/src/content/series/milk/data/research/found/cheese/{{CODE}}/{{REGIONCODE}}.md
in exactly this shape:

  # {{REGION}} ({{REGIONCODE}}), {{COUNTRY}} — cheese
  Searched: <one line per approach you tried, and what it yielded>

  ## <Main name> (<local names, with language and script>; other names)
  - Animal(s): <which milks>
  - Kind: <fresh / brined / stretched / bloomy / washed-rind / blue / pressed / whey cheese / dried curd / …>
  - What it is: <1–3 sentences>
  - How it is made: <steps you found: raw or heated milk, coagulant (rennet, acid, plant, heat), cutting, draining, pressing, salting, ripening time, with temperatures/times if a source gives them>
  - Texture / ripening: <if a source says>
  - Where / who: <region, people, farm/industrial; protected status if any>
  - Sources: <URL> — <what this page supports>; <URL> — …
  - Unsure: <only if something is doubtful>

  (one block per cheese)

  ## Unconfirmed leads
  - <name or claim> — <where you saw it (snippet, unreadable page)> — <URL if any>

When done, reply with one line: the number of cheeses, the number of unconfirmed leads, and the file path.
