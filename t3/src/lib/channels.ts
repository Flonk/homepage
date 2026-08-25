/**
 * What the three colour models look like as a set of bars.
 *
 * The bars themselves are the same everywhere — an axis with a ramp painted
 * along it and a lifted edge round it — but what the ramp *shows* is the
 * model's business, and in two of the three it depends on where the other two
 * channels currently are. A lightness ramp is only true for the hue it was
 * drawn at, so the ramps are a function of the colour rather than a constant.
 *
 * Lives here rather than in the component because it is needed twice: once at
 * build time so the bars arrive with the right thing on them, and again on
 * every move.
 */
import { lighten, lightenRgb, oklchCss } from './oklch';
import { rgbCss, type Rgb } from './rgb';

export type Model = 'rgb' | 'hsl' | 'oklch';
/** A colour in whatever units its model counts in. */
export type Triple = [number, number, number];

export type Channel = {
	/** The full name, for a reader who is listening. */
	name: string;
	/** The one letter under the bar. */
	letter: string;
	min: number;
	max: number;
	step: number;
};

/** A fifth of the way to white, which is what an FLB is. */
const LIFT = 0.2;

/* HSL to sRGB, the formula CSS's own is written from. */
const hslRgb = (h: number, s: number, l: number): Rgb => {
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
		return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
	};
	return [f(0), f(8), f(4)];
};

/* The channels' own tints, for the one model whose bars do not depend on the
   colour: a red bar is red whatever green and blue are doing, and showing it
   the mixture instead would make three bars that all go grey together. */
const RGB_TINT = ['#f16d6d', '#7bd88f', '#6d9bf1'];

export const CHANNELS: Record<Model, Channel[]> = {
	rgb: [
		{ name: 'Red', letter: 'R', min: 0, max: 255, step: 1 },
		{ name: 'Green', letter: 'G', min: 0, max: 255, step: 1 },
		{ name: 'Blue', letter: 'B', min: 0, max: 255, step: 1 },
	],
	hsl: [
		{ name: 'Hue', letter: 'H', min: 0, max: 360, step: 1 },
		{ name: 'Saturation', letter: 'S', min: 0, max: 100, step: 1 },
		{ name: 'Lightness', letter: 'L', min: 0, max: 100, step: 1 },
	],
	oklch: [
		{ name: 'Lightness', letter: 'L', min: 0, max: 1, step: 0.001 },
		{ name: 'Chroma', letter: 'C', min: 0, max: 0.4, step: 0.001 },
		{ name: 'Hue', letter: 'H', min: 0, max: 360, step: 1 },
	],
};

/** A gradient from stops a walk along the channel produces. */
const gradient = (stops: number, at: (t: number) => string) =>
	`linear-gradient(to top, ${Array.from({ length: stops + 1 }, (_, i) => at(i / stops)).join(', ')})`;

/** The same walk, lifted, which is the edge that goes round it. */
const pair = (stops: number, at: (t: number, lift: number) => string) => ({
	backdrop: gradient(stops, (t) => at(t, 0)),
	edge: gradient(stops, (t) => at(t, LIFT)),
});

const oklchStop = (l: number, c: number, h: number, lift: number) =>
	oklchCss(l + lift * (1 - l), c, h);

const hslStop = (h: number, s: number, l: number, lift: number) =>
	rgbCss(lift ? lightenRgb(hslRgb(h, s, l), lift) : hslRgb(h, s, l));

/**
 * What each bar should be painted, for a colour. Two of the three models
 * answer differently every time the colour moves; `rgb` answers the same thing
 * always, and is only a function for the sake of one signature.
 */
export function ramps(model: Model, [a, b, c]: Triple): { backdrop: string; edge: string }[] {
	if (model === 'rgb') {
		return RGB_TINT.map((tint) => ({
			backdrop: `linear-gradient(to top, #000000, ${tint})`,
			edge: `linear-gradient(to top, ${lighten('#000000', LIFT)}, ${lighten(tint, LIFT)})`,
		}));
	}

	if (model === 'hsl') {
		const [h, s, l] = [a, b, c];
		return [
			// The wheel, which is the one bar in this model that stands still.
			pair(24, (t, lift) => hslStop(t * 360, 100, 50, lift)),
			pair(12, (t, lift) => hslStop(h, t * 100, l, lift)),
			pair(12, (t, lift) => hslStop(h, s, t * 100, lift)),
		];
	}

	const [L, C, H] = [a, b, c];
	return [
		pair(12, (t, lift) => oklchStop(t, C, H, lift)),
		pair(12, (t, lift) => oklchStop(L, t * 0.4, H, lift)),
		pair(24, (t, lift) => oklchStop(L, C, t * 360, lift)),
	];
}
