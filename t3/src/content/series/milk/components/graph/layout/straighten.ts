import { ROW_GAP, CORNER, type Node } from '../client/base';
import type { Box } from './types';
import type { PlacementInputs } from './place';
import { pillBox, moved, gap } from './util';
import { arrowFootprint } from './arrowFootprint';
import { nestedBend } from './gaps';

// A box, and whether it is of the arrow into its product.
type Footprint = Box & { arrowIn?: true };

/* Squaring up strands with their children: a child its strand runs into
   nearly level would be met by a jog too short to draw well, so the
   parent, or else the child with all made from it, is moved up or down
   so the strand meets it square on. */
export const strandStraightener = ({ tree, sizes, labels, gaps, strands, contents, rulers, panels }: PlacementInputs, comeInBy: Map<Node, number>) => {
	const { root, nodes, parent, childrenOf } = tree;
	const { hungUnderRuler, panelContents, panelContaining, rulerAbove, busUnder, busAbove } = contents;
	const { trunkHalfWidth, rightEdge, trunkX } = gaps;
	const { lineWidth } = sizes;
	const { strandYs, strandSides, jogTooShort, jogNegligible } = strands;
	const footprintOfArrow = arrowFootprint(sizes, labels, gaps, comeInBy);

	// It and all laid out under it: its branch, its ruler's lists, its panel.
	const withAllUnder = (n: Node): Node[] => [
		n,
		...[...childrenOf(n), ...(hungUnderRuler.get(n) ?? []), ...(panelContents.get(n) ?? []), ...(busUnder.get(n) ?? [])].flatMap(withAllUnder),
	];
	/* What a product takes up where it is: its pill, the arrow into it with
	   its label over it, and (`withTrunk`) the line out of it to its trunk
	   and down the trunk; or the arrow down into it from a ruler. */
	const footprint = (n: Node, withTrunk = true): Footprint[] => {
		const boxes: Footprint[] = [moved(pillBox(n), n.y)];
		// In a panel, only its pill; the panel is its family's.
		if (panelContaining(n)) return boxes;
		if (panelContents.has(n)) boxes.push(moved(panels.panelBoxRelative(n), n.y));
		const p = parent.get(n);
		const r = rulerAbove(n);
		// Off a bus, the drop into it from the bus over the row.
		if (busAbove(n)) boxes.push({ x0: n.x - lineWidth(n), x1: n.x + lineWidth(n), y0: n.y - n.h / 2 - 2 * lineWidth(n), y1: n.y - n.h / 2 });
		else if (r) {
			const t = rulers.rulerTickX(r, n.at!);
			boxes.push({ x0: Math.min(t, n.x) - 3, x1: Math.max(t, n.x) + 3, y0: r.y + rulers.rulerBottom(r), y1: r.y + rulers.listTopY.get(n)! });
		} else if (p) {
			const label = n.step ? labels.stepLabelFont(n) * 1.3 + labels.extraLabelHeight(n) + labels.labelClearance(n) : 0;
			boxes.push(...footprintOfArrow(n, trunkX(p) - trunkHalfWidth(p), label).map((b) => ({ ...moved(b, n.y), arrowIn: true as const })));
		}
		const kids = childrenOf(n);
		if (kids.length && withTrunk) {
			const ys = kids.map((k) => k.y);
			const t = trunkX(n);
			const margin = 2 * trunkHalfWidth(n);
			boxes.push({ x0: rightEdge(n), x1: t + trunkHalfWidth(n), y0: n.y - trunkHalfWidth(n), y1: n.y + trunkHalfWidth(n), margin });
			boxes.push({ x0: t - trunkHalfWidth(n), x1: t + trunkHalfWidth(n), y0: Math.min(...ys), y1: Math.max(...ys), margin });
		}
		return boxes;
	};
	const clash = (a: Box, b: Box) =>
		a.x0 < b.x1 + gap(a, b, 0) && b.x0 < a.x1 + gap(a, b, 0) && a.y0 < b.y1 + gap(a, b, ROW_GAP) && b.y0 < a.y1 + gap(a, b, ROW_GAP);
	const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
	/* Moves them by `by`, if that brings them near nothing they were not
	   near already and puts no pill on another; else leaves them. */
	const tryMove = (moving: Node[], by: number) => {
		const p = parent.get(moving[0]);
		// Not the arrows into what they make, which they are meant to meet.
		const rest = nodes
			.filter((n) => !moving.includes(n))
			.flatMap((n) => footprint(n, n !== p).filter((b) => !(b.arrowIn && moving.includes(parent.get(n)!))));
		const before = moving.flatMap((n) => footprint(n));
		for (const n of moving) n.y += by;
		const after = moving.flatMap((n) => footprint(n));
		const pills = moving.map((n) => moved(pillBox(n), n.y));
		const others = nodes.filter((n) => !moving.includes(n)).map((n) => moved(pillBox(n), n.y));
		const ontoPill = pills.some((a) => others.some((b) => overlaps(a, b)));
		if (!ontoPill && !after.some((a, i) => rest.some((b) => clash(a, b) && !clash(before[i], b)))) return true;
		for (const n of moving) n.y -= by;
		return false;
	};
	/* Of a parent's children met by a jog too short, the thickest: the
	   parent moved to meet it, if the parent is not itself met square that
	   way already, so as not to undo it. Any others met short are moved
	   level with their strands, with all made from them, where there is
	   room; a branch point, with no pill, at least by itself. Down from
	   milk. */
	const squared = new Set<Node>();
	const squareUnder = (p: Node) => {
		if (!squared.has(p)) {
			const thickest = [...strandYs(p)]
				.map(([k, y]) => ({ k, by: k.y - y }))
				.filter(({ k, by }) => jogTooShort(k, by))
				.sort((a, b) => lineWidth(b.k) - lineWidth(a.k) || Math.abs(a.by) - Math.abs(b.by))[0];
			// The parent alone, where that brings it near nothing either.
			if (thickest && tryMove([p], thickest.by)) squared.add(thickest.k);
		}
		/* On each side, in the order they turn: once a strand there has
		   turned, one met short after it hugs it instead, moved just far
		   enough off its slot to bend round it all the way and then peel off
		   straight into its product, so no gap opens between the two. */
		const { slots, up, down } = strandSides(p);
		for (const [side, away] of [
			[up, -1],
			[down, 1],
		] as const) {
			// The bend of the last strand on this side that turns, and its width (see turnStrandsOf).
			let inner = CORNER;
			let before = 0;
			let turned = false;
			for (const k of side) {
				const y = slots.get(k)!;
				const bend = nestedBend(inner, before, lineWidth(k));
				const hugJog = bend + CORNER + lineWidth(k) / 2;
				if (!squared.has(k) && turned && Math.abs(k.y - y) < hugJog) {
					if (tryMove(withAllUnder(k), y + away * hugJog - k.y)) squared.add(k);
				} else if (!squared.has(k) && jogTooShort(k, k.y - y)) {
					if (tryMove(withAllUnder(k), y - k.y)) squared.add(k);
					else if (k.hub && jogNegligible(k, k.y - y)) {
						k.y = y;
						squared.add(k);
					}
				}
				if (!jogNegligible(k, k.y - y)) {
					turned = true;
					inner = bend;
					before = lineWidth(k);
				}
			}
		}
		for (const k of childrenOf(p)) squareUnder(k);
	};
	return {
		withAllUnder,
		footprint,
		squareAll: () => {
			squared.clear();
			squareUnder(root);
		},
	};
};
