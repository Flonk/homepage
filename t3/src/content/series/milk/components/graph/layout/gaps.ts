import { GAP_X, STEP_PAD, CORNER, type Node } from '../client/base';
import type { ProductTree, NodeSizes, StepLabelSizes, ParentToChildGaps, TrunkStrands, RulerAndPanelContents } from './types';

/* Out of a product, a straight run at least so much of its own height
   before its arrows bend, so a great pill's arrows plainly leave it
   before they turn. */
const LEAST_STRAIGHT_RUN = 0.5;

/* Each child just past the edge of its parent, by a gap the parent sets,
   the bigger the wider; not in columns shared with the rest of the tree,
   where one great pill would push every small one's children far off.
   Children drawn the same size line up, as far out as the longest step
   label into any of them needs; a small child is not pushed out by a
   great sibling's label, nor by any other parent's. */
export const measureParentToChildGaps = (
	{ root, nodes, parent, childrenOf }: ProductTree,
	{ scaleOf, lineWidth, arrowheadLength, milkRadius }: NodeSizes,
	{ stepLabelWidth, cardChainWidth }: StepLabelSizes,
	{ busUnder }: RulerAndPanelContents,
): ParentToChildGaps => {
	const busWidth = (n: Node) => (busUnder.get(n) ?? []).reduce((sum, k) => sum + lineWidth(k), 0);
	const marginX = (n: Node) => (GAP_X / 2) * Math.sqrt(scaleOf(n));
	// Milk's arrows leave from its middle; a branch point's turn at once, as it has no pill to clear.
	// How far a line runs straight out of a pill before it may turn.
	const straightRun = (n: Node) => (n === root ? milkRadius : n.hub ? GAP_X / 4 : Math.max(marginX(n), LEAST_STRAIGHT_RUN * n.h));
	// A bus turns down before the trunk, after its own straight run, and runs down right beside it (see bus.ts), so with one there is room for it too.
	const pillToTrunk = (n: Node) => straightRun(n) + (busUnder.has(n) ? busWidth(n) + CORNER : 0);
	// The trunk as thick as all its children's arrows together.
	const trunkHalfWidth = (n: Node) => childrenOf(n).reduce((sum, k) => sum + lineWidth(k), 0) / 2;
	const roomForLabel = (k: Node) =>
		Math.max(marginX(k), Math.max(stepLabelWidth.get(k) ?? 0, cardChainWidth(k)) + 2 * STEP_PAD * scaleOf(k) + arrowheadLength(k));
	const sizeClass = (k: Node) => `${parent.get(k)!.id} ${scaleOf(k)}`;
	const widestOfClass = new Map<string, number>();
	for (const k of nodes) if (k !== root) widestOfClass.set(sizeClass(k), Math.max(widestOfClass.get(sizeClass(k)) ?? 0, roomForLabel(k)));
	const rightEdge = (n: Node) => n.x + n.w / 2;
	const trunkX = (n: Node) => rightEdge(n) + pillToTrunk(n) + trunkHalfWidth(n);
	return {
		marginX,
		pillToTrunk,
		straightRun,
		trunkHalfWidth,
		busWidth,
		trunkToChild: (k) => widestOfClass.get(sizeClass(k))!,
		rightEdge,
		trunkX,
		// From the trunk's far side, or where its arrow turned off before it (see placeNodes), to the arrowhead.
		labelCentreX: (n, comeIn) => {
			const p = parent.get(n)!;
			// A branch point has no head on its arrow.
			return (trunkX(p) + trunkHalfWidth(p) - comeIn + n.x - n.w / 2 - (n.hub ? 0 : arrowheadLength(n))) / 2;
		},
	};
};

/* The strands of a parent's trunk: the trunk on the parent's middle, and
   each child's strand in it, side by side in the order the children go
   down (by where they are now). */
/* How round a strand bends when it turns round the one that turned
   before it on its side: on the same middle, so the two touch all the way
   round; `inner` is that one's bend and `before` its width. The first to
   turn, with none before it, as tightly as any line bends. */
export const nestedBend = (inner: number, before: number, width: number) => inner + (before + width) / 2;

export const trunkStrands = ({ childrenOf }: ProductTree, { lineWidth }: NodeSizes, { trunkHalfWidth, busWidth }: ParentToChildGaps): TrunkStrands => {
	const strandYs = (p: Node) => {
		// Above its bus, if it has one, the two centred on it together.
		let edge = p.y - trunkHalfWidth(p) - busWidth(p) / 2;
		return new Map(
			[...childrenOf(p)]
				.sort((a, b) => a.y - b.y)
				.map((k) => {
					edge += lineWidth(k);
					return [k, edge - lineWidth(k) / 2] as const;
				}),
		);
	};
	return {
		strandYs,
		strandSides: (p) => {
			const slots = strandYs(p);
			const kids = [...slots.keys()];
			return {
				slots,
				up: kids.filter((k) => k.y < slots.get(k)!),
				down: kids.filter((k) => k.y >= slots.get(k)!).reverse(),
			};
		},
		// Too short for a strand to turn down and back with two corners and a clear stretch between, rather than a kink.
		jogTooShort: (n, by) => Math.abs(by) < lineWidth(n) + 4 * CORNER,
		// Less than the strand is thick.
		jogNegligible: (n, by) => Math.abs(by) < lineWidth(n),
		isLevel: (by) => Math.abs(by) < 0.5,
	};
};
