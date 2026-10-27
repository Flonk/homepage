import { z } from 'astro/zod';
import { Sourcing } from './sourcing';
import { Country, ProductId, Firm, Protected, Days, About, Beasts } from './terms';
import { Composition, Node } from './node';

/* ---- The page: what the graph is given (see build.ts, and render/ for how each is made) ---- */

// A step of processing as a card: what it is ("🦠 FERMENT"), what it says ("2 weeks · 20–30°C"), what is done ("soured"), the microbes it adds, its sentence.
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
	// A cheese type's cheeses too many to show on its table, by their names: found by the search, under it.
	offTable: z.array(z.string()).optional(),
	image: PicturePage.optional(),
	about: About.optional(),
	named: z.array(z.string()).optional(),
	regions: z.array(Country).min(1).optional(),
	how: HowPage.optional(),
	step: z.string().optional(),
	scale: Node.shape.scale,
	at: z.number().optional(),
	panel: z.boolean().optional(),
	// A cheese type's table (see table in Node): its rows down, top first, and its columns, where it is not set out by time.
	table: z.strictObject({ down: z.enum(['firm', 'beast']), rows: z.array(z.string()), columns: z.array(z.string()).optional() }).optional(),
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
	// Where it is in a panel: its firmness and ripening (its family's usual, where none is known), and in a type's table, its row and column there.
	axes: z
		.strictObject({ firm: Firm, days: Days, timeless: z.literal(true).optional(), row: z.string().optional(), column: z.string().optional() })
		.optional(),
	protected: Protected.optional(),
	// One of the world's most made and best known cheeses; or on a type's table, among its most significant, or there as an outlier (see build/tables.ts).
	standing: z.enum(['famous', 'pick', 'outlier']).optional(),
	// Its rank among the world's most made and best known cheeses (see famous-cheeses.json).
	fame: z.number().int().positive().optional(),
	// Why its place is a guess, where it is.
	unsure: z.string().optional(),
	// For dev mode: what is still to be done on the way it is drawn along (see devOf in build.ts).
	dev: z.strictObject({ unsourced: z.literal(true).optional(), unranked: z.number().int().min(2).optional() }).optional(),
});
/* Products made together by one process, from one parent: each drawn
   with an arrow of its own, side by side. */
// A process making several products at once: what it is made from, its own step and what is done before it parts, and what it makes.
export const SplitPage = z.strictObject({ from: ProductId, step: z.string(), how: HowPage.optional(), ids: z.array(ProductId).min(2) });
export const Payload = z.strictObject({
	// How near a light step puts a product, against 1 for any other (see light in Node).
	light: z.number().gt(0).lt(1),
	groups: z.array(z.strictObject({ name: z.string() })),
	splits: z.array(SplitPage),
	// How firm a cheese can be, softest first: a panel's rows.
	firms: z.array(Firm),
	nodes: z.array(PageNode),
	links: z.array(z.strictObject({ source: z.string(), target: z.string(), weight: z.number() })),
	// The herd, the animals milk comes from: a tree of its own into milk, on its left (see build/herd.ts).
	animals: z.strictObject({ nodes: z.array(PageNode), links: z.array(z.strictObject({ source: z.string(), target: z.string(), weight: z.number() })) }).optional(),
});
export type SplitPage = z.infer<typeof SplitPage>;
export type Chip = z.infer<typeof Chip>;
export type PicturePage = z.infer<typeof PicturePage>;
export type RowPage = z.infer<typeof RowPage>;
export type HowPage = z.infer<typeof HowPage>;
export type PageNode = z.infer<typeof PageNode>;
export type SharePage = z.infer<typeof SharePage>;
export type Payload = z.infer<typeof Payload>;
