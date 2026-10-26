import { z } from 'astro/zod';

/* ---- The regions to look for dairy products in (research/regions.json) ---- */

/* A region: a country, by its ISO 3166-1 code, or a part of one, by its
   ISO 3166-2 code ("FR", "FR-ARA", "FR-01"); its name, what kind of part
   it is ("Province", "Region"), and the one it lies in: a country's top
   parts in the country, the rest in the part over them. */
export const RegionId = z.string().regex(/^[A-Z]{2}(-[A-Z0-9]{1,3})?$/);
export const Region = z.strictObject({
	id: RegionId,
	name: z.string().min(1),
	kind: z.string().min(1).optional(),
	parent: RegionId.optional(),
});
export const Regions = z
	.strictObject({ source: z.string().min(1), regions: z.array(Region).min(1) })
	.refine(({ regions }) => new Set(regions.map((r) => r.id)).size === regions.length, 'each region once')
	.refine(({ regions }) => {
		const ids = new Set(regions.map((r) => r.id));
		return regions.every((r) => !r.parent || ids.has(r.parent));
	}, 'every parent a region')
	.refine(({ regions }) => regions.every((r) => (r.parent === undefined) === (r.kind === undefined)), 'countries have no parent and no kind, their parts both');
export type Region = z.infer<typeof Region>;
