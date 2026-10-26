You are doing the SECOND PASS on the dairy and cheese research for ONE country: {{COUNTRY}} (ISO code {{CODE}}).
Earlier researchers wrote these files (some may be missing):
  /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/research/found/dairy/{{CODE}}.md
  /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/research/found/cheese/{{CODE}}.md
  and, for some countries, one file per region in
  /home/flo/repos/personal/homepage/t3/src/content/series/milk/components/graph/research/found/cheese/{{CODE}}/
Read all of them first.

YOUR JOB, in this order:
1. CHASE THE LEADS. Each file may end with an "## Unconfirmed leads" section. For every lead, try to find and OPEN a page (or read a PDF) that confirms it. If you confirm it, write it up as a full entry (see shape below) and remove it from the leads; if you cannot, leave it in the leads and add " — second pass: <what you tried>".
2. FILL THE GAPS. Look at what is missing. Search specifically for kinds the files have none of, in English and the country's own language(s):
   - dairy: industrial/supermarket products (yoghurt brands, flavoured milks, ice cream, evaporated/condensed milk, infant formula made locally), milk sweets and desserts, butter and ghee, fermented milks, milk of each animal kept in the country, human donor milk;
   - cheese: industrial cheeses and local dairies' cheeses, fresh cheeses and curds, whey cheeses, the cheeses of each animal kept there, protected cheeses.
   Use the same approaches as before: Wikipedia (English and the country's languages), Europe PMC
   (https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<terms>&format=json&resultType=lite, full text at https://www.ebi.ac.uk/europepmc/webservices/rest/<PMCID>/fullTextXML),
   open-access journals, government and FAO pages, dairy companies' and supermarkets' product pages, food blogs and recipe sites.
3. CHECK WHAT IS THIN. For entries with no "How it is made" or with only one source, try to find a second source that describes how it is made. Add it to the entry; do not remove anything that is already sourced.

READING PDFs: if a page is a PDF, or comes back as unreadable binary, download it and read its text in the shell:
  curl -sL -m 60 -o /tmp/{{CODE}}-2nd.pdf "<url>" && /nix/store/80q9cnqf0wvs86qn57d2dlgh4y9jax97-poppler-utils-26.06.0/bin/pdftotext -l 40 /tmp/{{CODE}}-2nd.pdf - | head -c 60000
A PDF read this way counts as opened.

SITES TO SKIP: Google Scholar, ResearchGate, TasteAtlas, Atlas Obscura, Slow Food (fondazioneslowfood.com), UNESCO intangible heritage (ich.unesco.org); and any site that returns 403, a captcha, a cookie wall or a "not a robot" page — move on, do not retry.

RULES
- Only write an entry if you OPENED a page (or read a PDF) that supports it, and give its URL. A search-result snippet is not a source. Never invent a product, a fact or a URL.
- Edit the existing files in place: add new entries before "## Unconfirmed leads" in the right file (dairy products in the dairy file; cheeses in the country cheese file, not the region files). Create a file if it is missing, in the same shape. Do not delete or rewrite earlier entries except to add sources or a "How it is made" you found.
- Add one line to the "Searched:" block of each file you change: "Second pass: <what you tried and what it yielded>".
- If a product is in the wrong file (a cheese in the dairy file, or the other way round), leave it and note it under "Unsure".

ENTRY SHAPE (same as the files):
  ## <Main name> (<local names, with language and script>; other names)
  - Animal(s): …
  - Kind: …
  - What it is: …
  - How it is made: …
  - Where / who: …
  - Sources: <URL> — <what this page supports>; …
  - Unsure: <only if something is doubtful>

When done, reply with one line: how many leads you confirmed, how many entries you added in total, and how many leads remain.
