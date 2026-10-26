import type { Node, Arrow } from '../client/base';
import type { Strip } from '../render/Processing';
import type { Chip } from '../schema';

/* What each part of the layout works out (see index.ts), in the order it
   is worked out; each made from the parts before it, and nothing else.
   Units are the picture's: a pill of the usual size is NODE_H tall. */

/* ---- Shapes ---- */

export type Point = [number, number];
/* What something takes up, edge to edge. When packing branches (see
   packing.ts): `own`, that it is a sibling's own pill or arrow, not
   something further down its branch; `margin`, the least room it keeps
   to anything else: a pill half its height, an arrow its thickness. */
export type Box = { x0: number; x1: number; y0: number; y1: number; own?: boolean; margin?: number };
export type Bounds = { x: number; y: number; width: number; height: number };

/* ---- The tree ---- */

/* The tree drawn: each product under what it is made from, and branch
   points (hubs: nodes with no pill) where siblings made alike, or made
   together by one process, leave their parent as one before they part. */
export interface ProductTree {
	// Milk.
	root: Node;
	// The products, then the branch points.
	nodes: Node[];
	byId: Map<string, Node>;
	// What each hangs from: a product, or a branch point.
	parent: Map<Node, Node>;
	/* What hangs from each, in the order drawn top to bottom. Products hung
	   under a ruler and cheeses in a panel are taken out of it once they
	   have counted towards the sizes (see RulerAndPanelContents). */
	children: Map<Node, Node[]>;
	childrenOf(n: Node): Node[];
	// Of those, the products, not the examples.
	productChildrenOf(n: Node): Node[];
	// Whether it is the product with that id, or a branch point leading to it.
	isOrLeadsTo(n: Node, id: string): boolean;
	// For each product made together with others by one process, that process's key.
	splitKeyOf: Map<string, string>;
	// The processing steps all of them start with, up to the first they differ in.
	sharedStepPrefix(nodes: Node[]): string[];
}

/* ---- Sizes ---- */

// How big each node is drawn, and how thick the arrow into it.
export interface NodeSizes {
	// Its scale: 1 is a pill of the usual size. By how much is made from it, or its share of the world's milk.
	scaleOf(n: Node): number;
	// How much the arrow into it carries: it and everything made from it, in strands.
	lineWeight: Map<Node, number>;
	lineWidth(n: Node): number;
	arrowheadLength(n: Node): number;
	// The font size of the chain of processing cards on the arrow into it.
	cardChainFont(n: Node): number;
	milkRadius: number;
	// A pill's photograph, square, as tall as the pill; and the room it and its gap take at the pill's left.
	photoSize(n: Node): number;
	// How tall its pill is, and how many times as thick as its scale has it, its label as many times as big.
	pillHeight(n: Node): number;
	thickness(n: Node): number;
	photoRoom(n: Node): number;
	pillCornerRadius(n: Node): number;
	pillRimWidth(n: Node): number;
}

/* Nodes laid out apart from the tree's branches: products hung under a
   ruler (a pill with a scale, as fat content) at their values on it, and
   a family's cheeses placed in its panel. */
export interface RulerAndPanelContents {
	hungUnderRuler: Map<Node, Node[]>;
	panelContents: Map<Node, Node[]>;
	// A parent's tables in a row off a bus, softest first (see bus.ts); and the parent a table hangs off so.
	busUnder: Map<Node, Node[]>;
	busAbove(n: Node): Node | null;
	panelContaining(n: Node): Node | null;
	rulerAbove(n: Node): Node | null;
	// A ruler's products by their value on it: those at one value are stacked as one list.
	listsByValue(ruler: Node): Map<number, Node[]>;
}

export interface PillMeasures {
	// Every node with a pill: all but the branch points.
	nodesWithPills: Node[];
	// Milk's own label, as big as fits across its circle.
	milkLabel: string;
	milkLabelFont: number;
}

/* The label written on an arrow, naming the processing step into the
   product ("churned"), and the chain of processing cards drawn on the
   arrow under it: their sizes. */
export interface StepLabelSizes {
	nodesWithStepLabel: Node[];
	nodesWithCardChain: Node[];
	stepLabelFont(n: Node): number;
	// The label's lines of text, and how much taller than one line they make it.
	labelTextLines(n: Node): string[];
	extraLabelHeight(n: Node): number;
	stepLabelWidth: Map<Node, number>;
	cardsOf(n: Node): Chip[];
	cardChainLayout(n: Node): Strip;
	cardChainWidth(n: Node): number;
	// With a little air under it.
	cardChainHeight(n: Node): number;
	// Centred on the arrow's middle: how far above and below it the chain reaches.
	cardChainTop(n: Node): number;
	cardChainBottom(n: Node): number;
	// How far above the arrow's middle the label must sit, to clear the arrow or the chain.
	labelClearance(n: Node): number;
}

/* ---- Across ---- */

/* The arrows out of a parent all run right into one vertical trunk, as
   thick as all of them together, where each turns up or down to its
   child's row. How far across from a parent's pill its trunk is, and
   from the trunk to each child's pill. */
export interface ParentToChildGaps {
	// A product's margin to its right: the bigger the pill, the wider.
	marginX(n: Node): number;
	pillToTrunk(n: Node): number;
	// How far a line runs straight out of its pill before it may turn.
	straightRun(n: Node): number;
	trunkHalfWidth(n: Node): number;
	// How wide its bus is, if it has one (see bus.ts): out of its pill below its trunk, so the two together are centred on it.
	busWidth(n: Node): number;
	trunkToChild(n: Node): number;
	rightEdge(n: Node): number;
	trunkX(n: Node): number;
	// The middle of the last stretch of the arrow into it, where its step label and card chain sit, for a child that came in by comeIn (see placeNodes).
	labelCentreX(n: Node, comeIn: number): number;
}

/* Within a parent's trunk each child's arrow is a strand of its own,
   side by side in the order the children go down. */
export interface TrunkStrands {
	// Where each child's strand runs in the line out of the parent.
	strandYs(parent: Node): Map<Node, number>;
	/* The strands that turn up out of the line, the outermost (topmost)
	   first, and those that turn down, the lowest first: the order they
	   turn in, each bending round the one before (see turnStrandsOf). */
	strandSides(parent: Node): { slots: Map<Node, number>; up: Node[]; down: Node[] };
	// A turn down and back too short to draw with two clean corners; and one so short it is no turn at all.
	jogTooShort(n: Node, by: number): boolean;
	jogNegligible(n: Node, by: number): boolean;
	// Level with its strand already, and drawn dead straight; any other bends, however little, into the product's middle.
	isLevel(by: number): boolean;
}

/* ---- Rulers and panels ---- */

export interface RulerLists {
	// How far under a ruler's middle its arrows leave it; where a value is along it.
	rulerBottom(ruler: Node): number;
	rulerTickX(ruler: Node, value: number): number;
	// How far under its ruler each product's middle is, and the top of the list it is in.
	hungY: Map<Node, number>;
	listTopY: Map<Node, number>;
	// Works those out for one ruler, once it is placed across.
	hangUnder(ruler: Node): void;
}

/* A map pin: a region's cheeses, or a country's whose region is not
   known, where they are and how many. Zoomed out, a country's pins near
   each other are drawn as one (see pinsAtZoom in draw/panelPainter.ts). */
export type Pin = { iso: string; areas: (string | undefined)[]; name: string; x: number; y: number; r: number; n: number };
/* A family's cheeses laid out under its pill: on a grid, ripening time
   across and firmness down; or on the world map, each in its country.
   Coordinates are the panel's own, its top left at 0. */
export type Panel = {
	kind: 'grid' | 'map';
	pins?: Pin[];
	w: number;
	h: number;
	rows: { firm: string; y: number; h: number }[];
	times: [number, string][];
	xOf: (days: number) => number;
	// Set out across by column, not by time: its times are the columns' numbers and names.
	columns?: boolean;
	// What is set out across.
	named?: string;
	at: Map<Node, { x: number; y: number }>;
	// A map's: where the world's top left is in the panel, the world being cut to the family's cheeses.
	origin?: { x: number; y: number };
};
export interface CheesePanels {
	panels: Map<Node, Panel>;
	// Its box with its family's pill at y 0; and where it is in the picture.
	panelBoxRelative(family: Node): Box;
	panelBox(family: Node): Box;
}

/* ---- Arrows and their labels ---- */

/* A strand: where it runs in its parent's trunk; where it turns off it
   towards its child, and where it turns back level into it (the same
   for a full quarter turn); how far it turns, in radians; and how round
   each corner is. */
export type TrunkStrand = { y: number; turnX: number; peelX: number; bends: number[]; angle: number };
// The way an arrow goes: its corner points, and how round each corner is.
export type ArrowRoute = { points: Point[]; bends: number[] };

export interface ArrowPaths {
	// One into every node from what it is made from; not into panel cheeses or branch points.
	arrows: Arrow[];
	// Those whose step has details to show, which can be pointed at and clicked.
	clickableArrows: Arrow[];
	hasStepDetails(n: Node): boolean;
	strands: Map<Node, TrunkStrand>;
	routeOf(target: Node): ArrowRoute;
	arrowOutline: Map<Arrow, Path2D>;
	arrowCentreLine: Map<Arrow, Path2D>;
	arrowBox: Map<Arrow, Box>;
}

// Where a card chain is drawn, and the area round it and its step label, to point at.
export type CardChainPlacement = { font: number; left: number; top: number; height: number; strip: Strip | null; area: Box };

// Where each step label and card chain sits on its arrow.
export interface StepLabelPlacement {
	// The height of the arrow's last straight stretch, into the product.
	lastLegY(n: Node): number;
	stepLabelX(n: Node): number;
	stepLabelLines(n: Node): { said: string; y: number }[];
	stepLabelBox(n: Node): Box;
	cardChainOf(n: Node): CardChainPlacement;
}

/* ---- The whole ---- */

// The graph laid out: everything the drawing (see draw/) is given.
export interface GraphLayout {
	root: Node;
	nodes: Node[];
	parent: Map<Node, Node>;
	children: Map<Node, Node[]>;
	panelContents: Map<Node, Node[]>;
	panelContaining(n: Node): Node | null;
	rulerTickX(ruler: Node, value: number): number;

	nodesWithPills: Node[];
	milkLabel: string;
	milkLabelFont: number;
	milkRadius: number;
	scaleOf(n: Node): number;
	photoSize(n: Node): number;
	thickness(n: Node): number;
	pillCornerRadius(n: Node): number;
	pillRimWidth(n: Node): number;
	// A pill and its shadow, which reaches a quarter of its height round it.
	pillShadowBox(n: Node): Box;

	nodesWithStepLabel: Node[];
	nodesWithCardChain: Node[];
	hasStepLabel(n: Node): boolean;
	hasCardChain(n: Node): boolean;
	stepLabelFont(n: Node): number;
	stepLabelX(n: Node): number;
	lastLegY(n: Node): number;
	stepLabelLines(n: Node): { said: string; y: number }[];
	stepLabelBox(n: Node): Box;
	cardChainOf(n: Node): CardChainPlacement;

	panels: Map<Node, Panel>;
	panelBox(family: Node): Box;

	arrows: Arrow[];
	clickableArrows: Arrow[];
	hasStepDetails(n: Node): boolean;
	arrowOutline: Map<Arrow, Path2D>;
	arrowCentreLine: Map<Arrow, Path2D>;
	arrowBox: Map<Arrow, Box>;

	// All of it, to frame whole.
	bounds: Bounds;
}
