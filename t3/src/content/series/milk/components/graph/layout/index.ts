import type { Node, Graph } from '../client/base';
import type { Box, Bounds, GraphLayout, LayoutOptions } from './types';
import { buildProductTree } from './tree';
import { measureNodeSizes } from './sizes';
import { orderSiblings } from './order';
import { takeOutRulerAndPanelContents } from './rulerAndPanelContents';
import { measurePills } from './pills';
import { measureStepLabels } from './stepLabels';
import { measureParentToChildGaps, trunkStrands } from './gaps';
import { hangUnderRulers } from './rulers';
import { layCheesePanels } from './panels';
import { placeNodes } from './place';
import { routeArrows } from './arrows';
import { placeStepLabels } from './labelPlacement';

export type { Box, Bounds, Point, Panel, GraphLayout, CardChainPlacement } from './types';

// A pill and its shadow, which reaches a quarter of its height round it.
const pillShadowBox = (n: Node): Box => {
	const s = n.h * 0.25;
	return { x0: n.x - n.w / 2 - s, x1: n.x + n.w / 2 + s, y0: n.y - n.h / 2 - s, y1: n.y + n.h / 2 + s };
};
const boundsOf = (boxes: Box[]): Bounds => {
	const x = Math.min(...boxes.map((b) => b.x0));
	const y = Math.min(...boxes.map((b) => b.y0));
	return { x, y, width: Math.max(...boxes.map((b) => b.x1)) - x, height: Math.max(...boxes.map((b) => b.y1)) - y };
};

/* The graph laid out: from the data, how big each node is and where, and
   the shape of every arrow, before anything is drawn (see draw/). The same
   for a filtered copy of the data as for the whole. Sets each node's x, y,
   w and h. */
export function layout(data: Graph, opts: LayoutOptions = {}): GraphLayout {
	const tree = buildProductTree(data);
	const sizes = measureNodeSizes(tree, opts);
	orderSiblings(tree, sizes);
	const contents = takeOutRulerAndPanelContents(tree);
	const pills = measurePills(tree, sizes, contents);
	const labels = measureStepLabels(tree, sizes, contents);
	const gaps = measureParentToChildGaps(tree, sizes, labels, contents);
	const strands = trunkStrands(tree, sizes, gaps);
	const rulers = hangUnderRulers(sizes, contents);
	const panels = layCheesePanels(data, sizes, contents);
	const comeInBy = placeNodes({ tree, sizes, labels, gaps, strands, contents, rulers, panels });
	const arrows = routeArrows({ tree, sizes, labels, gaps, strands, contents, rulers, inward: opts.inward });
	const placed = placeStepLabels({ sizes, labels, gaps, strands, arrows, comeInBy, contents });

	const stepLabelled = new Set(labels.nodesWithStepLabel);
	const cardChained = new Set(labels.nodesWithCardChain);

	/* Framed whole: the great branch points read from there, and the rest
	   is a zoom away. */
	const bounds = boundsOf([
		...pills.nodesWithPills.map(pillShadowBox),
		...arrows.arrowBox.values(),
		...labels.nodesWithStepLabel.map(placed.stepLabelBox),
		...labels.nodesWithCardChain.map((n) => placed.cardChainOf(n).area),
		...[...panels.panels.keys()].map(panels.panelBox),
	]);

	return {
		root: tree.root,
		nodes: tree.nodes,
		parent: tree.parent,
		children: tree.children,
		panelContents: contents.panelContents,
		panelContaining: contents.panelContaining,
		rulerTickX: rulers.rulerTickX,

		...pills,
		milkRadius: sizes.milkRadius,
		allMilk: sizes.allMilk,
		scaleOf: sizes.scaleOf,
		photoSize: sizes.photoSize,
		thickness: sizes.thickness,
		pillCornerRadius: sizes.pillCornerRadius,
		pillRimWidth: sizes.pillRimWidth,
		pillShadowBox,

		nodesWithStepLabel: labels.nodesWithStepLabel,
		nodesWithCardChain: labels.nodesWithCardChain,
		hasStepLabel: (n) => stepLabelled.has(n),
		hasCardChain: (n) => cardChained.has(n),
		stepLabelFont: labels.stepLabelFont,
		...placed,

		panels: panels.panels,
		panelBox: panels.panelBox,

		arrows: arrows.arrows,
		clickableArrows: arrows.clickableArrows,
		hasStepDetails: arrows.hasStepDetails,
		arrowOutline: arrows.arrowOutline,
		arrowCentreLine: arrows.arrowCentreLine,
		arrowBox: arrows.arrowBox,

		bounds,
	};
}
