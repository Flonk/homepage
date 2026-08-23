/**
 * OKLCH: lightness, chroma, hue — the space to reach for when the job is
 * "the same colour, lighter".
 *
 * The three numbers are polar OKLab (Björn Ottosson, 2020), which is a fit to
 * how much difference the eye reports rather than to anything a screen or a
 * camera does. That is the whole reason the Colour series uses it: a ramp of
 * evenly spaced L looks evenly spaced, and moving L alone leaves the hue where
 * it was. Neither is true of HSL, where "lightness" is a number about the RGB
 * cube, and stepping it drags the hue along — blues going purple, yellows
 * going green — because the cube's corners are nowhere near equally bright.
 *
 * Written out here rather than left to CSS's own `oklch()` for one reason:
 * most of the colours you can name in OKLCH do not exist on a screen, and what
 * a browser does with the ones that do not is its own business. Fitting the
 * chroma ourselves means a swatch is exactly the lightness it claims to be —
 * which for a post about lightness is the whole point — and that what gives
 * way at the ends of a ramp is the saturation, visibly and on purpose.
 */

import { parseHex, rgbCss, type Rgb } from './rgb';

type M3 = [number[], number[], number[]];

const mul = (m: M3, v: number[]) =>
	m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

/* Linear sRGB to the cone-ish space OKLab is built on, and back. Ottosson's
   coefficients, which are LMS through a matrix fitted so that the cube roots
   below come out perceptually uniform. */
const RGB_TO_LMS: M3 = [
	[0.4122214708, 0.5363325363, 0.0514459929],
	[0.2119034982, 0.6806995451, 0.1073969566],
	[0.0883024619, 0.2817188376, 0.6299787005],
];

const LMS_TO_RGB: M3 = [
	[4.0767416621, -3.3077115913, 0.2309699292],
	[-1.2684380046, 2.6097574011, -0.3413193965],
	[-0.0041960863, -0.7034186147, 1.7076147022],
];

/* The cube roots to Lab, and back. */
const LMS_TO_LAB: M3 = [
	[0.2104542553, 0.793617785, -0.0040720468],
	[1.9779984951, -2.428592205, 0.4505937099],
	[0.0259040371, 0.7827717662, -0.808675766],
];

const LAB_TO_LMS: M3 = [
	[1, 0.3963377774, 0.2158037573],
	[1, -0.1055613458, -0.0638541728],
	[1, -0.0894841775, -1.291485548],
];

/* The sRGB transfer curve. Same pair as lib/spectrum.ts keeps; duplicated
   rather than shared because the two modules are about different things and
   this is four lines of standard. */
const encode = (v: number) =>
	v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;

/** And back to light, for a colour arriving as something a screen was told. */
const decode = (v: number) =>
	v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

/** OKLab to linear sRGB, unclamped — negatives mean "not a colour a screen has". */
function labToLinear(L: number, a: number, b: number): number[] {
	const lms = mul(LAB_TO_LMS, [L, a, b]);
	return mul(
		LMS_TO_RGB,
		lms.map((v) => v * v * v),
	);
}

/** Linear sRGB to OKLab, for anything that needs to ask how light a colour is. */
export function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
	const lms = mul(RGB_TO_LMS, [r, g, b]);
	return mul(
		LMS_TO_LAB,
		lms.map((v) => Math.cbrt(v)),
	) as [number, number, number];
}

/* A hair of slack at both ends. Rounding on the way through the matrices puts
   a colour that sits exactly on the boundary — pure cyan, say — a few
   ten-thousandths outside it, and without this the fit below would back away
   from the very colours it should be finding. */
const EPS = 1e-4;

const inSrgb = (lin: number[]) => lin.every((v) => v >= -EPS && v <= 1 + EPS);

/**
 * The most chroma this lightness and hue can hold on a screen, up to the
 * amount asked for.
 *
 * Bisection rather than a formula: the sRGB gamut in OKLCH is a lumpy solid
 * with corners at the six primaries, and its boundary at a given L and hue has
 * no closed form worth writing. Twenty-odd halvings put the answer inside a
 * millionth of a chroma unit, which is far below anything a screen can show.
 *
 * L and hue are never touched. What comes back is the same colour, as
 * saturated as it can be — not a nearby colour that happens to fit.
 */
export function fitChroma(l: number, c: number, h: number): number {
	const rad = (h * Math.PI) / 180;
	const at = (chroma: number) =>
		labToLinear(l, chroma * Math.cos(rad), chroma * Math.sin(rad));
	if (inSrgb(at(c))) return c;
	let lo = 0;
	let hi = c;
	for (let i = 0; i < 24; i++) {
		const mid = (lo + hi) / 2;
		if (inSrgb(at(mid))) lo = mid;
		else hi = mid;
	}
	return lo;
}

/**
 * An OKLCH colour as `rgb(…)`, with the chroma brought inside sRGB first.
 *
 * Handed back as sRGB rather than as an `oklch()` string so that what is drawn
 * is what was computed — the same numbers a canvas, a gradient stop and a
 * background all agree on, whatever the browser's own idea of an out-of-gamut
 * colour happens to be.
 */
export function oklchCss(l: number, c: number, h: number): string {
	return rgbCss(oklchRgb(l, c, h));
}

/**
 * The same colour as three channels, for a caller with arithmetic to do on it
 * rather than a string to hand to CSS — seeding a set of RGB sliders from a
 * swatch, say. `oklchCss` is this, written down.
 */
export function oklchRgb(l: number, c: number, h: number): Rgb {
	const rad = (h * Math.PI) / 180;
	const fitted = fitChroma(l, c, h);
	const lin = labToLinear(l, fitted * Math.cos(rad), fitted * Math.sin(rad));
	return lin.map((v) => Math.round(255 * encode(Math.min(1, Math.max(0, v))))) as Rgb;
}

/**
 * A ramp of one colour at several lightnesses: shades, in the sense a design
 * system means it.
 *
 * Lightnesses are spaced evenly from `from` to `to`, because in this space
 * evenly spaced is what evenly spaced looks like. Chroma is asked for once and
 * fitted per step, so the ends give way on saturation rather than on lightness
 * — a very light or very dark cyan is a thing screens simply have less of.
 */
export function shades(
	steps: number,
	{ from, to, chroma, hue }: { from: number; to: number; chroma: number; hue: number },
): { l: number; c: number; css: string; rgb: Rgb }[] {
	return Array.from({ length: steps }, (_, i) => {
		const l = steps === 1 ? from : from + ((to - from) * i) / (steps - 1);
		const rgb = oklchRgb(l, chroma, hue);
		return { l, c: fitChroma(l, chroma, hue), css: rgbCss(rgb), rgb };
	});
}

/**
 * The same colour, lifted a fraction of the way to white.
 *
 * In this space that is a straight addition and nothing else moves: the hue
 * stays put and the chroma is only given up where the screen has none left to
 * give at the new lightness. Doing it in sRGB instead — scaling the three
 * channels — brightens and desaturates at once, and does it by different
 * amounts for each hue, which is exactly what makes a set of channel-coloured
 * edges come out looking like three unrelated colours.
 *
 * `by` is a fraction of the lightness a colour has left rather than a flat
 * addition, which is the difference between an edge that is still the colour
 * it edges and one that is white. A flat +0.2 takes the green channel — at
 * 0.80 already — straight past the top of the scale, and what comes back has
 * no chroma left to be green with; 0.2 of what remains puts it at 0.84 and
 * keeps it green. Black, having all its lightness ahead of it, moves the full
 * amount either way, which is what gives a bar's dark end an edge at all.
 *
 * Hex in, `rgb(…)` out; anything the parser does not recognise comes back
 * unchanged, because a caller passing a gradient wants no surprise.
 */
export function lighten(css: string, by: number): string {
	const rgb = parseHex(css);
	return rgb ? rgbCss(lightenRgb(rgb, by)) : css;
}

/** The same on three numbers, for a caller building a gradient a stop at a time. */
export function lightenRgb(rgb: Rgb, by: number): Rgb {
	const lin = rgb.map((v) => decode(v / 255)) as Rgb;
	const [l, a, b] = rgbToOklab(lin[0], lin[1], lin[2]);
	const c = Math.hypot(a, b);
	const h = (Math.atan2(b, a) * 180) / Math.PI;
	const lifted = Math.min(1, Math.max(0, l + by * (1 - l)));
	const [r, g, bb] = oklchCss(lifted, c, h).match(/\d+/g)!.map(Number);
	return [r, g, bb];
}
