import { ROOT, type Arrow, type Graph, type Node } from '../client/base';
import type { Box, GraphLayout } from './types';
import { layout } from './index';

/*
 * The graph with its herd: the animals milk comes from (see build/herd.ts)
 * laid out as a tree of their own out of milk, as the products are, with
 * milk as big and as wide as theirs; then turned over onto milk's left,
 * its arrows pointing in to milk, and the two made one, which the drawing
 * is given as it is any layout. Each question about a node is put to the
 * half it is in, and what the herd's half answers in its own place is
 * turned over too.
 */
export function layoutWithHerd(data: Graph): GraphLayout {
	const products = layout(data);
	if (!data.animals?.nodes.length) return products;
	// The herd's own milk to lay out from, a copy, so the products' is not moved.
	const milk = data.nodes.find((n) => n.id === ROOT)!;
	const herdData = { ...data, nodes: [{ ...milk }, ...(data.animals.nodes as Node[]).map((n) => ({ ...n }))], links: data.animals.links, splits: [] } as Graph;
	const herd = layout(herdData, { milkRadius: products.milkRadius, allMilk: products.allMilk, inward: true });
	return mergeMirrored(products, herd);
}

const mergeMirrored = (main: GraphLayout, herd: GraphLayout): GraphLayout => {
	const own = new Set(herd.nodes.filter((n) => n !== herd.root));
	// Turned over about milk: across, onto its other side; down, onto the products' milk.
	const across = main.root.x + herd.root.x;
	const down = main.root.y - herd.root.y;
	for (const n of own) {
		n.x = across - n.x;
		n.y += down;
	}
	const turned = new DOMMatrix([-1, 0, 0, 1, across, down]);
	const turn = (p: Path2D) => {
		const q = new Path2D();
		q.addPath(p, turned);
		return q;
	};
	const turnBox = (b: Box): Box => ({ ...b, x0: across - b.x1, x1: across - b.x0, y0: b.y0 + down, y1: b.y1 + down });
	// The herd's arrows out of its milk, now the products' milk.
	const arrowOf = new Map<Arrow, Arrow>(herd.arrows.map((a) => [a, a.source === herd.root ? { ...a, source: main.root } : a]));
	const arrows = [...arrowOf.values()];
	const remap = <T,>(m: Map<Arrow, T>, f: (x: T) => T) => new Map([...m].map(([a, x]) => [arrowOf.get(a)!, f(x)]));
	// Each question about a node to the half it is in.
	const by =
		<A extends unknown[], R>(mine: (n: Node, ...a: A) => R, theirs: (n: Node, ...a: A) => R) =>
		(n: Node, ...a: A) =>
			own.has(n) ? theirs(n, ...a) : mine(n, ...a);
	const parent = new Map(main.parent);
	for (const [n, p] of herd.parent) if (own.has(n)) parent.set(n, p === herd.root ? main.root : p);
	const children = new Map(main.children);
	for (const [p, ks] of herd.children) if (own.has(p)) children.set(p, ks);
	const herdBounds = turnBox({ x0: herd.bounds.x, x1: herd.bounds.x + herd.bounds.width, y0: herd.bounds.y, y1: herd.bounds.y + herd.bounds.height });
	const x = Math.min(main.bounds.x, herdBounds.x0);
	const y = Math.min(main.bounds.y, herdBounds.y0);
	return {
		...main,
		nodes: [...main.nodes, ...own],
		parent,
		children,
		panelContents: new Map([...main.panelContents, ...herd.panelContents]),
		panelContaining: by(main.panelContaining, herd.panelContaining),
		nodesWithPills: [...main.nodesWithPills, ...herd.nodesWithPills.filter((n) => own.has(n))],
		scaleOf: by(main.scaleOf, herd.scaleOf),
		photoSize: by(main.photoSize, herd.photoSize),
		thickness: by(main.thickness, herd.thickness),
		pillCornerRadius: by(main.pillCornerRadius, herd.pillCornerRadius),
		pillRimWidth: by(main.pillRimWidth, herd.pillRimWidth),
		nodesWithStepLabel: [...main.nodesWithStepLabel, ...herd.nodesWithStepLabel.filter((n) => own.has(n))],
		nodesWithCardChain: [...main.nodesWithCardChain, ...herd.nodesWithCardChain.filter((n) => own.has(n))],
		hasStepLabel: by(main.hasStepLabel, herd.hasStepLabel),
		hasCardChain: by(main.hasCardChain, herd.hasCardChain),
		stepLabelFont: by(main.stepLabelFont, herd.stepLabelFont),
		stepLabelX: by(main.stepLabelX, (n) => across - herd.stepLabelX(n)),
		lastLegY: by(main.lastLegY, (n) => herd.lastLegY(n) + down),
		stepLabelLines: by(main.stepLabelLines, (n) => herd.stepLabelLines(n).map((l) => ({ ...l, y: l.y + down }))),
		stepLabelBox: by(main.stepLabelBox, (n) => turnBox(herd.stepLabelBox(n))),
		cardChainOf: by(main.cardChainOf, herd.cardChainOf),
		panels: new Map([...main.panels, ...herd.panels]),
		panelBox: by(main.panelBox, (n) => turnBox(herd.panelBox(n))),
		arrows: [...main.arrows, ...arrows],
		clickableArrows: [...main.clickableArrows, ...herd.clickableArrows.map((a) => arrowOf.get(a)!)],
		hasStepDetails: by(main.hasStepDetails, herd.hasStepDetails),
		arrowOutline: new Map([...main.arrowOutline, ...remap(herd.arrowOutline, turn)]),
		arrowCentreLine: new Map([...main.arrowCentreLine, ...remap(herd.arrowCentreLine, turn)]),
		arrowBox: new Map([...main.arrowBox, ...remap(herd.arrowBox, turnBox)]),
		bounds: { x, y, width: Math.max(main.bounds.x + main.bounds.width, herdBounds.x1) - x, height: Math.max(main.bounds.y + main.bounds.height, herdBounds.y1) - y },
	};
};
