import { z } from 'astro/zod';
import { Sourcing } from './sourcing';
import { Country, Percent, Range, Picture, About } from './terms';

/*
 * The herd: the animals milk comes from, the left half of the graph, a
 * tree converging on milk as the products' branches out of it. Groups of
 * kin (the bovines, the small ruminants, the camelids, ...), their
 * species, a species' types where it falls into them (river and swamp
 * buffalo), and their breeds. One file each in data/animals/, by its id.
 *
 * Every figure stands with its own sources, never on the record's: how
 * much milk, how many head, how much each gives, what is in it, where
 * and when the animal was first kept. A figure worked out, rather than
 * read, says so (estimated) and says how in its sources' words.
 */

// An animal, by its id; which ids there are, the herd checks as it is read.
export const AnimalId = z.string().regex(/^[a-z][A-Za-z0-9]*$/);
// What a record is: a group of kin, a species, a type within one, a breed.
export const AnimalKind = z.enum(['group', 'species', 'type', 'breed']);
// How far down the tree of life its scientific name names it.
export const TaxonRank = z.enum(['class', 'order', 'suborder', 'family', 'subfamily', 'tribe', 'genus', 'species', 'subspecies']);
// A year a figure is for.
const Year = z.number().int().min(1900).max(2100);

// Its scientific name and rank, as a taxonomic authority has it.
export const Taxon = z.strictObject({ name: z.string().min(1), rank: TaxonRank, sources: Sourcing });

/* Where and when it was first kept for its milk or otherwise: the place
   in words, its countries today, and how long ago, in years before the
   present, as a span where the sources differ. */
export const Domestication = z.strictObject({
	where: z.string().min(1),
	regions: z.array(Country).min(1).optional(),
	yearsAgo: Range,
	text: z.string().min(1),
	sources: Sourcing,
});

// Where a breed was bred: the countries, the first first, and the place in words.
export const Origin = z.strictObject({
	regions: z.array(Country).min(1).max(4),
	place: z.string().min(1).optional(),
	// When it was bred or first recorded as a breed, as a year or span.
	formed: Range.optional(),
	sources: Sourcing,
});

/* How much milk the world has from it a year, in million tonnes: the
   width of its arrow into milk, as a product's share is of its arrow out
   (see Share). One measure for every species, the same year where it can
   be; a figure not in a statistic, worked out from what is (head milked
   times what each gives), estimated, and how said. */
export const MilkShare = z.strictObject({
	mt: z.number().nonnegative(),
	year: Year,
	estimated: z.literal(true).optional(),
	sources: Sourcing,
});

// How many there are: the world's, or a country's where that is all that is counted; milked ones only, where said.
export const Head = z.strictObject({
	count: z.number().int().nonnegative(),
	year: Year,
	where: z.union([z.literal('world'), Country]),
	milked: z.literal(true).optional(),
	estimated: z.literal(true).optional(),
	sources: Sourcing,
});

/* How much milk one gives: per lactation, over how many days, or per
   year; for a breed its herdbook's or a recording body's figures, for a
   species what is usual. In kilograms. */
export const Yield = z
	.strictObject({
		perLactation: Range.optional(),
		lactationDays: Range.optional(),
		perYear: Range.optional(),
		// Where the figures are from, when not the world: a country's recording.
		where: Country.optional(),
		year: Year.optional(),
		sources: Sourcing,
	})
	.refine((y) => y.perLactation || y.perYear, 'a yield per lactation or per year');

// What its milk is, in percent by weight.
export const MilkComposition = z
	.strictObject({
		fat: Percent.optional(),
		protein: Percent.optional(),
		lactose: Percent.optional(),
		solids: Percent.optional(),
		sources: Sourcing,
	})
	.refine((c) => c.fat || c.protein || c.lactose || c.solids, 'at least one of fat, protein, lactose, solids');

// What a breed is kept for, first what it is kept for most.
export const Purpose = z.enum(['dairy', 'dual-purpose', 'meat', 'draught', 'wool', 'fibre', 'riding', 'transport', 'companionship']);
export const Purposes = z.strictObject({ purposes: z.array(Purpose).min(1), sources: Sourcing });

// How endangered a breed is, as FAO's DAD-IS has it.
export const RiskStatus = z.enum(['not at risk', 'vulnerable', 'endangered', 'critical', 'critical-maintained', 'endangered-maintained', 'extinct', 'unknown']);
export const Risk = z.strictObject({ status: RiskStatus, year: Year.optional(), sources: Sourcing });

// Anything else told on its card, each with its own sources.
export const AnimalFact = z.strictObject({ k: z.string().min(1), v: z.string().min(1), sources: Sourcing });

export const Animal = z
	.strictObject({
		label: z.string().min(1),
		// Its other names, the sources for them its names'.
		aka: z.array(z.string().min(1)).optional(),
		names: Sourcing.optional(),
		kind: AnimalKind,
		// What it is of, nearer milk: a breed its species or type, a type its species, a species its group, a group milk.
		parent: z.union([z.literal('milk'), AnimalId]),
		taxon: Taxon.optional(),
		about: About,
		picture: Picture.optional(),
		domestication: Domestication.optional(),
		origin: Origin.optional(),
		milk: MilkShare.optional(),
		head: z.array(Head).min(1).optional(),
		yield: Yield.optional(),
		composition: MilkComposition.optional(),
		purposes: Purposes.optional(),
		risk: Risk.optional(),
		facts: z.array(AnimalFact).min(1).optional(),
		/* How sure whoever wrote it is of it all, and what they could not
		   find; for whoever checks it next, not shown. */
		confidence: z.enum(['high', 'medium', 'low']),
		gaps: z.string().min(1).optional(),
	})
	// What each kind has: a group, species or type its taxon; a species and a type its milk; a species where it was first kept (but people); a breed where it is from.
	.refine((a) => a.kind === 'breed' || a.taxon, { message: 'a group, species or type needs its taxon', path: ['taxon'] })
	// Its arrow's width: every species and type by its milk, so all of the herd's arrows are by one measure; a breed is a leaf, by none.
	.refine((a) => (a.kind !== 'species' && a.kind !== 'type') || a.milk, { message: 'a species or type needs its milk (MilkShare), estimated if need be', path: ['milk'] })
	.refine((a) => a.kind !== 'species' || a.domestication || a.parent === 'primates', { message: 'a species needs where it was first kept', path: ['domestication'] })
	.refine((a) => a.kind !== 'breed' || a.origin, { message: 'a breed needs where it is from', path: ['origin'] })
	.refine((a) => (a.kind === 'group') === (a.parent === 'milk'), { message: 'only a group hangs from milk itself', path: ['parent'] });

export type Animal = z.infer<typeof Animal>;
