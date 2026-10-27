import { STEP_FONT, NODE_H, RADIUS, PICTURE_GAP, sizeOf, headLength, MILK, STRAND, type Node } from '../client/base';
import { ARROW_LEAST, CARD_SIZE, FAME, FAME_TOP_10, FAME_TOP_50, STANDING } from '../settings';
import type { ProductTree, NodeSizes, LayoutOptions } from './types';

/* How big each node is, and how thick each arrow into it: by how much is
   made from it, or, where it is known, by its share of the world's milk. */
export const measureNodeSizes = ({ root, nodes, byId, parent, childrenOf, productChildrenOf }: ProductTree, opts: LayoutOptions = {}): NodeSizes => {
	/* How many products are made from each, all the way down, not counting
	   branch points; on a log scale (see sizeOf), so the great branches
	   stand out without swamping the rest. */
	const madeFrom = new Map<Node, number>();
	const countMadeFrom = (n: Node): number => {
		const v = childrenOf(n).reduce((s, k) => s + (k.hub ? 0 : 1) + countMadeFrom(k), 0);
		madeFrom.set(n, v);
		return v;
	};
	countMadeFrom(root);

	// Each drawing of a product again (a link) counts as one more thing made from it.
	const timesLinked = new Map<Node, number>();
	for (const n of nodes) if (n.link) timesLinked.set(byId.get(n.link)!, (timesLinked.get(byId.get(n.link)!) ?? 0) + 1);
	/* A link is as big as the product it is of, but no bigger than the
	   biggest sibling beside it, so it does not swamp what it is drawn with. */
	const siblingsOf = (n: Node) => productChildrenOf(parent.get(n)!).filter((k) => k !== n && !k.link);
	const asBigAsLinked = (n: Node, of: (n: Node) => number) => Math.min(of(byId.get(n.link!)!), Math.max(...siblingsOf(n).map(of), 0) || Infinity);
	const treeScale = (n: Node): number =>
		n.link ? asBigAsLinked(n, treeScale) : sizeOf(madeFrom.get(n)! + (timesLinked.get(n) ?? 0)) * (n === root ? MILK : 1);
	/* The world's most made and best known cheeses biggest, the more so the
	   higher their rank (see famous-cheeses.json); on a type's table, its
	   most significant cheeses a little bigger, its outliers a little smaller. */
	const famed = (rank: number) => FAME * (rank <= 10 ? FAME_TOP_10 : rank <= 50 ? FAME_TOP_50 : 1);
	const ownScale = (n: Node): number => treeScale(n) * (n.fame ? famed(n.fame) : n.standing ? STANDING[n.standing] : 1);
	/* An example's a little bigger, its pill and arrow being small, so it reads zoomed out as far as a product's.
	   By its own scale, not grown to its arrows out (see scaleOf), as its arrow's thickness is from it. */
	const cardChainFont = (n: Node) => STEP_FONT * CARD_SIZE * ownScale(n) * (n.example ? 0.5 : 0.35);

	// How much an arrow carries: the product, and all made from it (a branch point only what it splits into).
	const lineWeight = new Map<Node, number>();
	const weighLine = (n: Node): number => {
		const v = n.link ? asBigAsLinked(n, weighLine) : (n.hub ? 0 : 1) + childrenOf(n).reduce((sum, k) => sum + weighLine(k), 0);
		lineWeight.set(n, v);
		return v;
	};
	weighLine(root);

	/* Where how much of the world's milk goes is known for every one of a
	   product's children (see share in the schema's Node), their arrows
	   carry that share of all milk, and all made from them is scaled with
	   them. A branch point has the shares of what it leads to. */
	const shareOf = (n: Node): number | undefined => {
		if (!n.hub) return n.share?.percent;
		const shares = productChildrenOf(n).map(shareOf);
		return shares.every((v) => v !== undefined) ? shares.reduce((t, v) => t! + v!, 0) : undefined;
	};
	const scaleBranch = (n: Node, f: number) => {
		lineWeight.set(n, lineWeight.get(n)! * f);
		madeFrom.set(n, madeFrom.get(n)! * f);
		for (const k of childrenOf(n)) scaleBranch(k, f);
	};
	const allMilk = opts.allMilk ?? lineWeight.get(root)!;
	const shareOut = (p: Node) => {
		const kids = productChildrenOf(p);
		if (kids.length && kids.every((k) => shareOf(k) !== undefined)) {
			const giveShare = (k: Node) => {
				if (!k.hub) return scaleBranch(k, ((k.share!.percent / 100) * allMilk) / lineWeight.get(k)!);
				const theirs = productChildrenOf(k);
				theirs.forEach(giveShare);
				lineWeight.set(k, theirs.reduce((t, g) => t + lineWeight.get(g)!, 0));
			};
			kids.forEach(giveShare);
		}
		for (const k of kids) shareOut(k);
	};
	shareOut(root);

	/* Every arrow at least ARROW_LEAST thick, cards on it or not; and each
	   arrow then at least as thick as all the strands it splits into. */
	// A cheese in its type's panel has no arrow drawn to it.
	const inPanel = (n: Node) => n.example && !!parent.get(n)?.panel;
	const leastWeight = (n: Node) => (n === root || inPanel(n) ? 0 : ARROW_LEAST / STRAND);
	const thickenToLeast = (n: Node): number => {
		let grew = childrenOf(n).reduce((t, k) => t + thickenToLeast(k), 0);
		let v = lineWeight.get(n)! + grew;
		if (v < leastWeight(n)) {
			const short = leastWeight(n) - v;
			grew += short;
			v = leastWeight(n);
			/* A branch point is only its strands (see settleBranchPoints): the
			   arrows out of it thickened with it, each by its share, so they
			   still fill it edge to edge, a split's double arrow too. */
			if (n.hub) {
				const kids = childrenOf(n);
				const out = kids.reduce((t, k) => t + lineWeight.get(k)!, 0);
				for (const k of kids) lineWeight.set(k, lineWeight.get(k)! + short * (out ? lineWeight.get(k)! / out : 1 / kids.length));
			}
		}
		lineWeight.set(n, v);
		return grew;
	};
	thickenToLeast(root);
	/* A branch point carries only what it leads to, so it is as thick as
	   their arrows together, no thicker: its strands fill it edge to edge. */
	const settleBranchPoints = (n: Node): number => {
		const kids = childrenOf(n).map(settleBranchPoints);
		if (n.hub) lineWeight.set(n, kids.reduce((t, v) => t + v, 0));
		return lineWeight.get(n)!;
	};
	settleBranchPoints(root);

	const lineWidth = (n: Node) => STRAND * lineWeight.get(n)!;
	// A cheese type's pill over its table twice as thick, a header to it; its photograph as tall, its label as big.
	const thickness = (n: Node) => (n.table ? 2 : 1);
	/* Its scale, grown where it must be to be at least as tall as all the
	   arrows out of it together and its two corners, so they all come out
	   of its straight side. Not those in its panel, which have no arrows
	   drawn. Its corners grow with it: NODE_H s t = out + 2 RADIUS s. */
	const widthOut = (n: Node) => childrenOf(n).reduce((t, k) => t + (inPanel(k) ? 0 : lineWidth(k)), 0);
	const scaleOf = (n: Node): number =>
		n.hub ? ownScale(n) : Math.max(ownScale(n), widthOut(n) / (NODE_H * thickness(n) - 2 * RADIUS));
	const pillHeight = (n: Node) => NODE_H * scaleOf(n) * thickness(n);
	const photoSize = pillHeight;
	return {
		scaleOf,
		lineWeight,
		lineWidth,
		arrowheadLength: (n) => headLength(lineWidth(n)),
		cardChainFont,
		// A circle half as wide again as a pill of its size is tall.
		milkRadius: opts.milkRadius ?? 1.5 * (NODE_H / 2) * scaleOf(root),
		allMilk,
		photoSize,
		pillHeight,
		thickness,
		photoRoom: (n) => (n.image ? photoSize(n) + PICTURE_GAP * scaleOf(n) : 0),
		pillCornerRadius: (n) => RADIUS * scaleOf(n),
		pillRimWidth: (n) => Math.min(1, scaleOf(n)),
	};
};
