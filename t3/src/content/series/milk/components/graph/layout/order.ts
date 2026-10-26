import type { Node } from '../client/base';
import type { ProductTree, NodeSizes } from './types';
import { group } from './util';

// How siblings go down: the biggest branch first, or shuffled, stably, to try another look.
const SIBLING_ORDER: 'biggest' | 'shuffled' = 'shuffled';
// Siblings with a table (cheese types with their panels) first; where there are many, they go off a bus instead (see bus.ts).

/* Siblings ordered top to bottom: the biggest branch first, but those
   made alike side by side, as one bunch as big as all of it, as they are
   under the branch point they share; examples after the products. */
export const orderSiblings = ({ children, splitKeyOf, sharedStepPrefix, isOrLeadsTo }: ProductTree, { lineWeight }: NodeSizes) => {
	const orderBunches = (units: Node[][], step: number): Node[][] => {
		const byStep = new Map<string, Node[][]>();
		const alone: Node[][][] = [];
		for (const u of units) {
			const key = sharedStepPrefix(u)[step];
			if (key === undefined) alone.push([u]);
			else group(byStep, key, u);
		}
		const bunches = [...[...byStep.values()].map((b) => (b.length > 1 ? orderBunches(b, step + 1) : b)), ...alone];
		const weight = (b: Node[][]) => b.flat().reduce((t, k) => t + lineWeight.get(k)!, 0);
		// In an order that looks random but is the same every time: by a hash of the first one's id.
		const hash = (b: Node[][]) => [...b[0][0].id].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
		return bunches.sort((a, b) => (SIBLING_ORDER === 'shuffled' ? hash(a) - hash(b) : weight(b) - weight(a))).flat();
	};
	for (const kids of children.values()) {
		const products = kids.filter((k) => !k.example);
		const examples = kids.filter((k) => k.example);
		const units = new Map<string, Node[]>();
		for (const k of products) group(units, splitKeyOf.get(k.id) ?? k.id, k);
		const ordered = orderBunches([...units.values()], 0).flat();
		const first = ordered.filter((k) => k.table);
		kids.splice(0, kids.length, ...first, ...ordered.filter((k) => !first.includes(k)), ...examples);
		// One drawn below a sibling (its `below`) moved there, after that sibling's branch.
		for (const k of [...kids].filter((k) => k.below)) {
			const sibling = kids.find((n) => n !== k && isOrLeadsTo(n, k.below!));
			if (!sibling) continue;
			kids.splice(kids.indexOf(k), 1);
			kids.splice(kids.indexOf(sibling) + 1, 0, k);
		}
	}
};
