import type { Appearance, Colours, Drawing } from './types';

// Milk's texture tiles.
const TEXTURE_TILES: Record<string, string> = { dots: '/assets/chrome-dots.png', noise: '/assets/chrome-noise.png' };

/* The graph's colours as the page has them, worked out to what a canvas
   can take: a colour asked of a hidden element of its own. Photographs
   and flags fetched once each is first in sight, and the picture painted
   again as each comes in. */
export const makeAppearance = (G: Drawing): Appearance => {
	const probe = document.createElement('span');
	probe.hidden = true;
	G.figure.append(probe);
	const colourOf = (css: string) => {
		probe.style.color = css;
		return getComputedStyle(probe).color;
	};
	const colours: Colours = {
		pill: colourOf('var(--pill)'),
		rim: colourOf('var(--pill-rim)'),
		line: colourOf('var(--line)'),
		lit: colourOf('var(--lit)'),
		litLine: colourOf('color-mix(in oklab, var(--lit) 90%, var(--deck-ground))'),
		text: colourOf('var(--deck-ink)'),
		dim: colourOf('var(--deck-ink-dim)'),
		ground: colourOf('var(--deck-ground)'),
		accent: colourOf('var(--ink-accent)'),
		names: colourOf('color-mix(in oklab, var(--deck-ink) 6%, var(--pill))'),
		milk: colourOf('color-mix(in oklab, var(--pill), white 70%)'),
		// A guess's amber, about half way to the ground.
		unsure: colourOf('color-mix(in oklab, #d98a10 55%, var(--deck-ground))'),
		// The map's land, a shade off the ground.
		land: colourOf('color-mix(in oklab, var(--deck-ink) 7%, var(--deck-ground))'),
		// A panel's ground, a shade off the graph's, and its lines of time fainter than the arrows.
		panel: colourOf('color-mix(in oklab, var(--deck-ink) 4%, var(--deck-ground))'),
		grid: colourOf('color-mix(in oklab, var(--line) 35%, var(--deck-ground))'),
		// A table's edge, its header's and its panel's, darker than a pill's rim, so the table reads as one.
		tableEdge: colourOf('color-mix(in oklab, var(--line) 75%, var(--deck-ink))'),
	};

	const images = new Map<string, HTMLImageElement>();
	const imageOf = (src: string) => {
		let im = images.get(src);
		if (!im) {
			im = new Image();
			im.decoding = 'async';
			im.addEventListener('load', () => G.frames.requestPaint(), { once: true });
			im.src = src;
			images.set(src, im);
		}
		return im.complete && im.naturalWidth ? im : null;
	};
	const patterns = new Map<string, CanvasPattern>();

	return {
		colours,
		imageOf,
		/* The chrome's texture over milk, as the page round it has: its dots
		   blended over it, and its noise over that as many times as the post asks. */
		milkTextures: ['dots', ...Array.from({ length: Number(document.documentElement.dataset.grain ?? 1) }, () => 'noise')],
		texturePattern: (texture) => {
			if (patterns.has(texture)) return patterns.get(texture)!;
			const im = imageOf(TEXTURE_TILES[texture]);
			const p = im && G.viewport.ctx.createPattern(im, 'repeat');
			if (p) patterns.set(texture, p);
			return p;
		},
	};
};
