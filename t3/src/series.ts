import { maxChroma } from './lib/gamut';

/** A part of a series as a post links to it: where it is and which part. */
export type SeriesLink = { href: string; part: string; title: string; pubDate: number };

/**
 * The picture on a series' card in the post tree, from its series.json (see
 * content.config.ts). A series without one gets a card without a picture.
 *
 * Either an image, or a line of TeX set by KaTeX in the card's ink, at
 * `size` if it is too wide for the default. For an
 * image, `position` is where the crop sits when it is not the card's shape,
 * and `ink` is for a drawing in black on white: it is turned over to light
 * lines on the card's own ground, so a diagram does not land on the page as a
 * white slab, and shown whole rather than cropped. `backdrop` is any CSS
 * background, drawn live behind an image with a transparent ground, or the
 * name of one of BACKDROPS below.
 */
export type SeriesCover =
	| { src: string; position?: string; ink?: boolean; backdrop?: string; credit?: string }
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

/**
 * Backdrops worked out here rather than written into a series.json, which can
 * only hold them as words. The Colour series' cover is part #8's sRGB solid
 * on a clear ground, with this rainbow drawn live behind it.
 */
export const BACKDROPS: Record<string, string> = { rainbow: RAINBOW };
