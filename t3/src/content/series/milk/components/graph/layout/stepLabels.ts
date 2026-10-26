import { STEP_FONT, measure, type Node } from '../client/base';
import { strip, type Strip } from '../render/Processing';
import type { ProductTree, NodeSizes, RulerAndPanelContents, StepLabelSizes } from './types';

// Between the lines of a step label, in its font size.
export const LABEL_LEADING = 1.15;

/* Each step label and card chain measured, so each parent leaves room
   enough across for its children's. A branch point's arrow has none. */
export const measureStepLabels = (
	{ root, nodes }: ProductTree,
	{ scaleOf, lineWidth, cardChainFont }: NodeSizes,
	{ panelContaining, rulerAbove }: RulerAndPanelContents,
): StepLabelSizes => {
	// At the scale of the product the arrow makes; larger where the step has a card chain, so siblings read alike.
	const stepLabelFont = (n: Node) => STEP_FONT * scaleOf(n) * (n.how?.holds?.length ? 1.6 : 1);
	const nodesWithStepLabel = nodes.filter((n) => n.step && n !== root && !panelContaining(n));
	/* In as many lines as it is written in, the last just over its arrow
	   and the rest stacked up from there. */
	const labelTextLines = (n: Node) => n.step!.split('\n');
	const extraLabelHeight = (n: Node) => (n.step ? (labelTextLines(n).length - 1) * LABEL_LEADING * stepLabelFont(n) : 0);
	const stepLabelWidth = new Map<Node, number>();
	for (const n of nodesWithStepLabel) stepLabelWidth.set(n, measure(n.step!, stepLabelFont(n), 'italic 400'));

	/* The card chain, under the label and laid over the arrow: the step's
	   processing, card by card (see render/Processing); small, a footnote
	   to the label. None under a ruler or in a panel. An example's arrow
	   may have a chain and no label. */
	const cardsOf = (n: Node) => (rulerAbove(n) || panelContaining(n) ? [] : (n.how?.holds ?? []));
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
