/**
 * One way of writing a colour down.
 *
 * Half a dozen places in the series had grown their own — some with commas,
 * some without, some rounding on the way and some handing a canvas a value
 * with eleven decimal places in it. Where those numbers are only being fed
 * back to the browser it makes no difference; where they are printed on a
 * swatch for a reader to read, it does, because the same colour then looks
 * like two different things in two cards of the same post.
 *
 * The space-separated form is the modern CSS one, and the one this codebase
 * had already settled on almost everywhere. Rounding and clamping happen here
 * rather than at the call sites: every one of them was doing it, and the ones
 * that were not had a bug rather than a reason.
 */

/** A colour as three channels, 0 to 255. */
export type Rgb = [number, number, number];

const byte = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

/**
 * `rgb(255 138 30)` — for a stylesheet, a canvas, or a reader.
 *
 * Takes the three channels either loose or as a triple, so a call site can
 * pass whatever it is already holding.
 */
export function rgbCss(rgb: Rgb): string;
export function rgbCss(r: number, g: number, b: number): string;
export function rgbCss(r: Rgb | number, g?: number, b?: number): string {
	const [x, y, z] = Array.isArray(r) ? r : [r, g!, b!];
	return `rgb(${byte(x)} ${byte(y)} ${byte(z)})`;
}

/** The same with an alpha, for the times a colour has to be seen through. */
export function rgbaCss(rgb: Rgb, alpha: number): string {
	const [r, g, b] = rgb;
	const a = Math.max(0, Math.min(1, alpha));
	return `rgb(${byte(r)} ${byte(g)} ${byte(b)} / ${a})`;
}

/**
 * A hex colour as three channels. Null for anything else — a caller with a
 * named colour or a gradient has to ask the browser instead, which only a
 * script can do.
 */
export function parseHex(css: string): Rgb | null {
	const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(css.trim())?.[1];
	if (!hex) return null;
	const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
	return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
}
