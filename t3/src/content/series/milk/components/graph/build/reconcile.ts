import { createHash } from 'node:crypto';
import type * as S from '../schema';
import type { waysOf } from '../ways';

/*
 * The chains reconciling reads (see schemas/reconciled.ts): each drawn
 * arrow with the arrows above it, back up to milk, and a hash of them all.
 * An arrow's hash is of what it says (its ends, its step, its paragraph,
 * its steps, its legs) and its parent arrow's hash, so a change anywhere
 * above it, or a ranking drawing another way in up there, changes it too.
 */
export const chainsOf = (processes: Record<string, S.Process>, ways: ReturnType<typeof waysOf>) => {
	// Every arrow drawn: the one each node is drawn at the end of.
	const drawn = [...new Set([...ways.into.keys()].map((id) => ways.drawn(id)!))];
	// The arrow drawn into what it is made from, if that is made from anything.
	const above = (w: string) => ways.drawn(processes[w].from[0]);
	const hashes = new Map<string, string>();
	const hashOf = (w: string): string => {
		if (!hashes.has(w)) {
			const { from, to, step, variant, text, processing, legs } = processes[w];
			const up = above(w);
			const said = JSON.stringify({ from, to, step, variant, text, processing, legs });
			hashes.set(w, createHash('sha256').update(`${up ? hashOf(up) : ''}\n${said}`).digest('hex').slice(0, 16));
		}
		return hashes.get(w)!;
	};
	// From milk's first arrow down to this one.
	const chainOf = (w: string): string[] => {
		const up = above(w);
		return up ? [...chainOf(up), w] : [w];
	};
	// Those not reconciled since they or anything above them last changed.
	const stale = (reconciled: Record<string, S.Reconciled>) => drawn.filter((w) => reconciled[w]?.hash !== hashOf(w));
	return { drawn, hashOf, chainOf, stale };
};
