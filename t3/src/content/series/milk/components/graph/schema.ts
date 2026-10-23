import { z } from 'astro/zod';

/*
 * The milk graph's data (see MilkGraph.astro), as schemas: what is kept of
 * each product, of each example and cheese on the map, and of each arrow.
 * Every record is keyed by a product's id, or by its name for an example or
 * a cheese; which ids and names there are, and that each one named is there,
 * MilkGraph checks as it builds.
 *
 * Whatever is said of the world comes with its sources (see Sources): what
 * a product is called and what it is made from, where it is from, which
 * animals give its milk, how it is made, how much of it there is. Only how
 * it is drawn does not: a panel, a ruler's marks, a product drawn again.
 */

/* Where something said was found: at least one link, and in words what was
   taken from them, how anything was worked out from it, and what in it is
   not checked. A figure worked out from others links to those. */
export const Link = z.object({ name: z.string().min(1), url: z.url() });
export const Sources = z.object({
	links: z.array(Link).min(1),
	text: z.string().min(1),
});
/* Said without a source yet: kept, and counted, rather than given a link
   it does not have; in words what is missing, or what it rests on. */
export const Unsourced = z.object({ unsourced: z.literal(true), text: z.string().min(1) });
export const Sourcing = z.union([Sources, Unsourced]);

// A country, by its ISO 3166-1 alpha-2 code.
export const Country = z.string().regex(/^[A-Z]{2}$/);

// The animals milked: a product's or an example's (MILK_OF), and the map's cheeses' (cheeses.json).
export const Beast = z.enum(['cow', 'sheep', 'goat', 'horse', 'donkey', 'buffalo', 'camel', 'yak', 'reindeer']);
// A regional product's countries, each drawn as its flag: made in more than four, it is not regional.
export const MOST_COUNTRIES = 4;
export const Countries = z.array(Country).min(1).max(MOST_COUNTRIES);

// A photograph, and its credit (IMAGES, EXAMPLE_IMAGES): its sources its page on Wikimedia Commons.
export const Picture = z.object({
	file: z.string(),
	author: z.string(),
	license: z.string(),
	sources: Sourcing,
});

// What a product or an example is, said on its card (about.json).
export const About = z.object({ text: z.string(), sources: Sourcing });
export const AboutFile = z.object({
	products: z.record(z.string(), About),
	examples: z.record(z.string(), About),
});

// The countries a product or an example is from (regions.json).
export const Regions = z.object({ countries: Countries, sources: Sourcing });
export const RegionsFile = z.record(z.string(), Regions);

// The animals whose milk a product or an example is made from, where not only cows' (MILK_OF).
export const Beasts = z.object({ beasts: z.array(Beast).min(1), sources: Sourcing });

/* ---- Each node: a product ---- */

// Its place in the tree and how it is drawn (NODES; see Product).
export const Product = z.object({
	// Drawn on its pill, a line break where it wraps.
	label: z.string(),
	// Its other names, here and elsewhere: found by the search, not drawn.
	aka: z.array(z.string()).optional(),
	// Drawn as leaves under it, or in its panel.
	examples: z.array(z.string()).optional(),
	// What it is made from, and how, written on the arrow in; the other ways it is made, not drawn.
	from: z.string().optional(),
	step: z.string().optional(),
	alsoFrom: z.array(z.string()).optional(),
	// A remark behind an info mark on its pill.
	note: z.string().optional(),
	// For all of the above: its names, its examples being of it, what it is made from and how, its remark.
	sources: Sourcing,
	// How it is drawn, needing no sources: a kind with a ruler under it, and where on its parent's ruler one hangs.
	scale: z.object({ name: z.string(), unit: z.string(), to: z.number(), every: z.number() }).optional(),
	at: z.number().optional(),
	// Its examples in a panel, by ripening and firmness; the map of the world's cheeses under it; a family only on the map.
	panel: z.boolean().optional(),
	map: z.boolean().optional(),
	mapped: z.boolean().optional(),
	// Drawn just below the branch of this sibling.
	below: z.string().optional(),
	// Not a product of its own but this one drawn again.
	link: z.string().optional(),
});
export const Products = z.record(z.string(), Product);

// The families the products are in, in order; one with a hub drawn as one branch where a parent has two or more of it (GROUPS).
export const Group = z.object({ name: z.string(), hub: z.string().optional(), ids: z.array(z.string()), sources: Sourcing });

// How much a product matters to how people eat and live: 0 a staple, 1 well known, 2 niche (STAPLE, KNOWN).
export const Significance = z.object({ niche: z.union([z.literal(0), z.literal(1), z.literal(2)]), sources: Sourcing });

// How much of it is made, as its mass in million tonnes a year (SHARES).
export const Share = z.object({ mt: z.number().nonnegative(), sources: Sourcing });

// Everything kept of a product, gathered from all its records.
export const Node = Product.extend({
	id: z.string(),
	about: About,
	image: Picture.optional(),
	regions: Regions.optional(),
	beasts: Beasts.optional(),
	group: z.string(),
	significance: Significance,
	share: Share.optional(),
});

/* ---- Each example ---- */

export const Firm = z.enum(['fresh', 'soft', 'semi-soft', 'semi-hard', 'hard', 'extra-hard']);
// Where a cheese goes in a panel: how firm, and the least and most days it is ripened (EXAMPLE_AXES).
export const Axes = z.object({ firm: Firm, days: z.tuple([z.number(), z.number()]), sources: Sourcing });

export const Example = z.object({
	name: z.string(),
	about: About.optional(),
	image: Picture.optional(),
	// Its other names (EXAMPLE_AKA), and a remark on it (EXAMPLE_NOTES).
	aka: z.object({ names: z.array(z.string()).min(1), sources: Sourcing }).optional(),
	note: z.object({ text: z.string(), sources: Sourcing }).optional(),
	regions: Regions.optional(),
	beasts: Beasts.optional(),
	axes: Axes.optional(),
	// How it is made from its product, where its step is its own (steps.json).
	how: z.lazy(() => How).optional(),
});

/* ---- Each cheese on the map (cheeses.json) ---- */

export const Cheese = z.object({
	name: z.string(),
	aka: z.array(z.string()),
	// The id of its family, and of a second one it is of too.
	family: z.string(),
	secondary: z.string().optional(),
	countries: z.array(Country),
	milk: z.array(Beast),
	firm: Firm.nullable(),
	days: z.tuple([z.number(), z.number()]).nullable(),
	// The days not found in a source, but its family's usual.
	estimated: z.boolean(),
	coagulation: z.enum(['rennet', 'rennet-acid', 'acid', 'acid-heat', 'plant', 'heat', 'none']).optional(),
	rind: z.enum(['washed', 'none', 'natural', 'bloomy', 'brine', 'other', 'waxed']).nullable().optional(),
	protected: z.enum(['PDO', 'PGI', 'TSG']).nullable().optional(),
	desc: z.string().optional(),
	/* Where in its first country it is made: the region, the place as
	   latitude and longitude and as x and y on the map, and whether that
	   was said in its source, known, or guessed. */
	region: z.string().nullable().optional(),
	lat: z.number().optional(),
	lon: z.number().optional(),
	x: z.number().optional(),
	y: z.number().optional(),
	located: z.enum(['hint', 'knowledge', 'guess']).nullable().optional(),
	// How sure all of the above is, and where it was found.
	confidence: z.enum(['high', 'medium', 'low']),
	sources: Sourcing,
});
export const Cheeses = z.array(Cheese);

// The world's outline (map.json): its height against a width of 1, and each country's name, label point and rings as flat x, y pairs.
export const WorldMap = z.object({
	height: z.number(),
	countries: z.record(
		Country,
		z.object({ name: z.string(), label: z.tuple([z.number(), z.number()]), rings: z.array(z.array(z.number())) }),
	),
	sources: Sourcing,
});

/* ---- Each arrow ---- */

/* A measure that is seldom one number: between a least and a most, or
   only one of them ("above 40 °C", "up to 6 days"), and whether either is
   only about so ("about 23 °C", "overnight"). */
export const Range = z
	.object({ min: z.number().optional(), max: z.number().optional(), about: z.boolean().optional() })
	.refine((r) => r.min !== undefined || r.max !== undefined, 'a range needs a least or a most')
	.refine((r) => r.min === undefined || r.max === undefined || r.min <= r.max, 'a range runs from its least to its most');

/* A living thing at work in a ferment, by its name today, with the names
   it is still found under; or, where no species is named, the group it is
   of ("thermophilic lactic acid bacteria"). An animal is one too: the mites
   and the larvae some cheeses are ripened by. */
export const Microbe = z.object({
	name: z.string(),
	formerly: z.array(z.string()).optional(),
	kind: z.enum(['bacterium', 'yeast', 'mould', 'animal']),
	// What it is there for: the acid, the aroma (diacetyl), the gas (eyes, fizz), the slime of a ropy milk, the alcohol, a rind, a claim of health.
	does: z.array(z.enum(['acid', 'aroma', 'gas', 'slime', 'alcohol', 'rind', 'ripening', 'probiotic'])).min(1),
	// At what temperatures it grows best, where the source groups it so rather than naming a species.
	grows: z.enum(['mesophilic', 'thermophilic']).optional(),
	// Found rather than added: its share of the isolates in a survey of the traditional product, in percent.
	isolates: z.number().min(0).max(100).optional(),
});

/* How the microbes get into the milk: a starter of known cultures; a
   little of the last batch (back-slopping); kefir grains; the milk's own
   flora, left to itself; the vessel it sours in (a gourd, a smoked pot, a
   bamboo tube, a bag kept from last year); or the air of the place it
   ripens in (Roquefort's caves). */
export const Inoculum = z.object({
	by: z.enum(['starter', 'backslop', 'grains', 'wild', 'vessel', 'air']),
	// How much is put in, as a share of the milk, in percent.
	dose: Range.optional(),
	// What it sours in, where that matters: the gourd, the pot, how it is smoked.
	vessel: z.string().optional(),
});

/* One stretch of a ferment: held so warm, so long, and so damp, until it
   is so sour. Most ferments are one stretch; kefir is two (soured at
   23 °C, then ripened cool), and a mould cheese three (soured, dried,
   ripened). Temperatures in °C, times in hours, humidity and alcohol in
   percent, acidity as percent lactic acid. */
export const Stretch = z.object({
	does: z.enum(['incubate', 'ripen', 'dry', 'smear', 'pierce']),
	temperature: Range.optional(),
	hours: Range.optional(),
	humidity: Range.optional(),
	// Where it stops, or must have reached by law.
	pH: Range.optional(),
	acidity: Range.optional(),
	alcohol: Range.optional(),
});

/* Everything needed to say how milk, cream, whey or a curd is fermented:
   what by, how they got there, and how it is held until it is done; in
   words what none of these hold. Lactic is the souring of lactose into
   lactic acid, by bacteria alone (yoghurt, quark) or with yeasts too,
   making alcohol and fizz (kefir, kumis); mould and smear ripen a cheese
   from its surface or from within. */
export const Ferment = z.object({
	kinds: z.array(z.enum(['lactic', 'yeast', 'mould', 'smear', 'propionic'])).min(1),
	microbes: z.array(Microbe),
	inoculum: Inoculum,
	stretches: z.array(Stretch).min(1),
	text: z.string().optional(),
	sources: Sourcing,
});

const Row = z.object({ k: z.string(), v: z.string() });
/* How the product at an arrow's head is made (steps.json): a table
   drawn on the arrow, facts and words told on its card, and their sources;
   an example's step its own words, there being no arrow to write them on. */
export const How = z.object({
	label: z.string().optional(),
	table: z.array(Row).optional(),
	facts: z.array(Row).optional(),
	text: z.string().optional(),
	sources: Sourcing,
	// How it is fermented, where it is: not yet filled in from the table's and the facts' rows.
	ferment: Ferment.optional(),
});
export const Steps = z.record(z.string(), How);

// Products made together by one step, from one parent: one arrow, split (SPLITS).
export const Split = z.object({ from: z.string(), step: z.string(), ids: z.array(z.string()).min(2), sources: Sourcing });

// Kinds of a family's step: one branch off the family's hub, named, before each splits off (KINDS).
export const Kind = z.object({ step: z.string(), ids: z.array(z.string()), how: How });

// Everything kept of an arrow, from its parent to the product at its head.
export const Arrow = z.object({
	from: z.string(),
	to: z.string(),
	// Its words: the product's step, or the split's or the kind's it is part of; their sources are theirs.
	step: z.string(),
	how: How.optional(),
	split: Split.optional(),
	kind: Kind.shape.step.optional(),
	// How near its product sits, needing no sources: a light step (TREATED, LIGHT) counts for 0.4, any other for 1.
	weight: z.union([z.literal(1), z.literal(0.4)]),
});

export type Sources = z.infer<typeof Sources>;
export type Beast = z.infer<typeof Beast>;
export type Firm = z.infer<typeof Firm>;
export type Sourcing = z.infer<typeof Sourcing>;
export type Picture = z.infer<typeof Picture>;
export type About = z.infer<typeof About>;
export type Share = z.infer<typeof Share>;
export type Product = z.infer<typeof Product>;
export type Node = z.infer<typeof Node>;
export type Example = z.infer<typeof Example>;
export type Cheese = z.infer<typeof Cheese>;
export type How = z.infer<typeof How>;
export type Arrow = z.infer<typeof Arrow>;
export type Ferment = z.infer<typeof Ferment>;
