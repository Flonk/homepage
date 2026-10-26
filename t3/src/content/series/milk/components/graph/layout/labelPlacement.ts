import type { Node } from '../client/base';
import type { NodeSizes, StepLabelSizes, ParentToChildGaps, TrunkStrands, ArrowPaths, StepLabelPlacement, Box } from './types';
import { LABEL_LEADING } from './stepLabels';

export interface LabelPlacementInputs {
	sizes: NodeSizes;
	labels: StepLabelSizes;
	gaps: ParentToChildGaps;
	strands: TrunkStrands;
	arrows: ArrowPaths;
	// How far each child came in from past its parent's trunk (see placeNodes).
	comeInBy: Map<Node, number>;
}

/* Each step label in the middle of its arrow's last straight stretch,
   just above it; its card chain laid over the arrow under it. */
export const placeStepLabels = ({ sizes, labels, gaps, strands, arrows, comeInBy }: LabelPlacementInputs): StepLabelPlacement => {
	const { cardChainFont } = sizes;
	const { isLevel } = strands;
	const { stepLabelFont, labelTextLines, stepLabelWidth, cardsOf, cardChainLayout, cardChainWidth, cardChainHeight, cardChainTop, labelClearance } = labels;
	const lastLegY = (n: Node) => {
		const strand = arrows.strands.get(n);
		return strand && isLevel(n.y - strand.y) ? strand.y : n.y;
	};
	const labelBaseline = (n: Node) => lastLegY(n) - labelClearance(n) - stepLabelFont(n) * 0.45;
	const stepLabelX = (n: Node) => gaps.labelCentreX(n, comeInBy.get(n) ?? 0);
	const stepLabelLines = (n: Node) => {
		const font = stepLabelFont(n);
		const first = -(labelTextLines(n).length - 1) * LABEL_LEADING;
		return labelTextLines(n).map((said, i) => ({ said, y: labelBaseline(n) + font * (first + i * LABEL_LEADING) }));
	};
	return {
		lastLegY,
		stepLabelX,
		stepLabelLines,
		stepLabelBox: (n) => {
			const at = stepLabelLines(n);
			const w = stepLabelWidth.get(n)! / 2;
			return { x0: stepLabelX(n) - w, x1: stepLabelX(n) + w, y0: at[0].y - stepLabelFont(n), y1: at.at(-1)!.y + stepLabelFont(n) * 0.3 };
		},
		cardChainOf: (n) => {
			const font = cardChainFont(n);
			const left = stepLabelX(n) - cardChainWidth(n) / 2;
			const top = lastLegY(n) + cardChainTop(n);
			const wide = Math.max(stepLabelWidth.get(n) ?? 0, cardChainWidth(n)) + 2 * font;
			// Up to the top of its label, if it has one.
			const labelTop = n.step ? labelBaseline(n) - stepLabelFont(n) * (0.9 + (labelTextLines(n).length - 1) * LABEL_LEADING) : top;
			const area: Box = { x0: stepLabelX(n) - wide / 2, x1: stepLabelX(n) + wide / 2, y0: labelTop, y1: top + cardChainHeight(n) };
			return { font, left, top, height: cardChainHeight(n) - font * 0.6, strip: cardsOf(n).length ? cardChainLayout(n) : null, area };
		},
	};
};
