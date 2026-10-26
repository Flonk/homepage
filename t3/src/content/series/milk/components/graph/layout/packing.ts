import { PACKING, APART, ROW_GAP, type Node } from '../client/base';
import type { Box } from './types';
import type { PlacementInputs } from './place';
import { pillBox, moved, gap } from './util';
import { arrowFootprint } from './arrowFootprint';

/* Placing across, then down. Across, each child just past its parent's
   trunk (see ParentToChildGaps), less however far it comes in (see
   place.ts). Down, each branch packed as close under the one before as
   their outlines let them, not their bands: a branch is the boxes its
   pills, arrows and labels take up, and the next one comes down only as
   far as it must to clear them, wherever they are side by side. So a
   small product tucks in just above a great branch whose far end reaches
   up past it. A parent sits level with the middle of its first and last
   child. */
export const branchPacker = (
	{ tree, sizes, labels, gaps, contents, rulers, panels }: PlacementInputs,
	comeInBy: Map<Node, number>,
) => {
	const { root, parent, childrenOf } = tree;
	const { hungUnderRuler, panelContents } = contents;
	const { pillToTrunk, trunkHalfWidth, trunkToChild, rightEdge, trunkX } = gaps;
	const { rulerBottom, rulerTickX, hungY, listTopY, hangUnder } = rulers;

	const placeAcross = (n: Node) => {
		if (hungUnderRuler.has(n)) hangUnder(n);
		for (const k of panelContents.get(n) ?? []) k.x = n.x - n.w / 2 + panels.panels.get(n)!.at.get(k)!.x;
		for (const k of childrenOf(n)) {
			k.x = rightEdge(n) + pillToTrunk(n) + 2 * trunkHalfWidth(n) + trunkToChild(k) + k.w / 2 - (comeInBy.get(k) ?? 0);
			placeAcross(k);
		}
	};
	// Milk's arrows are taken from its middle.
	const packingTrunkX = (p: Node) => (p === root ? 0 : trunkX(p));
	const footprintOfArrow = arrowFootprint(sizes, labels, gaps, comeInBy);
	// The arrow into a product, from its parent's trunk, with room for its label over it.
	const arrowInBoxes = (n: Node) =>
		footprintOfArrow(n, packingTrunkX(parent.get(n)!), n.step ? labels.stepLabelFont(n) * 1.7 + labels.extraLabelHeight(n) + labels.labelClearance(n) : 0);
	// All hung under a ruler, with the arrows down to it, the ruler at 0.
	const rulerListBoxes = (r: Node): Box[] =>
		hungUnderRuler.get(r)!.flatMap((k) => {
			const y = hungY.get(k)!;
			const t = rulerTickX(r, k.at!);
			return [
				{ x0: k.x - k.w / 2, x1: k.x + k.w / 2, y0: y - k.h / 2, y1: y + k.h / 2 },
				{ x0: t - 3, x1: t + 3, y0: rulerBottom(r), y1: listTopY.get(k)! },
			];
		});
	/* How far down `next` must go to clear everything in `above`: as close
	   as their outlines allow for an example; for anything else only
	   PACKING of the way there from below all of `above` that is in its
	   way, so branches keep a little air between them. */
	const clearance = (above: Box[], next: Box[], snug: boolean) => {
		let dy = -Infinity;
		let lowest = -Infinity;
		for (const b of next)
			for (const a of above)
				// Side by side counts as in the way unless as far apart as rows are, and a great pill's as far as it would be over or under.
				if (b.x0 < a.x1 + gap(a, b, APART / 2) && a.x0 < b.x1 + gap(a, b, APART / 2)) {
					// Siblings close together; anything else, cousins and trunks, further apart.
					dy = Math.max(dy, a.y1 + gap(a, b, a.own && b.own ? ROW_GAP : APART) - b.y0);
					lowest = Math.max(lowest, a.y1);
				}
		if (snug || dy === -Infinity) return dy;
		const below = lowest + ROW_GAP - Math.min(...next.map((b) => b.y0));
		// Only ever further off for the air, never nearer than the room it needs.
		return dy + (1 - PACKING) * Math.max(0, below - dy);
	};
	// Each node's y relative to its parent.
	const relativeY = new Map<Node, number>();
	// The boxes of a whole branch, its own node at 0.
	const branchOutline = (n: Node): Box[] => {
		const own = [pillBox(n), ...(n === root || !parent.has(n) ? [] : arrowInBoxes(n))].map((b) => ({ ...b, own: true }));
		const kids = childrenOf(n);
		if (hungUnderRuler.has(n)) own.push(...rulerListBoxes(n).map((b) => ({ ...b, own: false })));
		// A panel under its family, as much the family's own as its pill.
		if (panelContents.has(n)) own.push({ ...panels.panelBoxRelative(n), own: true });
		if (!kids.length) return own;
		const { at, packed, mid } = stack(kids);
		for (const k of kids) relativeY.set(k, at.get(k)! - mid);
		const t = packingTrunkX(n);
		// As wide as the trunk: its strands turn down anywhere across it.
		const trunk: Box = {
			x0: t - trunkHalfWidth(n) - 1,
			x1: t + trunkHalfWidth(n) + 1,
			y0: at.get(kids[0])! - mid,
			y1: at.get(kids.at(-1)!)! - mid,
			margin: 2 * trunkHalfWidth(n),
		};
		// Its own pill and arrow stay its own, for packing against its siblings; all under it is no sibling of theirs.
		return [...own, { ...trunk, own: false }, ...packed.map((b) => ({ ...moved(b, -mid), own: false }))];
	};
	/* Branches stacked down, each as close under the one before as clears
	   it, an example's closest, and never above the one before, so the
	   order reads down; their middle the first's and the last's. */
	const stack = (kids: Node[]) => {
		let packed: Box[] = [];
		const at = new Map<Node, number>();
		let last = 0;
		for (const k of kids) {
			const branch = branchOutline(k);
			const dy = packed.length ? Math.max(clearance(packed, branch, !!k.example), last) : 0;
			last = dy;
			at.set(k, dy);
			packed = packed.concat(branch.map((b) => moved(b, dy)));
		}
		const mid = kids.length ? (at.get(kids[0])! + at.get(kids.at(-1)!)!) / 2 : 0;
		return { at, packed, mid };
	};
	const placeDown = (n: Node, y: number) => {
		n.y = y;
		for (const k of childrenOf(n)) placeDown(k, y + relativeY.get(k)!);
		for (const k of hungUnderRuler.get(n) ?? []) k.y = y + hungY.get(k)!;
		for (const k of panelContents.get(n) ?? []) k.y = y + n.h / 2 + panels.panels.get(n)!.at.get(k)!.y;
	};
	// Milk's branches stacked as any product's are, centred on milk.
	const packAll = () => {
		const tops = childrenOf(root);
		const { at, mid } = stack(tops);
		for (const k of tops) placeDown(k, at.get(k)! - mid);
	};
	return { placeAcross, packAll };
};
