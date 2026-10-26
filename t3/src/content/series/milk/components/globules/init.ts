import { pixelRatio } from '../../../../../lib/canvas';
import { FIELD, GLOBULES, MICELLES, SOFTEST, BIG, defocus, random, diameter, type Globule, type Micelle } from './field';

export function initFat(root: HTMLElement, signal: AbortSignal) {
	const canvas = root.querySelector('canvas')!;
	const ctx = canvas.getContext('2d')!;
	const lens = root.querySelector<HTMLElement>('.lens')!;
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* The far ones first, so the near ones lie over them. */
	const globules: Globule[] = Array.from({ length: GLOBULES }, () => ({
		x: random(0, FIELD),
		y: random(0, FIELD),
		r: diameter() / 2,
		depth: Math.random(),
	}))
		/* And one of the largest, fourteen micrometres across, always there
		   just off the field to the upper right, only an edge of it in view,
		   to show how large they get. It holds still: too big to be jostled. */
		.concat({ ...BIG })
		.sort((a, b) => b.depth - a.depth);
	const micelles: Micelle[] = Array.from({ length: MICELLES }, () => ({
		x: random(0, FIELD),
		y: random(0, FIELD),
		r: random(0.05, 0.15),
		depth: Math.random(),
	}));

	let w = 0;
	let dpr = 1;
	let px = 1;
	const pad = () => Math.ceil(SOFTEST * px * 2.5 + 4);
	/* A drop of oil as the light comes through it: brightest a little up
	   and left of its middle, deepening to its colour, edged dark where it
	   bends the light away, a glint of the lamp on it and the membrane a
	   fine darker line. Out of focus, soft and faint. Drawn once and
	   stamped, as blurring it afresh every frame is far too slow. */
	const paint = (g: Globule) => {
		const r = g.r * px;
		const size = Math.ceil((r + pad()) * 2);
		const m = size / 2;
		const a = defocus(g.depth);
		const blur = a * a * SOFTEST * px;
		// Soft ones need no more pixels than the screen's own.
		const res = a > 0.3 ? 1 : dpr;
		const sprite = g.sprite ?? document.createElement('canvas');
		sprite.width = sprite.height = Math.ceil(size * res);
		const c = sprite.getContext('2d')!;
		c.setTransform(res, 0, 0, res, 0, 0);
		c.filter = blur > 0.3 ? `blur(${blur}px)` : 'none';
		c.globalAlpha = 1 - a * 0.7;
		const body = c.createRadialGradient(m - r * 0.3, m - r * 0.3, r * 0.05, m, m, r);
		body.addColorStop(0, 'oklch(0.99 0.03 95)');
		body.addColorStop(0.55, 'oklch(0.9 0.1 90)');
		body.addColorStop(0.85, 'oklch(0.8 0.11 82)');
		body.addColorStop(1, 'oklch(0.55 0.09 72)');
		c.fillStyle = body;
		c.beginPath();
		c.arc(m, m, r, 0, Math.PI * 2);
		c.fill();
		c.strokeStyle = 'oklch(0.45 0.07 70 / 0.8)';
		c.lineWidth = Math.max(0.8, 0.1 * px);
		c.stroke();
		// The glint, in focus only.
		if (a < 0.35) {
			c.fillStyle = `rgb(255 255 255 / ${0.7 * (1 - a / 0.35)})`;
			c.beginPath();
			c.ellipse(m - r * 0.38, m - r * 0.4, r * 0.18, r * 0.11, -Math.PI / 4, 0, Math.PI * 2);
			c.fill();
		}
		g.sprite = sprite;
	};
	const resize = () => {
		dpr = pixelRatio();
		w = lens.getBoundingClientRect().width;
		canvas.width = Math.max(1, Math.round(w * dpr));
		canvas.height = canvas.width;
		px = w / FIELD;
		lens.style.setProperty('--five', `${5 * px}px`);
		for (const g of globules) paint(g);
		draw();
	};

	/* Jostled by the water, the small more than the large, as Brownian
	   motion goes, and round again at the edges. */
	const wrap = (v: number, r: number) => {
		const span = FIELD + 2 * r;
		return ((((v + r) % span) + span) % span) - r;
	};
	const jostle = (b: { x: number; y: number; r: number }, dt: number) => {
		const s = (0.9 / Math.sqrt(b.r + 0.1)) * Math.sqrt(dt);
		b.x = wrap(b.x + random(-s, s), b.r);
		b.y = wrap(b.y + random(-s, s), b.r);
	};

	/* The micelles in a few layers of depth, each drawn at once: in focus
	   fine dark points, out of it larger and fainter, till they are gone
	   into the water. */
	const LAYERS = 6;
	const draw = () => {
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, w);
		for (let layer = 0; layer < LAYERS; layer++) {
			const a = defocus((layer + 0.5) / LAYERS);
			if (a >= 0.95) continue;
			const spread = 1 + a * a * SOFTEST * 1.5;
			ctx.fillStyle = `oklch(0.5 0.05 55 / ${0.7 * (1 - a) ** 2})`;
			ctx.beginPath();
			for (const m of micelles) {
				if (Math.floor(m.depth * LAYERS) !== layer) continue;
				const r = Math.max(0.6, m.r * px) * spread;
				ctx.moveTo(m.x * px + r, m.y * px);
				ctx.arc(m.x * px, m.y * px, r, 0, Math.PI * 2);
			}
			ctx.fill();
		}
		for (const g of globules) {
			if (!g.sprite) continue;
			const size = (g.r * px + pad()) * 2;
			ctx.drawImage(g.sprite, g.x * px - size / 2, g.y * px - size / 2, size, size);
		}
	};
	const sizing = new ResizeObserver(resize);
	sizing.observe(lens);
	signal.addEventListener('abort', () => sizing.disconnect(), { once: true });
	resize();

	let last = 0;
	const frame = (now: number) => {
		if (signal.aborted) return;
		requestAnimationFrame(frame);
		if (reduceMotion || root.dataset.vizActive !== 'true') {
			last = 0;
			return;
		}
		const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
		last = now;
		if (!w) return;
		for (const g of globules) if (g.r < BIG.r) jostle(g, dt * 0.4);
		for (const m of micelles) jostle(m, dt);
		draw();
	};
	requestAnimationFrame(frame);
}
