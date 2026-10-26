import { type Node, SANS } from '../client/base';
import { legible, font } from '../render/canvas';
import type { Drawing, DevMarks, Remark } from './types';

// Where the eye button's state is kept between visits.
const STORAGE_KEY = 'milk-graph-dev';
// What is still to be done: no sources yet; drawn along a way no share picked, of so many.
const DEV_MARKS = [
	['unsourced', '?', '#d97706', () => 'UNSOURCED'],
	['unranked', '⇅', '#7c3aed', (n: number) => `1 OUT OF ${n} ARROWS SHOWN`],
] as const;

/* Dev mode, while its eye button is pressed (and kept so, where the
   browser lets it be): a mark on each arrow and node for each thing still
   to be done on the way it is drawn along (see devOf in build.ts), said
   on hover, as big as its pill's other marks. */
export const makeDevMarks = (G: Drawing): DevMarks => {
	const { layout, markPainter } = G;
	const button = G.figure.querySelector<HTMLButtonElement>('.milk-dev');
	try {
		if (localStorage.getItem(STORAGE_KEY) === 'on') button?.setAttribute('aria-pressed', 'true');
	} catch {}
	const enabled = () => button?.getAttribute('aria-pressed') === 'true';
	button?.addEventListener(
		'click',
		() => {
			button.setAttribute('aria-pressed', String(!enabled()));
			try {
				localStorage.setItem(STORAGE_KEY, enabled() ? 'on' : 'off');
			} catch {}
			G.frames.requestPaint();
		},
		{ signal: G.signal },
	);
	/* An unsourced arrow's mark in the middle of its last stretch, or under
	   its card chain where it has one (by the pill, for one in a panel,
	   which has no arrow drawn); an unranked node's in its pill's middle. */
	const marksOf = (n: Node): (Remark & { glyph: string; colour: string })[] => {
		if (!n.dev || n.onMap) return [];
		const r = n.h * 0.2;
		const at = (kind: (typeof DEV_MARKS)[number][0]): [number, number] =>
			kind === 'unranked'
				? [n.x, n.y]
				: layout.panelContaining(n)
					? [n.x - n.w / 2, n.y - n.h / 2]
					: [layout.stepLabelX(n), layout.hasCardChain(n) ? layout.cardChainOf(n).area.y1 + r * 1.4 : layout.lastLegY(n)];
		return DEV_MARKS.filter(([kind]) => n.dev![kind]).map(([kind, glyph, colour, text]) => {
			const [x, y] = at(kind);
			return { node: n, kind, glyph, colour, text: text(n.dev!.unranked ?? 0), r, x, y };
		});
	};
	// Edged as the pill's marks are, the glyph only once it can be read.
	const draw = (s: number, inSight: (b: { x0: number; x1: number; y0: number; y1: number }) => boolean) => {
		if (!enabled()) return;
		const { ctx } = G.viewport;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (const n of layout.nodesWithPills)
			for (const { glyph, colour, r, x, y } of marksOf(n)) {
				if (!inSight({ x0: x - r, x1: x + r, y0: y - r, y1: y + r })) continue;
				markPainter.drawDisc(ctx, x, y, r, colour, s);
				markPainter.drawDiscRim(ctx, n, x, y, r);
				if (!legible(r * 1.35, s)) continue;
				ctx.fillStyle = '#fff';
				ctx.font = font(r * 1.35, '700', SANS());
				ctx.fillText(glyph, x, y + r * 0.08);
			}
	};
	return { enabled, marksOf, draw };
};
