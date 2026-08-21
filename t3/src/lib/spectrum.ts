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

   Worked out here rather than written down, so it follows from the table above
   rather than from coefficients copied out of a paper that used some other
   scaling of cone space.

   Tritanopia is deliberately missing: it needs two half-planes that are
   nowhere near coplanar, so the one-plane shortcut that is fine for these two
   would not be. */
export type Vision = 'normal' | 'deuteranopia' | 'protanopia';

const NEUTRAL_LMS = (() => {
	// Equal energy across the band: these are spectra, so that is the white
	// they are spread around.
	let x = 0;
	let y = 0;
	let z = 0;
	for (const c of CIE_XYZ) {
		x += c[0];
		y += c[1];
		z += c[2];
	}
	return apply(XYZ_TO_LMS, [x, y, z]);
})();

/** The plane, as: the missing cone would have read from * kept + s * S. */
const planeThrough = (anchorNm: number, missing: 0 | 1) => {
	const a = apply(XYZ_TO_LMS, spectralXyz(anchorNm));
	const w = NEUTRAL_LMS;
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

function throughDichromat(xyz: number[], vision: Exclude<Vision, 'normal'>) {
	const lms = apply(XYZ_TO_LMS, xyz);
	const p = PLANES[vision];
	const out: [number, number, number] = [lms[0], lms[1], lms[2]];
	out[p.missing] = p.from * lms[p.keep] + p.s * lms[2];
	return apply(LMS_TO_XYZ, out);
}

/* The sRGB transfer curve, so the ramp from dark to bright is the one the
   screen expects. */
const encode = (v: number) => {
	const c = Math.max(0, Math.min(1, v));
	return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};

/**
 * An sRGB rendering of a single wavelength, optionally as seen by an eye short
 * of one kind of cone.
 *
 * No spectral colour is inside sRGB, so something has to give. Negative
 * channels are clipped rather than washed out towards white — washing them out
 * turns the far red end pink, which is a worse lie than losing saturation — and
 * then the brightest channel is taken to full, so what survives is the hue, at
 * the most of it a screen can manage.
 */
export function wavelengthRgb(raw: number, vision: Vision = 'normal'): [number, number, number] {
	const xyz = spectralXyz(raw);
	const lin = apply(XYZ_TO_RGB, vision === 'normal' ? xyz : throughDichromat(xyz, vision));
	const top = Math.max(lin[0], lin[1], lin[2], 1e-9);

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
		Math.round(255 * encode(Math.max(0, lin[0]) / top) * fade),
		Math.round(255 * encode(Math.max(0, lin[1]) / top) * fade),
		Math.round(255 * encode(Math.max(0, lin[2]) / top) * fade),
	];
}

/** The same, ready to hand to a canvas or a gradient stop. */
export function wavelengthCss(nm: number, vision: Vision = 'normal'): string {
	const [r, g, b] = wavelengthRgb(nm, vision);
	return `rgb(${r} ${g} ${b})`;
}
