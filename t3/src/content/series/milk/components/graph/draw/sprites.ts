import type { Box } from '../layout';
import { spacing, type Node } from '../client/base';
import { decidedAt, type Pen } from '../render/canvas';
import type { Drawing, Painter, Sprite, SpriteCache } from './types';

// The longest side, in device pixels, a sprite is kept at; anything bigger is drawn as it is.
const MAX_SPRITE_PX = 2048;

/* Each sprite drawn once into a little canvas of its own at each zoom it
   is seen at, a zoom to every doubling, and stamped from there: drawing
   words, photographs and shadows afresh at every step of a zoom takes
   longer than a frame. */
export const makeSpriteCache = (G: Drawing): SpriteCache => {
	const { layout, highlight, pillPainter, markPainter, panelPainter } = G;
	const bitmaps = new Map<string, { bitmap: ImageBitmap; from: number; to: number }>();
	const pixelRatio = () => G.viewport.pixelRatio;
	const zoomLevelOf = (s: number) => 2 ** Math.round(Math.log2(s));
	const tooBigToKeep = (box: Box, level: number) => Math.max(box.x1 - box.x0, box.y1 - box.y0) * level * pixelRatio() > MAX_SPRITE_PX;
	const offscreenCanvas = (w: number, h: number, k: number, x0: number, y0: number) => {
		const canvas = new OffscreenCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));
		const g = canvas.getContext('2d')!;
		g.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
		g.letterSpacing = `${spacing}px`;
		return { canvas, g };
	};
	/* Those kept at zooms more than a doubling from this one let go, so they
	   do not pile up: the zoom each was kept at read off its key; those
	   `spared` kept whatever the zoom. */
	const evictFarZooms = <T,>(from: Map<string, T>, level: number, levelOfKey: (key: string) => number, close: (t: T) => void, spared = (_: number) => false) => {
		for (const [key, t] of from) {
			const at = levelOfKey(key);
			if (!spared(at) && Math.abs(Math.log2(at / level)) > 1) {
				close(t);
				from.delete(key);
			}
		}
	};
	/* Kept as an image the screen holds on to, not one handed over at every
	   stamp; and only if drawn whole. Drawn at its doubling's zoom, but what
	   shows in it decided at `s`, the zoom it is seen at, and kept with the
	   zooms that holds for (see shownAt): outside them it is drawn again. */
	const drawAndKeep = ({ key, box, draw }: Sprite, level: number, s: number) => {
		const k = level * pixelRatio();
		const { canvas, g } = offscreenCanvas((box.x1 - box.x0) * k, (box.y1 - box.y0) * k, k, box.x0, box.y0);
		const { drawn, from, to } = decidedAt(s, () => draw(g, level));
		if (drawn === false) return canvas;
		const bitmap = canvas.transferToImageBitmap();
		bitmaps.get(`${key}@${level}`)?.bitmap.close();
		bitmaps.set(`${key}@${level}`, { bitmap, from, to });
		return bitmap;
	};
	// A sprite kept at a zoom, if what shows in it is still what shows at `s`.
	const keptFor = (key: string, level: number, s: number) => {
		const kept = bitmaps.get(`${key}@${level}`);
		return kept && s >= kept.from && s < kept.to ? kept.bitmap : undefined;
	};

	/* A pill's sprites, each with whether it has one and its box; a selected
	   pill's kept apart from an unselected one's. Stamped kind by kind in
	   this order, every pill's before the next kind: a seal's ribbons under
	   the flags of the pill below, its rosette over its own. */
	const PILL_SPRITES: [string, (n: Node) => unknown, (n: Node) => Box, Painter][] = [
		['p', (n) => n !== layout.root, layout.pillShadowBox, pillPainter.drawPill],
		['tails', (n) => n.protected, (n) => markPainter.markRowBox([markPainter.sealSpot(n)], 2.4), markPainter.drawSealTails],
		['f', (n) => n.regions?.length, (n) => markPainter.markRowBox(markPainter.flagSpots(n), 1.65), markPainter.drawFlags],
		['seal', (n) => n.protected, (n) => markPainter.markRowBox([markPainter.sealSpot(n)], 1.6), markPainter.drawSeal],
		// A story's bubble only while on the ground: off it, drawn afresh (see rise in pointer.ts).
		['t3', (n) => n.story && !G.pointer?.raised.has(n), (n) => { const b = markPainter.storyBox(n); const m = (b.y1 - b.y0) * 0.5; return { x0: b.x0 - m, x1: b.x1 + m, y0: b.y0 - m, y1: b.y1 + m * 1.5 }; }, markPainter.drawStory],
		['i', (n) => n.unsure, (n) => markPainter.markRowBox(markPainter.remarksOf(n), 1.6), markPainter.drawRemarks],
		['b', (n) => n.beasts?.length, (n) => markPainter.markRowBox(markPainter.animalSpots(n), 1.8), markPainter.drawAnimals],
	];
	const pillSpritesOf = (nodes: Node[]): Sprite[] =>
		PILL_SPRITES.flatMap(([kind, has, box, draw]) =>
			nodes.filter(has).map((n) => ({
				key: `${kind}:${n.id}${kind === 'p' ? `:${n === highlight.selected ? 1 : 0}` : ''}`,
				box: box(n),
				draw: (g: Pen, at: number) => draw(g, n, at),
			})),
		);
	const allSprites = (): Sprite[] => [
		...[...layout.panels.keys()].map((p) => ({ key: `panel:${p.id}`, box: layout.panelBox(p), draw: (g: Pen, at: number) => panelPainter.drawPanel(g, p, at) })),
		...layout.nodesWithStepLabel.map((n) => {
			const box = layout.stepLabelBox(n);
			// Room for italics and ink past the measured box.
			const wide = (box.x1 - box.x0) * 0.1 + layout.stepLabelFont(n) * 0.3;
			return {
				key: `s:${n.id}:${n === highlight.inkedStep ? 1 : 0}`,
				box: { ...box, x0: box.x0 - wide, x1: box.x1 + wide },
				draw: (g: Pen, at: number) => pillPainter.drawStepLabel(g, n, at),
			};
		}),
		...layout.nodesWithCardChain.map((n) => ({
			key: `t:${n.id}:${n === highlight.inkedStep ? 1 : 0}`,
			box: layout.cardChainOf(n).area,
			draw: (g: Pen, at: number) => pillPainter.drawCardChain(g, n, at),
		})),
		...pillSpritesOf(layout.nodesWithPills),
	];

	return { bitmaps, keptFor, zoomLevelOf, tooBigToKeep, drawAndKeep, offscreenCanvas, evictFarZooms, allSprites, pillSpritesOf };
};
