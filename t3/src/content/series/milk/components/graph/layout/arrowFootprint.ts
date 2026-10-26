import type { Node } from '../client/base';
import type { Box, NodeSizes, StepLabelSizes, ParentToChildGaps } from './types';

/* What the arrow into a product takes up, relative to the product's
   middle: its line, all along from `fromX`, keeping its thickness clear
   round it; and, only where they sit on its last stretch, its step label
   over it and its card chain on it, keeping the chain's height clear.
   `labelHeight` is how far above the line the label reaches. */
export const arrowFootprint =
	({ lineWidth }: NodeSizes, labels: StepLabelSizes, gaps: ParentToChildGaps, comeInBy: Map<Node, number>) =>
	(n: Node, fromX: number, labelHeight: number): Box[] => {
		const toX = n.x - n.w / 2;
		const half = lineWidth(n) / 2;
		const line: Box = { x0: Math.min(fromX, toX), x1: Math.max(fromX, toX), y0: -half, y1: half, margin: lineWidth(n) };
		if (!labelHeight && !labels.cardChainHeight(n)) return [line];
		const centre = gaps.labelCentreX(n, comeInBy.get(n) ?? 0);
		const halfWide = Math.max(labels.stepLabelWidth.get(n) ?? 0, labels.cardChainWidth(n)) / 2;
		return [
			line,
			{
				x0: centre - halfWide,
				x1: centre + halfWide,
				y0: -Math.max(labelHeight, half),
				y1: Math.max(half, labels.cardChainBottom(n)),
				margin: Math.max(lineWidth(n), labels.cardChainHeight(n)),
			},
		];
	};
