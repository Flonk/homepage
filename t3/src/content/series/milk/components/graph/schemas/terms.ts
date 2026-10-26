import { z } from 'astro/zod';
import { Sourcing, Own } from './sourcing';

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
export const Beast = z.enum(['cow', 'sheep', 'goat', 'horse', 'donkey', 'buffalo', 'camel', 'yak', 'reindeer', 'human']);
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

// The families the products are in, in order: a slice of the circle each (GROUPS).
export const Group = z.strictObject({ name: z.string().min(1), ids: z.array(ProductId).min(1), ...Own });

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
export type Beast = z.infer<typeof Beast>;
export type Beasts = z.infer<typeof Beasts>;
export type Firm = z.infer<typeof Firm>;
export type Picture = z.infer<typeof Picture>;
export type About = z.infer<typeof About>;
export type Share = z.infer<typeof Share>;
export type Protected = z.infer<typeof Protected>;
export type Setting = z.infer<typeof Setting>;
export type Group = z.infer<typeof Group>;
export type Range = z.infer<typeof Range>;

/* The world's most made and best known cheeses, ranked (see
   famous-cheeses.json): each by the node that is it, how much of it
   is made where that is known, and what its place rests on; and the
   sources, each with what it measures. Drawn the biggest of all cheeses. */
export const FamousCheeses = z.strictObject({
	about: z.string().min(1),
	sources: z.array(z.strictObject({ name: z.string().min(1), url: z.url(), measures: z.string().min(1) })).min(1),
	cheeses: z.array(z.strictObject({ rank: z.number().int().positive(), id: z.string().nullable(), name: z.string().min(1), tonnes: z.number().positive().nullable(), basis: z.string().min(1) })),
});
