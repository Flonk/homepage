import type * as S from './schema';

/**
 * The families, each given its own slice of the circle round milk, in the
 * order milk flows through them: the milks themselves, what is skimmed off
 * them, what is boiled down, soured, distilled, curdled, and what is left of
 * the curd, out to what industry, the workshop and medicine make of that,
 * and round again to colostrum beside the milks. Every product but milk is
 * in exactly one.
 *
 * Its own slice and colour only: what is drawn together within it is
 * what starts out made the same way (see the layout's sort of siblings).
 */
export const GROUPS: S.Group[] = [
	{
		name: 'Milks',
		ids: ['certified', 'homogenised', 'pasteurised', 'fresh', 'esl', 'uht', 'thermised', 'sterilised', 'evaporated', 'milkPowder', 'maltedMilk', 'flavouredMilk', 'milkTea', 'lactoseFree', 'tonedMilk', 'bakedMilk', 'skimRaw', 'semi', 'semiUht', 'semiEvaporated', 'skimmed', 'ultrafilteredMilk', 'skimmedEvaporated', 'skimmedPowder', 'calfReplacer', 'recombined', 'reconstituted', 'infantFormula'],
	},
	{
		name: 'Creams',
		ids: ['rawCream', 'cream', 'clotted', 'coffeeCream', 'kaffeeobers', 'cremeDeLeite', 'halfAndHalf', 'cremeLegere', 'kaffeerahm', 'singleCream', 'lightCream', 'namaKurimu', 'mediaCrema', 'pannaDaCucina', 'schlagsahne', 'schlagobers', 'cremeFluide', 'vollrahm', 'thickenedCream', 'whipping', 'heavyCream', 'cremeDouble', 'vispgradde', 'doppelrahm', 'double', 'evaporatedCream', 'whippedCream', 'culturedCream', 'saureSahne', 'graddfil', 'sauerrahm', 'saurerHalbrahm', 'smetana', 'sourCream', 'tejfol', 'schmand', 'cremeFraiche', 'romme', 'cremaMexicana', 'mascarpone', 'posset', 'pannaCotta', 'rommegrot'],
	},
	{
		name: 'Butter & fat',
		ids: ['butter', 'culturedButter', 'culturedButtermilk', 'mildButter', 'butterfat', 'gheeResidue', 'brownButter', 'clarified', 'amf', 'milkFatFractions', 'smen', 'bogButter', 'nitirKibbeh', 'butterTea', 'churn', 'buttermilk', 'staka', 'stakovoutiro'],
	},
	{
		name: 'Cooked & sweet',
		ids: ['condensed', 'dulce', 'khoa', 'khoaSweets', 'rabri', 'kulfi', 'nimish', 'kheer', 'milkPudding', 'iceCream', 'milkshake', 'frozenYoghurt', 'gomme', 'junket', 'custard', 'milkChocolate', 'milkCaramel', 'brigadeiro'],
	},
	{
		name: 'Fermented',
		ids: ['soured', 'dickmilch', 'filmjolk', 'dahi', 'ymer', 'ymerWhey', 'cultureButtermilk', 'piima', 'ropy', 'ryazhenka', 'kefir', 'mildYoghurt', 'probioticYoghurt', 'probioticDrink', 'yoghurt', 'mishtiDoi', 'creamYoghurt', 'heatTreatedYoghurt', 'shanklish', 'zhentytsia', 'greek', 'greekWhey', 'ayran', 'fermButter', 'fermButtermilk', 'driedYoghurt', 'kishk', 'qaraqurut', 'dadiah', 'mursik', 'choormog', 'milletMilk', 'calpis'],
	},
	{ name: 'Alcohol', ids: ['kumis', 'arkhi', 'arkhiGrades', 'stillCheese', 'blaand', 'wheyVodka', 'creamLiqueur'] },
	{
		name: 'Acid & heat-set',
		ids: ['curd', 'quark', 'magerquark', 'speisequark20', 'sahnequark', 'rahmquark', 'doppelrahmquark', 'cottageCheese', 'creamCheese', 'skyr', 'skyrWhey', 'sourMilkCheese', 'cookedCheese', 'mish', 'byaslag', 'eezgii', 'rushan', 'chhena', 'chhenaWhey', 'paneer', 'chhenaSweets', 'sweetCurd', 'cheesecake', 'plantCheese', 'buttermilkCheese', 'hardChhurpi'],
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
		ids: ['lactose', 'lactoseDerivatives', 'lactitol', 'lactobionicAcid', 'tagatose', 'milkMinerals', 'alphaLactalbumin', 'betaLactoglobulin', 'acidCasein', 'acidCaseinWhey', 'rennetCasein', 'caseinWhey', 'caseinate', 'lactoferrin', 'mpc', 'milkPermeate', 'mcc', 'mfgm'],
	},
	{ name: 'Materials', ids: ['caseinGlue', 'beerLabelGlue', 'caseinPaint', 'galalith', 'lanital', 'blotto', 'wineFiningCasein', 'butterSculpture', 'litmusMilk', 'skimMilkAgar', 'milkSpray', 'caseinCoating'] },
	{
		name: 'Medicine',
		ids: ['lactulose', 'inhalers', 'glycomacropeptide', 'caseinHydrolysate', 'wheyHydrolysate', 'cppAcp', 'milkDrugs', 'travelan', 'lactotripeptide', 'lactoperoxidase', 'tabletLactose', 'donorMilk', 'ghrita'],
	},
	{ name: 'Colostrum', ids: ['colostrum', 'colostrumPudding', 'colostrumPowder'] },
];

// What a light step counts for, against 1 for any other (see light in the schema's Node).
export const LIGHT = 0.4;
