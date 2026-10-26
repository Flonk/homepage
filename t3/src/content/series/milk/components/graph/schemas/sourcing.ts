import { z } from 'astro/zod';

/* Where something said was found: at least one link, and in words what was
   taken from them, how anything was worked out from it, and what in it is
   not checked. A figure worked out from others links to those. */
export const Link = z.object({ name: z.string().min(1), url: z.url() });
// Checked again by someone who did not say it: when, and why it holds; null, or not there, till then.
export const Verification = z.strictObject({ verifiedAt: z.iso.date(), reason: z.string().min(1) });
const Verified = { verification: Verification.nullable().optional() };
export const Sources = z.object({
	links: z.array(Link).min(1),
	text: z.string().min(1),
	...Verified,
});
/* Said without a source yet: kept, and counted, rather than given a link
   it does not have; in words what is missing, or what it rests on. */
export const Unsourced = z.object({ unsourced: z.literal(true), text: z.string().min(1), ...Verified });
export const Sourcing = z.union([Sources, Unsourced]);
/* Sources of its own, on anything said inside a record that has its
   sources: a step of a processing, a row of a table, a microbe; where it
   is from somewhere other than the rest. Where it has none, what holds it
   vouches for it: a step its processing's, a row its step's. */
export const Own = { sources: Sourcing.optional() };
export type Sources = z.infer<typeof Sources>;
export type Sourcing = z.infer<typeof Sourcing>;
