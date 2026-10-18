# Cheese families by technique, worldwide: what the "what milk becomes" graph lacks

Scope note: I read the graph's real edges in `src/components/MilkGraph.astro`. The cheese edges are: `raw → freshCheese`, `pasteurised → freshCheese`, `raw/pasteurised → sweetWhey`, `pasteurised → soured → curd`, `curd → quark | acidWhey | soft | semiHard | hard`, `quark → sourMilkCheese | cookedCheese`, `semiHard/hard → processed`, `freshCheese → pastaFilata | brined`, `sweetWhey → wheyButter | wheyCheese | wheyPowder | wpc | wpi`.

Rows are in the format: **Name (examples)** | made from | step | animal | region | notes. A row tagged [bg] comes from background knowledge and has no web source fetched in this session. The report writer should treat [bg] details as unverified (see Gaps).

## Are the graph's existing parents right? (the rennet-curd problem)

### Takeaway
They are not. Cheese science splits cheese first by how the milk is set: rennet, acid, or heat plus acid. In the graph, Soft, Semi-hard and Hard cheese descend from `Soured milk → Curd`, which is an acid curd. That makes Brie, Gouda and Parmesan acid cheeses, which is wrong. The fix is a new **Rennet curd** node made from milk (raw and pasteurised). It should be the parent of Soft, Semi-hard and Hard cheese, Pasta filata, Brined cheese and **Sweet whey**. `Curd` should be renamed or kept as the acid curd (Quark, Sour milk cheese, Cooked cheese, Acid whey).

### Cited Findings
- *Fundamentals of Cheese Science* (Fox, Guinee, Cogan, McSweeney) has a "Principal Families of Cheese" chapter. Its sections are rennet-coagulated, acid-coagulated, heat/acid-coagulated, and concentration/crystallisation (whey cheeses such as brunost). — [Fox et al. TOC (e-bookshelf PDF)](https://download.e-bookshelf.de/download/0007/6446/84/L-G-0007644684-0015413704.pdf)
- McSweeney/Fox *Cheese* (4th ed.), ch. 1: texture is the most common criterion, but "no classification scheme developed to date is completely satisfactory." — [UCC research portal](https://research.ucc.ie/en/publications/chapter-1-cheese-an-overview/)
- The cheesescience.org chart splits cheese this way. Unripened: acid only (cottage, cream cheese, neufchâtel, quark, chèvre), acid + heat (ricotta, queso blanco, paneer, mascarpone), acid + rennet (fresh mozzarella) and rennet only (queso fresco, panela, ranchero). Ripened cheeses are all rennet-coagulated: internal bacterial (cheddar, colby, swiss, gouda/edam, parmesan, provolone…), external bacterial smear (limburger, gruyère, comté, tilsit, port du salut; *Brevibacterium*), internal mould/blue (*P. roqueforti*) and external mould/white (*P. camemberti*). — [cheesescience.org Cheese Types](https://www.cheesescience.org/cheese_types/)
- Acid: "neutralizes charges on casein micelles allowing them to aggregate". Acid + heat: "heat denatures whey proteins which then attach to casein micelle surfaces". — [cheesescience.org](https://www.cheesescience.org/cheese_types/)
- A university manual (Guelph) puts acid cheeses at pH 4.6–4.8 with little or no coagulating enzyme (cottage, quark, cream cheese). It lists paneer, channa, ricotta and requesón as heat-acid. It says rennet-set cheeses typically have no added acid and the categories "cannot be applied rigidly". — [Guelph cheesemaking ebook, via search summary](https://books.lib.uoguelph.ca/cheesemakingtechnologyebook/chapter/other-technological-criteria/) (the "cheese families" chapter returned HTTP 403, so this is from search snippets)
- Halloumi uses rennet at 30–34 °C with no acid-producing bacteria. — [Wikipedia: Halloumi](https://en.wikipedia.org/wiki/Halloumi). This shows that "Brined cheese" also belongs under rennet curd, not acid curd.

### Inferences
- **Recommended restructure (minimal):**
  - Add **Rennet curd** (`raw → rennetCurd`, `pasteurised → rennetCurd`).
  - Move `soft`, `semiHard`, `hard`, `pastaFilata` and `brined` under `rennetCurd`.
  - Replace `raw/pasteurised → sweetWhey` with `rennetCurd → sweetWhey`. Sweet whey is by definition the whey of rennet curd, just as acid whey already hangs off Curd, Yoghurt and Skyr.
  - Keep `soured → curd → quark/acidWhey/sourMilkCheese/cookedCheese` and rename the label to "Acid curd" or "Curd (Topfen)" for clarity.
- **"Fresh cheese" (`raw/pasteurised → freshCheese → pastaFilata/brined`) is ambiguous.** Fresh cheese can be acid-set (cream cheese, cottage), heat-acid (paneer, ricotta) or rennet (queso fresco). Pasta filata and feta come from a rennet curd, not from a finished fresh cheese. Two options:
  - (a) Keep "Fresh cheese" as the rennet-only fresh family (queso fresco, panela), parented by Rennet curd, and give pasta filata and brined their own edges from Rennet curd.
  - (b) Remove it as a parent entirely.
  
  Option (a) is cleaner.
- Mozzarella in the strict sense is "acid + rennet". The curd is acidified to about pH 5.2 before stretching ([bg]). It still sits under Rennet curd.
- Soft, Semi-hard and Hard are texture classes. The graph is about technique, so the families below should hang off them or off Rennet curd directly. Pragmatically, keep the texture nodes as hubs and attach families to the nearest one: Bloomy-rind → Soft, Alpine → Hard, and so on.

### Gaps
- I could not read the Guelph "cheese families" chapter (403) or the Fox family definitions in full. The pH 4.6 figure and the family split come from search snippets and the table of contents.

## Acid-set and acid-heat-set families (missing nodes)

### Takeaway
At least eight acid or heat-acid nodes are missing:
- Paneer
- Chhena (with its sweets)
- Ricotta-type whey/milk albumin cheese
- Cottage cheese
- Cream cheese
- Tvorog/farmer's cheese (borderline; could merge with Quark)
- Queso blanco
- Lactic-set goat cheese

The biggest structural point is that **heat-acid cheeses come from hot whole milk plus acid, with no Curd step**. Ricotta's real parent is **Sweet whey**, which the graph's "Whey cheese (brunost)" node gets wrong: brunost is whey *boiled down*, while ricotta is whey *heat-acid precipitated*. They are two different techniques.

### Cited Findings
- **Paneer:** hot milk curdled with lemon juice, vinegar, citric acid or dahi, drained in muslin, pressed (2–3 h for a firm North Indian block) and soaked in chilled water. Cow or buffalo milk, across South Asia. Surti paneer (Surat) is buffalo milk ripened in whey. — [Wikipedia: Paneer](https://en.wikipedia.org/wiki/Paneer)
- **Chhena:** milk boiled 10 min, acid or aged whey added at 75–80 °C, curd strained through muslin and drained by gravity, unpressed. Kneaded warm it becomes "smooth, whipped-cream consistency". It "may be further processed to make paneer". Sweets: rasgulla (kneaded chhena + sugar + semolina/arrowroot balls), sandesh ("most popular chhena-based sweet"), ras malai, chhena poda. Odisha, West Bengal and Bangladesh. — [Wikipedia: Chhena](https://en.wikipedia.org/wiki/Chhena)
- **Ricotta:** whey left 12–24 h to acidify, heated to near boiling; "low pH and high temperature denatures the protein and causes it to flocculate". Modern ricotta is often made from milk. Malta's irkotta uses fresh milk. Ricotta salata is pressed, salted, dried and aged ricotta. Relatives: urdă (Romania), requesón (Spain), requeijão (Portugal/Brazil), mizithra and anthotyros (Greece). — [Wikipedia: Ricotta](https://en.wikipedia.org/wiki/Ricotta)
- **Whey cheeses:** "from whey, a by-product" of other cheese (ricotta, brocciu). — [Wikipedia: Types of cheese](https://en.wikipedia.org/wiki/Types_of_cheese)
- **Cottage cheese:** two routes. Cultured: pasteurised skim milk at 30–32 °C, lactic bacteria for 4–8 h plus a small dose of rennet. Direct-acid: vinegar, citric or lactic acid into cold skim milk. Then the curd is cut (<4 mm or >8 mm), **cooked at 49–54 °C**, **washed with chilled water** and dressed with cream and salt. — [Wikipedia: Cottage cheese](https://en.wikipedia.org/wiki/Cottage_cheese)
- **Tvorog vs quark:** tvorog is a "drier variant" of quark, at 65–80 % water. Russian rules class it as a dairy product, not a cheese. Central and Eastern European styles (tvorog, Polish twaróg/"white cheese") are "drier and more solid" than German quark. Quark is sometimes sold as "pressed cottage cheese". Dishes: syrniki, sernik. — [Wikipedia: Quark](https://en.wikipedia.org/wiki/Quark_(dairy_product))
- **Lactic/acid-only fresh cheeses:** cottage, cream cheese, neufchâtel, quark, chèvre. **Heat-acid:** ricotta, queso blanco, paneer, mascarpone. **Rennet-only fresh:** queso fresco, panela, ranchero. — [cheesescience.org](https://www.cheesescience.org/cheese_types/)
- **Halloumi is not acid-set.** It is a rennet cheese with no starter, scalded in hot whey for ≥30 min, salted, folded with mint and kept in salted whey. Matured halloumi spends ≥40 days in brine-whey. It does not melt because the casein network stays intact, and the same network makes it squeak. Goat and/or sheep milk, often with cow added. Cyprus. — [Wikipedia: Halloumi](https://en.wikipedia.org/wiki/Halloumi)
- **Chhurpi (soft):** buttermilk is boiled and the solid mass is separated, hung in cloth and slightly fermented. This is a heat-acid curd from buttermilk, not milk. — [Wikipedia: Chhurpi](https://en.wikipedia.org/wiki/Chhurpi)

### Inferences (catalogue rows)
| Family (examples) | Made from | Step | Animal | Region | Notes / node judgement |
|---|---|---|---|---|---|
| **Paneer** (ponir, Surti paneer) ★ | Chhena (or Pasteurised milk directly) | pressed heat-acid curd | cow, buffalo | South Asia | One node. If Chhena is added, the cleanest edge is Chhena → Paneer, which the chhena source supports. |
| **Chhena** (chhana) ★ | Pasteurised milk (hot) | heat + acid, drained not pressed | cow, buffalo | Bengal, Odisha, Bangladesh | One node. Note its products: **rasgulla, sandesh, ras malai, chhena poda**. These could be a single "Chhena sweets" leaf, since the graph is not about desserts. |
| **Ricotta** (requesón, urdă, mizithra, anthotyros, brocciu, irkotta) ★ | **Sweet whey** (+ milk) | heat + acid flocculation of whey proteins | sheep, cow, goat | Mediterranean, Balkans, Iberia | One node, distinct from brunost: precipitated whey vs evaporated whey. Optional child: **Ricotta salata** (pressed, salted, aged). |
| **Cottage cheese** | Skimmed milk | acid (± small rennet) → cut → cooked 49–54 °C → washed → cream-dressed | cow | N. America, UK | One node. A child of Skimmed milk is technically accurate. |
| **Cream cheese** (Neufchâtel-style) [bg for process] | Cream / Pasteurised milk + cream | acid set, curd separated hot (centrifuge), homogenised | cow | USA (Philadelphia-style) | One node. Classed as acid-only by cheesescience.org; the process details are [bg]. |
| **Tvorog / farmer's cheese / twaróg** | Curd (acid) | drained and pressed drier than quark | cow | E. & Central Europe | Judgement: **merge into Quark** as "Quark (tvorog)". The source calls it a drier quark variant. |
| **Queso blanco** [bg for Latin naming] | Pasteurised milk (hot) | heat + acid (vinegar/lime) | cow | Latin America | Same technique as paneer. Could be one node "Paneer (queso blanco)" or a bracket mention. |
| **Queso fresco / panela** (rennet-only fresh) | Rennet curd | rennet, no culture, unripened | cow | Mexico, Latin America | This is what the graph's "Fresh cheese" node should mean. Relabel it "Fresh cheese (queso fresco)". |
| **Lactic-set goat cheese** (chèvre frais, Crottin, Sainte-Maure, Valençay) ★ | Soured milk / acid curd (goat) | long slow lactic set (~24 h) with a drop of rennet, ladled, drained [bg] | goat | Loire, Poitou | One node. Children below: ash-coated, Geotrichum-rind. |
| **Labneh balls** (labneh mkabbaleh) [bg] | Greek yoghurt / strained yoghurt | strained further, rolled, kept in oil | cow, goat, sheep | Levant | Leaf off the existing Greek yoghurt node. Small. |
| **Chhurpi, soft** | Buttermilk | boiled, separated, hung, slightly fermented | yak, cow | Himalaya | See the next section for the hard form. |

### Gaps
- No fetched source confirmed cream cheese processing, queso blanco technique, labneh balls or the Loire lactic-set procedure (the 24 h set, rennet drop, ash, *Geotrichum*). The Goat cheese article did not cover them. These are [bg].
- Mascarpone is listed as heat-acid by cheesescience.org. The graph has it as Crème fraîche → Mascarpone. Strictly it is cream + heat + acid (citric/tartaric) [bg], so `cream → mascarpone` may be a more accurate edge. Flag only.

## Rennet technique families (missing nodes)

### Takeaway
The texture triad Soft/Semi-hard/Hard hides about ten well-defined technique families. The strongest additions are:
- Bloomy-rind
- Washed-rind/smear
- Blue
- Alpine cooked-pressed (eyes from *Propionibacterium*)
- Cheddared
- Washed-curd (Gouda)
- Grana

Pasta filata variants (kashkaval/caciocavallo/provolone, Oaxaca/string) and grilling cheeses (halloumi, leipäjuusto) are good secondary nodes.

### Cited Findings
- **Bloomy rind:** "velvety bloom of *P. camemberti*" (Brie, Camembert). **Washed rind:** "periodically cured in a solution of saltwater brine or mold-bearing agents" (Munster, Port Salut); smear-ripened is a subgroup. **Blue:** *P. roqueforti* or *P. glaucum* (Roquefort, Gorgonzola, Stilton). **Pasta filata:** hot curd stretched; mozzarella fresh, provolone aged. **Brined:** feta, halloumi. **Cooked pressed:** thermophilic starters at high temperature (Emmental, Gruyère, Parmesan). — [Wikipedia: Types of cheese](https://en.wikipedia.org/wiki/Types_of_cheese)
- **Smear:** bacteria (sometimes with yeasts and moulds) applied to the outside, *Brevibacterium* named. Limburger, Liederkranz, Gruyère, Esrom, Comté, Port du Salut, Tilsit. — [cheesescience.org](https://www.cheesescience.org/cheese_types/)
- **Emmental:** raw cow's milk; *S. thermophilus*, *L. helveticus* and ***Propionibacterium freudenreichii***. Holes form from bacterial gas around hay-dust particles. — [Wikipedia: Emmental](https://en.wikipedia.org/wiki/Emmental_cheese)
- **Cheddaring:** after heating, "the curd is kneaded with salt, cut into cubes to drain the whey, and then stacked and turned". Colby and Red Leicester are similar. — [Wikipedia: Cheddar](https://en.wikipedia.org/wiki/Cheddar_cheese)
- **Washed curd (Gouda):** part of the whey is drained and replaced with water, removing lactose and giving sweetness. Then moulded, brined, waxed, and aged 4 weeks to 12–21 months. A reference title groups "Gouda, Edam and Other Washed Curd Cheese". — [Wikipedia: Gouda](https://en.wikipedia.org/wiki/Gouda_cheese). Colby and Monterey Jack are milder because "their curd is rinsed before it is pressed". — [Wikipedia: Types of cheese](https://en.wikipedia.org/wiki/Types_of_cheese)
- **Kashkaval:** semi-hard, traditionally unpasteurised, from cow, sheep, goat or mixed milk. Names: cașcaval, kačkavalj (Pirot), kaşar (Turkey), qashqawān (Levant). The name possibly comes from Italian caciocavallo. The article does **not** describe its making. — [Wikipedia: Kashkaval](https://en.wikipedia.org/wiki/Kashkaval)
- **Oaxaca:** pasta filata stretched "into long ribbons" and wound into a ball like yarn. Often confused with asadero, which is made differently. — [Wikipedia: Oaxaca cheese](https://en.wikipedia.org/wiki/Oaxaca_cheese)
- **Halloumi:** rennet, curd scalded in whey, folded with mint, brined, non-melting and squeaky. — [Wikipedia: Halloumi](https://en.wikipedia.org/wiki/Halloumi)
- **Leipäjuusto / juustoleipä:** traditionally cow colostrum (now cow or goat milk). Curdled and set into a 2–3 cm disc, then **baked, grilled or flambéed** to brown spots. Traditionally dried rock-hard and kept for years. Finnish names: kahvijuusto, narskujuusto ("squeaky"). Southern Ostrobothnia, Kainuu. — [Wikipedia: Leipäjuusto](https://en.wikipedia.org/wiki/Leip%C3%A4juusto)
- **Cotija:** milk salted, curd milled, pressed and aged 100–365 days. Dry and firm, does not melt. Types: de Montaña (seasonal), Tajo (moister, feta-like), Añejo (Parmesan-like). Michoacán, Mexico. — [Wikipedia: Cotija](https://en.wikipedia.org/wiki/Cotija_cheese)

### Inferences (catalogue rows)
| Family (examples) | Made from | Step | Animal | Region | Notes / node judgement |
|---|---|---|---|---|---|
| **Bloomy-rind cheese** (Brie, Camembert, Chaource) ★ | Soft cheese (or Rennet curd) | surface mould *P. camemberti* | cow | France | One node. Strongest single addition. |
| **Washed-rind / smear cheese** (Munster, Limburger, Époisses, Taleggio, Romadur, Tilsit) ★ | Soft or Semi-hard cheese | rind washed in brine/beer/marc, *Brevibacterium* smear | cow | Alsace/Vosges, Belgium, Germany, Burgundy | One node. Smear runs across textures (Gruyère and Comté are smeared too), so draw it from Semi-hard or from Rennet curd. |
| **Blue cheese** (Roquefort, Gorgonzola, Stilton, Danablu, Cabrales) ★ | Semi-hard or Soft cheese | *P. roqueforti* added, pierced for air | sheep (Roquefort), cow | Europe | One node. |
| **Alpine cooked-pressed cheese** (Emmental, Gruyère, Comté, Beaufort, Appenzeller) ★ | Hard cheese | curd cooked high with thermophilic starter, pressed, long aged; *P. freudenreichii* → eyes (Emmental) | cow, often raw | Alps | One node: "Alpine cheese (Emmental, Gruyère)". Eye formation is a note, not a separate node. |
| **Grana / extra-hard** (Parmigiano Reggiano, Grana Padano, Pecorino Romano, Sbrinz) | Hard cheese | cooked, brined 3 weeks [bg], aged 12–36 months, very low moisture | cow (sheep for Romano) | N. Italy | Could be merged with Alpine as "Cooked hard cheese", but kept separate it shows the extra-hard end. Medium value. |
| **Cheddared cheese** (Cheddar, Cheshire, Lancashire, Red Leicester) ★ | Semi-hard / Hard (from Rennet curd) | slabs stacked and turned, milled, dry-salted, pressed | cow | England, now global | One node. A fine parent for Processed cheese (American cheese). |
| **Fresh cheese curds** (squeaky curds, poutine) [bg] | Cheddared cheese (unpressed) | milled cheddared curd eaten fresh | cow | Québec, Wisconsin | Small leaf; poutine is the dish. No source fetched. |
| **Washed-curd cheese** (Gouda, Edam, Colby, Monterey Jack, Havarti) | Semi-hard cheese | whey partly replaced with water, brined, waxed | cow | Netherlands, USA | One node. Dutch "Gouda family". |
| **Pasta filata, aged/hard** (provolone, caciocavallo, kashkaval/kaşar, ragusano) | Pasta filata | stretched curd, shaped, brined, hung/aged (provolone often smoked) | cow, sheep | S. Italy, Balkans, Turkey, Levant | Judgement: **one node** "Aged pasta filata (provolone, kashkaval)". The kashkaval-as-filata claim is [bg]; its Wikipedia page does not state the method. |
| **Pasta filata, wound/string** (Oaxaca, string cheese, chechil) | Pasta filata | stretched into ribbons/strings, wound/braided | cow | Mexico, Armenia, USA | Judgement: a bracket on Pasta filata ("mozzarella, Oaxaca") is enough. Chechil is [bg]. |
| **Grilling cheese** (halloumi, leipäjuusto, juustoleipä, bread cheese) ★ | Rennet curd | curd heated (scalded in whey or baked/grilled) so it does not melt; squeaks | goat/sheep, cow colostrum | Cyprus, Finland | One node for "cheese you can grill", which shows a real technique: heat-set casein network. Alternatively halloumi joins Brined cheese and leipäjuusto stands alone. |
| **White brined cheeses beyond feta** (sirene, beyaz peynir, telemea, domiati, akkawi, nabulsi) [bg] | Brined cheese | brine-ripened (domiati salts the milk before renneting) | sheep, cow, buffalo | Balkans, Turkey, Egypt, Levant | Judgement: **not a new node**. Widen the bracket: "Brined cheese (feta, sirene, domiati)". Domiati's milk-salting is a curiosity [bg]. |
| **Cotija / dry-salted Mexican aged** | Rennet curd (salted milk) | milled, pressed, aged 100–365 days | cow | Michoacán | Leaf off Hard cheese, or a bracket on Grana ("Parmesan of Mexico"). Low priority. |
| **Smoked cheese** (scamorza affumicata, oscypek, provola, smoked gouda) [bg] | any (Pasta filata / Semi-hard) | cold or hot smoked | sheep (oscypek), cow | everywhere | Judgement: smoking is a finish, not a family. One node "Smoked cheese (oscypek)" is acceptable since the graph is one-step edges. Oscypek (Tatra, sheep, scalded and pressed in carved moulds, smoked) is a nice example [bg]. |
| **Ash-coated cheese** (Valençay, Selles-sur-Cher, Morbier's ash line) [bg] | Lactic-set goat cheese | dusted with salted charcoal ash before ripening | goat | Loire | Small leaf; could be a bracket on lactic-set goat. Humboldt Fog has an ash line ([Wikipedia: Goat cheese](https://en.wikipedia.org/wiki/Goat_cheese)). |
| **Geotrichum / wrinkled-rind** (Crottin, Saint-Marcellin) [bg] | Lactic-set goat cheese | *Geotrichum candidum* surface | goat, cow | France | Merge with ash-coated into "Ripened goat cheese". |

### Gaps
- No fetched source gave cooking temperatures for Alpine or grana cheese, the CO₂ mechanism in so many words, Parmigiano brining times, the mozzarella pH, kashkaval's stretching method, smoked cheese, ash-coated or Geotrichum rinds, or cheese curds and poutine. Those details are [bg].

## Other worldwide oddities (Himalaya, Mongolia, Africa, insect- and mite-ripened)

### Takeaway
The most striking non-European additions are:
- **Hard chhurpi**: buttermilk curd, pressed and hung over fire until stone-hard.
- **Byaslag/aaruul**: the Mongolian set. Aaruul is close to the existing Dried yoghurt/qurut node.
- **Wagashi**: Benin; set with a plant enzyme from *Calotropis procera*, then dyed red with sorghum.
- **Casu marzu**: ripened by insect larvae, with mite-ripened Mimolette and Milbenkäse as its sibling.

### Cited Findings
- **Chhurpi, hard:** the soft cheese is pressed in a jute bag, dried, cut into cubes and hung over a fire to harden (this step is tagged "citation needed" on Wikipedia). Made from buttermilk, yak and cattle. Nepal, Tibet, Bhutan, NE India. — [Wikipedia: Chhurpi](https://en.wikipedia.org/wiki/Chhurpi)
- **Mongolia:** milk is boiled to lift the cream (öröm) and the skim is made into cheese. Byaslag is "the slightly fermented aarts", aaruul is dried curds, and eezgii is a roasted variant of dried curds. — [Wikipedia: Byaslag → Mongolian cuisine](https://en.wikipedia.org/wiki/Byaslag)
- **Wagashi / wagasi (Gassirè):** cow's milk heated to 65–70 °C and coagulated with *Calotropis procera* leaf or stem extract (enzyme calotropain), then pressed into wheels. The red rind comes from a warm sorghum-panicle solution (one source says teak leaves; another says red palm oil, a conflict). Fried or boiled as a meat substitute. Northern Benin (Parakou), made by Fulani (Peulh) women. — [PMC9489737](https://pmc.ncbi.nlm.nih.gov/articles/PMC9489737); [Swisscontact](https://www.swisscontact.org/en/news/improving-the-quality-of-gassire-cheese-for-the-empowerment-of-fulani-women); [Wikipedia: Wagasi](https://en.wikipedia.org/wiki/Wagasi) (Wikipedia instead names *Bombax ceiba*/"fromagier" and red wax from a leaf, which conflicts with the research literature; prefer PMC)
- **Casu marzu:** whole pecorino sardo with part of the rind removed, left for the cheese fly *Piophila casei* to lay eggs. The larvae soften the paste over about 3 months. The ooze is "làgrima". Banned for sale (Italy/EU). Variants: casgiu merzu (Corsica), marcetto (Abruzzo), salterello (Friuli) and others. **Mite-ripened:** German Milbenkäse and French Mimolette. — [Wikipedia: Casu martzu](https://en.wikipedia.org/wiki/Casu_martzu)

### Inferences (catalogue rows)
| Family (examples) | Made from | Step | Animal | Region | Notes / node judgement |
|---|---|---|---|---|---|
| **Hard chhurpi** (durkha, chhurpi) ★ | Soft chhurpi ← **Buttermilk** | boiled buttermilk curd, pressed, dried, fire-hung | yak, cow | Himalaya | One node "Chhurpi (yak)" from Buttermilk, an existing node. A good edge because it shows buttermilk turning into the hardest cheese in the world. |
| **Byaslag** | Skimmed milk (after öröm) | lightly fermented rennet/acid curd, pressed | cow, yak, sheep, goat, camel [bg] | Mongolia | Low priority. The coagulant could not be verified (Wikipedia gives no method). |
| **Aaruul / eezgii** | Curd (Mongolian aarts) | sun-dried curd pieces / roasted curd | various | Mongolia | Judgement: **merge** into the existing "Dried yoghurt (kashk, qurut)" node by adding aaruul to its bracket. Eezgii (roasted) is a curiosity [bg]. Also **kurt** (Central Asia) = qurut, already covered. |
| **Wagashi** ★ | Milk (raw) | heat (65–70 °C) + plant-protease coagulation, pressed, sorghum-dyed | cow (Fulani zebu) | Benin, West Africa | One node, and it adds a third coagulant type: **plant rennet**. Iberian thistle-rennet torta cheeses (Serra da Estrela, Torta del Casar, set with *Cynara cardunculus*) [bg] could join as "Plant-rennet cheese". |
| **Insect-ripened cheese** (casu marzu, casgiu merzu, marcetto) | Hard cheese (pecorino) | ripened by *Piophila casei* larvae | sheep | Sardinia, Corsica, Italy | One node. Include it; it is the memorable one. |
| **Mite-ripened cheese** (Mimolette, Milbenkäse/Würchwitzer) | Semi-hard cheese | cheese mites work the rind | cow | France, Saxony | Could be merged with insect-ripened as "Critter-ripened (casu marzu, Mimolette)"; the technique differs (rind vs paste). |
| **Tiroler Graukäse, Harzer, Olomoucké tvarůžky** | Quark / Sour milk cheese | lactic acid curd, ripened (grey mould / smear) | cow | Tyrol, Harz, Moravia | **Already covered** by "Sour milk cheese". Add them as bracket examples: "Sour milk cheese (Harzer, Graukäse)" [bg]. |
| **Cheese curds / juustoleipä / Oaxaca / Cotija** | — | — | — | — | Covered above. |
| **Processed cheese variants** (American slices, Kraft, Dutch smeltkaas, Laughing Cow) | Semi-hard/Hard | emulsifying salts + heat | — | — | Already present. Note: processed cheese = "traditional cheese and emulsifying salts" ([Types of cheese](https://en.wikipedia.org/wiki/Types_of_cheese)). Cheddared cheese is the more truthful parent for American cheese. |

### Gaps
- I found no method for byaslag (coagulant, pressing) and no specifics on Mongolian camel or yak milk in the fetched pages.
- Thistle-rennet cheeses, Graukäse, Harzer, Mimolette's mite process and oscypek were not verified in this session.
- The wagashi coagulant is conflicting: the peer-reviewed literature says *Calotropis procera*, while Wikipedia says *Bombax ceiba*/"fromagier".

## Shortlist and node judgements (summary for the report writer)

### Takeaway
The six additions that add most to the picture, plus one structural fix:
0. **Structural fix: add Rennet curd** (milk → rennet curd → Soft / Semi-hard / Hard / Pasta filata / Brined / Sweet whey), and keep `Curd` as the acid curd.
1. **Bloomy-rind cheese** (Brie, Camembert): mould outside.
2. **Blue cheese** (Roquefort, Gorgonzola, Stilton): mould inside.
3. **Washed-rind / smear cheese** (Munster, Limburger, Époisses): bacteria outside.
4. **Alpine cooked cheese** (Emmental, Gruyère, Comté): propionibacteria eyes. Merging grana into it is optional.
5. **Paneer + Chhena** (rasgulla, sandesh): the heat-acid family, straight from hot milk.
6. **Ricotta** from **Sweet whey**: heat-acid whey precipitation, a different technique from brunost.

Runners-up, by value:
- Cheddared cheese
- Washed-curd cheese (Gouda)
- Grilling cheese (halloumi, leipäjuusto)
- Hard chhurpi from Buttermilk
- Wagashi (plant rennet)
- Insect/mite-ripened
- Lactic-set goat cheese
- Cottage cheese
- Cream cheese
- Aged pasta filata (provolone, kashkaval)
- Grana

Bracket-only (no new node):
- Tvorog → Quark
- Aaruul/kurt → Dried yoghurt
- Harzer/Graukäse → Sour milk cheese
- Sirene/domiati → Brined
- Oaxaca/string → Pasta filata
- Queso blanco → Paneer
- Queso fresco/panela → Fresh cheese

### Cited Findings
- The family structure (rennet vs acid vs heat-acid vs concentration) follows Fox et al. — [TOC PDF](https://download.e-bookshelf.de/download/0007/6446/84/L-G-0007644684-0015413704.pdf). The four ripening agent classes (internal/external bacterial, internal/external mould) follow [cheesescience.org](https://www.cheesescience.org/cheese_types/).

### Inferences
- Count of candidates in this file: about 35 rows across the three tables. That is about 20 new nodes if the merges above are applied.
- Parent fixes beyond Rennet curd:
  - `sweetWhey` should come from Rennet curd, not straight from milk.
  - `freshCheese` should not be the parent of pasta filata and feta.
  - Mascarpone is arguably cream + heat + acid rather than from crème fraîche.
  - "Whey cheese (brunost)" is the concentration family. Ricotta needs its own sibling under Sweet whey.

### Gaps
- Kindstedt's *Cheese and Culture*, the Oxford Companion to Cheese and the Codex standards were not consulted directly in this session (no open full text was fetched). The [bg] rows should be checked against them before publication if precision matters.
