import { z } from 'astro/zod';
import { ProcessId } from './process';
import { ProductId } from './terms';

/* ---- Each reconciling (reconciled/<process id>.json) ---- */

/*
 * A drawn arrow read along with the chain of arrows down to it from milk,
 * to see that it checks out: that its parent is the right one (the nearer
 * an ancestor, the more it matters; one far up may be loosely right, a
 * yak cheese under homogenised milk), and that its steps are only what is
 * done between its parent and it, and no more than it needs to be what it
 * is. A step done already upstream is wrong and taken out; one true but
 * not needed is marked minor; a dish's recipe goes entirely.
 *
 * `hash` is of the arrow and every arrow above it, as they were once it
 * was reconciled (see build/reconcile.ts): when any of them changes, or a
 * ranking draws another way in, it no longer matches and the arrow is to
 * be reconciled again. Left out by whoever reconciles, and stamped after.
 *
 * `verdict`: it checked out as it was, it was fixed, or it is flagged for
 * a person, as where a better parent is proposed in `move`, which is never
 * made by itself.
 */
export const Reconciled = z.strictObject({
	hash: z.string().regex(/^[0-9a-f]{16}$/).optional(),
	verdict: z.enum(['ok', 'fixed', 'flagged']),
	// What was changed, or why it is flagged, in a sentence or two.
	notes: z.string().min(1).optional(),
	move: z.strictObject({ to: ProductId, why: z.string().min(1) }).optional(),
	model: z.string().min(1).optional(),
	date: z.iso.date().optional(),
});
export const Reconciliations = z.record(ProcessId, Reconciled);
export type Reconciled = z.infer<typeof Reconciled>;
