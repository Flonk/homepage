import type * as S from './schema';

/**
 * A product: the name drawn on its node, a line break where it wraps, and
 * every other name it goes by, here or elsewhere in the world. The other
 * names are kept with it rather than drawn, so a product found under another
 * name is folded in here instead of becoming a node of its own. Many came
 * out of a round of research and are not all checked yet (see
 * reports/Milk products missing from graph.md).
 *
 * `from` is what it is made from, one parent and no more: of the ways it
 * can be made, the one that matters most, from the more everyday product
 * and from its own family where there is a choice. The other ways are kept
 * in `alsoFrom` as the other names are in `aka`, not drawn. Milk and the
 * other milks beside it are made from nothing. `step` is how it is made from
 * `from`, in a few words, written on the arrow. What one step makes
 * besides is made with it, as a split (see SPLITS): setting milk with rennet
 * makes the curd, and the whey drains off.
 *
 * A product with a `scale` is a kind measured along it rather than a
 * product of its own: drawn with a ruler under it, and what is made from it
 * hung below, each straight down from where its own `at` is on the ruler;
 * cultured cream, and its creams by how much fat they have.
 *
 * A product with `panel` is a family of cheeses too many for a list: its
 * examples are drawn in a panel under it, each placed by how long it is
 * ripened across and how firm it is down (see EXAMPLE_AXES); what is made
 * from it branches off to its right as from any other.
 */
export type Product = Omit<S.Product, 'sources'>;

/** Every product, by a short id. */
export const NODES: Record<string, Product> = {
	raw: { label: 'Milk', aka: ['Raw milk', 'Rohmilch'], examples: ['Milch ab Hof'] },
	certified: {
		label: 'Certified raw milk',
		aka: ['Vorzugsmilch'],
		from: 'raw',
		step: 'bottle raw, certified',
		note: 'In Germany only Vorzugsmilch, with its stricter production and testing rules, may be sold raw in shops. Ordinary raw milk (Rohmilch ab Hof) may be sold only at the farm gate and must carry a boil-before-drinking notice.',
	},
	homogenised: { label: 'Homogenised milk', aka: ['Homogenisierte Milch'], from: 'raw', step: 'homogenise' },
	pasteurised: { label: 'Pasteurised milk', aka: ['Pasteurisierte Milch'], from: 'homogenised', alsoFrom: ['skimRaw'], step: 'pasteurise' },
	fresh: { label: 'Fresh whole milk', aka: ['Frischmilch', 'Frische Vollmilch'], from: 'pasteurised', step: 'chill and bottle' },
	esl: { label: 'ESL milk', aka: ['Extended shelf life milk', 'Länger frische Milch'], from: 'homogenised', step: 'heat higher or microfilter' },
	uht: { label: 'UHT milk', aka: ['Long-life milk', 'H-Milch', 'H-Vollmilch', 'Haltbarmilch'], from: 'homogenised', step: 'ultra-heat' },
	// Heated below pasteurisation, to hold raw milk or milk for cheese.
	thermised: {
		label: 'Thermised milk',
		aka: ['Thermisierte Milch'],
		from: 'raw',
		step: 'warm to 57–68 °C',
		note: 'Not a drink: it still tests phosphatase-positive and cannot be sold as milk for people. It holds raw milk, or milk for cheese, for a few days or for cheese that is aged at least 60 days in the US, and it is also how quark and fermented products are sanitised before they are drained or packed.',
	},
	sterilised: { label: 'Sterilised milk', aka: ['Sterilmilch'], from: 'homogenised', step: 'sterilise in bottle' },
	// Concentrated first and sterilised in its can after.
	evaporated: { label: 'Evaporated milk', aka: ['Kondensmilch'], examples: ['Viking Melk', 'Carnation', 'PET'], from: 'pasteurised', step: 'evaporate, sterilise in can' },
	// The sugar goes in before the milk is boiled down, and keeps it.
	condensed: {
		label: 'Sweetened\ncondensed milk',
		aka: ['Gezuckerte Kondensmilch', 'Leche condensada'],
		examples: ['Sgushchyonka', 'Eagle Brand', 'Milchmädchen', 'La Lechera'],
		from: 'fresh',
		step: 'add sugar, evaporate',
	},
	lactoseFree: {
		label: 'Lactose-free milk',
		aka: ['Laktosefreie Milch'],
		examples: ['Valio lactose-free milk', 'Minus L'],
		from: 'pasteurised',
		alsoFrom: ['uht', 'skimmed'],
		step: 'split the lactose with lactase',
		note: 'In Germany only a product with under 0.1 g lactose per 100 g, and labelled so, may be called laktosefrei (MilchPQV § 58). The milk tastes sweeter because glucose and galactose are sweeter than the lactose they came from.',
	},
	// Dried from a concentrate, not from evaporated milk.
	milkPowder: { label: 'Milk powder', aka: ['Dried milk', 'Whole milk powder', 'Milchpulver'], from: 'pasteurised', step: 'concentrate, spray-dry' },
	calfReplacer: {
		label: 'Calf milk replacer',
		aka: ['Milk replacer', 'Kälbermilchaustauscher', 'Milchaustauscher'],
		from: 'skimmedPowder',
		alsoFrom: ['wheyPowder'],
		step: 'blend with whey, fat and vitamins, dry',
		note: 'Replacers of the 1950s and 60s were mostly skim milk powder; today most protein is whey (dried whey about 12 % protein, delactosed whey about 27 %, WPC about 35 %) or blends with vegetable protein. Replacers with whey protein do not clot with rennet, so clotting is no quality test any more.',
	},
	maltedMilk: { label: 'Malted milk', aka: ['Malted milk powder'], examples: ['Horlicks', 'Ovaltine', 'Milo'], from: 'milkPowder', step: 'mix with malt extract and flour, dry', note: 'Invented as an infant food: James Horlick, a London pharmacist, formed J & W Horlicks in 1873, patent 1883 for a formula with dried milk; the name malted milk was trademarked 1887.' },
	flavouredMilk: {
		label: 'Flavoured milk',
		examples: ['Chocolate milk', 'Strawberry milk', 'Masala milk'],
		from: 'pasteurised',
		alsoFrom: ['semi', 'uht'],
		step: 'add cocoa or flavour, sugar and stabiliser',
		note: 'Sold either pasteurised and chilled or UHT-treated so it keeps unrefrigerated. A carton of the chilled kind can hold as much sugar as a can of soft drink (2018 analysis of 90+ products).',
	},
	milkTea: {
		label: 'Milk tea',
		aka: ['Milchtee'],
		examples: ['Hong Kong-style milk tea', 'Masala chai', 'Suutei tsai', 'Teh tarik'],
		from: 'fresh',
		alsoFrom: ['evaporated', 'condensed'],
		step: 'brew with tea',
		note: 'Either the leaves are boiled in the milk (masala chai, doodh pati) or strong tea is made first and milk added (Mongolian suutei tsai, which is salted). Hong Kong-style milk tea is finished with evaporated milk.',
	},
	tonedMilk: {
		label: 'Toned milk',
		examples: ['Double-toned milk'],
		from: 'raw',
		alsoFrom: ['skimmedPowder', 'skimmed'],
		step: 'dilute with skim milk and water',
		note: 'Buffalo milk (7-8 % fat) is too rich to sell as it is, so it is stretched with skim milk, skim milk powder and water; the milk supply grows by nearly a factor of three at 3 % fat. First sold in Bombay in 1946.',
	},
	bakedMilk: { label: 'Baked milk', aka: ['Toplyonoye moloko', 'Топлёное молоко'], from: 'pasteurised', step: 'hold hot for hours' },
	skimRaw: { label: 'Skimmed raw milk', aka: ['Fettarme bis magere Rohmilch'], from: 'raw', step: 'the rest' },
	semi: { label: 'Semi-skimmed milk', aka: ['Fettarme Milch'], from: 'skimRaw', step: 'standardise the fat', note: 'In the US and UK, "low-fat milk" means about 1 % fat, lower than semi-skimmed (about 1.5–2 %). The US counterpart of semi-skimmed is reduced-fat milk at 2 %.' },
	semiUht: { label: 'Semi-skimmed\nUHT milk', aka: ['Fettarme H-Milch'], from: 'semi', step: 'heat to ≥135 °C' },
	semiEvaporated: { label: 'Semi-skimmed\nevaporated milk', aka: ['Teilentrahmte Kondensmilch'], from: 'semi', step: 'evaporate, sterilise in can' },
	skimmed: { label: 'Skimmed milk', aka: ['Skim milk', 'Magermilch'], from: 'skimRaw', step: 'pasteurise' },
	ultrafilteredMilk: {
		label: 'Ultrafiltered milk',
		aka: ['Ultra-filtered milk'],
		examples: ['fairlife', 'Organic Valley Ultra'],
		from: 'skimmed',
		step: 'ultrafilter, blend the cream back',
		note: 'Ultra-filtered milk is not milk with protein powder added: the proteins stay in the milk and part of the water, lactose and minerals goes out through the membrane. fairlife says it takes out about half the sugar and uses no added protein powder.',
	},
	skimmedEvaporated: { label: 'Evaporated\nskimmed milk', aka: ['Kondensmagermilch'], from: 'skimmed', step: 'evaporate, sterilise in can' },
	skimmedPowder: {
		label: 'Skimmed milk\npowder',
		aka: ['Nonfat dry milk', 'Magermilchpulver'],
		examples: ['Low-heat skim milk powder', 'Medium-heat skim milk powder', 'High-heat skim milk powder', 'Instant skim milk powder', 'Film-set cocaine'],
		from: 'skimmed',
		step: 'spray-dry',
	},
	// The fat comes from anhydrous milk fat; the single drawn parent is the powder.
	recombined: {
		label: 'Recombined milk',
		from: 'skimmedPowder',
		alsoFrom: ['amf'],
		step: 'add water and milk fat',
		note: 'Used where there is little or no milk: the powder and the butter oil travel and keep for months, the milk is made at the dairy and then pasteurised or UHT-treated.',
	},
	reconstituted: { label: 'Reconstituted milk', from: 'milkPowder', alsoFrom: ['skimmedPowder'], step: 'add water', note: 'Water stirred into whole or skim milk powder; the fat comes from the powder, none is added separately. Unlike recombined milk.' },

	// A second root beside milk: the first milkings after calving, a secretion
	// of its own, which sets like egg when it is heated.
	colostrum: { label: 'Colostrum', aka: ['Beestings', 'Biestmilch', 'Råmjölk', 'Uurag'] },
	colostrumPudding: {
		label: 'Colostrum pudding',
		aka: ['Råmjölkspudding', 'Beestings pudding'],
		examples: ['Kalvdans', 'Ábrystir', 'Kharvas'],
		from: 'colostrum',
		step: 'bake or steam until set',
	},
	colostrumPowder: { label: 'Colostrum powder', from: 'colostrum', step: 'skim, dry gently' },
	travelan: { label: 'Hyperimmune\ncolostrum', aka: ['Travelan', 'Immune milk'], from: 'colostrum', step: 'from vaccinated cows, dry' },

	milkDrugs: {
		label: 'Drugs from\ntransgenic milk',
		examples: ['ATryn', 'Ruconest'],
		from: 'raw',
		step: 'transgenic goat or rabbit milk, purify',
		note: "The goats (and rabbits) carry a human gene.",
	},

	lactotripeptide: {
		label: 'Lactotripeptide milk\n(Ameal S, Evolus)',
		aka: ['Blood-pressure sour milk'],
		examples: ['Calpis Ameal S', 'Evolus'],
		from: 'skimmed',
		step: 'ferment with L. helveticus',
		note: 'Two routes exist: this one ferments skimmed milk; the other digests casein with enzymes (patent US7785824). Trial evidence is mixed: a Cochrane review (Usinger 2012) found no confirmed ACE-inhibiting effect in people.',
	},
	// Human milk, not cow's: only the pasteurising is the same idea.
	donorMilk: {
		label: 'Donor human milk',
		aka: ['Pasteurised donor milk', 'Milk-bank milk', 'Lactarium milk'],
		from: 'raw',
		step: 'screen donors, Holder-pasteurise',
		note: "Human milk, not cow's: the node only records the one process (Holder pasteurisation) that is the same idea as pasteurising cow milk, only slower and colder.",
	},
	ghrita: {
		label: 'Medicated ghee\n(ghrita)',
		aka: ['Ghrita', 'Medicated ghrita', 'Sneha kalpana'],
		examples: ['Bhallatakadi ghrita'],
		from: 'butterfat',
		step: 'cook with herb paste and water',
		note: 'Murcchana (a first cooking of the ghee with herbs) and Shata-dhauta (washing the ghee 100 times in water) are pre-treatments claimed to raise quality and keeping time.',
	},

	rawCream: { label: 'Raw cream', aka: ['Rahm'], from: 'raw', step: 'the fat' },
	/* Cream as it is sold, its fat set to a grade and heated: each country
	   names its own grades, hung under the ruler at the least fat the name
	   allows (or, where it sets none, what it usually has); what is made
	   from it branches off to its right. */
	cream: {
		label: 'Cream',
		aka: ['Sahne', 'Rahm', 'Obers', 'Crème liquide'],
		from: 'rawCream',
		step: 'standardise, pasteurise',
		scale: { name: 'fat', unit: '%', to: 50, every: 10 },
	},
	// Kaymak and malai also skim off heated whole milk as it cools.
	clotted: { label: 'Clotted cream\n(kaymak)', examples: ['Cornish clotted cream', 'Devon clotted cream', 'Kaymak', 'Afyon kaymagi', 'Malai', 'Urum'], from: 'fresh', alsoFrom: ['cream'], step: 'heat slowly, skim the crust' },
	rabri: { label: 'Rabri', aka: ['Rabdi', 'Layered milk skins'], examples: ['Basundi', 'Khurchan'], from: 'fresh', step: 'reduce, layer the skins' },
	coffeeCream: { label: 'Kaffeesahne', from: 'cream', at: 10 },
	kaffeeobers: { label: 'Kaffeeobers', from: 'cream', at: 10 },
	cremeDeLeite: { label: 'Creme de leite', from: 'cream', at: 10 },
	halfAndHalf: { label: 'Half-and-half', from: 'cream', at: 12 },
	cremeLegere: { label: 'Crème légère', from: 'cream', at: 12 },
	kaffeerahm: { label: 'Kaffeerahm', from: 'cream', at: 15 },
	singleCream: { label: 'Single cream', from: 'cream', at: 18 },
	lightCream: { label: 'Light cream', aka: ['Coffee cream', 'Table cream'], from: 'cream', at: 18 },
	namaKurimu: { label: 'Nama kurīmu', aka: ['生クリーム', 'Fresh cream'], from: 'cream', at: 18 },
	mediaCrema: { label: 'Media crema', aka: ['Table cream'], from: 'cream', at: 20 },
	pannaDaCucina: { label: 'Panna da cucina', aka: ['Cooking cream'], from: 'cream', at: 20 },
	schlagsahne: { label: 'Schlagsahne', from: 'cream', at: 30 },
	schlagobers: { label: 'Schlagobers', aka: ['Schlagrahm'], from: 'cream', at: 30 },
	cremeFluide: { label: 'Crème fluide', aka: ['Crème fraîche fluide', 'Crème entière'], from: 'cream', at: 30 },
	vollrahm: { label: 'Vollrahm', aka: ['Schlagrahm'], from: 'cream', at: 35 },
	thickenedCream: { label: 'Thickened cream', from: 'cream', at: 35 },
	whipping: { label: 'Whipping cream', from: 'cream', at: 35 },
	heavyCream: { label: 'Heavy cream', aka: ['Heavy whipping cream'], from: 'cream', at: 36 },
	whippedCream: {
		label: 'Whipped cream',
		note: 'Cream is beaten until air bubbles are held by clumped fat globules; beat too long and the fat clumps into butter. It collapses after about 1-2 h.',
		examples: ['Crème Chantilly', 'Spray whipped cream'],
		from: 'cream',
		step: 'whip in air',
	},
	cremeDouble: { label: 'Crème double', from: 'cream', at: 40 },
	vispgradde: { label: 'Vispgrädde', from: 'cream', at: 40 },
	doppelrahm: { label: 'Doppelrahm', note: 'In Switzerland, Crème double de la Gruyère is a cream of about 45 % fat, listed in the Culinary Heritage of Switzerland', from: 'cream', at: 45 },
	double: { label: 'Double cream', from: 'cream', at: 48 },
	evaporatedCream: { label: 'Evaporated cream', aka: ['Kondenssahne'], from: 'cream', step: 'evaporate, sterilise in can' },
	/* Cream soured once, by the same lactic cultures, into what is one product
	   under many names, told apart by little more than how much fat it has:
	   each hung under the ruler at what it typically has. */
	culturedCream: {
		label: 'Cultured cream',
		aka: ['Soured cream', 'Sauerrahmerzeugnisse'],
		from: 'cream',
		step: 'culture, ferment',
		scale: { name: 'fat', unit: '%', to: 40, every: 10 },
	},
	saureSahne: { label: 'Saure Sahne', aka: ['Sahnesauermilch'], from: 'culturedCream', at: 10 },
	graddfil: { label: 'Gräddfil', from: 'culturedCream', at: 12 },
	sauerrahm: { label: 'Sauerrahm', aka: ['Rahm, sauer'], from: 'culturedCream', at: 15 },
	saurerHalbrahm: { label: 'Saurer Halbrahm', from: 'culturedCream', at: 15 },
	smetana: { label: 'Smetana', aka: ['Сметана', 'Smântână', 'Śmietana'], from: 'culturedCream', at: 20 },
	sourCream: { label: 'Sour cream', aka: ['Cultured sour cream'], from: 'culturedCream', at: 18 },
	tejfol: { label: 'Tejföl', from: 'culturedCream', at: 20 },
	schmand: { label: 'Schmand', from: 'culturedCream', at: 24 },
	cremeFraiche: { label: 'Crème fraîche', aka: ['Crème épaisse'], from: 'culturedCream', at: 30 },
	romme: { label: 'Rømme', note: 'Ordinary rømme (lettrømme) has 18-20 % fat; seterrømme has 35 %, the same as the cream it is made from, and is the one used to cook rømmegrøt', from: 'culturedCream', at: 20 },
	cremaMexicana: {
		label: 'Crema',
		aka: ['Crema fresca', 'Crema espesa', 'Mexican crema'],
		note: 'Heavy cream mixed with buttermilk; softer, tangier and thinner than sour cream, close to crème fraîche; some versions have salt or lime juice',
		from: 'culturedCream',
		at: 18,
	},
	// Cream set by heat and acid, rather than made from crème fraîche.
	mascarpone: { label: 'Mascarpone', from: 'cream', step: 'heat with acid' },
	rommegrot: { label: 'Rømmegrøt', aka: ['Rømmegraut', 'Römmegröt'], note: 'Eaten at feasts, with sugar, cinnamon and the skimmed fat poured over; cured meats and flatbread on the side. The skimmed fat is served on the side as the butter.', from: 'cream', step: 'sour, cook with flour, skim the butterfat' },
	pannaCotta: { label: 'Panna cotta', note: 'The name is not found in Italian cookbooks before the 1960s, though Piedmont lists it as a traditional food (2001). Some say the older Piedmontese version was set with egg white; others that it descends from French bavarois.', from: 'cream', step: 'sweeten, set with gelatin' },
	posset: { label: 'Posset', examples: ['Lemon posset', 'Syllabub'], from: 'cream', step: 'curdle with wine or citrus' },
	junket: { label: 'Junket', aka: ['Jonquet', 'Renneted milk'], examples: ['Cuajada', 'Chongos zamoranos', 'Ostkaka'], from: 'pasteurised', step: 'set with rennet' },
	gomme: { label: 'Gomme', aka: ['Gumme', 'Gubbost'], examples: ['Brunost gomme', 'Hvitgomme'], from: 'fresh', step: 'curdle, boil down' },
	custard: {
		label: 'Custard',
		aka: ['Crème anglaise', 'Pouring custard'],
		examples: ['Pastry cream', 'Crème caramel', 'Crème brûlée', 'Crema catalana', 'Leche flan', 'Natillas'],
		from: 'fresh',
		alsoFrom: ['cream'],
		step: 'cook with egg yolks and sugar',
		note: 'The egg proteins set at about 70 °C, so milk and egg yolk thicken with no starch. Two or three degrees too much and it curdles. Thin pouring custard, thick pastry cream and the set desserts are all this step.',
	},
	milkChocolate: {
		label: 'Milk chocolate',
		aka: ['Milchschokolade'],
		examples: ['Gala Peter', 'Cadbury Dairy Milk', 'Hershey bar'],
		from: 'milkPowder',
		alsoFrom: ['condensed'],
		step: 'mix with cocoa mass, sugar and cocoa butter, conche',
		note: 'Condensed milk was how Daniel Peter (Switzerland, 1875) first got milk into chocolate; Nestlé’s neighbour Henri Nestlé had just made it. British milk chocolate still uses crumb, and its Maillard browning gives a cooked caramel flavour. Germany, France and Belgium mostly add milk powder.',
	},
	milkCaramel: {
		label: 'Milk caramel\n(and fudge)',
		aka: ['Chewy caramel', 'Milchkaramell'],
		examples: ['Fudge'],
		from: 'condensed',
		alsoFrom: ['fresh', 'cream'],
		step: 'cook with sugar and fat to a set stage',
		note: 'At the firm-ball stage (120 °C) the sugar itself is too cool to caramelise, so this is called milk or cream caramel: the milk browns. Fudge is cooked to the soft-ball stage and beaten so that it crystallises.',
	},
	brigadeiro: {
		label: 'Brigadeiro',
		examples: ['Beijinho', 'Brigadeiro de colher', 'Dois amores'],
		from: 'condensed',
		step: 'cook with cocoa and butter, roll',
		note: 'Created in the 1940s to support Brigadier Eduardo Gomes’s 1945 presidential candidacy (Heloísa Nabuco de Oliveira). Eaten with a spoon it is brigadeiro de colher.',
	},
	iceCream: {
		label: 'Ice cream',
		aka: ['Eiscreme'],
		examples: ['Gelato', 'Soft serve', 'Frozen custard', 'Dondurma', 'Booza', 'Bastani', 'Semifreddo'],
		from: 'cream',
		step: 'sweeten, churn, freeze',
		note: 'In German, Speiseeis is the whole category of edible ice, including sorbet and water ice; Eiscreme (at least 10 % milk fat) is the one that matches ice cream.',
	},
	milkshake: {
		label: 'Milkshake',
		aka: ['Shake', 'Thick shake'],
		examples: ['Malted milkshake'],
		from: 'iceCream',
		step: 'blend with milk',
		note: 'Fast-food chains often use a premade mix of milk, sweetener, flavouring and thickener rather than ice cream, and some places restrict the word milkshake. In 1885 the word still meant an alcoholic eggnog-like drink.',
	},
	kulfi: { label: 'Kulfi', examples: ['Matka kulfi', 'Kulfi falooda'], from: 'fresh', step: 'reduce, freeze in moulds' },
	nimish: {
		label: 'Nimish (milk foam)',
		aka: ['Malaiyo', 'Malai makkhan', 'Makhan malai', 'Daulat ki chaat'],
		from: 'fresh',
		step: 'boil, chill overnight, whip to a foam',
		note: 'Only made in the cold months: in warmth the foam collapses. It is served at dawn.',
	},
	kheer: { label: 'Kheer', aka: ['Khir'], examples: ['Phirni', 'Payasam', 'Payesh', 'Sütlaç', 'Arroz con leche', 'Arroz doce'], from: 'fresh', step: 'simmer with rice and sugar' },
	milkPudding: {
		label: 'Milk pudding',
		examples: ['Muhallebi', 'Double-skin milk', 'Blancmange', 'Tavuk göğsü', 'Kazandibi', 'Vla', 'Semolina pudding'],
		from: 'fresh',
		step: 'thicken with starch, sweeten',
	},
	// The mix is fermented with the yoghurt culture, or yoghurt is blended in, then frozen like ice cream.
	frozenYoghurt: {
		label: 'Frozen yoghurt',
		examples: ['Pinkberry'],
		aka: ['Frozen yogurt'],
		from: 'fresh',
		alsoFrom: ['yoghurt'],
		step: 'ferment or blend yoghurt in, freeze with air',
		note: 'Many shops sell frozen yoghurt made from a heat-treated yoghurt base, so it may no longer hold live cultures.',
	},

	butter: { label: 'Butter', examples: ['Sweet cream butter', 'Three-quarter fat butter', 'Half-fat butter', 'Dairy spread', 'Rucava white butter', "Beurre d'Isigny", 'Vologda butter'], from: 'cream', step: 'the fat' },
	culturedButter: { label: 'Cultured butter', aka: ['Sauerrahmbutter'], examples: ['Makhan', 'Kibe', 'Zebda', 'Yak butter', 'Beurre Rose', 'Beurre d\'Échiré'], from: 'cream', alsoFrom: ['soured'], step: 'the fat', below: 'butter' },
	// The buttermilk churned cultured butter leaves, drawn again here beside it.
	culturedButtermilk: { label: 'Buttermilk', from: 'cream', step: 'the rest', link: 'buttermilk' },
	mildButter: { label: 'Mildly soured butter', aka: ['Mildgesäuerte Butter'], from: 'butter', step: 'work in culture' },
	// Desi ghee is boiled from butter churned from dahi.
	butterfat: { label: 'Ghee', aka: ['Desi ghee'], examples: ['Manteiga de garrafa'], from: 'butter', alsoFrom: ['culturedButter', 'cream'], step: 'the fat' },
	gheeResidue: { label: 'Ghee residue', from: 'butter', step: 'the solids', note: 'More of it forms when ghee is made from medium-fat cream than from butter' },
	brownButter: { label: 'Brown butter', aka: ['Beurre noisette', 'Browned butter', 'Braune Butter'], examples: ['Beurre noir'], from: 'butter', step: 'heat until the solids brown', note: 'Unlike ghee and clarified butter, the browned milk solids stay in the butter.' },
	clarified: { label: 'Clarified butter', aka: ['Butterschmalz', 'Geklärte Butter', 'Samneh'], examples: ['Shar tos', 'Butter lamp'], from: 'butter', step: 'melt, lift off solids', note: 'In German law Butterschmalz is the same product as Butterreinfett and wasserfreies Milchfett (at least 99.8 % fat, at most 0.1 % water; MilchPQV Anlage 8), see anhydrous milk fat. The household version is made by hand by melting and skimming.' },
	amf: { label: 'Anhydrous milk fat', aka: ['AMF', 'Anhydrous butter oil', 'Butterreinfett', 'Butterschmalz'], from: 'butter', alsoFrom: ['cream'], step: 'remove water and solids', note: 'In German law Butterreinfett, Butterschmalz and wasserfreies Milchfett are one product (MilchPQV Anlage 8): at least 99.8 % fat, at most 0.1 % water. The Butterschmalz sold in shops is the same idea as clarified butter. Codex also has plain butter oil, a looser grade at 99.6 % fat with no water limit (like ghee), which is not the same as AMF.' },
	milkFatFractions: { label: 'Milk fat fractions', aka: ['High-melting and low-melting fractions'], from: 'amf', step: 'melt, cool in stages, filter' },
	smen: { label: 'Smen', aka: ['Aged butter', 'Semn'], from: 'butter', step: 'boil, salt, age in jars' },
	bogButter: { label: 'Bog butter', aka: ['Im portaigh'], from: 'butter', step: 'bury in peat' },
	nitirKibbeh: { label: 'Spiced butter\n(niter kibbeh)', aka: ['Niter kibbeh', 'Niter qibe', 'Tesmi'], from: 'butter', step: 'simmer with spices' },
	butterTea: { label: 'Butter tea', aka: ['Po cha', 'Suja', 'Bho jha'], from: 'butter', alsoFrom: ['culturedButter'], step: 'churn with salted tea' },
	churn: { label: 'Churning liquid', aka: ['Sweet buttermilk', 'Süßrahmbuttermilch'], from: 'cream', step: 'the rest' },
	buttermilk: { label: 'Buttermilk', aka: ['Buttermilch', 'Babeurre', 'Lait ribot', 'Lait battu'], from: 'churn', alsoFrom: ['skimmed'], step: 'sour' },
	// Cretan staka and staka butter: cream cooked with flour splits into protein paste and fat.
	staka: { label: 'Staka', aka: ['Στάκα'], from: 'cream', step: 'the protein', note: 'Cretan, from cream; a roux-like paste of protein and flour, eaten hot with bread' },
	stakovoutiro: { label: 'Stakovoutiro', aka: ['Staka butter', 'Σταχοβούτυρο'], from: 'cream', step: 'the fat', note: 'Keeps for later; faint cheesy flavour; goes into Cretan pilaf (gamopilafo)' },
	// The buttermilk of butter churned from soured milk or yoghurt rather than
	// cream, as across North Africa, the Middle East, Ethiopia and South Asia.
	// What is left of butter churned from the whole soured milk.
	fermButtermilk: {
		label: 'Fermented buttermilk',
		examples: ['Lben', 'Chaas', 'Rob', 'Arera', 'Hazo'],
		from: 'soured',
		alsoFrom: ['dahi', 'yoghurt'],
		step: 'the rest',
	},
	// The butter churned out of it, drawn again here beside its buttermilk.
	fermButter: { label: 'Cultured butter', from: 'soured', step: 'the fat', link: 'culturedButter' },

	// Pasteurising kills the milk's own lactic bacteria, so it is soured with
	// a culture added back; traditionally, raw milk was left to sour by itself.
	soured: {
		label: 'Soured milk',
		aka: ['Sauermilch'],
		examples: ['Prostokvasha', 'Clabber', 'Filbunke', 'Laban rayeb', 'Ergo', 'Amasi', 'Mabisi', 'Nunu', 'Maconi', 'Podkvasa', 'Kivuguto', 'Amabere amaruranu', 'Suero costeño', 'Tarag', 'Galotyri'],
		from: 'pasteurised',
		alsoFrom: ['raw'],
		step: 'with lactococci',
		note: 'Industrial soured milk is made from pasteurised milk with a starter culture. The traditional, natural kind needs raw milk, which sours by itself on its own lactic flora; pasteurised milk has lost that flora and will not sour the same way.',
	},
	/* Soured milks of their own, each made with its own culture of lactococci
	   beside soured milk, not from it (see KINDS). */
	dickmilch: { label: 'Dickmilch', aka: ['Dickete', 'Dicke Milch', 'Tykmælk'], from: 'pasteurised', step: 'set to spoon' },
	filmjolk: { label: 'Filmjölk', aka: ['Fil'], examples: ['Arla filmjölk'], from: 'pasteurised', step: 'with aroma cultures' },
	// Soured by mesophilic lactococci at about 22 °C, so not a yoghurt (Codex does not count it as one).
	dahi: { label: 'Dahi', aka: ['Curd'], examples: ['Meekiri', 'Sho'], from: 'pasteurised', step: 'with lactococci' },
	// Fermented thinly, then drained of half its volume as whey and topped up with cream.
	ymer: {
		label: 'Ymer',
		examples: ['Ylette'],
		from: 'skimmed',
		alsoFrom: ['cream'],
		step: 'the curd, with cream',
		note: 'Danish ymer is soured skimmed milk that is drained of about half its volume as whey, then blended and topped up with cream to about 3.5 % fat.',
	},
	// Skimmed or low-fat milk soured with cultures, not what churning butter leaves (see buttermilk).
	cultureButtermilk: {
		label: 'Cultured buttermilk',
		from: 'skimmed',
		step: 'culture, ferment',
		note: "Despite the name, today's cultured buttermilk is not what is left from churning butter: it is skimmed or low-fat milk soured with lactic cultures. The US standard of identity allows the name \"cultured buttermilk\" for cultured milk.",
	},
	piima: { label: 'Piimä', from: 'pasteurised', step: 'ferment slowly, cool' },
	// Soured by the same lactococci as soured milk is, but strains of them that give off slime.
	ropy: { label: 'Ropy milk', examples: ['Långfil', 'Viili', 'Tätmjölk'], from: 'pasteurised', step: 'with slime-making lactococci' },
	ryazhenka: { label: 'Ryazhenka', aka: ['Baked fermented milk', 'Ряженка'], examples: ['Varenets'], from: 'bakedMilk', step: 'ferment baked milk' },
	kefir: { label: 'Kefir', examples: ['Lifeway kefir'], from: 'pasteurised', step: 'yeast-lactic, with grains' },
	// Yoghurt without the sharper of its two bacteria, gentler ones in its place.
	mildYoghurt: { label: 'Mild yoghurt', aka: ['Joghurt mild'], examples: ['Bioghurt'], from: 'pasteurised', step: 'without L. bulgaricus' },
	// Yoghurt with both its bacteria, and a probiotic strain besides.
	// Yoghurt heated again once it has set: the live bacteria are gone, and it keeps.
	heatTreatedYoghurt: {
		label: 'Heat-treated yoghurt',
		aka: ['Haltbarer Joghurt'],
		examples: ['Thermised yoghurt', 'Ambient yoghurt'],
		from: 'yoghurt',
		step: 'heat after fermenting',
		note: 'In the EU and under Codex the heat-treated kind must be labelled so; it has no live cultures left, so it cannot be sold as a probiotic. Stabilisers such as pectin keep the gel from splitting in the heat.',
	},
	probioticYoghurt: {
		label: 'Probiotic yoghurt',
		aka: ['Joghurt probiotisch'],
		examples: ['Actimel', 'Activia'],
		from: 'pasteurised',
		step: 'with a probiotic too',
	},
	// Not yoghurt: one probiotic strain on its own, without the yoghurt cultures.
	probioticDrink: {
		label: 'Probiotic\nmilk drink',
		examples: ['Yakult', 'Acidophilus milk'],
		from: 'skimmed',
		step: 'ferment',
	},
	yoghurt: { label: 'Yoghurt', aka: ['Yogurt', 'Joghurt'], examples: ['Matsoni', 'Gioddu', 'Zabady', 'Qatiq', 'Meiji Bulgaria', 'Beijing yoghurt'], from: 'pasteurised', step: 'with both yoghurt bacteria' },
	shanklish: { label: 'Shanklish', aka: ['Chanklish', 'Shinklish', 'Shankleesh'], examples: ['Sorke'], from: 'greek', step: 'salt, shape, age', note: 'Egyptian shanklish is a different thing, made by fermenting areesh cheese (mish), not from yoghurt.' },
	zhentytsia: { label: 'Żentyca\n(zhentytsia)', aka: ['Żętyca', 'Zhentytsa'], examples: ['Žinčica'], from: 'sweetWhey', step: 'heat, skim, ferment', note: 'The Ukrainian word zhentytsa also simply means whey, so the same word names the drink and the liquid it is made from.' },
	mishtiDoi: { label: 'Mishti doi', aka: ['Sweet yoghurt', 'Misti dahi'], examples: ['Juju dhau', 'Bogurar doi', 'Bhapa doi'], from: 'fresh', step: 'boil down, sweeten, ferment' },
	creamYoghurt: { label: 'Cream yoghurt', aka: ['Sahnejoghurt'], from: 'pasteurised', alsoFrom: ['cream'], step: 'add cream, ferment' },
	greek: { label: 'Greek yoghurt', aka: ['Strained yoghurt', 'Griechischer Joghurt', 'Stragisto'], examples: ['Labneh', 'Chakka', 'Shrikhand', 'Suzma', 'Jocoque', 'Hangop'], from: 'yoghurt', step: 'what is left when the whey goes', note: 'Much supermarket Greek-style yoghurt is not strained in a cloth but concentrated by separator or membrane, or made from protein-fortified milk.' },
	// The whey strained off it, drawn again here beside it; and so for each acid whey below.
	// The half of the ymer volume that is drained off is the same acid whey.
	ymerWhey: { label: 'Acid whey', from: 'skimmed', step: 'the whey', link: 'acidWhey' },
	greekWhey: { label: 'Acid whey', from: 'yoghurt', step: 'the whey', link: 'acidWhey' },
	// A fresh sour milk cheese, though eaten as yoghurt is: the curd of skimmed milk, set with a little rennet besides, strained as quark is.
	skyr: { label: 'Skyr', from: 'curd', alsoFrom: ['skimmed'], step: 'what is left when the whey goes' },
	skyrWhey: { label: 'Acid whey', from: 'curd', step: 'the whey', link: 'acidWhey' },
	ayran: { label: 'Ayran', examples: ['Doogh', 'Tan', 'Mastaw', 'Salted lassi', 'Sweet lassi'], from: 'yoghurt', alsoFrom: ['dahi'], step: 'dilute, salt' },
	driedYoghurt: {
		label: 'Dried yoghurt\n(kashk, qurut)',
		aka: ['Getrockneter Joghurt', 'Kurt', 'Aarul'],
		examples: ['Kashk', 'Jameed', 'Qurut', 'Chortan', 'Aaruul', 'Khuruud', 'Aqit', 'Jocoque seco'],
		from: 'yoghurt',
		alsoFrom: ['fermButtermilk'],
		step: 'drain, dry',
	},
	calpis: { label: 'Calpis-type\nmilk concentrate', from: 'skimmed', step: 'ferment with bacteria, then yeast', note: 'Sold as a concentrate and diluted with water or milk before drinking; the yeast stage is what gives the sweet, fruity aroma that a bacteria-only lactic drink lacks.' },
	milletMilk: { label: 'Milk with millet', examples: ['Fura da nono', 'Brukina', 'Dégué'], from: 'soured', step: 'stir in millet' },
	kishk: { label: 'Kishk', aka: ['Kishk shami', 'Keshk'], examples: ['Trahanas'], from: 'yoghurt', step: 'mix with bulgur, ferment, dry' },
	qaraqurut: { label: 'Qaraqurut', from: 'acidWhey', step: 'boil, dry' },
	dadiah: { label: 'Dadiah', aka: ['Dadih', 'Buffalo milk in bamboo'], from: 'raw', step: 'ferment in bamboo' },
	mursik: { label: 'Mursik', aka: ['Gourd-fermented milk'], examples: ['Kule naoto'], from: 'raw', step: 'ferment in gourd' },
	choormog: {
		label: 'Fermented\ncamel milk',
		examples: ['Choormog', 'Shubat', 'Chal', 'Gariss', 'Suusac', 'Dhanaan', 'Ititu'],
		from: 'raw',
		step: 'ferment camel milk',
	},
	kumis: { label: 'Kumis / airag\n(mare\'s milk)', examples: ['Chigee'], aka: ['Kumis', 'Koumiss', 'Kymyz', 'Airag', 'Kumys'], from: 'raw', step: 'ferment mare\'s milk' },
	arkhi: { label: 'Arkhi', aka: ['Milk vodka', 'Yark', 'Araky'], examples: ['Shimiin arkhi', 'Araka', 'Tarasun', 'Araga'], from: 'soured', alsoFrom: ['kumis', 'yoghurt'], step: 'what boils over' },
	arkhiGrades: {
		label: 'Re-distilled arkhi\n(artz, khorz)',
		examples: ['Artz', 'Khorz'],
		from: 'arkhi',
		step: 'distil again',
	},
	// Cheese made from what the still leaves behind.
	stillCheese: { label: 'Still-residue\ncheese (shuurmg)', aka: ['Bozo', 'Khurskh', 'Shuurmg', 'Arsa', 'Aadmg'], from: 'soured', step: 'left in the still, dried' },

	// Set by acid: the milk soured until it curdles.
	// Made industrially from skimmed milk, fermented on its own; traditionally, soured milk set and drained.
	curd: { label: 'Acid curd', aka: ['Curd'], from: 'skimmed', alsoFrom: ['soured'], step: 'ferment, a little rennet' },
	quark: {
		label: 'Quark',
		aka: ['Topfen'],
		examples: ['Tvorog', 'Magerquark', 'Speisequark 20 %', 'Sahnequark', 'Rahmquark', 'Doppelrahmquark', 'Long-life quark', 'Areesh', 'Karish', 'Petit-suisse'],
		from: 'curd',
		step: 'the curd',
		note: 'German grades by fat in dry matter: Magerstufe under 10 %, Viertelfettstufe 10 %, Halbfettstufe 20 %, Dreiviertelfettstufe 30 %, Fettstufe 40 %, Vollfettstufe 45 %, Rahmstufe 50 %, Doppelrahmstufe 60–87 %. Under German cheese law, quark must hold at least 73 % water in the fat-free mass.',
	},
	// Granular, cooked and washed, then dressed with cream: its own route to a fresh cheese.
	cottageCheese: { label: 'Cottage cheese', aka: ['Hüttenkäse'], examples: ['Dry curd cottage cheese'], from: 'skimmed', step: 'ferment, cut, cook, wash', note: 'Industrial cottage cheese in North America is often made by direct acidification of cold skimmed milk with food acid (US label: direct acid set) instead of a starter; the cultured route is the main one in the UK and Europe.' },
	creamCheese: { label: 'Cream cheese', examples: ['Neufchâtel (US)', 'Philadelphia', 'Double-cream cheese', 'Single-cream cheese', 'Caboc'], from: 'cream', alsoFrom: ['pasteurised'], step: 'homogenise, culture, drain hot' },
	sourMilkCheese: { label: 'Sour milk cheese', aka: ['Sauermilchkäse'], examples: ['Harzer', 'Olmützer Quargel', 'Tiroler Graukäse', 'Handkäse', 'Mainzer', 'Milbenkäse', 'Gammelost', 'Pultost'], from: 'quark', step: 'ripen' },
	cookedCheese: { label: 'Cooked cheese', aka: ['Kochkäse'], examples: ['Jānu siers'], from: 'quark', step: 'cook' },
	sweetCurd: { label: 'Sweet curd\ndesserts', aka: ['Tvorozhnaya massa', 'Sweet curd mass'], examples: ['Paskha'], from: 'quark', step: 'press, sieve, sweeten, mould', note: 'Paskha is a festive Easter dish of Eastern Orthodox countries: eaten at the end of Lent, so rich in the dairy foods given up. Cooked version is an egg custard with the curd; the uncooked keeps poorly, so batches are smaller.' },
	cheesecake: { label: 'Cheesecake', aka: ['Käsekuchen', 'Sernik'], examples: ['Sernik', 'Japanese soufflé cheesecake', 'New York cheesecake', 'Basque burnt cheesecake', 'No-bake cheesecake'], from: 'creamCheese', alsoFrom: ['quark', 'ricotta', 'cottageCheese'], step: 'mix with sugar and eggs, bake', note: 'Whether it is baked (with eggs) or unbaked (with cream or gelatin) depends on the style. Cream cheese was first made commercially in 1872.' },
	mish: { label: 'Mish', aka: ['Mish cheese'], from: 'quark', step: 'pickle for years' },
	byaslag: { label: 'Byaslag', aka: ['Biyaslag', 'Tsagaan byaslag', 'Mongolian cheese'], from: 'raw', alsoFrom: ['skimmed'], step: 'heat to foam, add fermented milk, press', note: 'Also made from the milk left after making oerom; mostly cow and yak, sheep and goat milk go mostly into tea and cheese' },
	eezgii: { label: 'Eezgii', aka: ['Ээзгий', 'Browned curd'], from: 'raw', step: 'boil, curdle, cook in its whey till brown' },
	rushan: { label: 'Rushan', aka: ['Milk fan', '乳扇'], from: 'chhena', step: 'stretch into sheets, dry' },
	// Set by heat and acid together, straight from hot milk.
	chhena: { label: 'Chhena', aka: ['Chhana', 'Chena'], examples: ['Bandel cheese', 'Adyghe cheese', 'Brousse du Rove'], from: 'pasteurised', step: 'the curd' },
	chhenaWhey: { label: 'Acid whey', from: 'pasteurised', step: 'the whey', link: 'acidWhey' },
	paneer: { label: 'Paneer', examples: ['Rubing', 'Kalari'], from: 'chhena', step: 'press' },
	chhenaSweets: { label: 'Chhena sweets', examples: ['Rasgulla', 'Sandesh', 'Rasmalai', 'Kalakand', 'Chhena poda', 'Pantua', 'Chum chum', 'Rasabali'], from: 'chhena', step: 'knead, shape, sweeten' },
	// Set by an enzyme from a plant: a third way, after rennet and acid.
	plantCheese: {
		label: 'Plant-set cheese',
		examples: ['Wagashi', 'Dangke', 'Torta del Casar', 'Serra da Estrela', 'Queijo de Azeitão', 'Dali ni horbo', 'Litsusu', 'Cologanti', 'Ginger milk curd'],
		from: 'raw',
		step: 'set with a plant enzyme',
	},

	// Set by rennet: the enzyme from a calf's stomach, or a microbial one.
	rennetCurd: { label: 'Rennet curd', aka: ['Bruch', 'Käsebruch'], from: 'raw', alsoFrom: ['pasteurised'], step: 'the curd' },
	cheese: { label: 'Cheese', aka: ['Käse'], from: 'rennetCurd', step: 'make cheese', map: true },
	freshCheese: { mapped: true, label: 'Fresh cheese', aka: ['Frischkäse'], examples: ['Queso fresco', 'Queso blanco', 'Panela', 'Stracchino', 'Robiola', 'Tomino', 'Mató', 'Jben', 'Queijo Minas frescal', 'Kesong puti', 'Renost'], from: 'rennetCurd', alsoFrom: ['lacticCheese'], step: 'drain fresh' },
	lacticCheese: { label: 'Lactic-set cheese', aka: ['Fromage lactique', 'Lactic cheese'], examples: ['Sainte-Maure de Touraine', 'Crottin de Chavignol', 'Selles-sur-Cher', 'Valençay', 'Chabichou du Poitou', 'Pouligny-Saint-Pierre', 'Chaource', "Afuega'l pitu", 'Katiki Domokou', 'Picodon', 'Bouhezza', 'Crowdie'], from: 'raw', alsoFrom: ['pasteurised'], step: 'set slowly with acid, ladle unpressed' },
	soft: { mapped: true, label: 'Soft cheese', aka: ['Weichkäse'], examples: ['Bel Paese', 'Cuartirolo', 'Pule', 'Montebore'], from: 'rennetCurd', step: 'drain unpressed' },
	semiHard: { mapped: true, label: 'Semi-hard cheese', aka: ['Schnittkäse'], examples: ['Manchego', 'Tilsiter', 'Appenzeller', 'Butterkäse', 'Morbier', 'Havarti', 'Saint-Paulin', 'Mahón', 'Oscypek', 'Idiazabal', 'Asiago', 'Montasio', 'Pecorino Toscano', 'Queijo Canastra', 'Queso Chihuahua', 'Ossau-Iraty', 'Pecorino Sardo', 'Majorero', 'Formaggio di fossa', 'Roncal', 'Fiore Sardo', 'Raclette du Valais', 'Tête de Moine', 'Fontina', 'Lancashire', 'Cantal'], from: 'rennetCurd', step: 'press, brine' },
	hard: { mapped: true, label: 'Hard cheese', aka: ['Hartkäse'], examples: ['Parmigiano Reggiano', 'Grana Padano', 'Pecorino Romano', 'Sbrinz', 'Kefalotyri', 'Cotija', 'Rumi', 'Reggianito', 'Graviera Kritis', 'Ladotyri Mytilinis'], from: 'rennetCurd', step: 'scald, press' },
	bloomy: { mapped: true, label: 'Bloomy-rind cheese', aka: ['Weißschimmelkäse'], examples: ['Brie de Meaux', 'Camembert de Normandie', 'Coulommiers', 'Brillat-Savarin', 'Neufchâtel', 'Caravane'], from: 'soft', step: 'grow white mould' },
	blue: { mapped: true, label: 'Blue cheese', aka: ['Blauschimmelkäse'], examples: ['Roquefort', 'Gorgonzola', 'Stilton', 'Danish Blue', 'Cabrales', "Fourme d'Ambert"], from: 'rennetCurd', step: 'pierce, grow blue' },
	washed: { mapped: true, label: 'Washed-rind cheese', aka: ['Smear-ripened cheese', 'Rotschmierkäse'], examples: ['Époisses', 'Munster', 'Limburger', 'Taleggio', 'Herve', 'Reblochon', 'Maroilles', 'Livarot', "Pont-l'Évêque", "Vacherin Mont d'Or"], from: 'soft', step: 'smear the rind' },
	alpine: { mapped: true, label: 'Alpine cheese', aka: ['Bergkäse'], examples: ['Emmentaler', 'Gruyère', 'Comté', 'Beaufort', 'Langtang yak cheese', 'Jarlsberg'], from: 'hard', step: 'scald, ripen' },
	cheddared: { mapped: true, label: 'Cheddared cheese', examples: ['Cheddar', 'Red Leicester', 'Dunlop', 'Double Gloucester', 'Cheese curds'], from: 'rennetCurd', step: 'cheddar' },
	washedCurd: { mapped: true, label: 'Washed-curd cheese', examples: ['Gouda', 'Edam', 'Colby', 'Monterey Jack', 'Leyden', 'Maasdam', 'Brick'], from: 'semiHard', step: 'wash the curd' },
	insect: { mapped: true, label: 'Insect- or mite-\nripened cheese', examples: ['Casu marzu', 'Casgiu merzu', 'Marcetto', 'Mimolette'], from: 'rennetCurd', alsoFrom: ['semiHard', 'washedCurd', 'hard', 'quark'], step: 'ripen with mites or larvae' },
	tulum: { mapped: true, label: 'Tulum', aka: ['Tulum peyniri'], examples: ['Erzincan tulum', 'İzmir tulum', 'Divle', 'Çimi', 'Kargı', 'Guda', 'Brânză de burduf'], from: 'rennetCurd', step: 'pack in skin', note: 'Ripened in an animal skin (tulum), the method that gives it its name. Other skin-packed cheeses exist too, such as Greek touloumotyri.' },
	processed: { label: 'Processed cheese', aka: ['Schmelzkäse'], examples: ['American cheese', 'Cancoillotte', 'Requeijão cremoso', 'Queijo de manteiga', 'Plavleny syrok', 'Velveeta'], from: 'cheese', alsoFrom: ['hard', 'cheddared', 'freshCheese'], step: 'melt', note: 'Made from whatever natural cheese the maker has: mostly Cheddar and Colby in the US, Emmental or Gouda types in Europe, and fresh curd for Cancoillotte and requeijão' },
	cheesePowder: { label: 'Cheese powder', examples: ['Mac and cheese powder', 'Snack seasoning'], from: 'cheese', alsoFrom: ['semiHard', 'hard', 'creamCheese'], step: 'melt with water and salts, spray-dry' },
	grilling: { mapped: true, label: 'Grilling cheese', examples: ['Halloumi', 'Leipäjuusto', 'Queso para freír', 'Queijo de coalho'], from: 'rennetCurd', alsoFrom: ['colostrum'], step: 'heat hard' },
	pastaFilata: {
		mapped: true,
		label: 'Pasta filata\n(mozzarella)',
		aka: ['Stretched-curd cheese', 'Brühkäse'],
		examples: ['Mozzarella di bufala', 'Provolone', 'Provoleta', 'Caciocavallo', 'Kashkaval', 'Queso Oaxaca', 'Kasseri', 'Scamorza', 'Suluguni', 'Chechil', 'Tenili', 'Mudafara', 'String cheese'],
		from: 'rennetCurd',
		step: 'stretch',
	},
	stracciatella: { mapped: true, label: 'Stracciatella', examples: ['Burrata', 'Stracciatella di bufala'], from: 'pastaFilata', alsoFrom: ['cream'], step: 'tear, add cream' },
	lumpCheese: { mapped: true, label: 'Lump cheese\n(hrudkový syr)', from: 'rennetCurd', step: 'drain, ripen' },
	sunDriedCheese: { mapped: true, label: 'Sun-dried cheese', examples: ['Tchoukou'], from: 'rennetCurd', step: 'drain, sun-dry', note: 'Not pressed and not ripened: it is dried in the open air until hard and stored dry.' },
	steamedCheese: { label: 'Steamed cheese (parenica)', aka: ['Parený syr'], examples: ['Parenica', 'Korbáčik', 'Žázrivský korbáčik', 'Oštiepok'], from: 'cheese', step: 'steam in hot water, pull', note: 'Slovak and Goral cheeses: matured lump cheese is scalded and stretched; not the same as oscypek, which is pressed in wooden moulds and smoked, not stretched.' },
	bryndza: { mapped: true, label: 'Bryndza', examples: ['Bryndza podhalańska', 'Slovenská bryndza'], from: 'lumpCheese', step: 'grind with salt' },
	brined: { mapped: true, label: 'Brined cheese\n(feta)', aka: ['Salzlakenkäse', 'White cheese'], examples: ['Feta', 'Sirene', 'Domiati', 'Akkawi', 'Telemea', 'Beyaz peynir', 'Nabulsi', 'Imeruli', 'Lighvan', 'Jibneh Arabieh', 'Otlu peynir', 'Gibna bayda', 'Ezine'], from: 'rennetCurd', step: 'brine' },
	buttermilkCheese: { label: 'Buttermilk cheese', examples: ['Soft chhurpi', 'Datshi', 'Ayib', 'Çökelek', 'Dambalkhacho', 'Klila'], from: 'fermButtermilk', step: 'heat, drain' },
	hardChhurpi: { label: 'Hard chhurpi', aka: ['Durkha', 'Chugo'], from: 'buttermilkCheese', step: 'press, smoke-dry' },
	khoa: { label: 'Khoa', aka: ['Khoya', 'Mawa', 'Khowa'], examples: ['Palkova', 'So', 'Pastillas de leche'], from: 'fresh', step: 'boil down to a solid' },
	khoaSweets: { label: 'Khoa sweets', examples: ['Peda', 'Mathura peda', 'Dharwad peda', 'Barfi', 'Gulab jamun'], from: 'khoa', step: 'sweeten, shape' },
	dulce: {
		label: 'Dulce de leche',
		examples: ['Cajeta', 'Doce de leite', 'Arequipe', 'Manjar', 'Confiture de lait', 'Dulce gatas', 'Varenaya sgushchyonka'],
		from: 'fresh',
		alsoFrom: ['condensed'],
		step: 'simmer with sugar',
	},

	sweetWhey: { label: 'Sweet whey', aka: ['Rennet whey', 'Labmolke', 'Süßmolke'], from: 'raw', alsoFrom: ['pasteurised'], step: 'the whey' },
	acidWhey: { label: 'Acid whey', aka: ['Sauermolke'], examples: ['Sýra'], from: 'curd', alsoFrom: ['yoghurt', 'greek', 'skyr'], step: 'the whey' },
	wheyCream: { label: 'Whey cream', aka: ['Molkenrahm'], from: 'sweetWhey', step: 'separate' },
	wheyButter: { label: 'Whey butter', aka: ['Molkenbutter'], from: 'wheyCream', step: 'churn' },
	// Whey boiled down until its sugar browns; ricotta is the other way, the
	// whey's proteins set out of it by heat and acid.
	wheyCheese: { label: 'Brunost', aka: ['Mysost', 'Braunkäse'], examples: ['Gjetost', 'Gudbrandsdalsost', 'Fløtemysost'], from: 'sweetWhey', alsoFrom: ['cream'], step: 'boil down till brown' },
	prim: { label: 'Prim', aka: ['Mysmør'], examples: ['Messmör', 'Getmessmör'], from: 'sweetWhey', step: 'boil down' },
	ricotta: {
		label: 'Ricotta',
		note: 'Industry runs the same step as heat-precipitated whey protein.',
		examples: ['Requesón', 'Urdă', 'Brocciu', 'Mizithra', 'Manouri', 'Anthotyros', 'Ziger', 'Schabziger', 'Lor', 'Anari', 'Izvara', 'Requeijão (Portugal)', 'Ricotta salata', 'Ricotta forte', 'Ricotta infornata', 'Ricotta affumicata'],
		from: 'sweetWhey',
		step: 'heat with acid',
	},
	creamLiqueur: { label: 'Cream liqueur', aka: ['Sahnelikör', 'Irish cream'], examples: ['Baileys Irish Cream', 'Amarula'], from: 'cream', step: 'blend with spirit, homogenise', note: 'The alcohol (about 17 % vol in Baileys) preserves the cream; the emulsion is held by homogenising with an emulsifier.' },
	wheyVodka: { label: 'Whey vodka', examples: ['Black Cow'], from: 'sweetWhey', alsoFrom: ['permeate'], step: 'ferment the lactose, distil' },
	blaand: { label: 'Blaand', aka: ['Fermented whey drink'], from: 'sweetWhey', alsoFrom: ['acidWhey'], step: 'ferment', note: 'Made by mixing soured whey with water, or by souring whey that has been diluted. The undiluted soured whey is Icelandic sýra, which is listed under acid whey.' },
	wheyPowder: { label: 'Whey powder', aka: ['Molkepulver'], from: 'sweetWhey', step: 'spray-dry' },
	wpc: { label: 'Whey protein\nconcentrate', aka: ['WPC'], from: 'sweetWhey', step: 'what the filter holds' },
	wpi: { label: 'Whey protein\nisolate', aka: ['WPI'], from: 'sweetWhey', alsoFrom: ['skimmed', 'nativeWhey'], step: 'filter and diafilter, or ion exchange' },
	nativeWhey: {
		label: 'Native whey',
		aka: ['Ideal whey', 'Serum protein solution'],
		from: 'skimmed',
		step: 'what passes the filter',
		note: 'Has no glycomacropeptide, because no rennet touched it; that part only exists in sweet whey.',
	},
	permeate: { label: 'Whey permeate', aka: ['Permeat', 'Milchserum'], from: 'sweetWhey', step: 'what passes the filter' },
	delactosedPermeate: { label: 'Delactosed permeate', aka: ['Delac', 'Lactose mother liquor'], from: 'permeate', step: 'what stays after the lactose crystallises', note: 'Despite the name it still holds a lot of lactose and most of the salts, chloride and phosphate above all.' },
	demineralisedWhey: { label: 'Demineralised whey', aka: ['Demin whey', 'Entmineralisierte Molke'], examples: ['Demin 90 (D90)', 'Partly demineralised whey'], from: 'sweetWhey', step: 'take the salts out', note: 'Sold by how much of the ash is gone: roughly 25-30 % for ice cream, bakery and quark, 90-95 % for infant formula. Dried it is a powder of mostly lactose (over 80 % in the infant-formula grades).' },
	infantFormula: { label: 'Infant formula', aka: ['Infant milk formula', 'IMF', 'Säuglingsmilch', 'Anfangsnahrung'], examples: ['Follow-on formula', 'Hydrolysed-protein formula'], from: 'skimmed', alsoFrom: ['demineralisedWhey', 'lactose', 'wpc'], step: 'blend with whey, lactose and oils, spray-dry', note: "Skim milk has too much protein and mineral for a baby, so lactose and demineralised whey are added to bring the casein : whey ratio from milk's roughly 80 : 20 towards human milk's 40 : 60 (the ratio is not controlled in Europe)." },
	microparticulatedWhey: { label: 'Microparticulated\nwhey protein', examples: ['Simplesse'], from: 'wpc', step: 'heat and shear into tiny particles', note: 'About 1-1.3 kcal per gram against 9 for fat; it gels like egg white when cooked, so it goes into cold or lightly heated foods.' },
	heatWheyProtein: { label: 'Heat-precipitated\nwhey protein', aka: ['Denatured whey protein', 'Whey protein coagulum'], from: 'sweetWhey', alsoFrom: ['acidWhey'], step: 'heat and acidify, collect the flocs', note: 'The same chemistry as ricotta, run in a plant: the product goes back into cheese milk (a Camembert trial gained 12 % yield) or into spreads.' },
	milkSerumDrink: { label: 'Milk-serum soft drink', aka: ['Whey soft drink', 'Tafelgetränk auf Milchserumbasis'], examples: ['Rivella'], from: 'permeate', alsoFrom: ['sweetWhey'], step: 'acidify, add fruit extract and flavour' },
	mpc: {
		label: 'Milk protein\nconcentrate',
		aka: ['MPC'],
		examples: ['MPC70', 'MPC80', 'Milk protein isolate (MPI)'],
		from: 'skimmed',
		step: 'what the filter holds, dried',
		note: 'Casein and whey proteins stay in the same ratio as in milk, unlike a caseinate or a whey protein.',
	},
	milkPermeate: {
		label: 'Milk permeate',
		from: 'skimmed',
		step: 'what passes the filter',
		note: 'Mostly lactose and minerals; like whey permeate it is dried and used as a cheap filler and sweetener base.',
	},
	mcc: {
		label: 'Micellar casein\nconcentrate',
		aka: ['MCC', 'Milk colloidal casein concentrate'],
		from: 'skimmed',
		step: 'what the filter holds',
		note: 'Same casein as in milk, still in micelles, unlike caseinate; dried it goes into cheese milk and high-protein drinks.',
	},
	mfgm: { label: 'MFGM concentrate\n(milk phospholipids)', aka: ['Milk fat globule membrane', 'Phospholipid concentrate'], from: 'buttermilk', step: 'remove casein, microfilter', note: 'The globule membrane is about the size of casein micelles, so casein has to be got out first; it can not just be filtered off.' },
	lactose: { label: 'Lactose', aka: ['Milk sugar', 'Milchzucker'], from: 'permeate', step: 'the crystals' },
	lactoseDerivatives: { label: 'GOS', aka: ['Galacto-oligosaccharides'], examples: ['Vivinal GOS'], from: 'lactose', step: 'join with an enzyme' },
	lactitol: {
		label: 'Lactitol',
		aka: ['E966'],
		examples: ['Importal', 'Pizensy'],
		from: 'lactose',
		step: 'hydrogenate',
		note: 'Poorly absorbed: about 2-2.5 kcal/g and 30-40 % of the sweetness of sugar.',
	},
	lactobionicAcid: {
		label: 'Lactobionic acid',
		examples: ['Calcium lactobionate', 'Potassium lactobionate (organ preservation)'],
		from: 'lactose',
		alsoFrom: ['permeate'],
		step: 'oxidise',
		note: 'Potassium lactobionate is the osmotic support in organ-preservation solutions such as Viaspan and CoStorSol.',
	},
	// Made from lactose here; today it is mostly made from starch or sugar instead.
	tagatose: {
		label: 'Tagatose',
		aka: ['D-tagatose'],
		examples: ['Nutrilatose', 'Tagatesse'],
		from: 'lactose',
		step: 'split, then isomerise the galactose',
		note: 'About 92 % as sweet as sugar with 38 % of the calories. Today CJ CheilJedang (Korea) makes it from starch or sugar by enzymes; the lactose route is the Arla and Nutrilab one.',
	},
	lactulose: { label: 'Lactulose', examples: ['Duphalac', 'Kristalose'], from: 'lactose', step: 'rearrange' },
	tabletLactose: {
		label: 'Tablet lactose\n(excipient)',
		aka: ['Pharmaceutical lactose', 'Direct-compression lactose', 'Excipient lactose'],
		examples: ['FlowLac 100 (spray-dried)', 'Tablettose 80 (agglomerated)', 'DuraLac H (anhydrous)'],
		from: 'lactose',
		step: 'spray-dry, agglomerate or dehydrate',
		note: 'Whey permeate is the source: lactose is a cheese by-product.',
	},
	// Lactose milled fine as the carrier powder the drug rides on.
	inhalers: {
		label: 'Inhalation lactose\n(inhaler carrier)',
		aka: ['Inhalation-grade lactose', 'Inhaler lactose', 'DPI carrier lactose'],
		from: 'lactose',
		step: 'mill fine',
		note: 'Used in dry-powder inhalers for asthma and COPD: the lactose is the carrier for the drug, not the device.',
	},
	milkMinerals: {
		label: 'Milk minerals',
		aka: ['Milk calcium', 'Milk mineral concentrate'],
		examples: ['Alamin'],
		from: 'permeate',
		step: 'heat, precipitate calcium phosphate',
		note: 'A calcium supplement and fortifier made from the minerals of whey, not from milk powder.',
	},
	alphaLactalbumin: {
		label: 'alpha-Lactalbumin',
		aka: ['alpha-lac', 'α-La'],
		from: 'wpc',
		alsoFrom: ['nativeWhey'],
		step: 'separate from the other whey proteins',
		note: 'Human milk has about 2.8 g/l of it, cow milk only 1.2 g/l, which is why formula makers add it.',
	},
	betaLactoglobulin: {
		label: 'beta-Lactoglobulin',
		aka: ['BLG', 'beta-lg', 'β-Lg'],
		examples: ['Lacprodan BLG-100'],
		from: 'wpc',
		alsoFrom: ['nativeWhey'],
		step: 'separate from the other whey proteins',
		note: 'The main whey protein of cow milk (about 58 % of whey protein, 18.4 kDa) and absent from human milk.',
	},
	lactoperoxidase: { label: 'Lactoperoxidase', aka: ['LPO'], from: 'sweetWhey', alsoFrom: ['skimmed'], step: 'ion exchange' },
	lactoferrin: { label: 'Lactoferrin', aka: ['Bovine lactoferrin', 'bLF'], from: 'sweetWhey', alsoFrom: ['skimmed'], step: 'ion exchange' },
	glycomacropeptide: { label: 'Glycomacropeptide\n(PKU food)', aka: ['GMP'], examples: ['Glytactin'], from: 'sweetWhey', step: 'isolate' },
	blotto: { label: 'Blotto\n(blocking buffer)', aka: ['Bovine Lacto Transfer Technique Optimizer'], from: 'skimmedPowder', step: 'dissolve at 5 %' },

	acidCasein: { label: 'Acid casein', aka: ['Säurekasein'], from: 'skimmed', step: 'the casein' },
	acidCaseinWhey: { label: 'Acid whey', from: 'skimmed', step: 'the whey', link: 'acidWhey' },
	rennetCasein: { label: 'Rennet casein', aka: ['Labkasein'], from: 'skimmed', step: 'the curd, washed' },
	// The whey drained off it, drawn again here beside its casein.
	caseinWhey: { label: 'Sweet whey', from: 'skimmed', step: 'the whey', link: 'sweetWhey' },
	caseinate: { label: 'Caseinate', examples: ['Sodium caseinate', 'Calcium caseinate', 'Potassium caseinate'], from: 'acidCasein', step: 'neutralise with alkali' },
	caseinGlue: { label: 'Casein glue', aka: ['Kaseinleim', 'Cold-water glue'], examples: ["Elmer's Glue", 'Aircraft glue'], from: 'acidCasein', step: 'mix with lime' },
	wineFiningCasein: {
		label: 'Casein for\nfining wine',
		aka: ['Wine fining casein', 'Kaseinschönung'],
		from: 'caseinate',
		alsoFrom: ['acidCasein'],
		step: 'stir into wine, settle',
		note: 'Milk protein fining agents may need to be declared as allergens; Australia and New Zealand require declaration of fining agents that may be allergenic (Wikipedia); the EU rule was not opened.',
	},
	butterSculpture: {
		label: 'Butter sculpture',
		aka: ['Butter art'],
		examples: ['Iowa State Fair butter cow', 'Tibetan torma'],
		from: 'butter',
		alsoFrom: ['culturedButter'],
		step: 'model cold on a frame',
		note: 'Torma are made of ideally yak butter, dyed, often with flour and milk, hand-moulded as temporary altar offerings at Tibetan New Year.',
	},
	litmusMilk: {
		label: 'Litmus milk\n(test medium)',
		aka: ['Litmus SM broth'],
		from: 'skimmedPowder',
		alsoFrom: ['skimmed'],
		step: 'add litmus, sterilise',
		note: 'Same family as Blotto: skim milk powder used as a lab reagent, not eaten. A related skim-milk test medium is skim milk agar.',
	},
	skimMilkAgar: {
		label: 'Skim milk agar\n(test medium)',
		from: 'skimmed',
		step: 'add agar, sterilise, pour plates',
		note: 'Protease producers make a clear halo around their colonies.',
	},
	milkSpray: {
		label: 'Milk spray\n(garden fungicide)',
		aka: ['Milk fungicide'],
		from: 'raw',
		alsoFrom: ['skimmed'],
		step: 'dilute with water, spray',
		note: 'At 30 % and above mould grew on the upper leaf surface without harming the plants (secondary source).',
	},
	caseinCoating: {
		label: 'Casein coating\n(paper, leather)',
		aka: ['Casein finish', 'Casein leather glaze'],
		examples: ['Casein paper coating', 'Casein leather finish'],
		from: 'caseinate',
		step: 'mix with clay or pigment, coat',
		note: 'Paper coating was replaced by starch and SB latex; leather glazing is a niche that remains.',
	},
	beerLabelGlue: { label: 'Beer-label glue', aka: ['Casein label adhesive'], from: 'caseinate', alsoFrom: ['acidCasein'], step: 'add additives' },
	caseinPaint: {
		label: 'Casein &\nmilk paint',
		aka: ['Kaseinfarbe'],
		examples: ['Milk paint', 'Casein tempera', 'Casein distemper'],
		from: 'acidCasein',
		alsoFrom: ['curd'],
		step: 'dissolve in alkali, add pigment',
	},
	galalith: { label: 'Galalith', aka: ['Casein plastic', 'Kunsthorn'], examples: ['Erinoid', 'Lactoid', 'Aladdinite'], from: 'rennetCasein', step: 'harden in formaldehyde' },
	lanital: { label: 'Casein fibre\n(Lanital)', aka: ['Lanital'], examples: ['Aralac', 'Merinova', 'QMilch'], from: 'acidCasein', step: 'spin into fibre' },
	caseinHydrolysate: {
		label: 'Casein hydrolysate\n(Nutramigen)',
		from: 'acidCasein',
		step: 'break down with enzymes',
	},
	wheyHydrolysate: {
		label: 'Whey protein\nhydrolysate',
		aka: ['WPH', 'Hydrolysed whey protein'],
		examples: ['Partially hydrolysed whey (4-10 % DH)', 'Extensively hydrolysed whey'],
		from: 'wpc',
		alsoFrom: ['wpi'],
		step: 'break down with enzymes',
		note: 'Partial hydrolysates are made to be less allergenic; extensive ones (over 90 % hydrolysed in patent wording) for babies with cow milk protein allergy. The price is bitterness.',
	},
	cppAcp: { label: 'CPP-ACP\n(Recaldent)', examples: ['Tooth Mousse', 'MI Paste'], from: 'caseinate', step: 'digest, bind calcium' },
};
