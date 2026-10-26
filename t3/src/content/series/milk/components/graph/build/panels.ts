import type * as S from '../schema';

/* A family drawn in the tree that is ripened long enough for time to tell
   its cheeses apart is drawn as a panel, once it has enough of them; each
   placed where its sources put it, else where most of its family's go,
   and marked so (see unsure). */
export const panelsOf = (nodes: Record<string, S.Node>, ofProduct: Map<string, string>) => {
	const all = Object.entries(nodes);
	const products = all.filter(([, n]) => !n.example);
	const panelled = (id: string) => !!nodes[id].panel || (!!nodes[id].ripened && (nodes[id].examples?.length ?? 0) >= 6);
	const UNSURE_SAID = 'Not found in a source: placed where its family’s cheeses usually are';
	const middling = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
	// The one most of them are.
	const most = <T,>(xs: T[]) => {
		const count = new Map<T, number>();
		for (const x of xs) count.set(x, (count.get(x) ?? 0) + 1);
		return [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
	};
	const unsure = new Set<string>();
	const axesOf = new Map<string, { firm: S.Firm; days: [number, number]; timeless?: true }>();
	for (const [id, n] of all) {
		// Drawn under its product, placed by a guess; on the map, it is where it is made.
		if (ofProduct.has(id) && (n.estimated || n.confidence === 'low')) unsure.add(id);
		if (n.example && n.firm && n.days) axesOf.set(id, { firm: n.firm, days: n.days });
	}
	for (const [id, n] of products) {
		if (!panelled(id)) continue;
		const names = n.examples ?? [];
		// Placed in a panel, none on a line of no time.
		for (const x of names) {
			const a = axesOf.get(x);
			if (a) axesOf.set(x, { firm: a.firm, days: [Math.max(1, a.days[0]), Math.max(1, a.days[1])] });
		}
		const placedAt = names.flatMap((x) => axesOf.get(x) ?? []);
		const usual = {
			firm: most(placedAt.map((a) => a.firm)) ?? 'semi-hard',
			days: [middling(placedAt.map((a) => a.days[0])) ?? 30, middling(placedAt.map((a) => a.days[1])) ?? 90] as [number, number],
		};
		for (const x of names) {
			if (nodes[x].confidence === undefined || nodes[x].estimated) unsure.add(x);
			if (!axesOf.has(x)) axesOf.set(x, { ...usual, timeless: true as const });
		}
	}
	return { panelled, unsure, axesOf, UNSURE_SAID };
};
