import type { Box } from '../layout';
import { spacing, type Node } from '../client/base';
import type { Pen } from '../render/canvas';
import { mapPillsReadable } from '../layout/worldMap';
import type { Drawing, Painter, Sprite, SpriteCache, PicturePoint } from './types';

// A map tile's side, in device pixels.
const TILE_PX = 512;
// The longest side, in device pixels, a sprite is kept at; anything bigger is drawn as it is.
const MAX_SPRITE_PX = 2048;

/* Each sprite drawn once into a little canvas of its own at each zoom it
   is seen at, a zoom to every doubling, and stamped from there: drawing
   words, photographs and shadows afresh at every step of a zoom takes
   longer than a frame. */
export const makeSpriteCache = (G: Drawing): SpriteCache => {
	const { layout, highlight, pillPainter, markPainter, panelPainter } = G;
	const bitmaps = new Map<string, ImageBitmap>();
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
	// Kept as an image the screen holds on to, not one handed over at every stamp; and only if drawn whole.
	const drawAndKeep = ({ key, box, draw }: Sprite, level: number) => {
		const k = level * pixelRatio();
		const { canvas, g } = offscreenCanvas((box.x1 - box.x0) * k, (box.y1 - box.y0) * k, k, box.x0, box.y0);
		if (draw(g, level) === false) return canvas;
		const bitmap = canvas.transferToImageBitmap();
		bitmaps.set(`${key}@${level}`, bitmap);
		return bitmap;
	};

	// A pill's sprites, each with whether it has one and its box; a selected pill's kept apart from an unselected one's.
	const PILL_SPRITES: [string, (n: Node) => unknown, (n: Node) => Box, Painter][] = [
		['p', (n) => n !== layout.root, layout.pillShadowBox, pillPainter.drawPill],
		['f', (n) => n.regions?.length, (n) => markPainter.markRowBox(markPainter.flagSpots(n), 1.65), markPainter.drawFlags],
		['i', (n) => n.note || n.unsure, (n) => markPainter.markRowBox(markPainter.remarksOf(n), 1.6), markPainter.drawRemarks],
		['b', (n) => n.beasts?.length, (n) => markPainter.markRowBox(markPainter.animalSpots(n), 1.8), markPainter.drawAnimals],
		['seal', (n) => n.protected, (n) => markPainter.markRowBox([markPainter.sealSpot(n)], 1.6), markPainter.drawSeal],
	];
	const pillSpritesOf = (nodes: Node[]): Sprite[] =>
		PILL_SPRITES.flatMap(([kind, has, box, draw]) =>
			nodes.filter(has).map((n) => ({
				key: `${kind}:${n.id}${kind === 'p' ? `:${n === highlight.selected ? 1 : 0}` : ''}`,
				box: box(n),
				// A map's cheese only once it can be read; a pin for its country till then.
				draw: (g: Pen, at: number) => (n.onMap && !mapPillsReadable(at) ? true : draw(g, n, at)),
			})),
		);
	const pinSpritesAt = (s: number): Sprite[] =>
		mapPillsReadable(s)
			? []
			: [...layout.panels.keys()].flatMap((family) =>
					panelPainter.pinsAtZoom(family, s).map((pin) => ({
						key: `pin:${family.id}:${pin.iso}:${pin.areas.join()}:${pin.n}`,
						box: panelPainter.pinBox(pin),
						draw: (g: Pen, at: number) => panelPainter.drawPin(g, pin, at),
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
		...pillSpritesOf(layout.nodesWithPills.filter((n) => !n.onMap)),
	];

	/* The world map, cut into tiles as a map on the web is: its land and
	   every cheese on it drawn once into each tile at each zoom it is seen
	   at, and only the tiles in sight stamped; a thousand cheeses stamped
	   one sprite at a time take longer than a frame. A tile not yet drawn is
	   shown as a bigger one of the zoom below has it, a little soft, or as
	   the smaller ones of the zoom above; and drawn, a few a frame. */
	const mapTiles = new Map<string, { bitmap: ImageBitmap; whole: boolean; tries: number }>();
	const cheeseSprites = new Map<Node, Sprite[]>();
	const overlaps = (a: Box, b: Box) => a.x1 >= b.x0 && a.x0 <= b.x1 && a.y1 >= b.y0 && a.y0 <= b.y1;
	// How much of the picture a tile covers at a zoom, and the key it is kept under.
	const tileSpan = (level: number) => TILE_PX / (level * pixelRatio());
	const tileKey = (family: Node, level: number, tx: number, ty: number) => `${family.id}@${level}/${tx}/${ty}`;
	// The zoom it is all in one tile at: drawn first, so there is always something to show.
	const baseLevel = (family: Node) => zoomLevelOf(TILE_PX / ((layout.panelBox(family).x1 - layout.panelBox(family).x0) * pixelRatio())) / 2;
	const drawTile = (family: Node, level: number, tx: number, ty: number) => {
		const area = layout.panelBox(family);
		const span = tileSpan(level);
		const t = { x0: area.x0 + tx * span, y0: area.y0 + ty * span, x1: area.x0 + (tx + 1) * span, y1: area.y0 + (ty + 1) * span };
		const { canvas, g } = offscreenCanvas(TILE_PX, TILE_PX, level * pixelRatio(), t.x0, t.y0);
		panelPainter.drawMapLand(g, family, family.x - family.w / 2, family.y + family.h / 2);
		if (!cheeseSprites.has(family)) cheeseSprites.set(family, pillSpritesOf((layout.panelContents.get(family) ?? []).filter((k) => k.onMap)));
		let whole = true;
		highlight.drawPlain(() => {
			for (const sprite of cheeseSprites.get(family)!) if (overlaps(sprite.box, t) && sprite.draw(g, level) === false) whole = false;
		});
		const key = tileKey(family, level, tx, ty);
		const was = mapTiles.get(key);
		was?.bitmap.close();
		const tile = { bitmap: canvas.transferToImageBitmap(), whole, tries: (was?.tries ?? 0) + 1 };
		mapTiles.set(key, tile);
		return tile;
	};
	const drawMapTiles = (family: Node, s: number, from: PicturePoint, to: PicturePoint) => {
		const { ctx } = G.viewport;
		const { frames } = G;
		const area = layout.panelBox(family);
		const base = baseLevel(family);
		const level = Math.max(base, zoomLevelOf(s));
		const span = tileSpan(level);
		// The last tile across and down, at a zoom.
		const last = (n: number, at = level) => Math.ceil(n / tileSpan(at)) - 1;
		const clamp = (v: number, hi: number) => Math.max(0, Math.min(hi, v));
		const cols = last(area.x1 - area.x0);
		const rows = last(area.y1 - area.y0);
		// The zoom it is all in a tile or two at, always there to fall back on.
		for (let ty = 0; ty <= last(area.y1 - area.y0, base); ty++)
			for (let tx = 0; tx <= last(area.x1 - area.x0, base); tx++) if (!mapTiles.has(tileKey(family, base, tx, ty))) drawTile(family, base, tx, ty);
		for (let ty = clamp(Math.floor((from.y - area.y0) / span), rows); ty <= clamp(Math.floor((to.y - area.y0) / span), rows); ty++)
			for (let tx = clamp(Math.floor((from.x - area.x0) / span), cols); tx <= clamp(Math.floor((to.x - area.x0) / span), cols); tx++) {
				const x0 = area.x0 + tx * span;
				const y0 = area.y0 + ty * span;
				let tile = mapTiles.get(tileKey(family, level, tx, ty));
				// A photograph or flag not yet in when it was drawn: drawn again, once it may be.
				if ((!tile || (!tile.whole && tile.tries < 4 && !frames.moving)) && performance.now() < frames.keepUntil) tile = drawTile(family, level, tx, ty);
				if (tile) {
					ctx.drawImage(tile.bitmap, x0, y0, span, span);
					continue;
				}
				frames.keepingBehind = true;
				// The smaller ones of the zoom above, where they are all there.
				const finer = [0, 1].flatMap((j) => [0, 1].map((i) => mapTiles.get(tileKey(family, level * 2, tx * 2 + i, ty * 2 + j))));
				if (finer.every(Boolean) && mapPillsReadable(level * 2) === mapPillsReadable(level)) {
					finer.forEach((f, k) => ctx.drawImage(f!.bitmap, x0 + (k % 2) * (span / 2), y0 + Math.floor(k / 2) * (span / 2), span / 2, span / 2));
					continue;
				}
				// Or the part of a bigger one of the zooms below.
				for (let up = level / 2; up >= base; up /= 2) {
					const wide = tileSpan(up);
					const ux = Math.floor((x0 - area.x0) / wide);
					const uy = Math.floor((y0 - area.y0) / wide);
					const coarse = mapTiles.get(tileKey(family, up, ux, uy));
					if (!coarse || mapPillsReadable(up) !== mapPillsReadable(level)) continue;
					const k = up * pixelRatio();
					ctx.drawImage(coarse.bitmap, (x0 - area.x0 - ux * wide) * k, (y0 - area.y0 - uy * wide) * k, span * k, span * k, x0, y0, span, span);
					break;
				}
			}
		// Those at zooms far from this one let go, all but the one to fall back on.
		if (mapTiles.size > 400)
			evictFarZooms(mapTiles, level, (key) => Number(key.slice(key.indexOf('@') + 1, key.indexOf('/'))), (tile) => tile.bitmap.close(), (at) => at === base);
	};

	return { bitmaps, zoomLevelOf, tooBigToKeep, drawAndKeep, offscreenCanvas, evictFarZooms, allSprites, pillSpritesOf, pinSpritesAt, mapTiles, drawMapTiles };
};
