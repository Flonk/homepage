import { CORNER, headWidth, type Node, type Arrow } from '../client/base';
import type {
	ProductTree,
	NodeSizes,
	StepLabelSizes,
	ParentToChildGaps,
	TrunkStrands,
	RulerAndPanelContents,
	RulerLists,
	ArrowPaths,
	ArrowRoute,
	TrunkStrand,
	Point,
	Box,
} from './types';
import { offsetRoute, arrowOutlinePath, centreLinePath } from './arrowShape';
import { nestedBend } from './gaps';
import { busGeometry, labelRoom } from './bus';

export interface ArrowInputs {
	tree: ProductTree;
	sizes: NodeSizes;
	labels: StepLabelSizes;
	gaps: ParentToChildGaps;
	strands: TrunkStrands;
	contents: RulerAndPanelContents;
	rulers: RulerLists;
	// Each arrow's head at what it is of, not at what it leads to (see LayoutOptions).
	inward?: boolean;
}

/* Every arrow's route, once all is placed. Every line runs straight
   across or straight up and down, never slantwise: out of the parent's
   side, along its strand in the parent's trunk, round a corner, up or
   down to the child's row, and round again into it. */
export const routeArrows = ({ tree, sizes, labels, gaps, strands: trunk, contents, rulers, inward }: ArrowInputs): ArrowPaths => {
	const labelHeight = labelRoom(labels);
	const { root, parent, childrenOf } = tree;
	const { lineWidth, arrowheadLength, milkRadius } = sizes;
	const { trunkHalfWidth, trunkX } = gaps;

	/* An arrow into every node from what it is made from, an example's as a
	   product's; none into a branch point, which each arrow through it
	   passes on its way (see routeOf). */
	const madeFrom = (n: Node): Node => {
		const p = parent.get(n)!;
		return p.hub ? madeFrom(p) : p;
	};
	const arrows: Arrow[] = [...parent].filter(([n]) => !contents.panelContaining(n) && !n.hub).map(([n]) => ({ source: madeFrom(n), target: n, made: true }));

	/* The strands of a parent's trunk turn off it one by one into the gap
	   before the children: those that go up, the topmost first, and those
	   that go down, the lowest first, so a strand turns only once all on
	   its far side have, and none crosses another. Each bends round the one
	   that turned before it, on the same middle, so the two meet all the
	   way round the corner; the first round as tight a bend as any line has. */
	const strands = new Map<Node, TrunkStrand>();
	const turnStrandsOf = (p: Node) => {
		const { slots: at, up, down } = trunk.strandSides(p);
		// The gap's near edge, where the first strand turns.
		const start = trunkX(p) - trunkHalfWidth(p);
		for (const side of [up, down]) {
			let past = 0;
			/* The bend of the one before, as it was drawn, how thick it is, and how
			   far it turned. Going down past a bus, the bus is the one before: it
			   turns down just under and before them all (see busRoute). */
			const bus = side === down ? gaps.busWidth(p) : 0;
			let inner = bus ? CORNER + bus / 2 : CORNER;
			let before = bus;
			let angleBefore = Math.PI / 2;
			for (const k of side) {
				const turnX = start + past + lineWidth(k) / 2;
				strands.set(k, { y: at.get(k)!, turnX, peelX: turnX, bends: [], angle: Math.PI / 2 });
				past += lineWidth(k);
				const q = elbowPoints(p, k);
				if (q.length < 4) continue;
				const w = lineWidth(k) / 2;
				const jog = Math.abs(q[2][1] - q[1][1]);
				// Round the one before, on its middle, so the two touch all the way round; then into the product.
				let first = Math.min(nestedBend(inner, before, lineWidth(k)), turnX - q[0][0]);
				let last = CORNER + w;
				/* Too short a jog for a quarter turn both ways: it follows the one
				   before round its curve only as far as it must to rise so much,
				   peels off it there, and bends back level into its product. Never
				   further round than the one before, which it would cross. */
				const angle = Math.min(angleBefore, jog >= first + last ? Math.PI / 2 : Math.acos(1 - jog / (first + last)));
				// Where it turns: its curve begins where the one before's does, so the two stay concentric.
				const bendX = turnX - first + first * Math.tan(angle / 2);
				const peelX = bendX + (angle < Math.PI / 2 ? jog / Math.tan(angle) : 0);
				// No rounder back into the product than the stretch into it has room for, leaving the head its own.
				const into = q[3][0] - peelX;
				const room = Math.max(into - (k.hub ? 0 : arrowheadLength(k)), into / 2);
				last = Math.min(last, room / Math.tan(angle / 2));
				Object.assign(strands.get(k)!, { turnX: bendX, peelX, bends: [0, first, last], angle });
				inner = first;
				before = lineWidth(k);
				angleBefore = angle;
			}
		}
	};
	// Its corners, from the parent's edge, along its strand, to the child's edge.
	const elbowPoints = (s: Node, t: Node): Point[] => {
		// Out of milk, from where its round edge is as high as the line.
		const x1 = s === root ? s.x + Math.sqrt(Math.max(0, milkRadius ** 2 - trunkHalfWidth(s) ** 2)) - 1 : s.x + (s.w - 2) / 2;
		// Into a product, to its edge; into a branch point, just past it, where the strands out of it begin.
		const x2 = t.hub ? t.x + 1 : t.x - t.w / 2;
		const strand = strands.get(t);
		if (!strand) throw new Error(`MilkGraph: no strand for ${t.id} under ${s.id}`);
		const { y, turnX, peelX } = strand;
		// Its strand level with it already: straight on.
		if (trunk.isLevel(t.y - y))
			return [
				[x1, y],
				[x2, y],
			];
		return [
			[x1, y],
			[turnX, y],
			[peelX, t.y],
			[x2, t.y],
		];
	};
	/* Off a bus (see bus.ts): out of the parent's right side below its
	   trunk and down, at its own strand; round into its row's bus, along to
	   over its table, and down into its top. Each turn is round one middle
	   with the strands it turns with, the outermost the roundest. */
	const busRoute = (s: Node, t: Node): ArrowRoute => {
		const bus = busGeometry(s, contents.busUnder.get(s)!, lineWidth, labelHeight, gaps.straightRun(s));
		const row = bus.rowOf(t);
		const by = bus.offset.get(t)!;
		const across = bus.rowOffset.get(t)!;
		const out = s.y + trunkHalfWidth(s) + by;
		const down = bus.x - by;
		const along = bus.middleY(row) + across;
		return {
			points: [
				[s.x + (s.w - 2) / 2, out],
				[down, out],
				[down, along],
				[t.x, along],
				[t.x, t.y - t.h / 2],
			],
			bends: [0, CORNER + bus.width / 2 - by, CORNER + bus.widthOf(row) / 2 + across, CORNER + lineWidth(t) / 2, 0],
		};
	};
	/* Off a ruler, one straight line from the product's value to the top of
	   its pill, slanting where it is set aside to make room. */
	const cornerPoints = (s: Node, t: Node): Point[] => {
		if (t.at == null || !contents.hungUnderRuler.has(s)) return elbowPoints(s, t);
		return [
			[rulers.rulerTickX(s, t.at!), s.y + rulers.rulerBottom(s)],
			[t.x, t.y - t.h / 2],
		];
	};
	/* The whole way from the product it is made from: through any branch
	   point on the way, at its own place in the line into it, as the
	   strands of a line lie side by side; and on from there into it. So
	   those that go out together are each an arrow of their own, not one
	   that splits. */
	const routeOf = (t: Node): ArrowRoute => {
		const p = parent.get(t)!;
		if (contents.busAbove(t)) return busRoute(p, t);
		const points = cornerPoints(p, t);
		const strand = strands.get(t);
		const own = { points, bends: points.map((_, i) => strand?.bends[i] ?? CORNER) };
		if (!p.hub) return own;
		const into = offsetRoute(routeOf(p), (strands.get(t)?.y ?? t.y) - p.y);
		// The branch point's own end, and its own start just past it, dropped: one line on through.
		return {
			points: [...into.points.slice(0, -1), ...own.points.slice(1)],
			bends: [...into.bends.slice(0, -1), ...own.bends.slice(1)],
		};
	};

	// Down from milk, so a line in is turned before the lines out of it.
	const turnAllStrands = (p: Node) => {
		turnStrandsOf(p);
		for (const k of [...childrenOf(p), ...(contents.busUnder.get(p) ?? [])]) turnAllStrands(k);
	};
	turnAllStrands(root);

	// As drawn: the other way round where its head is at what it is of.
	const drawn = (t: Node): ArrowRoute => {
		const r = routeOf(t);
		return inward ? { points: [...r.points].reverse(), bends: [...r.bends].reverse() } : r;
	};
	const boxAround = (points: Point[], pad: number): Box => ({
		x0: Math.min(...points.map(([x]) => x)) - pad,
		x1: Math.max(...points.map(([x]) => x)) + pad,
		y0: Math.min(...points.map(([, y]) => y)) - pad,
		y1: Math.max(...points.map(([, y]) => y)) + pad,
	});
	// Whether its step has more to tell than its label: its cards, or a paragraph.
	const hasStepDetails = (n: Node) => !!(n.how?.holds?.length || n.how?.text);
	return {
		arrows,
		clickableArrows: arrows.filter((a) => hasStepDetails(a.target)),
		hasStepDetails,
		strands,
		routeOf,
		arrowOutline: new Map(arrows.map((a) => [a, new Path2D(arrowOutlinePath(drawn(a.target), lineWidth(a.target), a.made))])),
		arrowCentreLine: new Map(arrows.map((a) => [a, new Path2D(centreLinePath(routeOf(a.target)))])),
		arrowBox: new Map(arrows.map((a) => [a, boxAround(routeOf(a.target).points, lineWidth(a.target) + headWidth(lineWidth(a.target)))])),
	};
};
