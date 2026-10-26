import { spacing, type Arrow } from '../client/base';
import type { Box } from '../layout';
import type { Pen } from '../render/canvas';
import { pixelRatio } from '../../../../../../lib/canvas';
import { mapPillsReadable } from '../layout/worldMap';
import type { Drawing, FramePainter, Sprite } from './types';

// The overview's longest side, in pixels.
const OVERVIEW_PX = 4096;
// Kept sprites past this many are thinned to the zooms near this one.
const MOST_KEPT = 3000;
// Of a frame, how long may go on drawing sprites to keep, in ms.
const KEEPING_TIME = 6;

/* Painting a frame of what is in sight: the arrows, the lit ones over the
   rest; milk; the map's tiles; and the sprites (panels, step labels,
   card chains, pills and their marks), each stamped from where it is
   kept at this zoom. Zoomed far out, one image of the whole instead. */
export const makeFramePainter = (G: Drawing): FramePainter => {
	const { figure, signal, layout, viewport, highlight, pillPainter, panelPainter, sprites } = G;
	const colours = G.appearance.colours;
	const { ctx, canvas } = viewport;

	/* While it moves, nothing new is kept: keeping takes longer than a frame
	   has. Once still, what is in sight is kept at this zoom, as much as
	   there is time for in a frame, then the zooms either side when the page
	   has nothing else to do, ready for the next. */
	let spritesInSight: Sprite[] = [];
	let idleKeeping = 0;
	signal.addEventListener('abort', () => cancelIdleCallback(idleKeeping));
	const keepAhead = () => {
		cancelIdleCallback(idleKeeping);
		const level = sprites.zoomLevelOf(viewport.screenScale());
		const middle = viewport.screenToPicture(viewport.paneWidth / 2, viewport.paneHeight / 2);
		const distance = (p: Sprite) => Math.hypot((p.box.x0 + p.box.x1) / 2 - middle.x, (p.box.y0 + p.box.y1) / 2 - middle.y);
		const todo = [
			...[...spritesInSight].reverse().flatMap((p) => [level * 2, level / 2].map((at) => [p, at] as const)),
			...sprites
				.allSprites()
				.sort((a, b) => distance(b) - distance(a))
				.map((p) => [p, level] as const),
		].filter(([p, at]) => !sprites.bitmaps.has(`${p.key}@${at}`) && !sprites.tooBigToKeep(p.box, at));
		const keepSome = (deadline: IdleDeadline) => {
			while (todo.length && deadline.timeRemaining() > 2 && !frames.moving) {
				const [p, at] = todo.pop()!;
				sprites.drawAndKeep(p, at);
			}
			if (todo.length && !frames.moving) idleKeeping = requestIdleCallback(keepSome);
		};
		idleKeeping = requestIdleCallback(keepSome);
	};
	// Stamped from where it is kept; kept now, if there is time; else as it was kept at the nearest zoom, or drawn as it is.
	const stamp = (sprite: Sprite, s: number) => {
		const { key, box, draw } = sprite;
		const level = sprites.zoomLevelOf(s);
		if (sprites.tooBigToKeep(box, level)) {
			draw(ctx, s);
			return;
		}
		spritesInSight.push(sprite);
		let bitmap: ImageBitmap | OffscreenCanvas | undefined = sprites.bitmaps.get(`${key}@${level}`);
		if (!bitmap && !frames.moving && performance.now() < frames.keepUntil) bitmap = sprites.drawAndKeep(sprite, level);
		if (!bitmap) {
			frames.keepingBehind = true;
			for (const near of [level / 2, level * 2, level / 4, level * 4]) bitmap ??= sprites.bitmaps.get(`${key}@${near}`);
			if (!bitmap) {
				draw(ctx, s);
				return;
			}
		}
		ctx.drawImage(bitmap, box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
	};
	// Those kept at zooms far from this one let go, once the zoom has come to another doubling.
	let evictedAtLevel = 0;
	const evictOnZoom = (s: number) => {
		const level = sprites.zoomLevelOf(s);
		if (sprites.bitmaps.size < MOST_KEPT || level === evictedAtLevel) return;
		evictedAtLevel = level;
		sprites.evictFarZooms(sprites.bitmaps, level, (key) => Number(key.slice(key.lastIndexOf('@') + 1)), (bitmap) => bitmap.close());
	};

	/* The whole of it, drawn plain once into a single image when there is
	   nothing else to do; and zoomed out so far that the image is as sharp
	   as the screen, painted as that one image, with only what is lit,
	   selected or hovered drawn over it. Zoomed out the most is in sight,
	   and stamping every sprite and arrow of it each frame takes too long. */
	const box = viewport.framedBox;
	const overviewScale = OVERVIEW_PX / Math.max(box.width, box.height);
	let overview: ImageBitmap | null = null;
	let overviewTimer = 0;
	const buildOverview = () => {
		cancelIdleCallback(overviewTimer);
		const { canvas: image, g } = sprites.offscreenCanvas(box.width * overviewScale, box.height * overviewScale, overviewScale, box.x, box.y);
		let whole = true;
		const todo: (() => void)[] = [
			() => {
				setArrowStroke(g, overviewScale);
				for (const a of layout.arrows) fillArrow(g, a, colours.line);
			},
			() => pillPainter.drawMilk(g, layout.root, overviewScale / viewport.pixelRatio),
			// A map's land; its cheeses are not drawn so far out, and its pins are drawn over it, as big as the zoom has them.
			...[...layout.panels.keys()].filter((p) => p.map).map((p) => () => panelPainter.drawMapLand(g, p, p.x - p.w / 2, p.y + p.h / 2)),
			...sprites.allSprites().map((p) => () => {
				if (p.draw(g, overviewScale / viewport.pixelRatio) === false) whole = false;
			}),
		].reverse();
		const drawSome = (deadline: IdleDeadline) => {
			highlight.drawPlain(() => {
				while (todo.length && (deadline.timeRemaining() > 2 || deadline.didTimeout)) todo.pop()!();
			});
			if (todo.length) {
				overviewTimer = requestIdleCallback(drawSome, { timeout: 1000 });
				return;
			}
			overview?.close();
			overview = image.transferToImageBitmap();
			requestPaint();
			// A photograph or flag not yet in: built again once they are.
			if (!whole) overviewTimer = window.setTimeout(buildOverview, 1500) as unknown as number;
		};
		overviewTimer = requestIdleCallback(drawSome, { timeout: 1000 });
	};
	signal.addEventListener('abort', () => {
		cancelIdleCallback(overviewTimer);
		clearTimeout(overviewTimer);
	});

	/* The map's card (see .milk-map-card): in the map's top left, a little
	   in from its edges; once the map is panned past that, held in the
	   pane's top left, under the search, as a sticky header is, until the
	   map's far edges push it out. Hidden while the map is too small on
	   the screen to hold it. */
	const mapCard = figure.querySelector<HTMLElement>('.milk-map-card')!;
	const worldMap = [...layout.panels.keys()].find((p) => p.map);
	// Its size and the search's foot, measured as it is first shown and as the pane changes size, not each frame.
	let mapCardSize: { w: number; h: number; top: number } | null = null;
	let mapCardTransform = '';
	const placeMapCard = () => {
		if (!worldMap) return void (mapCard.hidden = true);
		const area = layout.panelBox(worldMap);
		const [left, top] = viewport.pictureToScreen(area.x0, area.y0);
		const [right, bottom] = viewport.pictureToScreen(area.x1, area.y1);
		const inset = 12;
		// Three of its 15rem across, at the least; hidden, it has no width of its own to go by.
		const hide = right - left < 720;
		if (mapCard.hidden !== hide) mapCard.hidden = hide;
		if (hide) return;
		if (!mapCardSize) {
			// Under the search where it is in the pane; at the pane's top where it has gone to the deck's tools.
			const under = figure.querySelector<HTMLElement>('.milk-search .milk-beasts') ?? figure.querySelector<HTMLElement>('.milk-search input');
			const below = under ? under.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top + inset : inset;
			mapCardSize = { w: mapCard.offsetWidth, h: mapCard.offsetHeight, top: below };
		}
		const { w, h, top: least } = mapCardSize;
		const x = Math.round(Math.min(Math.max(left + inset, inset), right - inset - w));
		const y = Math.round(Math.min(Math.max(top + inset, least), bottom - inset - h));
		const transform = `translate(${canvas.offsetLeft + x}px, ${canvas.offsetTop + y}px)`;
		if (transform !== mapCardTransform) mapCard.style.transform = mapCardTransform = transform;
	};
	signal.addEventListener('abort', () => (mapCard.hidden = true));

	// An arrow filled, and edged in a hairline of its own colour, at a zoom.
	const setArrowStroke = (g: Pen, s: number) => {
		g.lineJoin = 'round';
		g.lineWidth = 1 / s;
	};
	const fillArrow = (g: Pen, a: Arrow, colour: string) => {
		const outline = layout.arrowOutline.get(a)!;
		g.fillStyle = g.strokeStyle = colour;
		g.fill(outline);
		g.stroke(outline);
	};
	// The selected pill and its marks, over the rest.
	const drawSelectedOnTop = (s: number) => {
		const { selected } = highlight;
		if (selected && selected !== layout.root) for (const sprite of sprites.pillSpritesOf([selected])) sprite.draw(ctx, s);
	};

	const paintNow = () => {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const s = viewport.screenScale();
		const dpr = viewport.pixelRatio;
		const [ox, oy] = viewport.pictureToScreen(0, 0);
		ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
		ctx.letterSpacing = `${spacing}px`;
		ctx.imageSmoothingQuality = 'high';
		const topLeft = viewport.screenToPicture(0, 0);
		const bottomRight = viewport.screenToPicture(viewport.paneWidth, viewport.paneHeight);
		const inSight = (b: Box) => b.x1 >= topLeft.x && b.x0 <= bottomRight.x && b.y1 >= topLeft.y && b.y0 <= bottomRight.y;
		placeMapCard();
		frames.keepingBehind = false;
		spritesInSight = [];
		evictOnZoom(s);

		// Zoomed out: the overview, and over it only what is lit, selected or hovered.
		if (overview && s * dpr <= overviewScale) {
			ctx.drawImage(overview, box.x, box.y, box.width, box.height);
			frames.keepUntil = performance.now() + KEEPING_TIME;
			for (const sprite of sprites.pinSpritesAt(s)) if (inSight(sprite.box)) stamp(sprite, s);
			setArrowStroke(ctx, s);
			for (const a of highlight.litArrows) fillArrow(ctx, a, colours.litLine);
			// The step labels on a lit arrow drawn again over it, as they are over every arrow zoomed in.
			const relabel = new Set([...highlight.litArrows].map((a) => a.target));
			if (highlight.inkedStep) relabel.add(highlight.inkedStep);
			for (const n of relabel) {
				if (layout.hasStepLabel(n) && inSight(layout.stepLabelBox(n))) pillPainter.drawStepLabel(ctx, n, s);
				if (layout.hasCardChain(n) && inSight(layout.cardChainOf(n).area)) pillPainter.drawCardChain(ctx, n, s);
			}
			drawSelectedOnTop(s);
			G.devMarks.draw(s, inSight);
			return;
		}

		// The tree, set back until a product is picked out; its arrows edged in a hairline of their own colour.
		setArrowStroke(ctx, s);
		for (const lit of [false, true])
			for (const a of layout.arrows) if (highlight.litArrows.has(a) === lit && inSight(layout.arrowBox.get(a)!)) fillArrow(ctx, a, lit ? colours.litLine : colours.line);
		// Milk under the rest.
		if (inSight(layout.pillShadowBox(layout.root))) pillPainter.drawMilk(ctx, layout.root, s);
		frames.keepUntil = performance.now() + KEEPING_TIME;
		for (const p of layout.panels.keys()) if (p.map && inSight(layout.panelBox(p))) sprites.drawMapTiles(p, s, topLeft, bottomRight);
		frames.sprites ??= sprites.allSprites();
		for (const list of [frames.sprites, sprites.pinSpritesAt(s)]) for (const sprite of list) if (inSight(sprite.box)) stamp(sprite, s);
		// One selected on the map, lit over its tile.
		if (highlight.selected?.onMap && mapPillsReadable(s)) drawSelectedOnTop(s);
		G.devMarks.draw(s, inSight);

		// Some not yet kept at this zoom: on with them in the next frame; all of them: the zooms either side.
		if (frames.moving) return;
		if (frames.keepingBehind) requestPaint();
		else keepAhead();
	};
	let paintQueued = false;
	const requestPaint = () => {
		if (paintQueued) return;
		paintQueued = true;
		requestAnimationFrame(() => {
			paintQueued = false;
			if (!signal.aborted) paintNow();
		});
	};

	/* As big as the pane, in the screen's own pixels; and as the pane
	   changes size, the point that was in its middle kept in its middle. */
	const sizeToPane = () => {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		const was = viewport.pixelRatio;
		viewport.pixelRatio = pixelRatio();
		// Tiles and sprites are drawn in the screen's pixels: on a screen with more to them, drawn again.
		if (viewport.pixelRatio !== was) {
			for (const tile of sprites.mapTiles.values()) tile.bitmap.close();
			sprites.mapTiles.clear();
			for (const bitmap of sprites.bitmaps.values()) bitmap.close();
			sprites.bitmaps.clear();
		}
		if (canvas.width !== Math.round(w * viewport.pixelRatio) || canvas.height !== Math.round(h * viewport.pixelRatio)) {
			canvas.width = Math.round(w * viewport.pixelRatio);
			canvas.height = Math.round(h * viewport.pixelRatio);
		}
		// Only a real change moves the picture: anything else would cut short a glide under way.
		if (!w || !h || (w === viewport.paneWidth && h === viewport.paneHeight)) return;
		mapCardSize = null;
		const middleWas = viewport.screenToPicture(viewport.paneWidth / 2, viewport.paneHeight / 2);
		viewport.paneWidth = w;
		viewport.paneHeight = h;
		viewport.refit();
		viewport.canvasSelection.call(G.camera.zoomBehavior.transform, viewport.zoomCentredOn(middleWas.x, middleWas.y, viewport.zoom.k));
		paintNow();
	};
	const resizeObserver = new ResizeObserver(sizeToPane);
	signal.addEventListener('abort', () => resizeObserver.disconnect());

	const frames: FramePainter = {
		paintNow,
		requestPaint,
		sizeToPane,
		resizeObserver,
		moving: false,
		keepingBehind: false,
		keepUntil: 0,
		sprites: null,
		buildOverview,
	};
	return frames;
};
