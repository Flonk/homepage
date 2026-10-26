import type { Node, Arrow, Graph } from '../client/base';
import type { Pin, Box, GraphLayout } from '../layout';
import type { Pen } from '../render/canvas';
import type { Selection } from 'd3-selection';
import type { Transition } from 'd3-transition';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';

/* A drawing of the graph on a canvas, and everything it takes to look
   round it. Each member below is made by one module of draw/ (see
   index.ts), in the order listed; a module may use those listed before
   it as it is made, and any of them once the drawing is running. */
export interface Drawing {
	figure: HTMLElement;
	// Aborted when the drawing is replaced or the page left: every listener and timer goes with it.
	signal: AbortSignal;
	data: Graph;
	// Only some animals' milks are shown: framed whole, not focused on the card's product.
	filtered: boolean;
	layout: GraphLayout;
	viewport: Viewport;
	appearance: Appearance;
	highlight: Highlight;
	pillPainter: PillPainter;
	markPainter: MarkPainter;
	panelPainter: PanelPainter;
	sprites: SpriteCache;
	frames: FramePainter;
	devMarks: DevMarks;
	pointer: Pointer;
	camera: Camera;
	search: Search;
	infoCard: InfoCard;
}

/* ---- Seeing it ---- */

// Screen point, in the pane's CSS pixels.
export type ScreenPoint = readonly [number, number];
// A point of the picture, in the layout's units.
export type PicturePoint = { x: number; y: number };

/* The canvas and where the picture is on it: fitted whole into the pane
   (fitScale and the offsets), then zoomed and panned (zoom). */
export interface Viewport {
	canvas: HTMLCanvasElement;
	canvasSelection: Selection<HTMLCanvasElement, unknown, null, undefined>;
	ctx: CanvasRenderingContext2D;
	paneWidth: number;
	paneHeight: number;
	// Device pixels to a CSS pixel.
	pixelRatio: number;
	// The whole picture, with a margin round it.
	framedBox: { x: number; y: number; width: number; height: number };
	fitScale: number;
	fitOffsetX: number;
	fitOffsetY: number;
	zoom: ZoomTransform;
	refit(): void;
	// Screen pixels to a unit of the picture, at the current zoom.
	screenScale(): number;
	pictureToScreen(x: number, y: number): ScreenPoint;
	screenToPicture(sx: number, sy: number): PicturePoint;
	// The zoom that puts picture point (x, y) at screen point (cx, cy), the pane's middle by default.
	zoomCentredOn(x: number, y: number, k: number, cx?: number, cy?: number): ZoomTransform;
}

// The colours the canvas draws in, read from the page's CSS custom properties.
export type Colours = {
	pill: string;
	rim: string;
	line: string;
	lit: string;
	litLine: string;
	text: string;
	dim: string;
	ground: string;
	accent: string;
	names: string;
	milk: string;
	info: string;
	unsure: string;
	land: string;
	panel: string;
	grid: string;
};

// Colours, photographs and textures, as the page has them.
export interface Appearance {
	colours: Colours;
	// A photograph or flag, once it has loaded; asked for the first time, starts loading it.
	imageOf(src: string): HTMLImageElement | null;
	// Milk's texture layers, as the page's chrome has them, and each as a pattern once its tile has loaded.
	milkTextures: string[];
	texturePattern(texture: string): CanvasPattern | null;
}

/* What is picked out: the node selected (clicked, or found) or hovered,
   whose arrows in and out are lit; and the step label hovered or
   selected, drawn in the ink. */
export interface Highlight {
	selected: Node | null;
	selectedStep: Node | null;
	inkedStep: Node | null;
	litArrows: Set<Arrow>;
	// Lights every arrow into and out of it, through branch points; or none.
	lightArrowsOf(n: Node | null): void;
	inkStep(n: Node | null): void;
	// Draws as if nothing were picked out, for what is shared by every look (sprites, the overview).
	drawingPlain: boolean;
	drawPlain(draw: () => void): void;
}

/* ---- Painting ---- */

/* Each painter draws onto a canvas in the picture's units, at a screen
   scale of `s` pixels to a unit, leaving out words too small to read
   there. One that returns false was not drawn whole, as a photograph not
   yet loaded leaves it, and is not to be kept. */
export type Painter = (g: Pen, n: Node, s: number) => boolean;

export interface PillPainter {
	drawPill: Painter;
	drawMilk(g: Pen, milk: Node, s: number): void;
	drawStepLabel: Painter;
	drawCardChain: Painter;
	drawLine(g: Pen, x0: number, y0: number, x1: number, y1: number, width: number, colour: string): void;
	// Words in spaced small capitals, as a heading in a margin is.
	drawCaption(g: Pen, text: string, x: number, y: number): void;
}

/* A round mark on a pill's corner that says something when pointed at:
   a remark, a guess, or (in dev mode) something still to be done. */
export type Remark = { node: Node; kind: 'note' | 'unsure' | 'unsourced' | 'unranked'; text: string; r: number; x: number; y: number };
// Where a round mark is, and how big.
export type Spot = { r: number; x: number; y: number };

// The marks on a pill's corners: flags, animals, remarks, a protected name's seal.
export interface MarkPainter {
	flagSpots(n: Node): (Spot & { country: string })[];
	animalSpots(n: Node): (Spot & { emoji: string })[];
	remarksOf(n: Node): Remark[];
	sealSpot(n: Node): Spot;
	sameRemark(a: Remark | null, b: Remark | null): boolean;
	// The box round a row of marks with their shadows, `below` of their size under them.
	markRowBox(spots: Spot[], below: number): Box;
	drawFlags: Painter;
	drawAnimals: Painter;
	drawRemarks: Painter;
	drawSeal: Painter;
	drawDisc(g: Pen, x: number, y: number, r: number, fill: string, s: number): void;
	drawDiscRim(g: Pen, n: Node, x: number, y: number, r: number): void;
}


// A family's panel under its pill: a ripening grid, or the world map with its pins.
export interface PanelPainter {
	drawPanel: Painter;
	drawMapLand(g: Pen, family: Node, left: number, top: number): void;
	// The pins shown at a zoom: those of a country that would overlap merged into one.
	pinsAtZoom(family: Node, s: number): Pin[];
	// A pin's head at a zoom: its radius, and the y of its middle.
	pinHead(pin: Pin, s: number): { r: number; headY: number };
	pinBox(pin: Pin): Box;
	drawPin(g: Pen, pin: Pin, s: number): boolean;
}

/* A piece of the picture drawn once at a zoom, kept as a bitmap, and
   stamped from there each frame (see SpriteCache). `key` names how it
   looks, so a lit one is kept apart from an unlit one. */
export type Sprite = { key: string; box: Box; draw: (g: Pen, s: number) => boolean | void };

/* Sprites kept per zoom, a zoom to every doubling; and the world map
   kept as tiles, as a map on the web is. */
export interface SpriteCache {
	bitmaps: Map<string, ImageBitmap>;
	// The zoom to a doubling that `s` is kept at.
	zoomLevelOf(s: number): number;
	// Too big to keep at that zoom, close in: drawn as it is.
	tooBigToKeep(box: Box, level: number): boolean;
	drawAndKeep(sprite: Sprite, level: number): ImageBitmap | OffscreenCanvas;
	// A canvas of its own, w × h pixels, drawing the picture from (x0, y0) at k pixels to a unit.
	offscreenCanvas(w: number, h: number, k: number, x0: number, y0: number): { canvas: OffscreenCanvas; g: OffscreenCanvasRenderingContext2D };
	evictFarZooms<T>(from: Map<string, T>, level: number, levelOfKey: (key: string) => number, close: (t: T) => void, spared?: (level: number) => boolean): void;
	// Every sprite, in the order drawn: panels, step labels, card chains, pills and their marks.
	allSprites(): Sprite[];
	// A pill's sprites: the pill, its flags, its remarks, its animals and its seal.
	pillSpritesOf(nodes: Node[]): Sprite[];
	pinSpritesAt(s: number): Sprite[];
	mapTiles: Map<string, { bitmap: ImageBitmap; whole: boolean; tries: number }>;
	drawMapTiles(family: Node, s: number, from: PicturePoint, to: PicturePoint): void;
}

// Painting a frame, and keeping up with the pane.
export interface FramePainter {
	paintNow(): void;
	// Paints on the next frame, however many times it is asked in this one.
	requestPaint(): void;
	sizeToPane(): void;
	resizeObserver: ResizeObserver;
	// While the picture moves, nothing new is kept: keeping takes longer than a frame has.
	moving: boolean;
	// Some sprite in sight was not kept at this zoom yet.
	keepingBehind: boolean;
	// Until when, in this frame, there is time to keep more.
	keepUntil: number;
	// The sprites, worked out again when one looks different: lit, or selected.
	sprites: Sprite[] | null;
	// Draws the whole picture into one image, for zoomed far out, when there is time.
	buildOverview(): void;
}

// Dev mode's marks, on what is still to be done in the data.
export interface DevMarks {
	enabled(): boolean;
	marksOf(n: Node): (Remark & { glyph: string; colour: string })[];
	draw(s: number, inSight: (b: Box) => boolean): void;
}

/* ---- Looking round ---- */

// What is under the pointer.
export type Hit = { pill: Node | null; step: Node | null; hint: string; remark: Remark | null; pin: Pin | null };

export interface Pointer {
	hitTest(e: MouseEvent): Hit;
	// A remark said in a little tip over its mark: on hover, or pinned by a tap.
	showRemark(r: Remark | null, pin?: boolean): void;
	shownRemark: Remark | null;
	remarkPinned: boolean;
	hovered: { pill: Node | null; step: Node | null };
}

export interface Camera {
	zoomBehavior: ZoomBehavior<HTMLCanvasElement, unknown>;
	glideTo(zoom: ZoomTransform, glide?: boolean): Transition<HTMLCanvasElement, unknown, null, undefined>;
	// The zoom framing these nodes, with a margin, zoomed in at least to `least`.
	framing(nodes: Node[], least: number): ZoomTransform;
}

export interface Search {
	field: HTMLInputElement;
	// Its label on one line.
	displayName(n: Node): string;
	// Glides to it and selects it; and opens its card unless `quiet`.
	goTo(n: Node, quiet?: boolean): void;
	// The zoom that shows it big enough to read, beside the card.
	zoomToRead(n: Node): ZoomTransform;
}

// The card over the picture telling of a product, an example, or a step.
export interface InfoCard {
	showNode(n: Node | null): void;
	showStep(n: Node): void;
	close(): void;
	// Frames a product and everything made from it; or the whole, for null.
	focusOn(id: string | null, glide: boolean): void;
	zoomToPin(pin: Pin): void;
}
