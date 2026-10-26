import { ROOT, type Node, type Graph } from '../client/base';
import type { ProductTree } from './types';
import { group } from './util';

/* Each node's distance from milk, by the shortest way there with each
   step counted at its weight. The other milks nothing is made from,
   colostrum and the other animals', count as a light step out from
   milk; a product neither reaches sits out past the rest. */
const setDistancesFromMilk = ({ nodes, links, light }: Graph) => {
	const roots = nodes.filter((n) => n.id !== ROOT && !links.some((l) => l.target === n.id));
	const dist = new Map<string, number>([[ROOT, 0], ...roots.map((n) => [n.id, light] as [string, number])]);
	for (let changed = true; changed; ) {
		changed = false;
		for (const { source, target, weight } of links) {
			const via = (dist.get(source) ?? Infinity) + weight;
			if (via < (dist.get(target) ?? Infinity)) {
				dist.set(target, via);
				changed = true;
			}
		}
	}
	const deepest = Math.max(...dist.values());
	for (const n of nodes) n.dist = dist.get(n.id) ?? deepest + 1;
};

// A branch point under `parent`, a little further out than it, in the family of `like`.
const branchPoint = (id: string, parent: Node, like: Node): Node => ({
	id,
	label: '',
	group: like.group,
	niche: 0,
	hub: true,
	dist: parent.dist + 0.3,
	x: 0,
	y: 0,
	w: 0,
	h: 0,
});

export const buildProductTree = (data: Graph): ProductTree => {
	setDistancesFromMilk(data);
	// What is done to those made together before their split parts them, by product.
	const splitHolds = new Map(data.splits.flatMap(({ how, ids }) => ids.map((id) => [id, how?.holds ?? []] as const)));
	/* The processing steps into it, each as its card says it ("🔥 HEAT ·
	   55–65°C"): a split's before its own. */
	const stepTitles = (n: Node) => [...(splitHolds.get(n.id) ?? []), ...(n.how?.holds ?? [])].map((h) => `${h.title} · ${h.said}`);
	const sharedStepPrefix = (nodes: Node[]) => {
		const first = stepTitles(nodes[0]);
		const end = first.findIndex((t, i) => nodes.some((n) => stepTitles(n)[i] !== t));
		return end < 0 ? first : first.slice(0, end);
	};
	const products = data.nodes;
	const byId = new Map(products.map((n) => [n.id, n]));
	const root = byId.get(ROOT)!;
	// Each product under the one it is made from; the other milks under milk.
	const parent = new Map<Node, Node>();
	for (const { source, target } of data.links) parent.set(byId.get(target)!, byId.get(source)!);
	for (const n of products) if (n !== root && !parent.has(n)) parent.set(n, root);
	const splitKeyOf = new Map(data.splits.flatMap(({ from, ids }) => ids.map((id) => [id, `${from}:${ids}`])));
	const splitByKey = new Map(data.splits.map((s) => [`${s.from}:${s.ids}`, s]));

	/* Siblings made alike leave their parent as one arrow, and part where
	   their processing steps do: those that start with the same step, then
	   of those, the ones whose next is the same too, and so on. Where only
	   some of the siblings go together, they go through a branch point.
	   Those made together by one process count as one, by the steps they
	   all start with. */
	const branchPoints: Node[] = [];
	const groupBySharedSteps = (p: Node, units: Node[][], step: number) => {
		const byStep = new Map<string, Node[][]>();
		for (const u of units) {
			const key = sharedStepPrefix(u)[step];
			if (key !== undefined) group(byStep, key, u);
		}
		for (const [key, alike] of byStep) {
			if (alike.length < 2) continue;
			let under = p;
			if (alike.length < units.length) {
				under = branchPoint(`bunch:${p.id}:${step}:${key}`, p, alike[0][0]);
				branchPoints.push(under);
				parent.set(under, p);
				for (const k of alike.flat()) parent.set(k, under);
			}
			groupBySharedSteps(under, alike, step + 1);
		}
	};
	// Not those hung under a ruler at their value, whose arrows go straight down off it.
	const siblings = new Map<Node, Node[]>();
	for (const [n, p] of parent) if (!n.example && !(p.scale && n.at != null)) group(siblings, p, n);
	const madeTogether: Node[][] = [];
	for (const [p, kids] of siblings) {
		const units = new Map<string, Node[]>();
		for (const k of kids) group(units, splitKeyOf.get(k.id) ?? k.id, k);
		// Not a cheese type with a table: those go in rows of their own (see tableRows in order.ts), each with its own arrow.
		groupBySharedSteps(p, [...units.values()].filter((u) => !u.some((k) => k.table)), 0);
		madeTogether.push(...[...units.values()].filter((u) => u.length > 1));
	}
	/* Those made together by one process, held together before all else:
	   one arrow out of wherever they went, parting into each of them. */
	for (const made of madeTogether) {
		const p = parent.get(made[0])!;
		const key = splitKeyOf.get(made[0].id)!;
		// Its double arrow carries the split's step, and what is done before it parts.
		const { step, how } = splitByKey.get(key)!;
		const split: Node = { ...branchPoint(`split:${key}`, p, made[0]), step, how };
		branchPoints.push(split);
		parent.set(split, p);
		for (const k of made) parent.set(k, split);
	}
	const nodes = [...products, ...branchPoints];

	/* Children in the order the families are listed, and within a family
	   the more everyday first, then the nearer milk; reordered later
	   (see orderSiblings). */
	const children = new Map<Node, Node[]>();
	for (const [n, p] of parent) group(children, p, n);
	// Looked up each time, as some are taken out later (see takeOutRulerAndPanelContents).
	const childrenOf = (n: Node) => children.get(n) ?? [];
	const productChildrenOf = (n: Node) => childrenOf(n).filter((k) => !k.example);
	const isOrLeadsTo = (n: Node, id: string): boolean => n.id === id || (!!n.hub && childrenOf(n).some((k) => isOrLeadsTo(k, id)));
	for (const kids of children.values())
		kids.sort(
			(a, b) =>
				Number(!!a.example) - Number(!!b.example) ||
				(a.example && b.example ? a.rank! - b.rank! : 0) ||
				a.group - b.group ||
				a.niche - b.niche ||
				a.dist - b.dist ||
				a.label.localeCompare(b.label),
		);

	return { root, nodes, byId, parent, children, childrenOf, productChildrenOf, isOrLeadsTo, splitKeyOf, sharedStepPrefix };
};
