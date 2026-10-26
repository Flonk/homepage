import { APART, type Node } from '../client/base';
import type {
	ProductTree,
	NodeSizes,
	StepLabelSizes,
	ParentToChildGaps,
	TrunkStrands,
	RulerAndPanelContents,
	RulerLists,
	CheesePanels,
} from './types';
import { branchPacker } from './packing';
import { strandStraightener } from './straighten';

// What placing the nodes goes by.
export interface PlacementInputs {
	tree: ProductTree;
	sizes: NodeSizes;
	labels: StepLabelSizes;
	gaps: ParentToChildGaps;
	strands: TrunkStrands;
	contents: RulerAndPanelContents;
	rulers: RulerLists;
	panels: CheesePanels;
}

/* Every node placed, its x and y set; returns how far each child came in
   from past its parent's trunk.

   A parent's arrows all turn in its trunk, but each turns where its own
   strand is, not at the trunk's far side: so each branch comes in to just
   past where its own arrow turned. The outermost strands turn first (see
   arrows.ts): above the parent the topmost first, below it the lowest;
   one level with its strand does not turn, nor comes in; nor does one not
   clear of the band of arrows out of its parent, which it would come in
   over. How far is known only once all is placed, so it is all placed
   twice, the second time with each coming in as far as the first said. */
export const placeNodes = (inputs: PlacementInputs): Map<Node, number> => {
	const { root } = inputs.tree;
	const { lineWidth } = inputs.sizes;
	const { trunkHalfWidth } = inputs.gaps;
	const { strandYs, jogNegligible } = inputs.strands;
	const comeInBy = new Map<Node, number>();
	const { placeAcross, packAll } = branchPacker(inputs, comeInBy);
	const { withAllUnder, footprint, squareAll } = strandStraightener(inputs, comeInBy);

	const wantedComeIn = () => {
		const want = new Map<Node, number>();
		const visit = (p: Node) => {
			const at = strandYs(p);
			const kids = [...at.keys()];
			const half = trunkHalfWidth(p);
			const clearOfTrunkBand = (n: Node) => {
				const boxes = withAllUnder(n).flatMap((m) => footprint(m));
				return Math.max(...boxes.map((b) => b.y1)) + APART < p.y - half || Math.min(...boxes.map((b) => b.y0)) - APART > p.y + half;
			};
			const above = kids.filter((k) => k.y < at.get(k)!);
			const below = kids.filter((k) => k.y >= at.get(k)!).reverse();
			for (const side of [above, below]) {
				let past = 0;
				for (const k of side) {
					const by = 2 * half - past - lineWidth(k);
					past += lineWidth(k);
					if (by > 0 && !jogNegligible(k, k.y - at.get(k)!) && clearOfTrunkBand(k)) want.set(k, by);
				}
			}
			for (const k of kids) visit(k);
		};
		visit(root);
		return want;
	};
	const placeAll = () => {
		root.x = 0;
		placeAcross(root);
		packAll();
		root.y = 0;
		squareAll();
	};
	placeAll();
	for (const [k, by] of wantedComeIn()) comeInBy.set(k, by);
	placeAll();
	/* Placed again, an arrow may turn a little later than it did: a branch
	   that would come in past where its arrow now turns goes back out to
	   it, with all under it, rather than placing all once more. */
	const want = wantedComeIn();
	for (const [k, by] of [...comeInBy]) {
		const back = by - (want.get(k) ?? 0);
		if (back <= 0) continue;
		for (const n of withAllUnder(k)) n.x += back;
		if (by - back > 0) comeInBy.set(k, by - back);
		else comeInBy.delete(k);
	}
	return comeInBy;
};
