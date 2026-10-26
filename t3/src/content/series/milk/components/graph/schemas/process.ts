import { z } from 'astro/zod';
import { Sourcing } from './sourcing';
import { ProductId } from './terms';
import { Processing } from './steps';

/* ---- Each process (processes/<id>.json) ---- */

/* A process, by its id: what it is made from and what it makes,
   "raw--rawCream+skimRaw"; and where there are several ways between the
   same, a word or two after a tilde to tell them apart,
   "pasteurised--yoghurt~stirred". */
export const ProcessId = z.string().regex(/^[A-Za-z0-9+]+--[A-Za-z0-9+]+(~[a-z0-9]+(-[a-z0-9]+)*)?$/);
/* What one of the things a process makes at once says of itself: its own
   words on its leg ("the fat", "the rest"), a paragraph, and the steps
   done to it alone. */
export const Leg = z.strictObject({
	step: z.string().min(1).optional(),
	text: z.string().optional(),
	sources: Sourcing.optional(),
	processing: Processing.optional(),
});
/*
 * A process: one way of making something, an arrow from what it is made
 * from to what it makes. A product made several ways has a process for
 * each: yoghurt from pasteurised milk in a dairy, from raw milk at home.
 * One with several inputs is a blend; one with several outputs makes them
 * at once, as separating milk makes cream and skimmed milk, its shared
 * steps on the process and each output's own on its leg.
 *
 * `step` is how, in a few words, written on the arrow; `text` a paragraph
 * on it, told on the arrow's card; `processing` its steps, drawn on the
 * arrow as cards. `industrial`: whether it is how a dairy does it, or how
 * a farm, a kitchen, a region does; unsaid where not known. `variant`: an
 * arrow to an example of a product, from that product.
 */
export const Process = z
	.strictObject({
		from: z.array(ProductId).min(1),
		to: z.array(ProductId).min(1),
		industrial: z.boolean().optional(),
		step: z.string().min(1).optional(),
		// From a product to an example or variant of it: Gouda from washed-curd cheese.
		variant: z.literal(true).optional(),
		text: z.string().optional(),
		sources: Sourcing.optional(),
		processing: Processing.optional(),
		legs: z.record(ProductId, Leg).optional(),
	})
	.refine((p) => !p.legs || (p.to.length > 1 && Object.keys(p.legs).every((id) => p.to.includes(id))), 'legs only on a process making several, and only for what it makes');
export const Processes = z.record(ProcessId, Process);

/* ---- Each ranking (rankings/<node id>.json) ---- */

/* The ways into a node made more than one way, most of it made that way
   first: the first is the one the tree is drawn along. A way's `share` is
   how much of all of it is made that way, in percent, with its sources:
   the links it rests on and the reasoning from them to the figure, or the
   reasoning alone, unsourced, till there are links. One without a share
   is not rated yet, and ranked after those that are. */
export const RankedWay = z
	.strictObject({
		process: ProcessId,
		share: z.number().min(0).max(100).optional(),
		sources: Sourcing.optional(),
	})
	.refine((w) => (w.share === undefined) === (w.sources === undefined), 'a share needs its sources, and only a share has them');
export const Ranking = z
	.strictObject({ ways: z.array(RankedWay).min(1) })
	.refine((r) => new Set(r.ways.map((w) => w.process)).size === r.ways.length, 'each way ranked once')
	.refine((r) => r.ways.every((w, i) => i === 0 || w.share === undefined || (r.ways[i - 1].share ?? -1) >= w.share), 'the rated first, by share, most first')
	.refine((r) => r.ways.reduce((sum, w) => sum + (w.share ?? 0), 0) <= 100.5, 'shares add up to no more than 100');
export const Rankings = z.record(ProductId, Ranking);
export type Process = z.infer<typeof Process>;
export type Leg = z.infer<typeof Leg>;
export type Ranking = z.infer<typeof Ranking>;
export type RankedWay = z.infer<typeof RankedWay>;
