# Milk products missing from the graph: fluid/preserved milks, creams & fats, butters, cooked/sweetened, dried, frozen, colostrum

Source key (used in tables as short tags; full links in each section's Cited Findings):
- [LDP] Wikipedia, List of dairy products — https://en.wikipedia.org/wiki/List_of_dairy_products
- [CFR] 21 CFR 131 Subpart B section list — https://www.law.cornell.edu/cfr/text/21/part-131/subpart-B
- [BAKED] https://en.wikipedia.org/wiki/Baked_milk
- [KHOA] https://en.wikipedia.org/wiki/Khoa
- [DDL] https://en.wikipedia.org/wiki/Dulce_de_leche
- [RABRI] https://en.wikipedia.org/wiki/Rabri
- [KULFI] https://en.wikipedia.org/wiki/Kulfi
- [TONED] https://en.wikipedia.org/wiki/Toned_milk
- [SMEN] https://en.wikipedia.org/wiki/Smen
- [NITER] https://en.wikipedia.org/wiki/Niter_kibbeh
- [COL] https://en.wikipedia.org/wiki/Colostrum
- [KALV] https://en.wikipedia.org/wiki/Kalvdans
- [TP] Tetra Pak Dairy Processing Handbook, AMF chapter (seen via search summary only) — https://dairyprocessinghandbook.tetrapak.com/node/655

Rows marked "UNVERIFIED" come from background knowledge and were not confirmed by a source in this session; the report writer should treat them as candidates, not facts.

Method note: about 18 tool calls. The Codex PDFs (CXS 280 etc.) returned 403 and eCFR redirected to a bot wall, so standards are only cited at the level of section titles (CFR) or a second-hand summary (Codex 280 via Tetra Pak). Most process detail comes from Wikipedia articles, which are secondary sources.

---

## Fluid & preserved milks: what is missing?

### Takeaway
The best additions are **toned / double-toned milk** (an Indian process that mixes buffalo milk with skim milk, skim powder and water, a real "recombining" step) and **baked milk (toplyonoye moloko)**, which is the missing parent of ryazhenka and varenets. Lactose-free, A2, filtered and flavoured milks are mostly retail variants. Each adds one process step at most.

### Cited Findings
- Toned milk = buffalo milk + skim milk + skim milk powder + water. Fat drops from ~7–8% to ~3% (the article also says 3.5%) with non-fat solids restored. Volume "nearly triples". Double-toned milk = 1.5% fat, 9% SNF, always pasteurised. FSSAI "standard milk" ≥4.5% fat. Developed in India. — [TONED](https://en.wikipedia.org/wiki/Toned_milk)
- Baked milk: milk simmered slowly for ≥8 h, or boiled milk left in an oven a day or overnight until a brown crust forms. Maillard reactions give colour and caramel flavour. Some water is lost. Keeps up to 40 h at room temperature. Russia, Ukraine, Belarus. In China it is used in bubble tea ("kǎo nǎi"). Ryazhenka and varenets are fermented baked milk. Varenets was traditionally made by baking sour milk. — [BAKED](https://en.wikipedia.org/wiki/Baked_milk)
- Filled milk: milk, cream or skim milk with non-milk fats added. Haymilk is defined by feeding (Alps), not by processing. Other species' milks are listed: camel, goat, sheep, donkey, horse, reindeer, yak, moose. — [LDP](https://en.wikipedia.org/wiki/List_of_dairy_products)
- US standards include "Acidified milk" (131.111), "Concentrated milk" (131.115) and "Eggnog" (131.170) as standardised milk products. — [CFR](https://www.law.cornell.edu/cfr/text/21/part-131/subpart-B)

### Catalogue
| Product | Made from | Step | Animal | Region | Notes / source |
|---|---|---|---|---|---|
| Toned milk | Milk (raw) (buffalo) + Skimmed milk powder | Dilute fat with skim/SMP/water to ~3% | Buffalo | India | [TONED]. Has two parents, see flags |
| Double-toned milk | Toned milk (or same inputs) | Tone further to 1.5% fat | Buffalo | India | [TONED]. Could be merged into "Toned milk" |
| Baked milk (toplyonoye moloko, ryazhenka base) | Pasteurised/Fresh whole milk (boiled first) | Hold hot ≥8 h → Maillard browning | Cow | Russia/Ukraine/Belarus | [BAKED]. **Top pick**. Ryazhenka = baked milk → fermented |
| Filled milk | Skimmed milk | Add non-dairy fat | – | US/developing markets | [LDP] |
| Concentrated milk (fresh, unsterilised) | Pasteurised milk | Evaporate, no retort | Cow | US | [CFR] title only. Arguably merges into Evaporated milk |
| Eggnog | Milk + Cream | Add egg yolk, sugar | Cow | US/UK | [CFR], [LDP]. Composite product, borderline |
| Acidified milk | Pasteurised milk | Direct acidification, no culture | Cow | US | [CFR] title only |
| Recombined / reconstituted milk | Milk powder / Skimmed milk powder (+ AMF) | Redissolve in water, emulsify fat | Cow | Importing countries (Middle East, SE Asia) | UNVERIFIED |
| Lactose-free milk | Pasteurised/UHT milk | Lactase hydrolysis (± ultrafiltration) | Cow | Global | UNVERIFIED |
| Filtered / ultrafiltered milk | Skimmed + cream fractions | Membrane UF/RO concentrates protein, removes lactose | Cow | US/Canada/EU | UNVERIFIED |
| Microfiltered (ESL) milk | – | – | – | – | Already covered by ESL milk node; do not add |
| A2 milk | Milk (raw) | **None**: herd genetics (A2 β-casein cows) | Cow | NZ/Aus origin | UNVERIFIED. Not a processing step, so leave it out of a "made from" graph, like haymilk |
| Flavoured milk (chocolate, strawberry, banana) | Pasteurised/UHT milk | Add sugar, cocoa/flavour, stabiliser | Cow | Global | UNVERIFIED |
| Malted milk (drink/powder) | Milk powder + malted barley/wheat extract | Mix and dry | Cow | UK/US (Horlicks 1873) | UNVERIFIED |

### Inferences
- Baked milk is the only fluid-milk item that adds a new chemical process (Maillard browning) and opens a branch to products the other researchers will find (ryazhenka, varenets).
- Toned milk shows a fact about South Asian dairy: buffalo milk is so rich that it is diluted. That adds a culture and a "standardise downward" step.
- A2 milk and haymilk differ in the herd, not in a processing step, so they should not be nodes.

### Gaps
- Primary definitions for lactose-free, UF milk, recombined milk and flavoured milk were not fetched (Codex/eCFR were blocked).

---

## Creams & dairy fats: what is missing?

### Takeaway
The missing distinct nodes are **anhydrous milk fat / butteroil**, an industrial fat that is not the same as ghee, **malai** (skin skimmed off heated milk), **half-and-half / light (single) cream**, **whipped cream incl. aerosol**, **dry cream (cream powder)** and the gelatine-set cream **Qimiq**. Crème épaisse vs crème liquide is a culturing/viscosity distinction. Crème épaisse maps onto the existing Crème fraîche node and crème liquide onto Cream, so they need no new nodes.

### Cited Findings
- Malai is the cream layer that forms on cooled, heated whole milk (heated to ~80 °C for about an hour, then cooled). From India. Kaymak is the Turkish analogue from buffalo or cow milk. Clotted cream forms in shallow pans as heated milk cools (England). — [LDP](https://en.wikipedia.org/wiki/List_of_dairy_products)
- Whipped cream = cream beaten until fluffy, often sweetened. Qimiq = light cream with a little gelatine, patented 1995. — [LDP](https://en.wikipedia.org/wiki/List_of_dairy_products)
- US standards treat Heavy cream (131.150), Light cream (131.155), Light whipping cream (131.157), Half-and-half (131.180) and Dry cream (131.149) as separate products. — [CFR](https://www.law.cornell.edu/cfr/text/21/part-131/subpart-B)
- Codex CXS 280-1973 defines anhydrous milkfat / butteroil as fat made only from milk or milk products, with nearly all water and non-fat solids removed. Ghee is defined separately: made only from milk, cream or butter, with a "developed flavour and physical structure". Tetra Pak's handbook gives AMF and butteroil a chapter of their own, separate from butter. — [TP](https://dairyprocessinghandbook.tetrapak.com/node/655) (search-result summary, not full text)

### Catalogue
| Product | Made from | Step | Animal | Region | Notes / source |
|---|---|---|---|---|---|
| Malai | Fresh whole milk | Heat ~80 °C ~1 h, cool, lift the skin | Buffalo/cow | South Asia | [LDP]. **Top pick**. Parent is milk, not separated cream. Parent of rabri, malaiyo |
| Half-and-half | Milk + Cream | Blend to ~10.5–18% fat | Cow | US | [CFR]. Fat % UNVERIFIED |
| Light / single cream | Cream | Standardise to ~18–20% fat | Cow | US/UK | [CFR]. Overlaps with Coffee cream; merge? |
| Light whipping cream | Cream | Standardise ~30–36% | Cow | US | [CFR]. Merge into existing Whipping cream |
| Heavy cream | Cream | Standardise ≥36% | Cow | US | [CFR]. Merge into Whipping/Double cream |
| Whipped cream (incl. Chantilly) | Whipping cream | Whip in air (± sugar) | Cow | Global | [LDP] |
| Aerosol whipped cream | Whipping cream (UHT) | Pressurise with N₂O, foam on dispense | Cow | US origin | UNVERIFIED. Same product as whipped cream, aerated a different way; one node or a sub-label |
| Dry cream / cream powder | Cream | Spray-dry | Cow | – | [CFR] |
| Qimiq | Cream | Add gelatine, heat-treat | Cow | Austria | [LDP]. Austria origin UNVERIFIED |
| Anhydrous milk fat (AMF) / butteroil | Cream or Sweet cream butter | Melt, centrifuge, vacuum-dry (>99.8% fat) | Cow | Industrial/global | [TP] for the definition. Process figures UNVERIFIED |
| Fractionated milk fat | AMF | Crystallise, separate high/low-melting fractions | Cow | Industrial | UNVERIFIED |
| Crème épaisse / crème liquide | – | – | – | France | Not new: épaisse = cultured (Crème fraîche), liquide = Cream |

### Inferences
- Malai is the best "missing culture" in this family. It is the South Asian twin of kaymak and clotted cream, and it feeds several cooked sweets.
- The existing node "Clotted cream (kaymak)": if its graph parent is "Cream", that is defensible for English clotted cream (which is often made from cream). Kaymak and malai traditionally come from heated whole milk. Flag this as ambiguous.
- AMF deserves its own node, separate from "Butterfat (ghee)": ghee's flavour comes from browning, while AMF is neutral and made by centrifuge.

### Gaps
- Exact Codex/EU fat thresholds for creams were not retrieved.

---

## Butters: what is missing?

### Takeaway
Spiced or aged butter fats are the distinctive gaps. **Smen** (salted, herbed, aged and fermented butter of North Africa and Yemen) and **niter kibbeh** (spiced clarified butter of Ethiopia and Eritrea) stand out. **Brown butter** is a cooking step that could be one node. Salted and unsalted butter, whipped butter and spreadable butter are formulation variants. They are better as labels on Sweet cream butter than as nodes.

### Cited Findings
- Smen: butter is boiled, skimmed and strained into a jar, then salted. Fenugreek is sometimes boiled in, and thyme added "as a starter". It is aged, traditionally buried in the ground (citation needed). Made from sheep or goat milk, and also cow in Morocco. North Africa and Yemen (smoked in a gourd). Aged Moroccan smen smells like blue cheese and is valued more with age. Levantine "samneh" is a clarified-butter-like product cooked longer than clarified butter. — [SMEN](https://en.wikipedia.org/wiki/Smen)
- Niter kibbeh: clarified butter simmered with besobela, koseret, fenugreek, cumin, coriander, turmeric, korarima etc., then strained. Ethiopia and Eritrea. Prepared like ghee. (Stub article.) — [NITER](https://en.wikipedia.org/wiki/Niter_kibbeh)
- Yak butter is a staple and trade item on the Tibetan Plateau and in South-Central Asia. Ghee comes from ancient India. — [LDP](https://en.wikipedia.org/wiki/List_of_dairy_products)

### Catalogue
| Product | Made from | Step | Animal | Region | Notes / source |
|---|---|---|---|---|---|
| Smen (aged, Maghreb) | Sweet cream/Cultured butter | Boil, salt, herb, age in a sealed jar or underground | Sheep/goat (cow in Morocco) | Morocco, Algeria, Tunisia, Yemen | [SMEN]. **Top pick**: an aged, fermented fat |
| Samneh / samna (Levant) | Butter | Cook longer than clarified butter | Sheep/goat/cow | Levant, Gulf | [SMEN]. Merge with Clarified butter / ghee as a regional name |
| Niter kibbeh | Clarified butter | Simmer with spices, strain | Cow | Ethiopia, Eritrea | [NITER]. **Top pick** |
| Yak butter | Churned yak cream/milk | Churning | Yak | Tibet, Himalaya | [LDP]. Butter from another species. Parent of butter tea (po cha), a composite that is out of scope |
| Brown butter (beurre noisette) | Sweet cream butter | Heat until the milk solids brown | Cow | France / global | UNVERIFIED. A kitchen step. Ghee is "brown butter, then strained", so this could be an intermediate |
| Makhan / makkhan | Dahi (yoghurt) or malai | Churn cultured whole milk/curd | Buffalo/cow | South Asia | UNVERIFIED. Parent is Yoghurt (fermented, so it sits outside this family). Same as "Cultured butter" in function. Its interest is that it is churned from whole curd, not cream |
| Whipped butter | Sweet cream butter | Incorporate air/N₂ | Cow | US | UNVERIFIED. A variant; label |
| Spreadable butter | Butter (+ oil, or AMF fractions) | Blend/fractionate | Cow | UK/EU | UNVERIFIED. Variant |
| Salted vs unsalted | – | Add salt | – | – | Not separate nodes (formulation) |
| Compound butter (beurre maître d'hôtel) | Butter | Mix in herbs | Cow | France | UNVERIFIED. Culinary, not a dairy product; skip |
| Bog butter | Butter | Bury in peat bog (preservation/aging) | Cow | Ireland/Scotland (archaeological) | UNVERIFIED. A historical cousin of smen's underground aging; good as a note |
| Recombined butter | AMF + skim milk powder + water | Re-emulsify | Cow | Industrial | UNVERIFIED |

### Inferences
- In the graph, the chain Butter → Clarified butter → Niter kibbeh and the chain Butter → Smen (aged) add new edge types: spicing and aging a fat. No current node has either.

### Gaps
- No primary or ethnographic source was fetched for bog butter, makhan or yak butter processing.

---

## Cooked / caramelised / sweetened milks: what is missing?

### Takeaway
This is the richest gap. **Sweetened condensed milk** is a basic missing node. **Dulce de leche** (with cajeta, doce de leite, arequipe, manjar blanco and confiture de lait as names of one node) and the South Asian **khoa** tree (khoa → peda, kalakand, barfi, gulab jamun; plus rabri and basundi from reducing milk) are the most distinctive.

### Cited Findings
- Dulce de leche: milk + sugar simmered 1–2 h with constant stirring until golden. It reduces to about 1/6 of the original volume. Colour comes from caramelisation and Maillard reactions. Baking soda is optional. Names: cajeta (Mexico, goat milk), confiture de lait (Normandy, Savoy), doce de leite (Brazil, records in Minas Gerais from 1773), arequipe (Colombia, Venezuela), manjar blanco (Bolivia, Ecuador, Peru). Dulce gatas uses carabao milk (Philippines). A variant comes from pressure-cooking cans of sweetened condensed milk. — [DDL](https://en.wikipedia.org/wiki/Dulce_de_leche)
- Khoa: full-fat milk simmered for hours in a shallow iron pan until only the solids remain (~80 °C to avoid scorching). A fast method uses whole milk powder and skim milk. Types: batti (~20% moisture, hard, gratable, ages up to a year), chikna (~50%), dhap (soft, for gulab jamun and pantua), daanedaar (grainy, acid-coagulated, for kalakand), pindi (dry, for peda). Barfi and gujia also use khoa. — [KHOA](https://en.wikipedia.org/wiki/Khoa)
- Rabri: sweetened milk heated in a wide kadhai. Each cream skin that forms is lifted off and set aside, and this repeats. The layered "lachha" rabri results. India, Nepal, Pakistan, Bangladesh. Basundi is "similar". — [RABRI](https://en.wikipedia.org/wiki/Rabri)
- Basundi: milk slowly boiled down to half and sweetened (India). Malaiyo: boiled, sugared, saffron milk left overnight on a rooftop and churned to foam (Varanasi). Bhuna khoya: a Khangarh (Pakistan) khoa variety. Condensed milk = evaporated + sweetened. Junket = sweetened milk set with rennet. Sütlaç: Turkish rice pudding. Custard / crème anglaise: milk + egg yolk cooked. — [LDP](https://en.wikipedia.org/wiki/List_of_dairy_products)
- Sweetened condensed milk is a separate US standard (131.120). — [CFR](https://www.law.cornell.edu/cfr/text/21/part-131/subpart-B)

### Catalogue
| Product | Made from | Step | Animal | Region | Notes / source |
|---|---|---|---|---|---|
| Sweetened condensed milk | Milk (whole or skim) | Add sugar, evaporate (no sterilisation: sugar preserves it) | Cow | Global (US 1856, Borden — UNVERIFIED) | [CFR], [LDP]. Parent: Fresh whole milk, not Evaporated milk (sugar goes in before evaporation) |
| Dulce de leche (= cajeta, doce de leite, arequipe, manjar blanco, confiture de lait, dulce gatas) | Fresh whole milk (+sugar). Alt: Sweetened condensed milk | Long open cooking → Maillard/caramel | Cow; goat (cajeta); carabao (dulce gatas) | Latin America, France, Philippines | [DDL]. **Top pick**. ONE node. The goat milk of cajeta is the only notable difference |
| Khoa / khoya / mawa | Fresh whole milk (buffalo preferred) | Open-pan evaporation to a solid | Buffalo/cow | South Asia | [KHOA]. **Top pick**. Batti/chikna/dhap are moisture grades, so one node |
| Peda / pedha | Khoa (pindi) | Sweeten, cook, shape | – | India | [KHOA] |
| Kalakand | Khoa (daanedaar; acid-coagulated grains) | Sweeten, set | – | India | [KHOA]. Parent ambiguous: daanedaar khoa involves acid coagulation (like chhena) |
| Barfi | Khoa | Cook with sugar, flavouring; cut | – | South Asia | [KHOA] |
| Gulab jamun | Khoa (dhap) | Deep-fry balls, soak in syrup | – | South Asia | [KHOA]. Composite sweet; optional |
| Rabri | Fresh whole milk (via repeated Malai skins) | Reduce, collect skins layer by layer | Buffalo/cow | South Asia | [RABRI]. Parent = Malai (or milk). Ambiguous |
| Basundi | Fresh whole milk | Boil down ~½, sweeten | – | Maharashtra/Gujarat | [LDP]. Near-duplicate of rabri without the skins. Could be one node, "Reduced sweet milk (basundi/rabri)" |
| Malaiyo (makhan malai, daulat ki chaat) | Fresh whole milk / cream | Boil, sweeten, expose overnight, whip to foam | – | Varanasi, Delhi, Lucknow | [LDP]. Odd and distinctive (dew-set foam) |
| Junket | Milk (sweetened) | Set with rennet, no whey drained | Cow | UK/US | [LDP]. Parent is milk. Borderline "curd" family |
| Kheer / payasam / sütlaç / rice pudding | Milk + rice | Simmer | – | South Asia, Turkey, Europe | [LDP] (sütlaç). Composite dish; probably exclude |
| Custard / crème anglaise | Milk/Cream + eggs | Cook | – | Europe | [LDP]. Composite; exclude, or a note only |
| Baked milk | (see Fluid section) | | | | Belongs here as much as in fluid milks |
| Brunost / mysost | – | – | – | Norway | Note only: caramelised **whey**, already in graph as Whey cheese |

### Inferences
- If the graph wants one "caramelised milk" node, use dulce de leche and put the other names in the notes. Cajeta could be a separate node only to show a goat-milk branch.
- Khoa sits at the centre of South Asian dairy sweets, as cheese curd does in Europe. One khoa node with 2–3 children (peda, barfi, kalakand) adds a lot to the picture.

### Gaps
- No source fetched for the history or date of sweetened condensed milk, or for the kheer/payasam process.

---

## Dried & concentrated milks: what is missing?

### Takeaway
The missing items are **dry whole milk** vs **instant (agglomerated) powder**, **cream powder** (dry cream, see above), **buttermilk powder**, **infant formula** and **malted milk**. Chhurpi belongs to the cheese researcher. Batti khoa (aged, gratable) is a dried "concentrated" form that sits on the khoa node.

### Cited Findings
- "Dry whole milk" (131.147), "Nonfat dry milk" (131.125) and "Dry cream" (131.149) are separate US standards. — [CFR](https://www.law.cornell.edu/cfr/text/21/part-131/subpart-B)
- Infant formula is industrially processed food for infants under 12 months, sold as powder or liquid. — [LDP](https://en.wikipedia.org/wiki/List_of_dairy_products)
- Batti khoa (~20% moisture) can be aged up to a year and grated. — [KHOA](https://en.wikipedia.org/wiki/Khoa)
- Bovine colostrum is sold as spray-dried powder and as tablets (hyperimmune colostrum, 2011 trial). — [COL](https://en.wikipedia.org/wiki/Colostrum)

### Catalogue
| Product | Made from | Step | Notes |
|---|---|---|---|
| Instant milk powder | Milk powder / Skimmed milk powder | Agglomerate (± lecithin coating) | UNVERIFIED. Variant |
| Buttermilk powder | Buttermilk (sweet) | Spray-dry | UNVERIFIED. Industrial ingredient |
| Cream powder (dry cream) | Cream | Spray-dry | [CFR] |
| Butter powder | Cream/AMF + carrier | Spray-dry | UNVERIFIED. Minor |
| Infant formula | Skimmed milk powder + Whey protein concentrate (+ veg oils, lactose) | Blend, spray-dry | [LDP]. Parent ambiguous: several parents |
| Malted milk powder | Milk powder + malt extract | Mix/vacuum-dry | UNVERIFIED |
| Milk tablets | Milk powder | Compress | UNVERIFIED. Asian/Chinese snack ("nǎi piàn"); Mongolian/Tibetan dried forms belong to the cheese/curd researcher |
| Colostrum powder | Colostrum | Spray-dry | [COL] |
| Milk protein concentrate / micellar casein | Skimmed milk | Ultrafiltration/microfiltration, dry | UNVERIFIED. Industrial counterpart to WPC |
| Caseinate | Skimmed milk → acid casein | Precipitate casein, neutralise, dry | UNVERIFIED. Parent sits in the curd branch |

### Inferences
- From the whey side, the graph already has WPC/WPI. MPC and caseinate would give the casein side an industrial "protein ingredient" counterpart.

### Gaps
- Codex CXS 207 (milk powders and cream powder) was not retrieved.

---

## Frozen dairy: what is missing?

### Takeaway
**Ice cream** is the main missing node. **Kulfi** (reduced milk frozen without churning) and **dondurma/booza** (thickened with salep, flavoured with mastic, stretchy) add distinct processes. Gelato, soft serve, frozen custard and ice milk are formulation or overrun variants. Frozen yoghurt's parent is Yoghurt.

### Cited Findings
- Kulfi: sweetened milk slow-cooked and reduced (caramelising sugar, browning proteins), poured into clay kulhar moulds, sealed, and frozen in a matka of ice and salt. It is **not churned**, so it holds little air and is denser and slower to melt. Mughal Delhi, 16th c. Name from Persian *qulfi* "covered cup". — [KULFI](https://en.wikipedia.org/wiki/Kulfi)
- Booza: elastic, slow-melting ice cream from Syria. Dondurma: Turkish, made with milk, sugar, salep and mastic. Gelato: Italian, milk, cream, sugars, purées. Soft serve: air incorporated in freezing (US). Frozen custard: includes eggs (US). Ice milk: <10% milkfat. Semifreddo: semi-frozen with whipped cream. Spaghettieis: Mannheim. — [LDP](https://en.wikipedia.org/wiki/List_of_dairy_products)

### Catalogue
| Product | Made from | Step | Notes |
|---|---|---|---|
| Ice cream | Cream + Milk (+ SMP, sugar) | Pasteurise mix, age, freeze while whipping air in | [LDP]. Core node |
| Gelato | Milk (more milk, less cream) | Slow churn, low overrun | [LDP]. Variant, one node with ice cream or a child |
| Soft serve | Ice cream mix | Freeze-dispense with air | [LDP]. Variant |
| Frozen custard | Ice cream mix + egg yolk | Freeze | [LDP]. Variant |
| Ice milk | Milk | Freeze (<10% fat) | [LDP]. Variant |
| Kulfi | Basundi/rabri-like reduced milk (Fresh whole milk) | Reduce, mould, freeze unchurned | [KULFI]. **Top pick**. Parent could be "Reduced sweet milk (basundi)" |
| Dondurma / booza | Milk + salep + mastic | Freeze while pounding/kneading | [LDP]. Distinctive (orchid-tuber flour). Dondurma and booza = one node. Goat milk in Maraş dondurma: UNVERIFIED |
| Frozen yoghurt | Yoghurt | Freeze with sugar, air | Parent = existing Yoghurt node (fermented). UNVERIFIED |
| Sherbet (US) | Fruit + milk/cream (1–2% fat) | Freeze | UNVERIFIED |
| Semifreddo | Whipped cream (+ egg) | Semi-freeze | [LDP]. Culinary |

### Gaps
- Fat thresholds for ice cream (21 CFR 135) and for gelato were not retrieved.

---

## Colostrum products: what is missing?

### Takeaway
There is no colostrum node at all. Add **Colostrum** (beestings) as a sibling of Milk (raw). Its children are **colostrum pudding** (one node covering beestings pudding, kalvdans, ábrystir, kharvas, junnu, groosniuys), **colostrum cheese** (molozyvo, a variant of leipäjuusto/uunijuusto) and **colostrum powder**. The colostrum branch is a top pick, because heat-setting colostrum like egg is unique in dairy.

### Cited Findings
- Kalvdans (Sweden): unpasteurised colostrum mixed with water and heated gently. Its high protein content makes it set like egg. The name means "calf dance" (from its jiggle); kalvost is an old name (1682). Råmjölkspannkaka is a related dish. Finnish uunijuusto is "similar". Equivalents: Iceland *ábrystir*, England "beestings", India *kharvas* (buffalo colostrum). Swedish raw-milk sales are limited to the farm. — [KALV](https://en.wikipedia.org/wiki/Kalvdans)
- Junnu/ginnu (Karnataka, Andhra Pradesh, Telangana): a sweet, cheese-like dish of cow or buffalo colostrum, ideally from day 2. It is sometimes adulterated with ordinary milk. Molozyvo (Ukraine) is a sweet colostrum cheese. Leipäjuusto (Finland) is traditionally made from cow colostrum or reindeer milk. Groosniuys (Isle of Man) is a colostrum pudding. Colostrum sweets are sold in Salem, Tamil Nadu. — [COL](https://en.wikipedia.org/wiki/Colostrum)
- The list article describes junnu as steamed with jaggery, cardamom and pepper, and uunijuusto as salted colostrum baked in an oven. — [LDP](https://en.wikipedia.org/wiki/List_of_dairy_products)
- Colostrum powder is spray-dried. — [COL](https://en.wikipedia.org/wiki/Colostrum)

### Catalogue
| Product | Made from | Step | Animal | Region |
|---|---|---|---|---|
| Colostrum (beestings, råmjölk) | – (sibling of Milk (raw)) | First milking after calving | Cow/buffalo | Global |
| Colostrum pudding (kalvdans, råmjölkspudding, beestings pudding, ábrystir, groosniuys) | Colostrum | Dilute, sweeten/spice, bake or steam until it sets | Cow | Sweden, England, Iceland, Isle of Man |
| Junnu / kharvas | Colostrum | Add jaggery, cardamom; steam | Cow/buffalo | S. India / Maharashtra |
| Uunijuusto | Colostrum | Salt, bake | Cow | Finland |
| Molozyvo | Colostrum | Sweet cheese (details thin) | Cow | Ukraine |
| Colostrum powder / tablets | Colostrum | Spray-dry / compress | Cow | Industrial supplement |

### Inferences
- Junnu, kharvas and kalvdans are the same technique (heat-set colostrum) in different cultures, so make **one node** with regional names. Uunijuusto (salted, baked, called "cheese") could merge with them or stay separate, because it is savoury. Leipäjuusto is made with rennet from ordinary milk today, so it belongs to the cheese researcher.

### Gaps
- "Råmjölkspudding" was not confirmed as a term (the Wikipedia page is absent; the Kalvdans article uses kalvdans/råmjölkspannkaka). Kharvas details rest on one secondary mention.

---

## One node or several? Ambiguous parents, corrections, and the ~6 top picks

### Takeaway
Merge regional names that share one technique. Split items only where the process or animal differs. The ~6 most valuable additions are: **Baked milk**, **Malai**, **Khoa** (with peda/barfi), **Dulce de leche** (cajeta named), **Smen / niter kibbeh** (aged or spiced butter fat), **Kulfi**, and the **Colostrum** branch (colostrum pudding). If space allows, add the core basics **Sweetened condensed milk**, **Ice cream** and **Anhydrous milk fat**.

### Cited Findings (merge judgements)
- Dulce de leche, cajeta, doce de leite, arequipe, manjar blanco, confiture de lait: one technique, regional names. Cajeta differs only in using goat milk. — [DDL](https://en.wikipedia.org/wiki/Dulce_de_leche)
- Khoa batti / chikna / dhap / pindi / daanedaar: moisture or texture grades of one product. — [KHOA](https://en.wikipedia.org/wiki/Khoa)
- Kalvdans, beestings, ábrystir, kharvas: named as equivalents. — [KALV](https://en.wikipedia.org/wiki/Kalvdans)
- Maghreb smen (aged, fermented) ≠ Levantine samneh (a clarified-butter equivalent). — [SMEN](https://en.wikipedia.org/wiki/Smen)
- Codex separates AMF/butteroil from ghee. — [TP](https://dairyprocessinghandbook.tetrapak.com/node/655)

### Merge / split table
| Group | Verdict |
|---|---|
| Dulce de leche / cajeta / confiture de lait / doce de leite / arequipe / manjar blanco / dulce gatas | ONE node (note cajeta = goat, dulce gatas = carabao) |
| Basundi / rabri | Two nodes are defensible (rabri collects the skins). One node, "reduced sweet milk", is also OK |
| Khoa grades | ONE node |
| Smen (Maghreb) vs samneh (Levant) | TWO: smen is aged; samneh merges into Clarified butter |
| Ghee vs AMF/butteroil vs clarified butter | Keep ghee; ADD AMF as an industrial node; consider merging "Clarified butter" with samneh |
| Kaymak / clotted cream / malai | The existing node covers kaymak and clotted cream. ADD malai (parent is heated milk) |
| Crème épaisse / liquide | No new node |
| Ice cream / gelato / soft serve / frozen custard / ice milk | ONE node (ice cream), or ice cream + gelato |
| Dondurma / booza | ONE node |
| Kalvdans / beestings pudding / ábrystir / kharvas / junnu / groosniuys | ONE node (junnu could be split for its spices) |
| Salted/unsalted, whipped, spreadable butter | Not nodes (formulation labels) |
| A2, haymilk | Not nodes (herd and feed, not processing) |

### Ambiguous parents / correction flags
- **Sweetened condensed milk**: parent is milk, not Evaporated milk. Sugar is added before evaporation, and there is no retort sterilisation. (Process detail UNVERIFIED beyond [CFR]/[LDP] definitions.)
- **Dulce de leche**: two real routes, milk + sugar or a cooked can of condensed milk ([DDL]). Use milk as the canonical parent.
- **Rabri**: parent is Malai or milk. **Kulfi**: parent is reduced milk (basundi/rabri-like) or milk.
- **Kalakand**: daanedaar khoa is acid-coagulated ([KHOA]), so it touches the Curd branch.
- **Toned milk** and **infant formula** have several parents (milk + skim powder; SMP + WPC).
- **Clotted cream (kaymak)**: check whether the graph's parent is Cream or Milk. Kaymak and malai come from heated whole milk ([LDP]).
- **Ryazhenka/varenets** (fermented; other researcher): parent should be Baked milk, not plain milk ([BAKED]).
- **Frozen yoghurt**: parent Yoghurt. **Makhan**: parent dahi/Yoghurt.
- **Butterfat (ghee)** node label: Codex treats ghee and AMF as different ([TP]). Labelling ghee "Butterfat" mixes them up.

### Gaps
- Primary Codex/EU text could not be fetched, so merge judgements for creams and powders rest on US CFR section titles and secondary sources.
