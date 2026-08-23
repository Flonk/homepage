/**
 * The same OKLab, asked about three different sets of primaries.
 *
 * lib/oklch.ts knows one gamut — sRGB — because everything that had asked so
 * far was a colour going onto a page. This is the other question: given a set
 * of primaries, where does the box of colours they can mix land in OKLab? The
 * answer is a different lumpy solid for each, and the three of them nested is
 * the whole argument of a gamut post.
 *
 * OKLab is defined on XYZ, not on sRGB. Ottosson publishes it with the sRGB
 * matrix already folded in, which is why lib/oklch.ts can go straight from
 * channels to Lab in two multiplications — but that folded matrix is sRGB's
 * alone. Unfolding it is the whole of this file: primaries to XYZ, XYZ to the
 * cone-ish LMS space, cube roots, Lab. Same space, same numbers, three doors
 * into it.
 *
 * A note on what can actually be seen. The shapes here are exact for all
 * three, but a screen only shows what it holds: most hold sRGB, some hold P3,
 * and nothing on a desk holds Rec.2020. So a colour is placed by its own
 * space and painted in the display's — see `toDisplay`, which is where the
 * lie has to be told, and tells it by clamping rather than by quietly
 * rescaling the shape.
 */

/** The three sets of primaries this series has anything to say about. */
export type Space = 'srgb' | 'p3' | 'rec2020';

type M3 = [number[], number[], number[]];

const mul = (m: M3, v: number[]): number[] => [
	m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
	m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
	m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
];

const matMul = (a: M3, b: M3): M3 =>
	[0, 1, 2].map((i) => [0, 1, 2].map((j) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j])) as M3;

const invert = (m: M3): M3 => {
	const [[a, b, c], [d, e, f], [g, h, i]] = m;
	const A = e * i - f * h;
	const B = -(d * i - f * g);
	const C = d * h - e * g;
	const det = a * A + b * B + c * C;
	return [
		[A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
		[B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
		[C / det, -(a * h - b * g) / det, (a * e - b * d) / det],
	];
};

/* Linear RGB to CIE XYZ, D65, one per set of primaries. Standard matrices:
   sRGB/Rec.709 from IEC 61966-2-1, Display P3 from SMPTE RP 431-2 with a D65
   white, Rec.2020 from ITU-R BT.2020. The first of them, pushed through
   XYZ_TO_LMS below, reproduces the folded matrix in lib/oklch.ts to within a
   rounding error — which is the check that the unfolding is honest. */
const RGB_TO_XYZ: Record<Space, M3> = {
	srgb: [
		[0.4123907993, 0.3575843394, 0.1804807884],
		[0.2126390059, 0.7151686788, 0.0721923154],
		[0.0193308187, 0.1191947798, 0.9505321522],
	],
	p3: [
		[0.4865709486, 0.2656676932, 0.1982172852],
		[0.2289745641, 0.6917385218, 0.0792869141],
		[0.0, 0.0451133819, 1.0439443689],
	],
	rec2020: [
		[0.6369580483, 0.1446169036, 0.1688809752],
		[0.262700212, 0.6779980715, 0.0593017165],
		[0.0, 0.028072693, 1.0609850577],
	],
};

/* XYZ to the cone-ish space OKLab takes cube roots in, and Lab from there.
   Ottosson's M1 and M2 — the same fit lib/oklch.ts uses, one step earlier. */
const XYZ_TO_LMS: M3 = [
	[0.8189330101, 0.3618667424, -0.1288597137],
	[0.0329845436, 0.9293118715, 0.0361456387],
	[0.0482003018, 0.2643662691, 0.633851707],
];

const LMS_TO_LAB: M3 = [
	[0.2104542553, 0.793617785, -0.0040720468],
	[1.9779984951, -2.428592205, 0.4505937099],
	[0.0259040371, 0.7827717662, -0.808675766],
];

const LAB_TO_LMS = invert(LMS_TO_LAB);
const LMS_TO_XYZ = invert(XYZ_TO_LMS);

/* Folded per space, so a conversion is two multiplications like the sRGB one
   rather than four. Built once at module load. */
const TO_LMS = {} as Record<Space, M3>;
const FROM_LMS = {} as Record<Space, M3>;
const CROSS = {} as Record<string, M3>;
for (const from of Object.keys(RGB_TO_XYZ) as Space[]) {
	TO_LMS[from] = matMul(XYZ_TO_LMS, RGB_TO_XYZ[from]);
	FROM_LMS[from] = matMul(invert(RGB_TO_XYZ[from]), LMS_TO_XYZ);
	for (const to of Object.keys(RGB_TO_XYZ) as Space[]) {
		CROSS[`${from}>${to}`] = matMul(invert(RGB_TO_XYZ[to]), RGB_TO_XYZ[from]);
	}
}

/**
 * The sRGB transfer curve, which Display P3 also uses. Rec.2020 has one of its
 * own, and it is not here on purpose: nothing in this file ever encodes a
 * Rec.2020 signal, because nothing can show one. Its colours are carried as
 * light and converted into whatever the screen is before they are written
 * down.
 */
export const encode = (v: number) =>
	v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;

/** And back to light. */
export const decode = (v: number) =>
	v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

/** Linear channels in `space` to OKLab. */
export function linearToOklab(space: Space, lin: number[]): [number, number, number] {
	return mul(
		LMS_TO_LAB,
		mul(TO_LMS[space], lin).map(Math.cbrt),
	) as [number, number, number];
}

/** OKLab to linear channels in `space`, unclamped — negatives mean "not in it". */
export function oklabToLinear(space: Space, L: number, a: number, b: number): number[] {
	return mul(
		FROM_LMS[space],
		mul(LAB_TO_LMS, [L, a, b]).map((v) => v * v * v),
	);
}

/** The same light, addressed in another set of primaries. Still linear, still unclamped. */
export function convertLinear(from: Space, to: Space, lin: number[]): number[] {
	return from === to ? lin : mul(CROSS[`${from}>${to}`], lin);
}

/* The same slack lib/oklch.ts keeps, and for the same reason: a colour sitting
   exactly on the boundary comes back from the matrices a few ten-thousandths
   outside it. */
const EPS = 1e-4;

/** Whether these linear channels are inside their space's box. */
export const inGamut = (lin: number[]) => lin.every((v) => v >= -EPS && v <= 1 + EPS);

/**
 * The most chroma `space` holds at this lightness and hue, up to `ceiling`.
 *
 * Bisection, as in lib/oklch.ts — the boundary has no closed form worth
 * writing, and twenty halvings land inside a millionth of a chroma unit. Only
 * for the code that asks about a point (a slice, a readout); the solid itself
 * never calls it, because it is meshed from the cube's own surface instead
 * and so gets the boundary exactly.
 */
export function maxChroma(space: Space, L: number, h: number, ceiling = 0.5): number {
	const rad = (h * Math.PI) / 180;
	const at = (c: number) => oklabToLinear(space, L, c * Math.cos(rad), c * Math.sin(rad));
	if (inGamut(at(ceiling))) return ceiling;
	let lo = 0;
	let hi = ceiling;
	for (let i = 0; i < 22; i++) {
		const mid = (lo + hi) / 2;
		if (inGamut(at(mid))) lo = mid;
		else hi = mid;
	}
	return lo;
}

/**
 * A colour from one space, written down for a screen showing another.
 *
 * The clamp is the honest part. A Rec.2020 green on an sRGB screen is not a
 * slightly duller Rec.2020 green, it is simply not available, and every way of
 * pretending otherwise — squashing the whole solid to fit, rotating hues out
 * of the way — misrepresents either the shape or the colour. So the geometry
 * is left exactly where it belongs and the channels are clipped, which puts
 * the error where a reader can be told about it: the far shell of the wide
 * solids is flatter than it should be, and that flatness is the point being
 * made.
 */
export function toDisplay(from: Space, display: Space, lin: number[]): [number, number, number] {
	const conv = convertLinear(from, display, lin);
	return conv.map((v) => encode(Math.min(1, Math.max(0, v)))) as [number, number, number];
}

/**
 * An OKLCH colour written down for a screen: placed by `space`, painted in
 * `display`, and clipped on the way.
 *
 * Handed back as `color(display-p3 …)` when that is where it is going, so a
 * swatch beside a P3 solid is the colour the solid is showing rather than the
 * nearest sRGB one — and as plain `rgb()` otherwise, which every browser has
 * agreed on for thirty years.
 */
export function oklchCss(
	space: Space,
	display: Space,
	L: number,
	C: number,
	h: number,
): string {
	const rad = (h * Math.PI) / 180;
	const [r, g, b] = toDisplay(
		space,
		display,
		oklabToLinear(space, L, C * Math.cos(rad), C * Math.sin(rad)),
	);
	return display === 'srgb'
		? `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`
		: `color(display-p3 ${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)})`;
}

/** What each one is called, and how much of the eye's colours it reaches. */
export const SPACE_LABEL: Record<Space, string> = {
	srgb: 'sRGB',
	p3: 'Display P3',
	rec2020: 'Rec.2020',
};
