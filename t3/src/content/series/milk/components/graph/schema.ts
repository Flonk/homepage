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
/* Sources of its own, on anything said inside a record that has its
   sources: a step of a processing, a row of a table, a microbe; where it
   is from somewhere other than the rest. Where it has none, what holds it
   vouches for it: a step its processing's, a row its step's. */
const Own = { sources: Sourcing.optional() };

/* ---- What a bare string or number stands for ---- */

// A country, by its ISO 3166-1 alpha-2 code; that it is one on the map, the graph checks as it builds.
export const Country = z.string().regex(/^[A-Z]{2}$/);
// A product, by its id: what it is made from, drawn below, drawn again (which ids there are, the graph checks as it builds).
export const ProductId = z.string().regex(/^[a-z][A-Za-z0-9]*$/);
// How firm a cheese is, where a panel puts it.
export const Firm = z.enum(['fresh', 'soft', 'semi-soft', 'semi-hard', 'hard', 'extra-hard']);
// A protected name: a designation of origin, a geographical indication, a traditional speciality.
export const Protected = z.enum(['PDO', 'PGI', 'TSG']);
// A cheese's rind.
export const Rind = z.enum(['washed', 'none', 'natural', 'bloomy', 'brine', 'other', 'waxed']);
// What sets a milk into a curd: rennet, acid and a little rennet, acid, acid and heat, a plant's enzymes, heat alone.
export const Setting = z.enum(['rennet', 'rennet-acid', 'acid', 'acid-heat', 'plant', 'heat']);
// A span of days, the least and the most, from none up.
export const Days = z.tuple([z.number().min(0), z.number().min(0)]).refine(([a, b]) => a <= b, 'from the least to the most');

/* A measure that is seldom one number: between a least and a most, or
   only one of them ("above 40 °C", "up to 6 days"), and whether either is
   only about so ("about 23 °C", "overnight"). */
export const Range = z
	.strictObject({ min: z.number().optional(), max: z.number().optional(), about: z.boolean().optional() })
	.refine((r) => r.min !== undefined || r.max !== undefined, 'a range needs a least or a most')
	.refine((r) => r.min === undefined || r.max === undefined || r.min <= r.max, 'a range runs from its least to its most');
// A Range in a unit, each end within what the unit can be.
const within = (lo: number, hi: number, unit: string) =>
	Range.refine((r) => [r.min, r.max].every((x) => x === undefined || (x >= lo && x <= hi)), `${unit} from ${lo} to ${hi}`);
export const Seconds = within(0, 3.2e9, 'seconds');
export const Celsius = within(-60, 300, '°C');
export const Percent = within(0, 100, 'percent');
export const PH = within(0, 14, 'pH');
export const Bar = within(0, 2000, 'bar');
export const Millimetres = within(0, 1000, 'mm');

// An animal milked.
export const Beast = z.enum(['cow', 'sheep', 'goat', 'horse', 'donkey', 'buffalo', 'camel', 'yak', 'reindeer']);
// A regional product's countries, each drawn as its flag: made in more than four, it is not regional.
export const MOST_COUNTRIES = 4;

// A photograph, and its credit: its sources its page on Wikimedia Commons.
export const Picture = z.object({
	file: z.string(),
	author: z.string(),
	license: z.string(),
	sources: Sourcing,
});

// What a node is, said on its card.
export const About = z.object({ text: z.string(), sources: Sourcing });

/* The animals whose milk a thing is made from, the biggest share first,
   each once: marked on its pill where other than a cow's alone; only where
   the other milk is what it is made from, by law or as it usually is, not
   where it only may be (kefir can be made of goat's milk, but is not). */
export const Beasts = z
	.array(Beast)
	.min(1)
	.refine((bs) => new Set(bs).size === bs.length, 'each animal once');

// The families the products are in, in order; one with a hub drawn as one branch where a parent has two or more of it (GROUPS).
export const Group = z.strictObject({ name: z.string().min(1), hub: z.string().optional(), ids: z.array(ProductId).min(1), ...Own });

// How much of it is made, as its mass in million tonnes a year.
export const Share = z.object({ mt: z.number().nonnegative(), sources: Sourcing });

// The world's outline (map.json): its height against a width of 1, and each country's name, label point and rings as flat x, y pairs.
export const WorldMap = z.object({
	height: z.number(),
	countries: z.record(
		Country,
		z.object({
			name: z.string(),
			label: z.tuple([z.number(), z.number()]),
			rings: z.array(z.array(z.number()).refine((r) => r.length % 2 === 0, 'x, y pairs')),
		}),
	),
	sources: Sourcing,
});

/* ---- Each arrow ---- */

/* A living thing at work in a ferment, by its name today, with the names
   it is still found under; or, where no species is named, the group it is
   of ("thermophilic lactic acid bacteria"). An animal is one too: the mites
   and the larvae some cheeses are ripened by. */
export const Microbe = z.strictObject({
	name: z.string(),
	formerly: z.array(z.string()).optional(),
	kind: z.enum(['bacterium', 'yeast', 'mould', 'animal']),
	// What it is there for, where that is said: the acid, the aroma (diacetyl), the gas (eyes, fizz), the slime of a ropy milk, the alcohol, a rind, a claim of health.
	does: z.array(z.enum(['acid', 'aroma', 'gas', 'slime', 'alcohol', 'rind', 'ripening', 'probiotic'])).min(1).optional(),
	// At what temperatures it grows best, where the source groups it so rather than naming a species.
	grows: z.enum(['mesophilic', 'thermophilic']).optional(),
	// Found rather than added: its share of the isolates in a survey of the traditional product, in percent.
	isolates: z.number().min(0).max(100).optional(),
	...Own,
});

/* What comes in at the start of a stretch, and how: a starter of known
   cultures; a little of the last batch (back-slopping); kefir grains; the
   milk's own flora, left to itself; the vessel it sours in (a gourd, a
   smoked pot, a bamboo tube, a bag kept from last year); or the place it
   ripens in, its cave's air or its dairy's shelves and brushes. A ferment
   may take them two ways at once, a back-slopped gourd; and how, where it
   is not said, is left out rather than guessed. */
export const Inoculum = z.strictObject({
	microbes: z.array(Microbe),
	by: z.array(z.enum(['starter', 'backslop', 'grains', 'wild', 'vessel', 'place'])).min(1).optional(),
	// How much is put in, as a share of the milk, in percent.
	dose: Percent.optional(),
	// What it sours in, where that matters: the gourd, the pot, how it is smoked.
	vessel: z.string().optional(),
});

/* What a step of processing is held at: so warm, so long, so damp.
   Temperatures in °C, times in seconds, humidity in percent. And one
   sentence on it, drawn under it, for what these do not say: why, or how. */
const Sentence = z
	.string()
	.min(1)
	.refine((s) => !/[.!?]\s+[A-Z][a-z]+\s/.test(s.trim()), 'one sentence');
const Held = {
	temperature: Celsius.optional(),
	seconds: Seconds.optional(),
	humidity: Percent.optional(),
	note: Sentence.optional(),
	...Own,
};
/* Held hot or cold to change it: heated (72 °C for 15 s, pasteurising),
   a curd cooked (52–54 °C), cooled or chilled. */
export const HeatTreatment = z.strictObject({
	type: z.literal('heat'),
	does: z.enum(['heat', 'cook', 'cool']),
	...Held,
});
/* Held for microbes to work: soured (incubated), ripened, its rind
   smeared, pierced to let the air in; what is added at its start, and
   where it stops, or must have reached by law: pH, acidity as percent
   lactic acid, alcohol in percent. Its kinds, where said: lactic is the
   souring of lactose into lactic acid, by bacteria alone (yoghurt, quark)
   or with yeasts too, making alcohol and fizz (kefir, kumis); mould and
   smear ripen a cheese from its surface or from within, propionic
   bacteria make its eyes, animals (mites, larvae) eat their way through. */
export const Ferment = z.strictObject({
	type: z.literal('ferment'),
	does: z.enum(['incubate', 'ripen', 'smear', 'pierce']),
	kinds: z.array(z.enum(['lactic', 'yeast', 'mould', 'smear', 'propionic', 'animal'])).min(1).optional(),
	adds: Inoculum.optional(),
	...Held,
	pH: PH.optional(),
	acidity: Percent.optional(),
	alcohol: Percent.optional(),
});
// Held to dry: in the sun, in the air, in a spray drier.
export const Drying = z.strictObject({
	type: z.literal('dry'),
	...Held,
});
/* The steps done to milk above all others, each its own. Pasteurised:
   heated just enough to kill what could make one ill, 72 °C for 15 s or
   63 °C for 30 min. Homogenised: forced through a narrow gap, at so many
   bar, so its fat breaks into globules too small to rise. Coagulated:
   its casein set into a curd, by rennet, by acid, by acid and heat, by a
   plant's enzymes (thistle, fig), by heat alone, until it is so sour.
   Churned: cream or soured milk beaten until its fat clumps into butter. */
export const Pasteurise = z.strictObject({ type: z.literal('pasteurise'), ...Held });
export const Homogenise = z.strictObject({ type: z.literal('homogenise'), bar: Bar.optional(), ...Held });
export const Coagulate = z.strictObject({
	type: z.literal('coagulate'),
	by: Setting.optional(),
	pH: PH.optional(),
	...Held,
});
export const Churn = z.strictObject({ type: z.literal('churn'), ...Held });
/* The steps a curd and much else is put through, each its own. Salted:
   dry, rubbed or sprinkled on; in a brine, so strong; or into the milk or
   the curd. Drained: of its whey, hung in a cloth, in a cloth, in its
   moulds, through a sieve. Cut: into grains so many mm across, or milled,
   ground, crumbled, shredded. Pressed. Moulded: put into its moulds, shaped.
   Separated: its cream off, risen and skimmed or spun off, so much fat left.
   Evaporated: boiled down, in the open or under vacuum, to so much solids.
   Filtered: through a cloth, or a membrane fine or finer (micro, ultra,
   nano), or washed through it (dia). Something added to it, so much of it. */
export const Salt = z.strictObject({ type: z.literal('salt'), how: z.enum(['dry', 'brine', 'milk']).optional(), strength: Percent.optional(), ...Held });
export const Drain = z.strictObject({ type: z.literal('drain'), by: z.enum(['hang', 'cloth', 'mould', 'sieve']).optional(), ...Held });
export const Cut = z.strictObject({ type: z.literal('cut'), how: z.enum(['cut', 'mill', 'grind', 'crumble', 'shred']).optional(), size: Millimetres.optional(), ...Held });
export const Press = z.strictObject({ type: z.literal('press'), ...Held });
export const Mould = z.strictObject({ type: z.literal('mould'), ...Held });
export const Separate = z.strictObject({ type: z.literal('separate'), by: z.enum(['gravity', 'centrifuge']).optional(), fat: Percent.optional(), ...Held });
export const Evaporate = z.strictObject({ type: z.literal('evaporate'), under: z.enum(['open', 'vacuum']).optional(), solids: Percent.optional(), ...Held });
export const Filter = z.strictObject({ type: z.literal('filter'), by: z.enum(['cloth', 'micro', 'ultra', 'nano', 'dia']).optional(), ...Held });
// Acidified: soured by an acid put in, not by microbes (see Ferment), with what, to so low a pH.
export const Acidify = z.strictObject({ type: z.literal('acidify'), with: z.string().min(1).optional(), pH: PH.optional(), ...Held });
export const Add = z.strictObject({ type: z.literal('add'), what: z.string().min(1).optional(), share: Percent.optional(), ...Held });
/* Any other step a thing is held at or put through, named in a word or
   two: stretched, smoked, frozen, washed; so warm and so long where that
   is said. */
export const CustomStep = z.strictObject({
	type: z.literal('custom'),
	name: z.string().min(1).max(20),
	...Held,
});
/* How a thing is made from its parent, step by step, in order: heated,
   soured, its curd cooked, ripened. Kefir is two ferments (soured at
   23 °C, then ripened cool), a washed rind cheese three (soured with a
   starter; smeared with B. linens; ripened damp), yoghurt a heat
   treatment, a ferment and two coolings. In words what its steps do not
   hold, such as a second way it is made; and where all of it is from. */
export const Processing = z.strictObject({
	steps: z.array(z.discriminatedUnion('type', [Pasteurise, Homogenise, Coagulate, Churn, Salt, Drain, Cut, Press, Mould, Separate, Evaporate, Filter, Acidify, Add, HeatTreatment, Ferment, Drying, CustomStep])).min(1),
	text: z.string().optional(),
	sources: Sourcing,
});

/* How a node is made from its parent: its processing, drawn on the arrow
   in; a paragraph on it, told on the arrow's card; their sources; and an
   example's step its own words, there being no arrow to write them on. */
export const How = z.object({
	label: z.string().optional(),
	text: z.string().optional(),
	sources: Sourcing,
	// How it is processed, heated, fermented, dried, step by step.
	processing: Processing.optional(),
});

// Products made together by one step, from one parent: one arrow, split (SPLITS).
export const Split = z.strictObject({ from: ProductId, step: z.string().min(1), ids: z.array(ProductId).min(2), ...Own });

// Kinds of a family's step: one branch off the family's hub, named, before each splits off (KINDS).
export const Kind = z.strictObject({ step: z.string().min(1), ids: z.array(ProductId).min(1), how: How });

/* ---- Each node (nodes/<id>.json) ---- */

/* What a thing is as it comes out, by weight, in percent, and its pH: fat,
   fat in its dry matter (as cheese is labelled), water, protein, lactose,
   sugar, all solids. */
export const Composition = z.strictObject({
	fat: Percent.optional(),
	fatInDryMatter: Percent.optional(),
	moisture: Percent.optional(),
	protein: Percent.optional(),
	lactose: Percent.optional(),
	sugar: Percent.optional(),
	solids: Percent.optional(),
	// Alcohol, in percent by volume: a spirit's, a fermented milk's.
	alcohol: Percent.optional(),
	pH: PH.optional(),
	...Own,
});
// A fact of a node's own, told on its card, a row each: what it is like, where it is from, what it is called and why.
export const Fact = z.strictObject({ k: z.string().min(1), v: z.string().min(1), ...Own });

/*
 * A node: a product, or an example of one, everything said of it in one
 * record, by its id. A product is drawn on its own pill, made from its
 * parent, its line labelled with how; an example is a cheese, a brand, a
 * regional kind of its product, drawn as a leaf under it, in its panel, or
 * on the map (a cheese of the world's no product names is on the map only).
 *
 * A product's `from` is what it is made from, one parent and no more: of
 * the ways it can be made, the one that matters most; the others are in
 * `alsoFrom`, not drawn. Milk and the other milks beside it are made from
 * nothing. `step` is how it is made from `from`, in a few words, written
 * on the arrow; what one step makes besides is made with it, as a split
 * (see SPLITS). A product with a `scale` is a kind measured along it:
 * drawn with a ruler under it, and what is made from it hung below at its
 * `at`. One with `panel` has its examples drawn in a panel under it, by
 * how long they are ripened and how firm they are.
 */
export const Node = z
	.strictObject({
		// Drawn on its pill, a line break where it wraps; its other names, found by the search, not drawn.
		label: z.string().min(1),
		aka: z.array(z.string().min(1)).optional(),
		// An example of a product, not a product of its own.
		example: z.literal(true).optional(),
		// Why it is drawn as it is, for whoever keeps the graph; not shown.
		comment: z.string().optional(),
		// A remark behind an info mark on its pill.
		note: z.string().optional(),
		// What it is made from, and how; the other ways it is made, not drawn.
		from: ProductId.optional(),
		step: z.string().optional(),
		alsoFrom: z.array(ProductId).optional(),
		// How it is drawn: a kind's ruler, where on its parent's one it hangs, its examples in a panel, the map under it, a family only on the map, drawn below this sibling, this product drawn again.
		scale: z.strictObject({ name: z.string(), unit: z.string(), to: z.number(), every: z.number() }).optional(),
		at: z.number().optional(),
		panel: z.boolean().optional(),
		map: z.boolean().optional(),
		mapped: z.boolean().optional(),
		below: ProductId.optional(),
		link: ProductId.optional(),
		/* How much it matters to how people eat and live, as a second pull on
		   how far out it sits: the everyday staples (0) in close, the well
		   known (1) a little further, and everything else, the regional and
		   the curious, out past them: niche unless said. */
		niche: z.union([z.literal(0), z.literal(1)]).optional(),
		/* Made by a step that only treats milk (heats it, homogenises it,
		   skims it, separates its cream off), which counts for less than one
		   that turns it into something else: pasteurised milk sits nearer
		   than yoghurt, and yoghurt nearer than the cheese made from its curd. */
		light: z.literal(true).optional(),
		// Its examples are cheeses, on the map; ripened long enough for time to tell them apart, a panel once there are enough.
		cheese: z.literal(true).optional(),
		ripened: z.literal(true).optional(),
		// Its examples, by their ids, in the order they are drawn.
		examples: z.array(ProductId).optional(),
		// A cheese's family, and a second family it is of too.
		family: ProductId.optional(),
		also: ProductId.optional(),
		// What it is, said on its card; its photograph; the countries it is from; the animals whose milk it is.
		about: About.optional(),
		picture: Picture.optional(),
		regions: z.array(Country).min(1).optional(),
		beasts: Beasts.optional(),
		// How firm it is and how many days it is ripened, the days its family's usual where no source said.
		firm: Firm.optional(),
		days: Days.optional(),
		estimated: z.literal(true).optional(),
		// What sets it, or none, a cheese only melted; its rind; a protected name.
		setting: z.union([Setting, z.literal('none')]).optional(),
		rind: Rind.optional(),
		protected: Protected.optional(),
		/* Where in its first country it is made: the region, the place as
		   latitude and longitude and as x and y on the map, and whether that
		   was said in its source, known, or guessed. */
		place: z
			.strictObject({
				region: z.string().optional(),
				lat: z.number().min(-90).max(90).optional(),
				lon: z.number().min(-180).max(180).optional(),
				x: z.number().optional(),
				y: z.number().optional(),
				located: z.enum(['hint', 'knowledge', 'guess']).optional(),
			})
			.refine((p) => (p.x === undefined) === (p.y === undefined), 'x and y together')
			.optional(),
		// How sure the inventory of the world's cheeses is of all of the above.
		confidence: z.enum(['high', 'medium', 'low']).optional(),
		// Made from raw milk, by law or as it usually is.
		raw: z.literal(true).optional(),
		// Its cultures alive when it is sold: not heated after it is fermented.
		live: z.literal(true).optional(),
		// What it is as it comes out; and its other facts, told on its card.
		composition: Composition.optional(),
		facts: z.array(Fact).min(1).optional(),
		// How much of it is made; how it is made from its parent.
		share: Share.optional(),
		how: How.optional(),
		/* For what is said of it here with none of its own: its names, what it
		   is made from and how, its facts. Not yet given for most products:
		   those without are counted as the graph is built. */
		...Own,
	})
	.refine((n) => !n.example || [n.from, n.step, n.scale, n.at, n.examples, n.panel, n.map, n.mapped].every((x) => x === undefined), 'an example is made from nothing and has no examples of its own');
export const Nodes = z.record(ProductId, Node);

/* ---- The page: what the graph is given (see index.ts, and render/ for how each is made) ---- */

// A step of processing as a card: what it is ("🦠 FERMENT"), what it says ("2 weeks @ 20–30°C"), what is done ("soured"), the microbes it adds, its sentence.
export const Chip = z.strictObject({ title: z.string(), said: z.string(), done: z.string(), microbes: z.string().optional(), note: z.string().optional() });
// A photograph where it is, and its credit.
export const PicturePage = z.strictObject({ src: z.string(), credit: z.string(), author: z.string(), license: z.string(), source: z.string() });
export const RowPage = z.strictObject({ k: z.string(), v: z.string() });
// How it is made: its processing as chips, whether any of it ferments, its paragraph and its sources.
export const HowPage = z.strictObject({
	label: z.string().optional(),
	text: z.string().optional(),
	sources: Sourcing.optional(),
	holds: z.array(Chip).optional(),
	fermented: z.literal(true).optional(),
});
// How much of the world's milk goes its way: in Mt a year, in percent, and how that was worked out.
export const SharePage = z.strictObject({ mt: z.number().nonnegative(), percent: z.number().min(0).max(100), sources: Sourcing });
/* A product or an example as the page is given it. A product's place in
   the tree and how it is drawn (see Node); an example's or a map
   cheese's own: its rank among its kind's, its axes in a panel, where on
   the map it is put. */
export const PageNode = z.strictObject({
	id: z.string(),
	label: z.string(),
	aka: z.array(z.string()).optional(),
	note: z.string().optional(),
	image: PicturePage.optional(),
	about: About.optional(),
	named: z.array(z.string()).optional(),
	regions: z.array(Country).min(1).optional(),
	how: HowPage.optional(),
	step: z.string().optional(),
	scale: Node.shape.scale,
	at: z.number().optional(),
	panel: z.boolean().optional(),
	map: z.boolean().optional(),
	below: ProductId.optional(),
	link: ProductId.optional(),
	beasts: Beasts.optional(),
	// Which family's slice it is held in; milk, in the middle, in none (−1).
	group: z.number().int(),
	// 0 a staple, 1 well known, 2 niche (see niche in Node).
	niche: z.union([z.literal(0), z.literal(1), z.literal(2)]),
	share: SharePage.optional(),
	// What it is as it comes out, its own facts, and whether it is made from raw milk: told on its card.
	composition: Composition.optional(),
	facts: z.array(RowPage).optional(),
	raw: z.literal(true).optional(),
	live: z.literal(true).optional(),
	// Where what is said of it is from, where not with its paragraph.
	sources: Sourcing.optional(),
	example: z.literal(true).optional(),
	rank: z.number().int().optional(),
	axes: z.strictObject({ firm: Firm, days: Days }).optional(),
	protected: Protected.optional(),
	// Why its place is a guess, where it is.
	unsure: z.string().optional(),
	// A cheese on the map: the country it is put in, the region there, where on the map, whether that is a guess, its family's name.
	onMap: z.literal(true).optional(),
	place: Country.optional(),
	area: z.string().optional(),
	spot: z.tuple([z.number(), z.number()]).optional(),
	guessed: z.boolean().optional(),
	family: z.string().optional(),
});
export const Payload = z.strictObject({
	// How near a light step puts a product, against 1 for any other (see light in Node).
	light: z.number().gt(0).lt(1),
	groups: z.array(z.strictObject({ name: z.string(), hub: z.string().nullable() })),
	splits: z.array(Split),
	kinds: z.array(z.strictObject({ step: z.string(), ids: z.array(ProductId), how: HowPage })),
	// How firm a cheese can be, softest first: a panel's rows.
	firms: z.array(Firm),
	nodes: z.array(PageNode),
	links: z.array(z.strictObject({ source: z.string(), target: z.string(), weight: z.number() })),
	map: WorldMap.pick({ height: true, countries: true }),
});

export type Sources = z.infer<typeof Sources>;
export type Beast = z.infer<typeof Beast>;
export type Beasts = z.infer<typeof Beasts>;
export type Firm = z.infer<typeof Firm>;
export type Sourcing = z.infer<typeof Sourcing>;
export type Picture = z.infer<typeof Picture>;
export type About = z.infer<typeof About>;
export type Share = z.infer<typeof Share>;
export type Node = z.infer<typeof Node>;
export type How = z.infer<typeof How>;
export type Protected = z.infer<typeof Protected>;
export type Setting = z.infer<typeof Setting>;
export type Group = z.infer<typeof Group>;
export type Split = z.infer<typeof Split>;
export type Kind = z.infer<typeof Kind>;
export type Ferment = z.infer<typeof Ferment>;
export type Range = z.infer<typeof Range>;
export type Processing = z.infer<typeof Processing>;
export type ProcessingStep = Processing['steps'][number];
export type HeatTreatment = z.infer<typeof HeatTreatment>;
export type Coagulate = z.infer<typeof Coagulate>;
export type Drying = z.infer<typeof Drying>;
export type Chip = z.infer<typeof Chip>;
export type PicturePage = z.infer<typeof PicturePage>;
export type RowPage = z.infer<typeof RowPage>;
export type HowPage = z.infer<typeof HowPage>;
export type PageNode = z.infer<typeof PageNode>;
export type SharePage = z.infer<typeof SharePage>;
export type Payload = z.infer<typeof Payload>;
export type Composition = z.infer<typeof Composition>;
export type Fact = z.infer<typeof Fact>;
