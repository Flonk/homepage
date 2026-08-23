/**
 * Light, as far as a drawing needs to know about it.
 *
 * Shared because more than one visualization in the Colour series draws the
 * same rainbow, and a colour approximation that two components each keep their
 * own copy of is one that will eventually disagree with itself.
 *
 * The rainbow is colorimetry rather than a hue ramp: the CIE 1931 matching
 * functions, through the sRGB matrix. It has to be, because the same pipeline
 * produces the dichromat rainbow below, and the two are only worth comparing
 * if the one difference between them is the missing cone.
 */

import { coneResponse } from './cones';
import { rgbCss } from './rgb';

/** The speed of light, in nanometres a second. */
export const C_NM_PER_S = 2.99792458e17;

/* Where the response is spent altogether. Past the ends of the band the eye
   keeps giving out rather than stopping, and reaching zero is the point: it
   lets a sweep run out past the band and take the light with it. */
export const RED_OUT = 820;
export const VIOLET_OUT = 362;

/* ---- the matching functions ---------------------------------------------
   CIE 1931 2-degree, every 5nm, from the tables the Colour & Vision Research
   Laboratory at UCL publishes:

     http://cvrl.ioo.ucl.ac.uk/database/data/cmfs/ciexyz31.csv

   Every wavelength in here is outside what three fixed primaries can mix —
   that is what a spectral colour is — so the drawing below has to give up some
   of the saturation. Which is, more or less, what this series is about. */
const CIE_FIRST_NM = 380;
const CIE_LAST_NM = 780;
const CIE_STEP_NM = 5;
const CIE_XYZ: [number, number, number][] = [
	[0.001368, 0.000039, 0.00645], // 380
	[0.002236, 0.000064, 0.01055], // 385
	[0.004243, 0.00012, 0.02005], // 390
	[0.00765, 0.000217, 0.03621], // 395
	[0.01431, 0.000396, 0.06785], // 400
	[0.02319, 0.00064, 0.1102], // 405
	[0.04351, 0.00121, 0.2074], // 410
	[0.07763, 0.00218, 0.3713], // 415
	[0.13438, 0.004, 0.6456], // 420
	[0.21477, 0.0073, 1.0391], // 425
	[0.2839, 0.0116, 1.3856], // 430
	[0.3285, 0.01684, 1.623], // 435
	[0.34828, 0.023, 1.7471], // 440
	[0.34806, 0.0298, 1.7826], // 445
	[0.3362, 0.038, 1.7721], // 450
	[0.3187, 0.048, 1.7441], // 455
	[0.2908, 0.06, 1.6692], // 460
	[0.2511, 0.0739, 1.5281], // 465
	[0.19536, 0.09098, 1.2876], // 470
	[0.1421, 0.1126, 1.0419], // 475
	[0.09564, 0.13902, 0.81295], // 480
	[0.05795, 0.1693, 0.6162], // 485
	[0.03201, 0.20802, 0.46518], // 490
	[0.0147, 0.2586, 0.3533], // 495
	[0.0049, 0.323, 0.272], // 500
	[0.0024, 0.4073, 0.2123], // 505
	[0.0093, 0.503, 0.1582], // 510
	[0.0291, 0.6082, 0.1117], // 515
	[0.06327, 0.71, 0.07825], // 520
	[0.1096, 0.7932, 0.05725], // 525
	[0.1655, 0.862, 0.04216], // 530
	[0.22575, 0.91485, 0.02984], // 535
	[0.2904, 0.954, 0.0203], // 540
	[0.3597, 0.9803, 0.0134], // 545
	[0.43345, 0.99495, 0.00875], // 550
	[0.51205, 1, 0.00575], // 555
	[0.5945, 0.995, 0.0039], // 560
	[0.6784, 0.9786, 0.00275], // 565
	[0.7621, 0.952, 0.0021], // 570
	[0.8425, 0.9154, 0.0018], // 575
	[0.9163, 0.87, 0.00165], // 580
	[0.9786, 0.8163, 0.0014], // 585
	[1.0263, 0.757, 0.0011], // 590
	[1.0567, 0.6949, 0.001], // 595
	[1.0622, 0.631, 0.0008], // 600
	[1.0456, 0.5668, 0.0006], // 605
	[1.0026, 0.503, 0.00034], // 610
	[0.9384, 0.4412, 0.00024], // 615
	[0.85445, 0.381, 0.00019], // 620
	[0.7514, 0.321, 0.0001], // 625
	[0.6424, 0.265, 0.00005], // 630
	[0.5419, 0.217, 0.00003], // 635
	[0.4479, 0.175, 0.00002], // 640
	[0.3608, 0.1382, 0.00001], // 645
	[0.2835, 0.107, 0], // 650
	[0.2187, 0.0816, 0], // 655
	[0.1649, 0.061, 0], // 660
	[0.1212, 0.04458, 0], // 665
	[0.0874, 0.032, 0], // 670
	[0.0636, 0.0232, 0], // 675
	[0.04677, 0.017, 0], // 680
	[0.0329, 0.01192, 0], // 685
	[0.0227, 0.00821, 0], // 690
	[0.01584, 0.005723, 0], // 695
	[0.011359, 0.004102, 0], // 700
	[0.0081109, 0.002929, 0], // 705
	[0.0057903, 0.002091, 0], // 710
	[0.0041095, 0.001484, 0], // 715
	[0.0028993, 0.001047, 0], // 720
	[0.0020492, 0.00074, 0], // 725
	[0.00144, 0.00052, 0], // 730
	[0.00099995, 0.0003611, 0], // 735
	[0.00069008, 0.0002492, 0], // 740
	[0.00047602, 0.0001719, 0], // 745
	[0.0003323, 0.00012, 0], // 750
	[0.00023483, 0.0000848, 0], // 755
	[0.00016615, 0.00006, 0], // 760
	[0.00011741, 0.0000424, 0], // 765
	[0.000083075, 0.00003, 0], // 770
	[0.000058707, 0.0000212, 0], // 775
	[0.00004151, 0.00001499, 0], // 780
];

/** X, Y and Z for a wavelength, straight off the table between samples. */
function spectralXyz(nm: number): [number, number, number] {
	const at = Math.min(CIE_LAST_NM, Math.max(CIE_FIRST_NM, nm));
	const x = (at - CIE_FIRST_NM) / CIE_STEP_NM;
	const i = Math.min(CIE_XYZ.length - 2, Math.floor(x));
	const t = x - i;
	const a = CIE_XYZ[i];
	const b = CIE_XYZ[i + 1];
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

type M3 = number[][];
const apply = (m: M3, v: number[]): [number, number, number] => [
	m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
	m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
	m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
];

/** CIE XYZ to linear sRGB, D65. */
const XYZ_TO_RGB: M3 = [
	[3.2404542, -1.5371385, -0.4985314],
	[-0.969266, 1.8760108, 0.041556],
	[0.0556434, -0.2040259, 1.0572252],
];

/* Hunt-Pointer-Estevez: the cone space the dichromacy model is stated in. Not
   the same thing as the measured fundamentals in lib/cones.ts — those are what
   the eye does with light; this is a working coordinate system. */
const XYZ_TO_LMS: M3 = [
	[0.38971, 0.68898, -0.07868],
	[-0.22981, 1.1834, 0.04641],
	[0, 0, 1],
];

const invert = (m: M3): M3 => {
	const [a, b, c] = m[0];
	const [d, e, f] = m[1];
	const [g, h, i] = m[2];
	const A = e * i - f * h;
	const B = -(d * i - f * g);
	const C = d * h - e * g;
	const det = a * A + b * B + c * C;
	return [
		[A, -(b * i - c * h), b * f - c * e],
		[B, a * i - c * g, -(a * f - c * d)],
		[C, -(a * h - b * g), a * e - b * d],
	].map((r) => r.map((v) => v / det));
};
const LMS_TO_XYZ = invert(XYZ_TO_LMS);

/* ---- what is left when a cone is missing --------------------------------
   Vienot, Brettel & Mollon (1999). Someone with two kinds of cone instead of
   three can see, in cone space, only the colours lying on a single plane
   through the neutral axis. Everything off it is pulled onto it, and which
   colours land on top of each other is exactly what they cannot tell apart.
   The plane is fixed by that axis and by an invariant hue — a wavelength they
   and a trichromat agree on — which is 475nm for both of these.

   Worked out from the drawn colours rather than from coefficients copied out
   of the paper, which are stated in a different scaling of cone space. Doing
   it this way makes the invariant hue exactly invariant, which those
   coefficients are not: they drift 475nm by about 90 units of 255.

   The simulation runs on the colour as drawn, not on the light it stands for,
   and that is the whole difference between a rainbow that darkens towards its
   ends and one that stays a flat gold across them. What is being asked is
   "how does the strip above look to this reader", and the strip above is what
   the answer has to come out of, brightness and all. Take the light instead
   and the brightness relationship is thrown away by the normalising, leaving
   pure red as bright as pure yellow, which it is not.

   Tritanopia is deliberately missing: it needs two half-planes that are
   nowhere near coplanar, so the one-plane shortcut that is fine for these two
   would not be. */
export type Vision = 'normal' | 'deuteranopia' | 'protanopia';

/** Linear sRGB to CIE XYZ, D65 — the way back. */
const RGB_TO_XYZ: M3 = [
	[0.4124564, 0.3575761, 0.1804375],
	[0.2126729, 0.7151522, 0.072175],
	[0.0193339, 0.119192, 0.9503041],
];

/**
 * The colour a wavelength is drawn as, in linear light, before any of this.
 *
 * No spectral colour is inside sRGB, so something has to give. Negative
 * channels are clipped rather than washed out towards white — washing them out
 * turns the far red end pink, which is a worse lie than losing saturation — and
 * then the brightest channel is taken to full, so what survives is the hue, at
 * the most of it a screen can manage.
 */
function drawnLinear(nm: number): [number, number, number] {
	const lin = apply(XYZ_TO_RGB, spectralXyz(nm));
	const r = Math.max(0, lin[0]);
	const g = Math.max(0, lin[1]);
	const b = Math.max(0, lin[2]);
	const top = Math.max(r, g, b, 1e-9);
	return [r / top, g / top, b / top];
}

const rgbToLms = (lin: number[]) => apply(XYZ_TO_LMS, apply(RGB_TO_XYZ, lin));
const lmsToRgb = (lms: number[]) => apply(XYZ_TO_RGB, apply(LMS_TO_XYZ, lms));

/** The plane, as: the missing cone would have read from * kept + s * S. */
const planeThrough = (anchorNm: number, missing: 0 | 1) => {
	const a = rgbToLms(drawnLinear(anchorNm));
	// The axis the reader's eye is adapted to is the white of the screen they
	// are reading it on, not the average of the spectrum.
	const w = rgbToLms([1, 1, 1]);
	const n = [
		w[1] * a[2] - w[2] * a[1],
		w[2] * a[0] - w[0] * a[2],
		w[0] * a[1] - w[1] * a[0],
	];
	const keep = missing === 0 ? 1 : 0;
	return { missing, keep, from: -n[keep] / n[missing], s: -n[2] / n[missing] };
};

const PLANES = {
	deuteranopia: planeThrough(475, 1),
	protanopia: planeThrough(475, 0),
};

function throughDichromat(lin: number[], vision: Exclude<Vision, 'normal'>) {
	const lms = rgbToLms(lin);
	const p = PLANES[vision];
	const out: [number, number, number] = [lms[0], lms[1], lms[2]];
	out[p.missing] = p.from * lms[p.keep] + p.s * lms[2];
	// Clamped, not rescaled: rescaling is what would put the brightness back.
	return lmsToRgb(out);
}

/* The sRGB transfer curve, so the ramp from dark to bright is the one the
   screen expects. */
const encode = (v: number) => {
	const c = Math.max(0, Math.min(1, v));
	return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};

/** And back to light, for anything that has to do arithmetic on a drawn colour. */
const decode = (v: number) => {
	const c = Math.max(0, Math.min(1, v));
	return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/**
 * An sRGB rendering of a single wavelength, optionally as it looks to an eye
 * short of one kind of cone.
 */
export function wavelengthRgb(raw: number, vision: Vision = 'normal'): [number, number, number] {
	const drawn = drawnLinear(raw);
	const lin = vision === 'normal' ? drawn : throughDichromat(drawn, vision);

	/* The eye's response tails off at both ends of the visible range, and then
	   keeps going: a third of the way at the edge of the band, out altogether a
	   few tens of nanometres past it. Taken off the drawn brightness rather than
	   out of the light, because it is a statement about how much of this the
	   reader is meant to be able to see. */
	let fade = 1;
	const nm = Math.min(780, Math.max(380, raw));
	if (nm < 420) fade = 0.3 + (0.7 * (nm - 380)) / 40;
	else if (nm > 700) fade = 0.3 + (0.7 * (780 - nm)) / 80;
	if (raw > 780) fade *= Math.max(0, (RED_OUT - raw) / (RED_OUT - 780));
	else if (raw < 380) fade *= Math.max(0, (raw - VIOLET_OUT) / (380 - VIOLET_OUT));

	return [
		Math.round(255 * encode(lin[0]) * fade),
		Math.round(255 * encode(lin[1]) * fade),
		Math.round(255 * encode(lin[2]) * fade),
	];
}

/**
 * The whole projection as one matrix on linear sRGB, row-major, which is what
 * an SVG feColorMatrix wants — filters interpolate in linear light, which is
 * the space this is derived in, so the filter and the code above agree rather
 * than merely resemble each other.
 *
 * Handed out rather than written down anywhere else: whatever is drawn through
 * the filter and whatever is drawn through wavelengthRgb come from one model,
 * and cannot drift apart.
 */
export function dichromatMatrix(vision: Exclude<Vision, 'normal'>): number[] {
	const p = PLANES[vision];
	// The projection itself: identity, but for the row of the cone that is not
	// there, which is read off the other two instead.
	const P: M3 = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	];
	P[p.missing] = [0, 0, 0];
	P[p.missing][p.keep] = p.from;
	P[p.missing][2] = p.s;
	const mm = (a: M3, b: M3): M3 =>
		a.map((row) => [0, 1, 2].map((j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j]));
	return mm(mm(XYZ_TO_RGB, LMS_TO_XYZ), mm(P, mm(XYZ_TO_LMS, RGB_TO_XYZ))).flat();
}

/** The same, ready to hand to a canvas or a gradient stop. */
export function wavelengthCss(nm: number, vision: Vision = 'normal'): string {
	return rgbCss(wavelengthRgb(nm, vision));
}

/**
 * The same colour with some fraction of the light taken away — a filter in
 * front of it, say.
 *
 * Undone and redone through the transfer curve rather than multiplied where it
 * stands. Halving an encoded channel is not halving the light: 128 of 255 is
 * about a fifth of the photons of 255, so scaling the stored numbers dims far
 * faster than the filter does and would have the swatch black while the filter
 * was still passing a good part of the band.
 */
export function dimRgb(rgb: [number, number, number], keep: number): [number, number, number] {
	const k = Math.max(0, keep);
	return rgb.map((v) => Math.round(255 * encode(decode(v / 255) * k))) as [
		number,
		number,
		number,
	];
}

/* ---- adding lights together ----------------------------------------------
   Adding light is adding XYZ, which is most of the reason XYZ is worth having:
   two lights arriving at the same place stimulate the cones by the sum of what
   each would alone, and XYZ is a linear picture of that.

   A weight here is a share of the light's own full brightness — the brightness
   its swatch is drawn at — rather than a share of its power. Power is not
   something anyone can judge by eye, and mixing by it goes wrong in a way that
   matters here: at equal power a deep blue swamps everything, because 450nm
   carries some twenty times the Z per unit of luminance that 630nm carries of
   X. Even-handed by power comes out violet. Even-handed by brightness comes
   out the magenta anyone would expect. */
export type Light = { nm: number; weight: number };

/** How much of a light there has to be for it to be drawn at full brightness. */
function unitPower(nm: number): number {
	const lin = apply(XYZ_TO_RGB, spectralXyz(nm));
	const top = Math.max(Math.max(0, lin[0]), Math.max(0, lin[1]), Math.max(0, lin[2]), 1e-9);
	return 1 / top;
}

/**
 * What a handful of lights arriving together look like.
 *
 * The lights are added, and only then converted and clipped. Adding up what
 * each one is *drawn* as instead — which is what this did at first — is not
 * the same sum: every one of them has already had its out-of-gamut part cut
 * off by then, and cutting off then adding is not adding then cutting off. It
 * is close enough to pass by eye, which is how it survived, and wrong enough
 * to break anything that leans on the arithmetic: two mixtures with identical
 * XYZ came out as visibly different colours.
 */
export function mixRgb(lights: Light[]): [number, number, number] {
	let x = 0;
	let y = 0;
	let z = 0;
	for (const light of lights) {
		const c = spectralXyz(light.nm);
		const k = light.weight * unitPower(light.nm);
		x += c[0] * k;
		y += c[1] * k;
		z += c[2] * k;
	}
	const lin = apply(XYZ_TO_RGB, [x, y, z]);
	const r = Math.max(0, lin[0]);
	const g = Math.max(0, lin[1]);
	const b = Math.max(0, lin[2]);
	// Scaled back only if it has gone over full, so a dim mixture stays dim and
	// taking a light away makes the result darker rather than merely different.
	const top = Math.max(r, g, b, 1);
	return [
		Math.round(255 * encode(r / top)),
		Math.round(255 * encode(g / top)),
		Math.round(255 * encode(b / top)),
	];
}

/**
 * The three cone readings a mixture comes to, and the XYZ it comes to, as
 * columns — one per light, at weight 1. What a caller wants this for is the
 * set of mixtures that all look alike: three numbers cannot pin down four
 * lights, so with four of them the answer is a line rather than a point, and
 * the direction of that line is the null space of these rows.
 */
export function lightColumns(nm: number): { xyz: [number, number, number]; lms: [number, number, number] } {
	const k = unitPower(nm);
	const c = spectralXyz(nm);
	const cone = coneResponse(nm);
	return {
		xyz: [c[0] * k, c[1] * k, c[2] * k],
		lms: [cone[0] * k, cone[1] * k, cone[2] * k],
	};
}

/**
 * The direction a set of rows does not notice: the one combination of the
 * columns that comes to nothing. Gauss–Jordan, then read the free column off.
 * Null if there is no free column, which is to say the rows pin everything down
 * and there is nothing to walk along.
 */
function nullDirection(rows: number[][]): number[] | null {
	const m = rows.map((r) => [...r]);
	const n = m[0].length;
	const pivots: number[] = [];
	let row = 0;
	for (let c = 0; c < n && row < m.length; c++) {
		let best = 1e-12;
		let p = -1;
		for (let r = row; r < m.length; r++) {
			if (Math.abs(m[r][c]) > best) {
				best = Math.abs(m[r][c]);
				p = r;
			}
		}
		if (p < 0) continue;
		[m[row], m[p]] = [m[p], m[row]];
		const d = m[row][c];
		for (let k = 0; k < n; k++) m[row][k] /= d;
		for (let r = 0; r < m.length; r++) {
			if (r === row) continue;
			const f = m[r][c];
			for (let k = 0; k < n; k++) m[r][k] -= f * m[row][k];
		}
		pivots.push(c);
		row++;
	}
	const free = [...Array(n).keys()].find((c) => !pivots.includes(c));
	if (free === undefined) return null;
	const dir = new Array(n).fill(0);
	dir[free] = 1;
	pivots.forEach((c, i) => {
		dir[c] = -m[i][free];
	});
	return dir;
}

/**
 * The mixtures of these lights that all look exactly alike, as a line through
 * the weights given.
 *
 * Three numbers cannot pin down four lights, so one weight is free and the
 * answer is not a mixture but a whole family of them: base + t·dir, for t
 * anywhere between the two bounds returned, which is as far as it can go before
 * some light would have to shine a negative amount. That family is metamerism,
 * and what it costs is the point of it: whatever arrived, the eye keeps three
 * numbers and throws the rest away.
 *
 * Which three numbers is the whole difficulty. The cone fundamentals and the
 * colour on screen come from two different measurements of the standard
 * observer — Stockman & Sharpe for the cones, the CIE 1931 matching functions
 * for the drawn colour — and they do not quite agree. Hold the cone readings
 * still and the drawn colour drifts by 34 of 255, which is plainly visible and
 * reads as a bug. So the direction is taken from XYZ, which makes the drawn
 * colour exactly constant, and it is left to the caller to choose wavelengths
 * at which the cone readings come along: at 460, 530, 580 and 660nm they move
 * by 0.001, which is nothing at two decimal places. Both hold still because the
 * lights were picked so they could.
 */
export function metamerLine(
	nms: number[],
	base: number[],
): { dir: number[]; lo: number; hi: number } {
	const columns = nms.map(lightColumns);
	const dir = nullDirection([0, 1, 2].map((i) => columns.map((c) => c.xyz[i])));
	if (!dir) return { dir: nms.map(() => 0), lo: 0, hi: 0 };

	let lo = -Infinity;
	let hi = Infinity;
	dir.forEach((d, i) => {
		if (Math.abs(d) < 1e-9) return;
		const bound = -(base[i] ?? 0) / d;
		if (d > 0) lo = Math.max(lo, bound);
		else hi = Math.min(hi, bound);
	});
	if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return { dir, lo: 0, hi: 0 };
	return { dir, lo, hi };
}

/**
 * The single wavelength that comes closest to a mixture, and how far off it
 * still is — which is the number that says whether a colour is in the spectrum
 * at all.
 *
 * Measured in the chromaticity the light actually has rather than in what it
 * gets drawn as, so it is a statement about the light and not about the
 * screen. For scale, everything the eye can see is about 0.8 across.
 */
export function nearestWavelength(lights: Light[]): { nm: number; distance: number } {
	let x = 0;
	let y = 0;
	let z = 0;
	for (const light of lights) {
		const c = spectralXyz(light.nm);
		const k = light.weight * unitPower(light.nm);
		x += c[0] * k;
		y += c[1] * k;
		z += c[2] * k;
	}
	const sum = x + y + z || 1e-9;
	const px = x / sum;
	const py = y / sum;
	let best = { nm: 380, distance: Infinity };
	for (let nm = CIE_FIRST_NM; nm <= 700; nm += 1) {
		const c = spectralXyz(nm);
		const s = c[0] + c[1] + c[2] || 1e-9;
		const d = Math.hypot(c[0] / s - px, c[1] / s - py);
		if (d < best.distance) best = { nm, distance: d };
	}
	return best;
}

/**
 * What a mixture comes to at the three kinds of cone.
 *
 * Each light is scaled exactly as mixRgb scales it, so the numbers here and
 * the colour there are two readings of the same mixture rather than two
 * mixtures. Each cone's own response is a fraction of its own peak — the same
 * scale part three's graph is drawn on — so the three can be compared with the
 * curves there.
 *
 * This is the reading that says what a colour *is*, as far as anything past
 * the eye is concerned: three numbers, and no record at all of what arrived to
 * produce them.
 */
export function mixCones(lights: Light[]): [number, number, number] {
	let l = 0;
	let m = 0;
	let s = 0;
	for (const light of lights) {
		const k = light.weight * unitPower(light.nm);
		const c = coneResponse(light.nm);
		l += c[0] * k;
		m += c[1] * k;
		s += c[2] * k;
	}
	return [l, m, s];
}

/* ---- the chromaticity chart ------------------------------------------------
   Colour with the brightness divided out. Any XYZ scaled by any amount lands
   on the same (x, y), so what is left is the two numbers that say which colour
   it is and nothing about how much of it there is. That is what makes the
   chart worth drawing: every mixture of two lights lies on the straight line
   between them, so the set of colours three primaries can reach is exactly the
   triangle they span, and the whole argument about gamut becomes a picture. */

/** Brightness divided out of an XYZ. */
export function xyOf([X, Y, Z]: [number, number, number]): [number, number] {
	const sum = X + Y + Z || 1e-12;
	return [X / sum, Y / sum];
}

/** Where a single wavelength sits on the chart — a point of the horseshoe. */
export function spectralXy(nm: number): [number, number] {
	return xyOf(spectralXyz(nm));
}

/** The two ends of the spectral locus, between which the purples close it. */
export const LOCUS_FIRST_NM = 380;
export const LOCUS_LAST_NM = 700;

/**
 * The best sRGB rendering of a chromaticity, and whether it is an honest one.
 *
 * Taken at full brightness — the largest the channels can be without one going
 * over — since the chart has no brightness of its own to report. `inGamut` is
 * the thing worth knowing: false means at least one channel came out negative,
 * which is the screen being asked for more of a primary than none, and no
 * amount of arranging pixels will do it. Those are clipped and drawn anyway,
 * because a hole in the horseshoe would be worse, but what is drawn there is
 * the nearest colour the screen has rather than the colour asked for.
 */
export function chromaticityRgb(
	x: number,
	y: number,
): { rgb: [number, number, number]; inGamut: boolean } {
	if (y <= 1e-6) return { rgb: [0, 0, 0], inGamut: false };
	const lin = apply(XYZ_TO_RGB, [x / y, 1, (1 - x - y) / y]);
	const inGamut = lin[0] >= -1e-6 && lin[1] >= -1e-6 && lin[2] >= -1e-6;
	const r = Math.max(0, lin[0]);
	const g = Math.max(0, lin[1]);
	const b = Math.max(0, lin[2]);
	const top = Math.max(r, g, b, 1e-9);
	return {
		rgb: [
			Math.round(255 * encode(r / top)),
			Math.round(255 * encode(g / top)),
			Math.round(255 * encode(b / top)),
		],
		inGamut,
	};
}

/**
 * Three sets of primaries, as published, with the white they are defined
 * against. All three are D65, so the difference between them is only how far
 * out the corners reach.
 *
 * sRGB is Rec.709's primaries, which is to say a 1990 studio monitor's, and is
 * what a page is assumed to be in. Display P3 is the DCI cinema primaries on
 * that same white, which is what recent Apple and many phone screens do.
 * Rec.2020 is the ultra-high-definition set, whose red and green are single
 * wavelengths — no display reaches it in full.
 */
export type GamutName = 'srgb' | 'p3' | 'rec2020';

export const GAMUTS: Record<
	GamutName,
	{ label: string; primaries: [number, number][]; white: [number, number] }
> = {
	srgb: {
		label: 'sRGB',
		primaries: [
			[0.64, 0.33],
			[0.3, 0.6],
			[0.15, 0.06],
		],
		white: [0.3127, 0.329],
	},
	p3: {
		label: 'Display P3',
		primaries: [
			[0.68, 0.32],
			[0.265, 0.69],
			[0.15, 0.06],
		],
		white: [0.3127, 0.329],
	},
	rec2020: {
		label: 'Rec. 2020',
		primaries: [
			[0.708, 0.292],
			[0.17, 0.797],
			[0.131, 0.046],
		],
		white: [0.3127, 0.329],
	},
};

/** Whether a chromaticity is inside the triangle these primaries span. */
export function insideGamut(x: number, y: number, name: GamutName): boolean {
	const p = GAMUTS[name].primaries;
	let sign = 0;
	for (let i = 0; i < 3; i++) {
		const [ax, ay] = p[i];
		const [bx, by] = p[(i + 1) % 3];
		const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
		if (Math.abs(cross) < 1e-12) continue;
		const s = cross > 0 ? 1 : -1;
		if (sign === 0) sign = s;
		else if (s !== sign) return false;
	}
	return true;
}

/* ---- and what a printing press can do --------------------------------------
   Not a triangle. Ink is subtractive — each layer takes light away rather than
   adding it — so there are no three primaries spanning anything, and the
   boundary is whatever the inks and the paper happen to reach. Six corners
   rather than three: the three inks, and the three places two of them lie on
   top of each other.

   Measured, not modelled. This is the outline of the FOGRA39 characterization
   set, 1485 patches printed and read on coated art paper under ISO 12647-2:

     https://registry.color.org/cmyk-registry/chardata/FOGRA39.txt

   The measurements are D50 and this chart is D65, so they are adapted across
   with Bradford before the brightness is divided out; without that the whole
   shape sits visibly warm against the triangles it is there to be compared
   with. Paper white lands at (0.308, 0.324) afterwards, a shade bluer than D65
   itself, which is the optical brightener in the paper and is what it should
   be. The convex hull of the patches is what is drawn: the patches fill it to
   within 0.005 on average and 0.023 at the worst, up by the green corner where
   the sampling thins out, so the outline is the measurements' own shape rather
   than a smoothing of them.

   It is worth knowing how nearly the same size this is as sRGB — 98% of the
   area — while overlapping it so poorly. About a sixth of each lies outside
   the other. Print reaches cyans and greens no screen has, and misses reds and
   oranges every screen has, which is the whole difficulty of getting a
   photograph to come off a press looking like it did on the monitor. */
export const CMYK_GAMUT: [number, number][] = [
	[0.1544, 0.2145],
	[0.1579, 0.2039],
	[0.1606, 0.1976],
	[0.1637, 0.1912],
	[0.1701, 0.1795],
	[0.1789, 0.1655],
	[0.1893, 0.1504],
	[0.2003, 0.1368],
	[0.4665, 0.2372],
	[0.4803, 0.2458],
	[0.5711, 0.3033],
	[0.6034, 0.324],
	[0.4399, 0.4959],
	[0.4297, 0.4994],
	[0.4192, 0.5029],
	[0.4055, 0.5069],
	[0.3889, 0.511],
	[0.3578, 0.5178],
	[0.3177, 0.5242],
	[0.2714, 0.5282],
	[0.2223, 0.5276],
	[0.2092, 0.4759],
	[0.1946, 0.4142],
	[0.1816, 0.3548],
	[0.1711, 0.3053],
	[0.1655, 0.2769],
	[0.1611, 0.2528],
	[0.1575, 0.2324],
];

/** The corners worth naming, for a card that wants to point at them. */
export const CMYK_SOLIDS: { label: string; xy: [number, number] }[] = [
	{ label: 'C', xy: [0.1544, 0.2145] },
	{ label: 'B', xy: [0.2003, 0.1368] },
	{ label: 'M', xy: [0.4665, 0.2372] },
	{ label: 'R', xy: [0.6034, 0.324] },
	{ label: 'Y', xy: [0.4399, 0.4959] },
	{ label: 'G', xy: [0.2223, 0.5276] },
];
