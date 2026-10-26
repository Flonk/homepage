import { STEP_FONT, measure, type Node } from '../client/base';
import { strip, type Strip } from '../render/Processing';
import type { ProductTree, NodeSizes, RulerAndPanelContents, StepLabelSizes } from './types';

// Between the lines of a step label, in its font size.
export const LABEL_LEADING = 1.15;

/* Each step label and card chain measured, so each parent leaves room
   enough across for its children's. A branch point's arrow has none. */
export const measureStepLabels = (
	{ root, nodes, parent, childrenOf }: ProductTree,
	{ scaleOf, lineWidth, cardChainFont }: NodeSizes,
	{ panelContaining, rulerAbove, busAbove }: RulerAndPanelContents,
): StepLabelSizes => {
	/* At the scale of the product the arrow makes; larger where its step,
	   or a sibling's, has a card chain, so siblings read alike: the curd's
	   beside the whey's. */
	const carded = (n: Node) => !!n.how?.holds?.length;
	const stepLabelFont = (n: Node) => STEP_FONT * scaleOf(n) * (carded(n) || (parent.has(n) && childrenOf(parent.get(n)!).some(carded)) ? 1.6 : 1);
	const nodesWithStepLabel = nodes.filter((n) => n.step && n !== root && !panelContaining(n));
	/* In as many lines as it is written in, the last just over its arrow
	   and the rest stacked up from there. */
	const labelTextLines = (n: Node) => n.step!.split('\n');
	const extraLabelHeight = (n: Node) => (n.step ? (labelTextLines(n).length - 1) * LABEL_LEADING * stepLabelFont(n) : 0);
	const stepLabelWidth = new Map<Node, number>();
	for (const n of nodesWithStepLabel) stepLabelWidth.set(n, measure(n.step!, stepLabelFont(n), 'italic 400'));

	/* The card chain, under the label and laid over the arrow: the step's
	   processing, card by card (see render/Processing); small, a footnote
	   to the label. None under a ruler, in a panel, or off a bus, whose drops are too short for one. An example's arrow
	   may have a chain and no label. */
	const cardsOf = (n: Node) => (rulerAbove(n) || panelContaining(n) || busAbove(n) ? [] : (n.how?.holds ?? []));
	const layouts = new Map<Node, Strip>();
	const cardChainLayout = (n: Node) => {
		let laid = layouts.get(n);
		if (!laid) layouts.set(n, (laid = strip(cardsOf(n), cardChainFont(n))));
		return laid;
	};
	const hasCards = (n: Node) => cardsOf(n).length > 0;
	const cardChainHeight = (n: Node) => (hasCards(n) ? cardChainLayout(n).h + cardChainFont(n) * 0.6 : 0);
	const halfChain = (n: Node) => (cardChainHeight(n) ? (cardChainHeight(n) - cardChainFont(n) * 0.6) / 2 : 0);

	return {
		nodesWithStepLabel,
		nodesWithCardChain: nodes.filter(hasCards),
		stepLabelFont,
		labelTextLines,
		extraLabelHeight,
		stepLabelWidth,
		cardsOf,
		cardChainLayout,
		cardChainWidth: (n) => (hasCards(n) ? cardChainLayout(n).w : 0),
		cardChainHeight,
		cardChainTop: (n) => -halfChain(n),
		cardChainBottom: halfChain,
		labelClearance: (n) => Math.max(lineWidth(n) / 2, halfChain(n)),
	};
};
