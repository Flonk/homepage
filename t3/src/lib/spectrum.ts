/**
 * Light, as far as a drawing needs to know about it.
 *
 * Shared because more than one visualization in the Colour series draws the
 * same rainbow, and a colour approximation that two components each keep their
 * own copy of is a colour approximation that will eventually disagree with
 * itself.
 */

/** The speed of light, in nanometres a second. */
export const C_NM_PER_S = 2.99792458e17;

/* Where the response is spent altogether. Past the ends of the band the
   approximation below has no branch to offer and every channel falls through
   to nothing, so the hue is held at the edge and the brightness carries on
   down instead — which is what the eye does, over rather more nanometres than
   these. Reaching zero is the point: it lets a sweep run out past the band and
   take the light out with it. */
export const RED_OUT = 820;
export const VIOLET_OUT = 362;

/**
 * An approximate sRGB rendering of a single wavelength. It cannot be an exact
 * one: a pure spectral colour is outside what three fixed primaries can mix, so
 * every one of these is a nearest-available stand-in, and the saturated ends
 * are the furthest off. Which is, more or less, what this series is about.
 */
export function wavelengthRgb(raw: number): [number, number, number] {
	// The hue is only defined across the band; beyond it, it is the last one.
	const nm = Math.min(780, Math.max(380, raw));
	let r = 0;
	let g = 0;
	let b = 0;
	if (nm >= 380 && nm < 440) {
		r = -(nm - 440) / 60;
		b = 1;
	} else if (nm < 490) {
		g = (nm - 440) / 50;
		b = 1;
	} else if (nm < 510) {
		g = 1;
		b = -(nm - 510) / 20;
	} else if (nm < 580) {
		r = (nm - 510) / 70;
		g = 1;
	} else if (nm < 645) {
		r = 1;
		g = -(nm - 645) / 65;
	} else if (nm <= 780) {
		r = 1;
	}
	// The eye's response tails off at both ends of the visible range, and then
	// keeps going: a third of the way at the edge of the band, and out
	// altogether a few tens of nanometres past it.
	let fade = 1;
	if (nm < 420) fade = 0.3 + (0.7 * (nm - 380)) / 40;
	else if (nm > 700) fade = 0.3 + (0.7 * (780 - nm)) / 80;
	if (raw > 780) fade *= Math.max(0, (RED_OUT - raw) / (RED_OUT - 780));
	else if (raw < 380) fade *= Math.max(0, (raw - VIOLET_OUT) / (380 - VIOLET_OUT));
	const enc = (v: number) => Math.round(255 * Math.pow(Math.max(0, v) * fade, 0.8));
	return [enc(r), enc(g), enc(b)];
}

/** The same, ready to hand to a canvas or a gradient stop. */
export function wavelengthCss(nm: number): string {
	const [r, g, b] = wavelengthRgb(nm);
	return `rgb(${r} ${g} ${b})`;
}
