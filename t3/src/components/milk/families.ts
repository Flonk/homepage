import type { How } from './schema';

/**
 * The families, each given its own slice of the circle round milk, in the
 * order milk flows through them: the milks themselves, what is skimmed off
 * them, what is boiled down, soured, distilled, curdled, and what is left of
 * the curd, out to what industry, the workshop and medicine make of that,
 * and round again to colostrum beside the milks. Every product but milk is
 * in exactly one.
 *
 * A family with a `hub` is drawn as one branch where a parent has two or
 * more of it: a single arrow out of the parent, labelled with the hub, that
 * then splits into the family, each with its own step (pasteurised milk,
 * "ferment", then soured milk, kefir, yoghurt). A family without one already
 * starts at a product of its own (cream at raw cream, cheese at rennet curd).
 */
export const GROUPS: { name: string; hub?: string; ids: string[] }[] = [
	{
		name: 'Milks',
		ids: ['certified', 'homogenised', 'pasteurised', 'fresh', 'esl', 'uht', 'thermised', 'sterilised', 'evaporated', 'milkPowder', 'maltedMilk', 'flavouredMilk', 'milkTea', 'lactoseFree', 'tonedMilk', 'bakedMilk', 'skimRaw', 'semi', 'semiUht', 'semiEvaporated', 'skimmed', 'ultrafilteredMilk', 'skimmedEvaporated', 'skimmedPowder', 'calfReplacer', 'recombined', 'reconstituted', 'infantFormula'],
	},
	{
		name: 'Creams',
		ids: ['rawCream', 'cream', 'clotted', 'creamGrades', 'coffeeCream', 'kaffeeobers', 'cremeDeLeite', 'halfAndHalf', 'cremeLegere', 'kaffeerahm', 'singleCream', 'lightCream', 'namaKurimu', 'mediaCrema', 'pannaDaCucina', 'schlagsahne', 'schlagobers', 'cremeFluide', 'vollrahm', 'thickenedCream', 'whipping', 'heavyCream', 'cremeDouble', 'vispgradde', 'doppelrahm', 'double', 'evaporatedCream', 'whippedCream', 'culturedCream', 'saureSahne', 'graddfil', 'sauerrahm', 'saurerHalbrahm', 'smetana', 'sourCream', 'tejfol', 'schmand', 'cremeFraiche', 'romme', 'cremaMexicana', 'mascarpone', 'posset', 'pannaCotta', 'rommegrot'],
	},
	{
		name: 'Butter & fat',
		ids: ['butter', 'culturedButter', 'culturedButtermilk', 'mildButter', 'butterfat', 'gheeResidue', 'brownButter', 'clarified', 'amf', 'milkFatFractions', 'smen', 'bogButter', 'nitirKibbeh', 'butterTea', 'churn', 'buttermilk', 'staka', 'stakovoutiro'],
	},
	{
		name: 'Cooked & sweet',
		hub: 'cook down',
		ids: ['condensed', 'dulce', 'khoa', 'khoaSweets', 'rabri', 'kulfi', 'nimish', 'kheer', 'milkPudding', 'iceCream', 'milkshake', 'frozenYoghurt', 'gomme', 'junket', 'custard', 'milkChocolate', 'milkCaramel', 'brigadeiro'],
	},
	{
		name: 'Fermented',
		hub: 'ferment',
		ids: ['soured', 'dickmilch', 'filmjolk', 'dahi', 'ymer', 'ymerWhey', 'cultureButtermilk', 'piima', 'ropy', 'ryazhenka', 'kefir', 'mildYoghurt', 'probioticYoghurt', 'probioticDrink', 'yoghurt', 'mishtiDoi', 'creamYoghurt', 'heatTreatedYoghurt', 'shanklish', 'zhentytsia', 'greek', 'greekWhey', 'ayran', 'fermButter', 'fermButtermilk', 'driedYoghurt', 'kishk', 'qaraqurut', 'dadiah', 'mursik', 'choormog', 'milletMilk', 'calpis'],
	},
	{ name: 'Alcohol', hub: 'make alcohol', ids: ['kumis', 'arkhi', 'arkhiGrades', 'stillCheese', 'blaand', 'wheyVodka', 'creamLiqueur'] },
	{
		name: 'Acid & heat-set',
		hub: 'set with acid',
		ids: ['curd', 'quark', 'cottageCheese', 'creamCheese', 'skyr', 'skyrWhey', 'sourMilkCheese', 'cookedCheese', 'mish', 'byaslag', 'eezgii', 'rushan', 'chhena', 'chhenaWhey', 'paneer', 'chhenaSweets', 'sweetCurd', 'cheesecake', 'plantCheese', 'buttermilkCheese', 'hardChhurpi'],
	},
	{
		name: 'Cheese',
		ids: ['rennetCurd', 'cheese', 'freshCheese', 'lacticCheese', 'soft', 'semiHard', 'hard', 'bloomy', 'blue', 'washed', 'alpine', 'cheddared', 'washedCurd', 'insect', 'tulum', 'processed', 'cheesePowder', 'grilling', 'pastaFilata', 'stracciatella', 'lumpCheese', 'steamedCheese', 'bryndza', 'sunDriedCheese', 'brined'],
	},
	{
		name: 'Whey',
		ids: ['sweetWhey', 'acidWhey', 'wheyCream', 'wheyButter', 'wheyCheese', 'prim', 'ricotta', 'wheyPowder', 'wpc', 'wpi', 'permeate', 'delactosedPermeate', 'demineralisedWhey', 'heatWheyProtein', 'microparticulatedWhey', 'milkSerumDrink', 'nativeWhey'],
	},
	{
		name: 'Sugars & proteins',
		hub: 'fractionate',
		ids: ['lactose', 'lactoseDerivatives', 'lactitol', 'lactobionicAcid', 'tagatose', 'milkMinerals', 'alphaLactalbumin', 'betaLactoglobulin', 'acidCasein', 'acidCaseinWhey', 'rennetCasein', 'caseinWhey', 'caseinate', 'lactoferrin', 'mpc', 'milkPermeate', 'mcc', 'mfgm'],
	},
	{ name: 'Materials', hub: 'make materials', ids: ['caseinGlue', 'beerLabelGlue', 'caseinPaint', 'galalith', 'lanital', 'blotto', 'wineFiningCasein', 'butterSculpture', 'litmusMilk', 'skimMilkAgar', 'milkSpray', 'caseinCoating'] },
	{
		name: 'Medicine',
		ids: ['lactulose', 'inhalers', 'glycomacropeptide', 'caseinHydrolysate', 'wheyHydrolysate', 'cppAcp', 'milkDrugs', 'travelan', 'lactotripeptide', 'lactoperoxidase', 'tabletLactose', 'donorMilk', 'ghrita'],
	},
	{ name: 'Colostrum', ids: ['colostrum', 'colostrumPudding', 'colostrumPowder'] },
];

/**
 * Products made together by one step, from one parent: the step drawn as
 * one arrow out of the parent, split into each of them, its own words on
 * each part. Separating milk makes the cream and the skimmed milk at once,
 * not one and then the other, as churning cream makes the butter and the
 * liquid it leaves.
 */
/**
 * Kinds of one family's step: those of a family made by one kind of it
 * drawn as one branch off the family's hub, the kind's name on it, before
 * each splits off with its own step. Fermented milks by what ferments them
 * and how warm, after Robinson and Tamime: lactococci at room temperature,
 * yoghurt's bacteria warm. (Kefir, with yeasts besides, is alone in its kind
 * here, so its own step says so.) `how` is told of when the kind's arrow is
 * clicked, as a product's step is (see steps.json).
 */
export const KINDS: { step: string; ids: string[]; how: How }[] = [
	{
		step: 'mesophilic, 20–30 °C',
		ids: ['soured', 'dickmilch', 'filmjolk', 'dahi', 'ymer', 'cultureButtermilk', 'piima', 'ropy'],
		how: {
			facts: [
				{ k: 'Bacteria', v: 'Lactococcus lactis and its subspecies, often with Leuconostoc' },
				{ k: 'Temperature', v: '20–30 °C, room temperature' },
				{ k: 'Time', v: 'Most of a day, about 15–24 h' },
				{ k: 'Made', v: 'Soured milks, ropy milks, cultured buttermilk, sour cream' },
			],
			text: 'Lactococci grow best at room temperature, so they sour milk slowly and gently, into a soft set curd with a fresh, often buttery aroma. Where it is cool, as in northern Europe, milk left to stand sours this way, and the fermented milks there are mostly of this kind.',
			sources: { links: [{ name: 'Bintsis & Papademas 2022, Fermentation 8:679', url: 'https://doi.org/10.3390/fermentation8120679' }, { name: 'Tetra Pak Dairy Processing Handbook, ch. 13 Fermented milk products', url: 'https://dairyprocessinghandbook.tetrapak.com/chapter/fermented-milk-products' }], text: 'The bacteria, how warm and how long, and what they make, from these.' },
		},
	},
	{
		step: 'thermophilic, 40–45 °C',
		ids: ['yoghurt', 'mildYoghurt', 'probioticYoghurt', 'creamYoghurt', 'heatTreatedYoghurt'],
		how: {
			facts: [
				{ k: 'Bacteria', v: 'Streptococcus thermophilus with a Lactobacillus, in yoghurt L. bulgaricus' },
				{ k: 'Temperature', v: '40–45 °C' },
				{ k: 'Time', v: 'A few hours, about 3–5 h' },
				{ k: 'Made', v: 'Yoghurt, cream yoghurt, and yoghurts with other lactobacilli besides or instead' },
			],
			text: 'These bacteria grow best warm, so they sour milk fast and sharply, into a firmer gel. Where it is hot, from the Balkans and the Middle East to Central Asia, milk kept warm sours this way, and the fermented milks there are mostly of this kind.',
			sources: { links: [{ name: 'Bintsis & Papademas 2022, Fermentation 8:679', url: 'https://doi.org/10.3390/fermentation8120679' }, { name: 'Tetra Pak Dairy Processing Handbook, ch. 13 Fermented milk products', url: 'https://dairyprocessinghandbook.tetrapak.com/chapter/fermented-milk-products' }, { name: 'Codex Standard for Fermented Milks (CXS 243-2003)', url: 'https://www.fao.org/input/download/standards/400/CXS_243e.pdf' }], text: 'The bacteria, how warm and how long, and what they make, from these.' },
		},
	},
];

export const SPLITS: { from: string; step: string; ids: string[] }[] = [
	{ from: 'raw', step: 'separate', ids: ['rawCream', 'skimRaw'] },
	{ from: 'cream', step: 'churn', ids: ['butter', 'churn'] },
	{ from: 'cream', step: 'cook with flour, stir', ids: ['staka', 'stakovoutiro'] },
	{ from: 'butter', step: 'simmer until brown', ids: ['butterfat', 'gheeResidue'] },
	{ from: 'soured', step: 'churn', ids: ['fermButter', 'fermButtermilk'] },
	{ from: 'skimmed', step: 'set with rennet', ids: ['rennetCasein', 'caseinWhey'] },
	{ from: 'raw', step: 'set with rennet', ids: ['rennetCurd', 'sweetWhey'] },
	{ from: 'sweetWhey', step: 'ultrafilter', ids: ['wpc', 'permeate'] },
	{ from: 'permeate', step: 'crystallise', ids: ['lactose', 'delactosedPermeate'] },
	{ from: 'skimmed', step: 'ultrafilter', ids: ['mpc', 'milkPermeate'] },
	{ from: 'skimmed', step: 'microfilter', ids: ['mcc', 'nativeWhey'] },
	{ from: 'skimmed', step: 'ferment, drain', ids: ['ymer', 'ymerWhey'] },
	{ from: 'yoghurt', step: 'strain', ids: ['greek', 'greekWhey'] },
	{ from: 'curd', step: 'drain', ids: ['quark', 'acidWhey'] },
	{ from: 'curd', step: 'strain', ids: ['skyr', 'skyrWhey'] },
	{ from: 'pasteurised', step: 'curdle hot with acid', ids: ['chhena', 'chhenaWhey'] },
	{ from: 'skimmed', step: 'precipitate with acid', ids: ['acidCasein', 'acidCaseinWhey'] },
	{ from: 'cream', step: 'culture, ripen, churn', ids: ['culturedButter', 'culturedButtermilk'] },
	{ from: 'soured', step: 'distil', ids: ['arkhi', 'stillCheese'] },
];

/**
 * How close a product is to milk: the steps of making it, but a step that
 * only treats milk (heating it, homogenising it, skimming it, separating its
 * cream off) counts for less than one that turns it into something else. So
 * pasteurised milk sits nearer than yoghurt, and yoghurt nearer than the
 * cheese made from its curd. These are the products made by such a step; an
 * arrow into one of them is a light one.
 */
export const TREATED = new Set([
	'certified', 'homogenised', 'pasteurised', 'fresh', 'esl', 'uht', 'sterilised',
	'skimRaw', 'semi', 'semiUht', 'skimmed', 'rawCream', 'cream',
]);
// What a light step counts for, against 1 for any other.
export const LIGHT = 0.4;

/**
 * How much a product matters to how people eat and live, as a second pull
 * on how far out it sits: the everyday staples in close, the well known a
 * little further, and everything else, the regional and the curious, out
 * past them. A product in neither list is niche.
 */
export const STAPLE = new Set([
	'pasteurised', 'homogenised', 'fresh', 'uht', 'semi', 'skimmed', 'milkPowder', 'skimmedPowder', 'evaporated', 'condensed',
	'rawCream', 'cream', 'whipping', 'culturedCream', 'sourCream', 'butter', 'butterfat', 'buttermilk',
	'soured', 'yoghurt', 'greek', 'kefir', 'iceCream',
	'curd', 'quark', 'paneer', 'rennetCurd', 'cheese', 'freshCheese', 'soft', 'semiHard', 'hard', 'pastaFilata', 'processed',
	'sweetWhey', 'wheyPowder', 'wpc', 'lactose',
]);
export const KNOWN = new Set([
	'lacticCheese',
	'certified', 'esl', 'sterilised', 'colostrum', 'lactoseFree',
	'coffeeCream', 'double', 'clotted', 'saureSahne', 'schmand', 'cremeFraiche', 'mascarpone',
	'culturedButter', 'clarified', 'amf',
	'filmjolk', 'mildYoghurt', 'probioticYoghurt', 'probioticDrink', 'creamYoghurt', 'skyr', 'ayran', 'driedYoghurt', 'ryazhenka', 'fermButter', 'fermButtermilk', 'choormog', 'kumis',
	'chhena', 'chhenaSweets', 'cottageCheese', 'creamCheese', 'khoa', 'khoaSweets', 'dulce', 'kulfi', 'rabri', 'custard', 'milkChocolate',
	'bloomy', 'blue', 'washed', 'alpine', 'cheddared', 'washedCurd', 'brined', 'grilling', 'stracciatella',
	'acidWhey', 'ricotta', 'wheyCheese', 'wpi', 'acidCasein', 'caseinate',
	'lactulose', 'inhalers',
]);
