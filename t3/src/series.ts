import { maxChroma } from './lib/gamut';

/**
 * The running order of a series: oldest first, so it reads from part one
 * downwards, with the slug breaking ties.
 *
 * Sorted outright rather than by reversing a newest-first page order — parts
 * published the same day tie on date, and a reversal would then hand back
 * whatever order the collection happened to be in, which is backwards. Slugs
 * carry the part number, so they settle it.
 */
export function sortSeries<T extends { id: string; data: { pubDate: Date } }>(
	posts: T[],
): T[] {
	return [...posts].sort(
		(a, b) =>
			a.data.pubDate.valueOf() - b.data.pubDate.valueOf() || a.id.localeCompare(b.id),
	);
}

/**
 * Blurbs for post series, keyed by the `series` value in a post's frontmatter.
 * A series without an entry here still groups, it just renders without a tagline.
 */
export const SERIES_BLURBS: Record<string, string> = {
	'Type Systems':
		'In this series we work our way up from programming languages without types, to the most sophisticated type systems out there!',
	'Free objects':
		'Take an algebraic structure, add nothing beyond what its laws demand, and see which ' +
		'data structure falls out the other end — multisets, lists, finger trees.',
	Colour:
		'Everything I know about colour.'
};

/**
 * The picture on a series' card in the post tree, keyed like the blurbs. A
 * series without one gets a card without a picture.
 *
 * Either an image, or a line of TeX set by KaTeX in the card's ink, at
 * `size` if it is too wide for the default. For an
 * image, `position` is where the crop sits when it is not the card's shape,
 * and `ink` is for a drawing in black on white: it is turned over to light
 * lines on the card's own ground, so a diagram does not land on the page as a
 * white slab, and shown whole rather than cropped. `backdrop` is any CSS
 * background, drawn live behind an image with a transparent ground.
 */
export type SeriesCover =
	| { src: string; position?: string; ink?: boolean; backdrop?: string }
	| { tex: string; size?: string };

/**
 * Red round to violet at one OKLCH lightness, each hue at the most chroma sRGB
 * has for it there. A single chroma for every hue either greys the hues that
 * have more out or asks the rest for colours the screen does not have, and
 * the browser clips those to whatever is nearest, which lands as flat bands.
 * A stop every 5° is past seeing the joins.
 */
const RAINBOW = `linear-gradient(to right, ${Array.from({ length: 57 }, (_, i) => {
	const h = 25 + i * 5;
	return `oklch(0.7 ${(maxChroma('srgb', 0.7, h) * 0.98).toFixed(4)} ${h})`;
}).join(', ')})`;

export const SERIES_COVERS: Record<string, SeriesCover> = {
	// System F's type abstraction, which is where the series is headed.
	'Type Systems': { tex: '\\Lambda T.' },
	// A coalgebra: a carrier and a way to take one step out of it.
	'Classes are Coalgebras': { tex: 'a \\to F a', size: '1.8rem' },
	'Free objects': { src: '/assets/2025-07-04-free-objects-3/kid_named_finger.jpg', position: '50% 30%' },
	// Part #8's sRGB solid with its bright top in view, the rest run off the
	// edges, rendered once onto a clear ground and kept as a picture rather than
	// run live in the tree. The rainbow behind it is drawn live.
	Colour: { src: '/assets/series/colour.png', backdrop: RAINBOW },
};

/** Series still being written, marked as such on their card in the post tree. */
export const SERIES_WIP = new Set(['Colour', 'Classes are Coalgebras']);
