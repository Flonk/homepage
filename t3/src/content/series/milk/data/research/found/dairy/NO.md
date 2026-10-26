# Norway (NO) — dairy
Searched:
- WebSearch (English and Norwegian queries, e.g. "Norwegian dairy products traditional", "Wikipedia kulturhistorie melkeprodukter Norge"): every call was refused because this session's web search budget was used up on the first call; no results from it. Not retried.
- English Wikipedia "Norwegian cuisine" (fetched as a page): sour cream porridge, milk-based fish soup, Sandefjordsmør, grøt made with milk, lefse, brunost and gammelost (cheeses, left to the cheese researcher).
- English Wikipedia "List of dairy products" and "List of fermented milk products": generic, no Norway-specific entries.
- English Wikipedia Rømmegrøt, Multekrem, Ymer (disambiguation only; Danish/Swedish product, not Norwegian).
- Norwegian Wikipedia article extracts via the MediaWiki API: Kulturmelk, Surmelk, Kefir, Yoghurt, Skyr, Rømme, Rømmegrøt, Tettemelk (via "Tjukkmjølk"), Kvarg (via "Kesam"), Smør, Smørolje, Kjernemelk, Fløte, Kondensert melk, Kumelk, Geitemelk, Tørrmelk, Myse, Morsmelkerstatning, Multekrem, Prim (disambiguation), Brunost (cheese, not used). Failed or rate-limited and not retried: Skjør, Iskrem (ice cream), Sandefjordsmør (no.wiki, missing), Morsmelkbank (missing), Flødegrøt (missing), Melkeprodukter (empty).
- Europe PMC REST search: "tettemelk", "Norwegian traditional fermented milk", "Norway traditional dairy products", "human milk bank Norway donor milk", "reindeer milk Sami Norway". Only one relevant hit was opened: the Pinguicula vulgaris ropy-milk abstract (PMID 27423953). The other hits were unrelated or not Norwegian.
- Not covered in this run (no source found or not reached): milk tea, milk jam or caramel, milk sweets other than Multekrem, ice cream, infant formula made in Norway in depth, donor milk in Norway (no Norwegian source found), reindeer and Sami milk products, dried curd (non-cheese), ghee as a separate product.
- Second pass: WebSearch budget was used up for the whole session before this pass (shared 200-call limit), so no searches ran. Opened: matoppskrift.no Telemark ølost recipe (WebFetch, method and serving); no.wikipedia Kalvedans and Iskrem (WebFetch, summaries); no.wikipedia Kalvedans and Iskrem extracts (MediaWiki API); Europe PMC search for donor milk with Norway (no Norway-specific paper found; hits were Swedish or international); no.wikipedia Rausjødalsost and Ølost (no page).

## Tettemelk (tjukkmjølk, tjukkmelk; Swedish långmjölk, långfil)
- Animal(s): cow
- Kind: fermented milk (ropy, exopolysaccharide-producing lactococci)
- What it is: a traditional Nordic soured milk that stays firm and does not separate into whey and curd. Rarely eaten in daily life today; the closest modern product is Tjukkmjølk from Rørosmeieriet, which is the first Norwegian farm product to receive a protected geographical indication (PGI).
- How it is made: traditionally warm fresh milk was poured over the leaves of tettegras (butterwort, Pinguicula vulgaris), or the leaves were rubbed on the bottom of the milk pail or put in the strainer, and the milk was left to culture. Once the culture was going it was very robust and easy to keep alive; a cloth dipped in tettemelk and dried was carried by emigrants to America and reactivated in warm milk. Biologiforeningen (June 2009) reported that three people made tettemelk from leaves independently, with both pasteurised and unpasteurised milk. The Pinguicula leaf microbiome contains Lactococcus and genes for exopolysaccharide production, matching the ropy starter cultures of commercial tettemelk.
- Where / who: Røros area and rural Norway traditionally; Østerdalen seter tradition of tjukkøl (sour beer mixed with a cup of tettemelk when the beer had an off taste).
- Sources: https://no.wikipedia.org/wiki/Tettemelk (fetched via API, title Tjukkmjølk redirect) — history, method, PGI note, tjukkøl; https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:27423953&format=json&resultType=core — abstract of Pinguicula ropy-milk paper, confirms Norwegian folklore and the Lactococcus link with tettemelk samples from Norway.
- Unsure: the Pinguicula leaf-culture claim is folklore that the 2016 paper supports at the microbial level; the historical method is disputed (some sources say tettegubber, snails, were used).

## Surmelk (sour milk, general term)
- Animal(s): cow (dairy milk); also goat and sheep in other traditions
- Kind: fermented milk (general category)
- What it is: any milk soured by lactic acid bacteria, which lowers sugar and raises acidity and thickness, and makes it keep longer. In Norway it is mostly a controlled, culture-based process today, not spontaneous as it used to be.
- How it is made: pasteurised milk is inoculated with a specific lactic culture and held warm until it sets; the exact temperatures and times depend on the product.
- Where / who: nationwide; industrial. Its main commercial form is Kulturmelk (see below).
- Sources: https://no.wikipedia.org/wiki/Surmelk — definition, lactic acid process, list of Norwegian soured milks (Kulturmelk, kefir, yoghurt, tettemelk, skjør, kesam/kvarg, rømme).

## Kulturmelk (TINE trademark for soured milk)
- Animal(s): cow
- Kind: fermented milk (drink)
- What it is: TINE's trademark for soured milk. Full-fat version 3.8 % fat; skimmed version 0.4 % fat. Also sold flavoured as TINE Cultura and TINE Biola. TINE says it suits baking as an ingredient.
- How it is made: pasteurised cow milk with added lactic acid bacteria, homogenised and high-pasteurised; some versions with probiotic cultures.
- Where / who: industrial, nationwide, supermarket.
- Sources: https://no.wikipedia.org/wiki/Kulturmelk — trademark, fat levels, flavoured versions, nutrition table from Matvareguiden.no.

## Kefir (Norwegian kefir)
- Animal(s): cow in Norway (sheep and goat in the Caucasus, where it originates)
- Kind: fermented milk (drink)
- What it is: one of the oldest soured-milk types, a nordic kind of yoghurt, made with kefir grains. Norwegian kefir is usually cow-milk based.
- How it is made: milk fermented with kefir grains (a symbiotic culture of bacteria and yeasts). The article gives no temperatures.
- Where / who: industrial in Norway; traditional production in the Caucasus.
- Sources: https://no.wikipedia.org/wiki/Kefir — origin, animals in Norway vs Caucasus, kefir grains.
- Unsure: the Norwegian article is short; the TINE history page it links is not opened.

## Yoghurt (yoghurt, jogurt)
- Animal(s): cow
- Kind: fermented milk (spoon and drink); natural (unflavoured) yoghurt is used in cooking
- What it is: pasteurised milk set by Lactobacillus bulgaricus and Streptococcus thermophilus. Plain yoghurt is an ingredient in many dishes; sweetened, fruit and flavoured versions are eaten on their own; also sold with grain mixes as snacks.
- How it is made: pasteurised milk is inoculated with the two named bacteria and fermented warm until set; the article gives no temperatures.
- Where / who: industrial, nationwide.
- Sources: https://no.wikipedia.org/wiki/Yoghurt — definition, bacteria, uses, product types; https://no.wikipedia.org/wiki/Surmelk — yoghurt is a popular soured milk with roots in Bulgaria.

## Skyr (skjør in Norwegian)
- Animal(s): cow
- Kind: fresh soured milk product (ferskost), fat-free, thick
- What it is: a fat-free dairy product with traditions in Icelandic and Norwegian culture; thicker than yoghurt, slightly sour with some residual sweetness; sold in flavoured versions. The Norwegian variant is written skjør in Bokmål and Nynorsk rules. Q-Meieriene launched the first Norwegian-made skyr in 2009 under licence from Iceland's Mjólkursamsalan. Its trademark was contested; in 2018 the Patent Office revoked it but after appeal Kavli/Q-Meieriene kept it.
- How it is made: skimmed milk pasteurised at high temperature and cooled to about 35 °C; lactic cultures added and fermented 15–20 hours; then heat-treated and filtered to separate the curd; the curd is heat-treated again to finish.
- Where / who: industrial, Norway's main producer Q-Meieriene; Norwegian skjør historically from the same tradition as Icelandic skyr (the Norse settlers brought it to Iceland).
- Sources: https://no.wikipedia.org/wiki/Skyr — production steps (temperatures, times), etymology, Norwegian and Icelandic history, Q-Meieriene launch and trademark case.
- Unsure: the claim that Norse settlers brought skyr from Norway to Iceland is stated in the article; I did not check it against a second source.

## Kesam (kvarg, fresh curd cheese-like product)
- Animal(s): cow (skimmed cultured milk)
- Kind: fresh soured milk product (ferskost), kvarg type
- What it is: a fresh, soured skimmed milk curd, usually called kvarg (German quark). In Norway TINE launched TINE Kesam in 2003 (plain, 1 % fat low-fat version, and vanilla at 0.6 %). Q-Meieriene launched Q-Snjo (vanilla kvarg with jam to stir in) in 2012. Historically skjørost (curd) was made in Norway, especially on the north-west coast until the 1900s; Tacitus' "lac concretum" is cited as a possible ancestor.
- How it is made: pasteurised milk (typically 72 °C for 15 s, skimmed) soured with Lactococcus cultures at about 22 °C for 14–18 hours to pH 4.5–4.7; the curd is then cut and stirred, and the whey separated by filtration or centrifuging. Industrial versions add low-concentration rennet, which the traditional home method did not use.
- Where / who: industrial in Norway; historic home production by farms.
- Sources: https://no.wikipedia.org/wiki/Kvarg (the page opened via the redirect "Kesam") — process, Norwegian history, TINE and Q-Meieriene products.
- Unsure: the kvarg article calls skjørost a quark-like product; cheese researcher may treat skjørost as cheese, so it is mentioned here only as history.

## Rømme (sour cream)
- Animal(s): cow
- Kind: soured cream
- What it is: cream or a mix of whole milk and cream that is soured. Ordinary rømme is 18–20 % fat; seterrømme (from the summer dairy farm) is 35 % fat. The 18–20 % version is sold as "Lettrømme", an imprecise name.
- How it is made: cream is soured with a bacterial culture, either natural or added lactic culture.
- Where / who: traditional and modern; used widely in cooking, also on pancakes and waffles. Seterrømme is linked to summer dairy farms in Norway.
- Sources: https://no.wikipedia.org/wiki/Rømme — definition, fat levels, sales names, uses.

## Rømmegrøt (sour cream porridge)
- Animal(s): cow
- Kind: porridge / traditional dish (milk and cream as main ingredients)
- What it is: a Norwegian porridge in which sour cream is the base ingredient, together with whole milk, wheat flour, butter and salt. Traditionally a delicacy for special occasions and holidays; it marked haymaking (slåttegrøt) and St John's Eve (Jonsok). Regional variations; in some places semolina, cream, rice, or kulturmelk/kefir are added.
- How it is made: the sour cream is heated, flour is cooked in it, milk is added and it is cooked until thick; served with butter, sugar, cinnamon, sometimes raisins and red juice, and cured meat (spekemat, fenalår, flatbrød). In Valdres it is traditionally made from real rømme and served with smørøye (butter), at births, christenings, weddings, funerals.
- Where / who: Valdres, Østerdalen, Vestlandet, Orkdal and Aulestad regional versions; especially summer dairy (seter) farms in Østerdalen.
- Sources: https://en.wikipedia.org/wiki/Rømmegrøt — ingredients, occasions, serving; https://no.wikipedia.org/wiki/Rømmegrøt — regional recipes (Valdres, Østerdalen, Orkdal), seasonal tradition, occasions; https://en.wikipedia.org/wiki/Norwegian_cuisine — rømmegrøt served with cured meat and flatbread.

## Smør (butter)
- Animal(s): cow; the article says also goat, sheep, water buffalo
- Kind: butter
- What it is: butter from cream, which was first a way to preserve milk. In Norwegian tradition the cream is usually soured before churning. Its colour depends on the feed: summer grazing gives a natural yellow, winter dry feed gives a pale butter; old practice added carrot-water to colour it.
- How it is made: cream (35–40 % fat) is separated from whole milk (16–20 litres of milk gives about 1 kg of butter) by hand, a separator or a centrifuge; cream is churned in a stick or crank churn until small butter lumps form; the buttermilk is drained; the butter is worked or pressed to remove water and air and is optionally salted or coloured with herbs.
- Where / who: home and dairy production; historically important as a payment and barter medium (1617 tax reform was paid in butter; a "smørlaup" equal to 18 kg).
- Sources: https://no.wikipedia.org/wiki/Smør — production steps, colour, history.

## Smørolje (butter oil)
- Animal(s): cow
- Kind: clarified butter / butter oil
- What it is: a product made from cream or from melted butter, with nearly all water and non-fat solids removed; 99.9 % milk fat (butter is 83 %). Used for frying, rømmegrøt, béarnaise, soups and glazing; smoke point 182 °C, melts at 30–32 °C, sets at 18–20 °C.
- How it is made: concentration of cream or melted butter until almost all water and solids are removed (the article gives no temperatures).
- Where / who: industrial in Norway.
- Sources: https://no.wikipedia.org/wiki/Smørolje — composition, uses, melting and smoke points.

## Kjernemelk (buttermilk; also kinnemelk, saup)
- Animal(s): cow
- Kind: by-product drink from butter
- What it is: the thin liquid left after butter has separated from cream in churning. Tangy when the cream was soured. Used in baking, soups and sauces. Hardly sold commercially now because butter is usually made from unsoured cream and soured afterwards; the nearest commercial product is kulturmelk.
- How it is made: butter churning; buttermilk is drained off through a sieve.
- Where / who: home and dairy; historically from farms.
- Sources: https://no.wikipedia.org/wiki/Kjernemelk — definition, uses, commercial availability.

## Sandefjordsmør (butter and cream sauce)
- Animal(s): cow
- Kind: butter-based sauce
- What it is: a butter and cream sauce served with fish dishes, such as salmon, garnished with fresh dill and peppercorn. Reputedly first made in Sandefjord (Vestfold) in 1959.
- How it is made: not described in the source.
- Where / who: Norway, served with fish; restaurant and home.
- Sources: https://en.wikipedia.org/wiki/Norwegian_cuisine — sauce description, origin (reputed).
- Unsure: the source says "reputedly" and the Norwegian Wikipedia article for Sandefjordsmør was missing, so the origin is not confirmed elsewhere.

## Fløte (cream)
- Animal(s): cow
- Kind: cream
- What it is: the fatty part of milk, separated from cow's milk, pasteurised but not homogenised. Norwegian types: kremfløte 38 % fat (whippable); matfløte 20 % (not whippable); kaffefløte 9 or 12–13 % (for coffee and tea); fløtebase 15 % with gelatin, used as a stabiliser in other dairy products.
- How it is made: milk is separated; cream is pasteurised.
- Where / who: industrial, nationwide; used in soups, sauces, desserts and as topping.
- Sources: https://no.wikipedia.org/wiki/Fløte — types and fat levels, uses, pasteurisation.

## Multekrem (cloudberry cream)
- Animal(s): cow (whipped cream)
- Kind: dessert (cream with fruit)
- What it is: a traditional Norwegian dessert of cloudberries mixed with whipped cream and sugar, served raw or warm; a Christmas dinner dessert; served with krumkake or kransekake, or filled in krumkaker.
- How it is made: whipped cream folded with cloudberries and sugar.
- Where / who: Norway, nationwide, especially at Christmas and for special occasions.
- Sources: https://en.wikipedia.org/wiki/Multekrem — definition, serving, Christmas use; https://no.wikipedia.org/wiki/Multekrem — description (whipped cream and molter, served in a bowl or as a krumkake filling).

## Kondensert melk (condensed milk; Viking Melk unsweetened)
- Animal(s): cow
- Kind: evaporated / condensed milk
- What it is: milk with about half the water removed by vacuum evaporation, so it is thick and sweet (sweetened versions); the unsweetened version is sold in Norway as Viking Melk. Sterile and canned, keeps for years unopened; 3–4 weeks once open if covered.
- How it is made: whole, skimmed or mixed milk (sometimes with cream or milk powder) is evaporated under vacuum to about half its water content.
- Where / who: industrial, supermarket.
- Sources: https://no.wikipedia.org/wiki/Kondensert_melk — process, Norwegian product name, shelf life.

## Tørrmelk (milk powder)
- Animal(s): cow
- Kind: dried milk product
- What it is: milk dehydrated to powder, made from whole or skimmed milk. Whole-milk powder goes rancid after the bag is opened; skimmed powder keeps for a long time. Instant versions dissolve easily.
- How it is made: milk is dried (the method is not specified in the source).
- Where / who: industrial; used as an ingredient or reconstituted with water.
- Sources: https://no.wikipedia.org/wiki/Tørrmelk — definition, rancidity, instant form.

## Myse (whey; valle)
- Animal(s): cow (also goat as the base of brunost whey)
- Kind: whey (by-product of cheese and casein production)
- What it is: the liquid left when milk curdles, containing most of the water, salts, lactose, whey protein and some fat. Sour whey is made by chemical precipitation; sweet whey by rennet coagulation. Historically a waste product in Norway; now used in food products and whey processing.
- How it is made: produced as a by-product during cheese making (10 l milk gives 1 l cheese and 9 l whey according to the article) or casein precipitation.
- Where / who: industrial; historically used in brunost production and given to farm animals.
- Sources: https://no.wikipedia.org/wiki/Myse — definition, sweet and sour whey, historical use, yield.
- Unsure: whey as a food product is listed here; brunost (caramelised whey, goat and cow milk) is a cheese-category product and is left to the cheese researcher.

## Kumelk (cow milk, drinking milk types)
- Animal(s): cow
- Kind: fresh milk (sweet milk) and soured milk
- What it is: the most drunk milk in the western world. Norwegian sweet milk: whole 3.8 % fat, lettmelk 0.7–1.5 %, extra light 0.5–0.7 %, skimmed 0.1 %, flavoured (chocolate, strawberry); also lactose-free and lactose-reduced milk, organic milk and long-life milk. Soured milk: kulturmelk, kefir, Cultura.
- How it is made: sweet milk is pasteurised and, except skimmed, homogenised; soured milk is high-pasteurised and homogenised, then inoculated with lactic cultures, with or without probiotics.
- Where / who: industrial, nationwide.
- Sources: https://no.wikipedia.org/wiki/Kumelk — milk types with fat percentages, processing, list of cow milk products (kalvedans, smør, fløte, ost, prim, yoghurt, rømme).

## Geitemelk (goat milk)
- Animal(s): goat
- Kind: fresh milk; mainly used for cheese, with small-scale soured milk products, ice cream and butter
- What it is: milk from the domestic goat (Capra aegagrus hircus), with higher fat and solids content than cow milk and smaller casein micelles. In Norway goats breed when days shorten in October–November and milk production stops until kidding in early spring; a dairy goat gives 2.7–7.3 litres a day and 660–1800 litres in 305 milking days. Used in brunost (caramelised whey cheese, cheese-category).
- How it is made: milked, then processed; it is consumed fresh and mostly made into cheese; the article says soured products, ice cream and butter are made on a small scale.
- Where / who: Norwegian goat farms; home production in many countries.
- Sources: https://no.wikipedia.org/wiki/Geitemelk — milk composition, breeding season, yields, uses; https://en.wikipedia.org/wiki/Norwegian_cuisine — goat milk used in Joika meatball gravy (brunost or goat milk).

## Morsmelkerstatning (infant formula)
- Animal(s): cow (formula base)
- Kind: infant formula (milk substitute)
- What it is: a food product that replaces or supplements breastfeeding; it aims to imitate human milk. Sold as powder (to be mixed with water) or ready-mixed liquid.
- How it is made: not described in the source.
- Where / who: industrial; used by infants.
- Sources: https://no.wikipedia.org/wiki/Morsmelkerstatning — definition, forms.

## Fiskesuppe (milk-based fish soup)
- Animal(s): cow (milk base)
- Kind: soup / dish with milk as the base liquid
- What it is: a white soup based on milk with vegetables (usually carrots, onion, potato) and various fish; creamed seafood soups are common along the coast.
- How it is made: not described beyond the ingredients.
- Where / who: coastal Norway, home cooking.
- Sources: https://en.wikipedia.org/wiki/Norwegian_cuisine — "Fiskesuppe – fish soup: a white, milk-based soup with vegetables".
- Unsure: milk is the base, but whether it is the main ingredient by volume is not stated.

## Grøt (milk porridge)
- Animal(s): cow (milk)
- Kind: porridge / dish with milk as the cooking liquid
- What it is: traditional Norwegian breakfast porridge made from flour or groats boiled with milk, in types including rømmegrøt (with sour cream) and risgrøt (with rice).
- How it is made: flour or groats boiled in milk (not detailed in the source).
- Where / who: home, traditional Norwegian breakfast.
- Sources: https://en.wikipedia.org/wiki/Norwegian_cuisine — grøt boiled with milk, types of grøt.

## Ølost (Telemark ølost; milk and beer drink)
- Animal(s): cow (milk)
- Kind: warm drink, curdled milk with beer
- What it is: a traditional Norwegian warm drink of milk and beer, served hot with sugar and sometimes small pieces of cheese; in the recipe source it is eaten at breakfast or as an evening snack, especially at Christmas.
- How it is made: fresh milk is boiled and mixed with beer and sugar to taste; the mixture is boiled again until the milk curdles. A second version on the same site boils milk and beer separately for a smooth result (that recipe was not opened).
- Where / who: Telemark (per the recipe page); home cooking.
- Sources: https://www.matoppskrift.no/oppskrift/oelost-fra-telemark — method, serving, Telemark origin (opened).
- Unsure: a recipe page, not a history; no Norwegian Wikipedia article exists under this name.

## Kalvedans (råmelkspudding, spannost, pottost, kjelost, råmjølkspudding)
- Animal(s): cow (colostrum)
- Kind: dessert (set milk pudding)
- What it is: a traditional Norwegian dessert of råmelk (colostrum) and ordinary milk. The high protein of colostrum makes it set firm without gelatin or egg.
- How it is made: about one part colostrum to two parts ordinary milk (less ordinary milk from the second or third milking); almond drops and a little sugar are added; it is set in a water bath with the heat kept low so the milk does not boil, and is firm after about an hour. Served chilled with cinnamon and milk or red sauce.
- Where / who: Norway. Called kalvedans or pottost in Østlandet and kjelost in Trøndelag and Helgeland; spannost is mentioned in the 1965 book Norsk mat. Kalvedans is also the name of an unrelated meat dish.
- Sources: https://no.wikipedia.org/wiki/Kalvedans — base ingredient, ratio, water bath, serving, regional names (opened via WebFetch summary).
- Unsure: the details come from a summarised fetch of the page, not checked line by line.

## Iskrem (fløteis, melkeis, fruktis, margarinis)
- Animal(s): cow (cream and milk)
- Kind: frozen dessert
- What it is: a frozen mix of cream, flavourings and sweeteners. The article sets Norwegian categories: fløteis at least 10 % milk fat; melkeis 4–10 % milk fat; fruktis under 4 % milk fat with at least 10 % fruit or berries; margarinis uses fat other than milk fat.
- How it is made: the mix is cooled while stirred to stop large ice crystals forming.
- Where / who: Norwegian brands named in the article: Hennig-Olsen Is (production from 5 May 1924 at Markensgate 24, Oslo, with recipes Sven Hennig-Olsen brought from the USA); Diplom-Is (Oslo, from August 1930, early cooling with a freezing mixture); Drammens Is and Hennig Olsen as leading brands after the war.
- Sources: https://no.wikipedia.org/wiki/Iskrem — categories, Norwegian rules, producers and history (opened via WebFetch summary).
- Unsure: the fat limits come from rules the article says were replaced on 1 January 2016, so they may be out of date; the article gives no egg-yolk or home-made detail.

## Unconfirmed leads
- Kefir history on the TINE website ("Historien om kefir", linked from the Norwegian Kefir article) — second pass: not opened in this pass — https://no.wikipedia.org/wiki/Kefir

## Unsure
- Prim (pålegg) — a whey spread, not a dairy product of this file; written up in the cheese file as Prim.
