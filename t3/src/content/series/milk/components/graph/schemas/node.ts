import { z } from 'astro/zod';
import { Own } from './sourcing';
import { Country, ProductId, Firm, Protected, Rind, Setting, Days, Percent, PH, Picture, About, Beasts, Share } from './terms';

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
 * record, by its id: what it is, not how it is made, which is its
 * processes' (see Process). A product is drawn on its own pill, at the end
 * of one of the ways it is made (see tree.ts); an example is a cheese, a
 * brand, a regional kind of its product, drawn as a leaf under it, in its
 * panel, or on the map (a cheese of the world's no product names is on the
 * map only). Milk and the other milks beside it are made from nothing.
 *
 * A product with a `scale` is a kind measured along it:
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
		// An example not drawn, its product naming too many to draw: found by the search, under it.
		hidden: z.literal('HIDDEN_DUE_TO_OVERLOAD').optional(),
		// A brand or one company's product, rather than a kind of product: drawn only if it has a place in a food culture, and why or why not.
		branded: z.strictObject({ significant: z.boolean(), why: z.string().min(1) }).optional(),
		// Why it is drawn as it is, for whoever keeps the graph; not shown.
		comment: z.string().optional(),
		// How it is drawn: a kind's ruler, where on its parent's one it hangs, its examples in a panel (a family with enough cheeses where they are made has a map under it instead, worked out at build time), drawn below this sibling, this product drawn again.
		// A ruler: what it measures (a line break stacks it), its unit, up to what, a mark every so many; and how wide a unit is drawn, where not the usual (see RULE_PX).
		scale: z.strictObject({ name: z.string(), unit: z.string(), to: z.number(), every: z.number(), px: z.number().positive().optional() }).optional(),
		at: z.number().optional(),
		panel: z.boolean().optional(),
		/* A cheese type's table, in its panel: what its cheeses are set out by,
		   across (how long they ripen, or what sets them) and down (how firm,
		   or whose milk); and its most significant cheeses, each with why. Those
		   and the outliers on each axis are shown; the rest, too many to show,
		   are only found by the search, under the type. */
		table: z
			.strictObject({
				across: z.enum(['days', 'setting']),
				down: z.enum(['firm', 'beast']),
				picks: z.array(z.strictObject({ id: ProductId, why: z.string().min(1) })).min(1).max(6),
			})
			.optional(),
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
		// How much of it is made.
		share: Share.optional(),
		/* For what is said of it here with none of its own: its names, its
		   facts. Not yet given for most products:
		   those without are counted as the graph is built. */
		...Own,
	})
	.refine((n) => !n.example || [n.scale, n.at, n.examples, n.panel, n.table].every((x) => x === undefined), 'an example has no ruler, no place on one, and no examples of its own');
export const Nodes = z.record(ProductId, Node);
export type Node = z.infer<typeof Node>;
export type Composition = z.infer<typeof Composition>;
export type Fact = z.infer<typeof Fact>;
