import type * as S from '../schema';
import { SIZE_EXPONENT, MILK } from '../settings';

/* A product, an example or a branch point: as the page is given it (see
   PageNode), and as it is laid out here, where it is, how big, how many
   steps from milk; a branch point is one the layout adds. */
export type Node = S.PageNode & {
	x: number;
	y: number;
	w: number;
	h: number;
	// Steps of making from milk, a treatment counting light (see light in the schema's Node).
	dist: number;
	hub?: true;
	// A story to tell of it, behind the T3 bubble on its pill (see stories/index.ts).
	story?: true;
};
export type Made = S.Payload['links'][number];
export type Arrow = { source: Node; target: Node; made: boolean };

export const ROOT = 'raw';
export const NODE_H = 40;
export const LINE = 15;
export const PAD_X = 14;
// The words' size at 1×, matching the stylesheet.
export const FONT = 13;
// How much of milk's width its word runs across.
export const ROOT_WORD = 0.7;
// The gap between one column and the next, where the lines turn.
export const GAP_X = 56;
// The steps' words at 1×, and the room either side of them (both growing
// with the product the arrow makes).
export const STEP_FONT = 10;
export const STEP_PAD = 16;
// A pill's corners at 1×: half the design system's --radius-medium.
export const RADIUS = 2;
// How tall on the screen a product found by the search is zoomed to, in px.
export const FOUND_HEIGHT = 44;
// How far products' branches are packed together, from 0 (each below the
// whole of the one before) to 1 (as close as their outlines allow).
export const PACKING = 0.8;
// The room between a pill's photograph and its words.
export const PICTURE_GAP = 6;
// The link mark at the right end of a product drawn again (see Product), and the room it takes.
export const LINK_MARK = 11;
export const LINK_ROOM = LINK_MARK + 6;
// The least room between a pill and anything not its sibling.
export const APART = 40;
// The room left under each pill, between it and the next row.
export const ROW_GAP = 8;
// A product drawn the bigger the more is made from it, all the way down (see settings.ts).
export const sizeOf = (made: number) => (1 + made) ** SIZE_EXPONENT;
export { MILK };
/* How thick a line is for each thing at the end of it: a line carries
   everything made down its branch, so it is this many times as thick as
   that is many, and a line out of a product splits into its children's
   as a river does, each strand as thick as its own branch (see layout/arrows.ts). */
export const STRAND = 1.5;
/* An arrowhead: the line's own end, tapering to a point, as wide as the
   line, however thin; and long enough, a thin line's too, to be seen to. */
export const headWidth = (line: number) => line;
export const headLength = (line: number) => 0.8 * Math.max(line, 7) + 4;
// How round a line's corners are.
export const CORNER = 8;
// The room round the whole, framed, in pixels on the screen.
export const MARGIN = 16;
/* How far in it can be zoomed: until the smallest words, a step's table
   on a thin arrow, read. */
export const MAX_ZOOM = 2000;
/* A ruler in a kind (see Product), along the bottom of its pill: this
   long a unit, room either end for what it measures; its products this far under it and their rows this far apart, and products
   side by side this far apart. */
export const RULE_PX = 20;
// How wide a unit of a ruler is drawn: its own, else the usual.
export const unitPx = (scale: { px?: number }) => scale.px ?? RULE_PX;
export const RULER_END = 4 * PAD_X + 48;
export const DROP = 36;
export const TIER_GAP = 28;
export const SIDE_GAP = 10;
// Inside a cheese panel, round its edge and between its rows (see layout/panels.ts).
export const PANEL_PADDING = 18;

/* Words measured on a canvas, in the graph's own font, rather than asked
   of the SVG, which lays the whole page out again for every one asked: a
   text's width is its widest line. The font is loaded before anything is
   drawn (see eachPage), as a canvas measures in whatever it has. */
// Looked up once: asking the page's styles for it is not free.
export let sans = '';
export const SANS = () => (sans ||= getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() || 'sans-serif');
// And the site's mono, the pills' names in it.
export let mono = '';
export const MONO = () => (mono ||= getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace');
// The prose's face, for the info mark's i.
export let serif = '';
export const SERIF = () => (serif ||= getComputedStyle(document.documentElement).getPropertyValue('--font-prose').trim() || 'serif');
export const FACES = ['400', 'italic 400', '600'];
// Made when first measured with, so the words' renderers can be loaded where there is no page (see render/).
let ruler: CanvasRenderingContext2D | null = null;
let rulerFont = '';
export const measure = (said: string, px: number, face = '400', family = SANS()) => {
	/* At a size where it measures true, and scaled to the one it is drawn
	   at: words a few pixels high, as a step's table's are, measure wide
	   of what they are drawn, as their widths are rounded at that size.
	   The font set only when it changes, as setting it is not free. */
	const font = `${face} 100px ${family}`;
	ruler ??= document.createElement('canvas').getContext('2d')!;
	if (font !== rulerFont) ruler.font = rulerFont = font;
	/* And the page's letter spacing, which the words inherit as so many
	   pixels a letter whatever their size, and which on the smallest of
	   them is a good part of their width. */
	return Math.max(...said.split('\n').map((l) => (ruler!.measureText(l).width * px) / 100 + spacing * [...l].length));
};
export let spacing = 0;
export const setSpacing = (to: number) => {
	spacing = to;
};

// How many have been drawn, to name each one's own parts apart.
let drawn = 0;
export const nextUid = () => `milk-${++drawn}`;
// The page's graph, its products and examples laid out (see Node).
export type Graph = Omit<S.Payload, 'nodes'> & { nodes: Node[] };
/* Only what is made from the milk of the animals chosen, and what that
   is made from, so the tree still reads down to it. A product with no
   animal marked is a cow's; one drawn again goes as the one it is of. */
export const only = (data: Graph, milks: Set<S.Beast>): Graph => {
	if (!milks.size) return data;
	const byId = new Map(data.nodes.map((n) => [n.id, n]));
	const fits = (n: Node): S.Beast[] => ((n.link && byId.get(n.link)) || n).beasts ?? ['cow'];
	const parent = new Map(data.links.map((l) => [l.target, l.source]));
	const kept = new Set([ROOT]);
	for (const n of data.nodes)
		if (fits(n).some((m) => milks.has(m))) for (let id: string | undefined = n.id; id && !kept.has(id); id = parent.get(id)) kept.add(id);
	return {
		...data,
		nodes: data.nodes.filter((n) => kept.has(n.id)),
		links: data.links.filter((l) => kept.has(l.source) && kept.has(l.target)),
		splits: data.splits.map((p) => ({ ...p, ids: p.ids.filter((id) => kept.has(id)) })).filter((p) => p.ids.length > 1),
	};
};

/* Marks on a pill's corner, a little over it, each a fifth of its height:
   flags, a remark's, animals, a seal. So many in a row from the corner
   inwards, each `step` of its own size from the one before, the corner's
   `inset` in; where each one's middle is, and how big. */
// How far a corner mark stands out past its pill's edge, top and bottom together, in its height: its radius, 0.2 of the height, less its inset.
export const MARK_OVERHANG = 2 * 0.2 * (1 - 0.35);

export const corner = (d: Node, n: number, right: boolean, bottom: boolean, inset = 0.35, step = 1.4) => {
	const r = d.h * 0.2;
	const x = (i: number) => (right ? d.x + d.w / 2 - r * inset - (n - 1 - i) * r * step : d.x - d.w / 2 + r * inset + i * r * step);
	const y = bottom ? d.y + d.h / 2 - r * inset : d.y - d.h / 2 + r * inset;
	return Array.from({ length: n }, (_, i) => ({ r, x: x(i), y }));
};

/* The room a ruler needs left of its nought: what it measures, in spaced
   small capitals (see drawCaption), and the nought itself, with a margin
   before them; so a long name does not run into the pill's photograph. */
export const rulerLead = ({ name }: { name: string }) =>
	Math.max(...name.split('\n').map((line) => measure(line.toUpperCase(), 11, '600') + 0.14 * 11 * line.length)) + measure(' 0', 10) + PAD_X;
