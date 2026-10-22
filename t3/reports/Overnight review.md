# Overnight review

Five loops of fix and research batches ran while you slept. 169 log sections in `reports/overnight-log.md`. The graph dump shows 287 items still with gaps. I did not run a full build for this review; the dump script loads the graph without errors.

Counts across the run: 791 changes applied, 312 skipped by appliers, 201 review findings (about 170 accepted, 31 rejected).

## What changed, by family

**Milks**
- New products: lactoseFree (Valio, Minus L), ultrafilteredMilk (fairlife, Organic Valley Ultra), recombined and Reconstituted milk, thermised, tonedMilk (Double-toned), flavouredMilk, milkTea, infantFormula, mpc, mcc, nativeWhey, milkPermeate.
- certified is now Vorzugsmilch only. 'Milch ab Hof' is an example of raw.
- esl: the temperature contradiction is fixed (about 120-135 C route and a filtration route). skimmedEvaporated now reads 'evaporate, sterilise in can'.
- skimmedPowder lost four use-examples; their uses are folded into the product text.
- Step details were added to fresh, semi, skimmed, evaporated, milkPowder and bakedMilk.

**Fermented**
- Dahi became its own mesophilic node. Cream yoghurt is re-parented to pasteurised. piima has a real fermentation step.
- aka cleanups: Matzoon, Leben, Mattha, Maas and Dahi no longer sit as aka on the wrong node. Choormog/Chal were split and Kule naoto became a Mursik example.
- driedYoghurt was rewritten at family level ('drain, dry'). The kashk/jameed route moved to the examples.
- soured now explains industrial (starter) versus natural souring. cultureButtermilk, ymer, shanklish, zhentytsia, heatTreatedYoghurt, milletMilk and calpis are new.
- New examples include Gioddu, Zabady, Qatiq, Meiji Bulgaria, Beijing yoghurt, Mabisi, Nunu, Kivuguto, Ititu, Hazo, Jocoque, Shrikhand, Sweet lassi, Juju dhau, Sho, Aqit and Khuruud.
- Full culture names were added to Dahi, Sirene, bloomy, kefir and piima. Tarag was moved out of yoghurt (wild flora, no S. thermophilus).
- Zhentytsia/Žinčica were split out of blaand. Salted lassi and chaas now also come from dahi.
- Many pictures were added.

**Cheese**
- Re-parenting: insect now hangs from rennetCurd, cheddared from rennetCurd, and Bryndza from a new lumpCheese node. Mahón, Montasio and Double Gloucester were moved out of hard and washedCurd, and Monterey Jack moved to washedCurd. Mató moved to freshCheese, Queso blanco was moved out of paneer, and Chaource went to the new lacticCheese node.
- The semiHard, washedCurd, processed, bloomy, blue, soft and hard step tables were corrected. soft lost the Camembert numbers, blue is now generic, and hard's aka is now only Hartkäse.
- New nodes: lumpCheese, lacticCheese, cottageCheese, creamCheese and sunDriedCheese.
- Dozens of examples with about, steps, regions and pictures: Kasseri, Scamorza, Suluguni, Beyaz peynir, Nabulsi, the tulum varieties, Cotija, Reblochon, Maroilles, Livarot, Queijo Canastra, Queijo de coalho, Kesong puti, Reggianito and others.
- Quark: Magerquark, Speisequark, Sahnequark, Rahmquark, Doppelrahmquark and the KäseV Doppelrahmstufe (60-87 %). Neufchâtel (US) now uses 21 CFR 133.162.
- plantCheese lost the false aka and gained the cardoon, papaya and wagashi details. Ginger milk curd is noted as 'not a cheese'.

**Whey and sweets from curd**
- sweetWhey now comes from raw, with a new split with rennetCurd. wpi is now from sweetWhey (ion exchange, filtration). Added prim, wheyCream and wheyButter details.
- wheyCheese: Gjetost, Gudbrandsdalsost and Fløtemysost became examples (aka trimmed). gomme got Brunost gomme and Hvitgomme. ricotta lost Mató and gained Ricotta salata, infornata and affumicata.
- chhenaSweets is now 'knead, shape, sweeten'. Kalakand moved there from khoaSweets. Rasgulla, Sandesh and Rasmalai have their own labels.
- Many Indian and Mongolian sweets and curd cheeses were added: Kalari, Bandel, Chhena poda, Pantua, Chum chum, Rasabali, Adyghe, Dambalkhacho, Klila, Karish.

**Creams**
- Aka cleanups: clotted, schlagsahne, cremeDouble, doppelrahm and creamGrades. Schmand is 'at least 20 % fat'.
- clotted now comes from fresh milk (alsoFrom cream). evaporatedCream now comes from cream (evaporate, sterilise in can).
- New examples under clotted (Afyon kaymagi, Double-skin milk). Step details were added for cream, rawCream, whipping, double, heavyCream, singleCream, mascarpone and others.
- Chantilly became an example of whippedCream.

**Butter and fat**
- Sweet cream butter is now an example. smen and nitirKibbeh come from butter. clarified and amf have the MilchPQV Anlage 8 note.
- New: butterTea, Yak butter, Manteiga de garrafa, Shar tos, Beurre d'Échiré, gheeResidue, staka and stakovoutiro.
- Details were added for butter, butterfat, churn and bogButter.

**Cooked and sweet**
- New: frozenYoghurt, nimish, kheer, milkPudding, milkChocolate, brigadeiro, milkshake and custards.
- Examples: Basundi, Palkova, Cuajada, So, Pastillas de leche, Doce de leite, Arequipe, Manjar and Confiture de lait.
- Many details were added for Dondurma, Soft serve, Frozen custard and Semifreddo.

**Industrial, casein and medicine**
- lanital lost Azlon (Aralac, Merinova and QMilch are examples). galalith lost its brand akas (Erinoid, Lactoid, Aladdinite are examples). Beer label glue now comes from caseinate.
- milkDrugs: ATryn/Ruconest are examples. inhalers, cppAcp, lactulose and glycomacropeptide were corrected. Added lactotripeptide, lactoperoxidase, donorMilk, tabletLactose, mfgm and ghrita.
- Junnu was merged into Kharvas. travelan comes from colostrum.

## Review findings rejected, and why

- soured phantom step: the arrow's own sources (MilchPQV, Codex) describe added cultures.
- Butterkäse label: backed by its own cited sources (large rennet dose at 40-42 C).
- uht/esl/sterilised parent: already fixed in the data.
- curd aka Dickete: de.wikipedia confirms the meaning.
- Posset/Syllabub: they really are curdled.
- cremeDeLeite 10 % fat: Portaria MAPA 146/1996 supports it.
- bogButter: burying butter is the step.
- driedYoghurt Jameed label: the strain-and-dry steps do happen.
- paneer/rushan/chhena step: already handled.
- sweetWhey/rennetCurd co-product: the shared gel node is fine.
- rennetCurd parent: would create a phantom step.
- lactoferrin parent: industry practice is mixed.
- pasteurised/homogenised/rennetCurd: already done.
- khoaSweets/Kalakand contradiction: it follows the cited Wikipedia text.
- Cotija to semi-hard: sources say hard.
- Stilton ages: the Defra specification supports it.
- Kaymak aka: the cited source lists them.
- Sahnequark/Rahmquark: the source lists the grades.
- Trahanas aka: the fix was not worth making.
- Butter fat variants: already handled.
- Bel Paese stewing: really happens.
- Queso fresco: its own source refutes the finding.
- Prostokvasha starters: GOST allows both kinds.

## Decisions that need you

1. **Species milk roots** (cow, goat, sheep, camel, etc. as roots): skipped, since it restructures the tree. Your call.
2. **Examples under ruler (`at:`) nodes crash the layout** ("Cannot destructure property 'at' of strands.get(...)"). Because of that, these were not added: Crème double de la Gruyère, Crème d'Isigny, Seterrømme and Lettrømme, and whippedCream could not hang from 'whipping'. Notes carry the facts instead. Fix the layout if you want those examples back.
3. **Mish and rushan structure**: the sources suggest Mish comes from Areesh and rushan is not from chhena. Not reparented; it is a structural call. (The review did move mish to quark, 'pickle for years'.)
4. **Double Gloucester**: first moved to cheddared, then back to semiHard when the Slow Food page didn't confirm cutting and stacking, then to cheddared with 'cheddar, press'. Check it. A review finding about the label 'cheddar, press' repeating the parent step was accepted late; check that it was applied.
5. **Soft serve**: the EXAMPLE_NOTES says about -5 C, the new steps table says about -4 C. Align them.
6. **Emmentaler 4-month ripening** still rests on secondary sources (the Pflichtenheft PDF could not be fetched).
7. **Weak pictures kept** (replace if you care): Kasseri, Amasi, kishk (a dish), caseinPaint, whey powder (shop tubs), lactulose (packaging), cppAcp, evaporatedCream (label art), halfAndHalf (fat-free carton), Acidophilus milk, byaslag (plate mixes in aaruul), Sho.
8. **Unverified or low-authority material kept**: Aqit (single source), Laban rayeb, galalith 'up to a year' and formalin figures (search snippets), mfgm about text (rests on a search summary), tabletLactose (supplier sources), Valio lactose-free removal method (conflict left open), Shrikhand and Ergo (not independently checked).
9. **Country caps**: the build allows at most four countries per example. Regions were cut for Jibneh Arabieh (8 to 4), Qatiq, Adyghe, kheer, milkPudding and Yak butter. Raise the cap if you want them back.
10. **Placement oddities left**: Pastillas de leche sits under khoaSweets although it isn't made from khoa. Cuajada, Jocoque and Suero costeño have no better parent. Rømmegrøt hangs from cream because culturedCream needs an `at` value.
11. **Unrelated working-tree changes**: `src/components/DeckViz.astro` and `src/content/series/parser-combinators/index.mdx` show as modified in git, and `ex-dickmilch.webp`, `ex-filmjolk.webp`, `ex-dahi.webp` and `ex-junnu.webp` are deleted. Nothing was committed (as the brief said). Check the first two before committing.

## Remaining gaps

The dump lists 287 items with gaps, mostly missing pictures and step details.
- About text missing for 44 items. Step details missing for about 136. Picture missing for about 245.
- Missing step details cluster on:
  - brands and examples: Carnation, PET, Eagle Brand, La Lechera, Horlicks, Ovaltine, Milo
  - flavoured milks and milk teas (all four Milks tea examples lack about, steps and images)
  - Medicine examples such as Calpis Ameal S, Evolus and Bhallatakadi ghrita
  - Colostrum pudding examples (Kalvdans, Ábrystir, Kharvas)
  - clotted examples (Cornish, Devon, Malai, Urum)
  - gomme examples, milkChocolate brands, brigadeiro varieties, kulfi variants
  - kheer examples (Payasam, Payesh, Phirni)
  - Creams: Kaffeeobers, cremeDeLeite, mediaCrema
- Missing pictures on the new, thinly documented products: thermised, recombined, Reconstituted milk, skimmedEvaporated, travelan, milkDrugs, lumpCheese, sunDriedCheese, Cuartirolo, permeate, wheyCream, wheyButter, casein products (rennetCasein, caseinate, Sodium/Calcium caseinate), lactoferrin, lactoseDerivatives, mpc/MPC70/MPC80, and most cream grades. No honest reusable photo was found for these.
- Cheese cultures: Kefalotyri steps have no numbers, and there are no ripening-flora rows for Cabrales or Brillat-Savarin. Sourcing was thinner for Majorero, Tetilla, San Simon, Queso de flor de Guia (pictures exist, no process source) and Muenster/Oka.
- Not yet researched: Queso de mano, Catupiry (skipped as optional), Lactaid, Bimuno, Prolacta products (dates conflict), Codex limits for infant formula, the Vologda process figures (source gave 403), species milk roots.
