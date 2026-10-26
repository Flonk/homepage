import { pixelRatio } from '../../../../../lib/canvas';
import { HEIGHT, FOOT, WALL, RADIUS, FINE, FINEST, ROOM, area, SPOUT_Y, SLANT, FRAME, WIDEST } from './shape';
import { glassDrawing } from './glass';
import { liquidDrawing } from './liquid';
import { settling } from './settling';
import type { Part, Pour } from './state';

let made = 0;

export function initPour(root: HTMLElement, signal: AbortSignal) {
	const glass = root.querySelector<HTMLCanvasElement>('canvas.pour-glass')!;
	const caption = root.querySelector<HTMLElement>('.milk-pour-label')!;
	const pouringCaption = root.querySelector<HTMLElement>('.milk-pour-pouring')!;
	const gctx = glass.getContext('2d')!;
	const layersCanvas = root.querySelector<HTMLCanvasElement>('canvas.pour-layers')!;
	const layersCtx = layersCanvas.getContext('2d')!;
	const parts: Part[] = JSON.parse(root.dataset.parts!);
	const authored: string[] = JSON.parse(root.dataset.contents!);
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const host = root.closest<HTMLElement>('[data-viz-phase]') ?? root.closest<HTMLElement>('[data-viz-stage]');
	const gate = root.closest<HTMLElement>('[data-viz-phase]');

	const colours = () => parts.map((p) => getComputedStyle(root).getPropertyValue(`--${p.id}`).trim() || '#ccc');
	// A CSS colour as numbers from 0 to 1, red, green, blue and alpha, as a canvas paints it.
	const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
	const rgba = (css: string) => {
		probe.clearRect(0, 0, 1, 1);
		probe.fillStyle = '#0000';
		probe.fillStyle = css;
		probe.fillRect(0, 0, 1, 1);
		return [...probe.getImageData(0, 0, 1, 1).data].map((v) => v / 255);
	};

	const keys = [...root.querySelectorAll<HTMLElement>('.milk-pour-key li')];
	const showKey = () => keys.forEach((li) => li.classList.toggle('is-in', state.wanted.has(li.dataset.part!)));

	// Each part's canvas and filter, named for this glass alone as another on the page would have the same.
	const total = parts.reduce((s, p) => s + p.share, 0);
	const liquids = parts.map((p, i) => {
		/* The finer drops only for a thin layer: one a tenth of the glass or
		   more, as the fat in cream is, of the water's, or it would be
		   thousands of drops. */
		const radius = i === 0 || p.share / total >= 0.1 ? RADIUS : p.id === 'minerals' ? FINEST : FINE;
		const canvas = root.querySelector<HTMLCanvasElement>(`canvas[data-liquid="${p.id}"]`)!;
		const filter = root.querySelector<SVGFilterElement>(`filter[data-liquid="${p.id}"]`)!;
		filter.id = `milk-pour-goo-${++made}`;
		canvas.style.filter = `url(#${filter.id})`;
		return {
			radius,
			canvas,
			ctx: canvas.getContext('2d')!,
			blur: filter.querySelector('feGaussianBlur')!,
			// Its share of the particles of its size, at least a few.
			quota: Math.max(8, Math.round((area * p.share) / total / (ROOM * radius ** 2))),
		};
	});

	const state: Pour = {
		root,
		parts,
		liquids,
		wanted: new Set(authored),
		colour: colours(),
		rgba,
		layers: [],
		pouring: null,
		turned: false,
		w: 0,
		h: 0,
		dpr: 1,
		scale: 1,
		ox: 0,
		oy: 0,
		sx: (x: number) => state.ox + x * state.scale,
		sy: (y: number) => state.oy - y * state.scale,
	};
	const { sx, sy } = state;
	showKey();

	/* The glass before this one in its picture, if it is poured after it;
	   and whether this one has settled, every part in and turned to a
	   layer, for the one after it to see (see settling). */
	const glasses = host ? [...host.querySelectorAll<HTMLElement>('[data-milk-pour]')] : [];
	const before = root.dataset.after !== undefined ? glasses[glasses.indexOf(root) - 1] : undefined;
	const { traceGlass, drawGlass } = glassDrawing(state, gctx);
	const { drawLayers, draw } = liquidDrawing(state, layersCtx, pouringCaption, traceGlass);
	const { tick, empty } = settling(state, before, drawLayers);

	// Where on its canvases the glass is drawn, worked out afresh and kept for the rest to draw by.
	const resize = () => {
		let { w, h, dpr, scale, ox, oy } = state;
		dpr = pixelRatio();
		const r = glass.getBoundingClientRect();
		w = r.width;
		h = r.height;
		for (const c of [glass, layersCanvas, ...liquids.map((l) => l.canvas)]) {
			c.width = Math.max(1, Math.round(w * dpr));
			c.height = Math.max(1, Math.round(h * dpr));
		}
		// Room under the foot for what the glass holds, and over the spout for what is poured.
		const room = caption.offsetHeight + 12;
		scale = Math.min((h * 0.94 - 2 * room) / FRAME, (w * 0.7) / (2 * (WIDEST + WALL)));
		ox = w * 0.58;
		oy = h * 0.96 - room - FOOT * scale;
		// On a wide screen, with room all round it, smaller and in the middle.
		if (matchMedia('(min-width: 1100px)').matches) {
			scale = Math.min(scale, (h * 0.3) / (HEIGHT + FOOT));
			ox = w / 2;
			oy = h / 2 + ((HEIGHT - FOOT) / 2) * scale;
		}
		Object.assign(state, { w, h, dpr, scale, ox, oy });
		caption.style.left = `${ox}px`;
		caption.style.top = `${sy(-FOOT) + 10}px`;
		pouringCaption.style.left = `${sx(SLANT.x)}px`;
		pouringCaption.style.top = `${sy(SPOUT_Y) - 8}px`;
		// Blurred together over about a particle's width, on the screen.
		for (const l of liquids) l.blur.setAttribute('stdDeviation', String(Math.max(0.8, l.radius * scale * 1.1)));
		drawGlass();
		drawLayers();
	};
	const sizing = new ResizeObserver(resize);
	sizing.observe(glass);
	signal.addEventListener('abort', () => sizing.disconnect(), { once: true });
	resize();

	/* ---- running ------------------------------------------------------- */
	// With motion reduced, the glass is filled and settled out of sight, and only that drawn.
	const settle = () => {
		for (let i = 0; i < 3600 && (state.pouring || parts.some((p, k) => state.wanted.has(p.id) && !state.layers.some((l) => l.part === k))); i++)
			tick(1 / 60);
		for (const l of state.layers) l.shown = 1;
		draw();
	};
	const set = (contents: string[]) => {
		state.wanted = new Set(contents);
		showKey();
		empty();
		if (reduceMotion) settle();
	};
	host?.addEventListener('viz:props', (e) => {
		const p = (e as CustomEvent).detail ?? {};
		caption.textContent = typeof p.label === 'string' ? p.label : caption.dataset.label!;
		// The same milk as before is left in the glass, not poured again.
		const contents: string[] = Array.isArray(p.contents) ? p.contents : authored;
		if (contents.length !== state.wanted.size || contents.some((id) => !state.wanted.has(id))) set(contents);
	});
	// The colours follow the ground, which can change under it.
	host?.addEventListener('viz:enter', () => {
		state.colour = colours();
		drawGlass();
		drawLayers();
		last = 0;
	});

	/* In steps of a sixtieth of a second however fast the screen draws, so
	   the liquid behaves the same on every screen; and its time running
	   faster than ours by PACE, so the pouring does not drag: more steps a
	   frame, each the same, so the liquid moves as it did, only sooner. */
	const STEP = 1 / 60;
	const PACE = 2.5;
	let last = 0;
	let behind = 0;
	const frame = (now: number) => {
		if (signal.aborted) return;
		requestAnimationFrame(frame);
		if (reduceMotion) return;
		if (gate && gate.dataset.vizActive === 'false') return;
		if (!state.w || !state.h) return;
		behind += last ? Math.min(0.1, (now - last) / 1000) * PACE : STEP;
		last = now;
		for (; behind >= STEP; behind -= STEP) tick(STEP);
		draw();
	};
	if (reduceMotion) settle();
	requestAnimationFrame(frame);
}
