/**
 * The made-up colours the design system post needs to show its patterns with.
 *
 * Everything here is worked out at build time from the site's own `lighten`,
 * so a specimen is edged the same way the thing it is a specimen of is.
 */
import { converter, formatHex } from 'culori';
import { lighten } from '../../lib/oklch';

/** A fifth of the way to white, which is what an FLB is. */
export const LIFT = 0.2;

const toRgb = converter('rgb');
const hueHex = (deg: number) => formatHex(toRgb({ mode: 'hsl', h: deg, s: 1, l: 0.5 })!);
const HUES = Array.from({ length: 25 }, (_, i) => i * 15);

/** A hue wheel laid out flat, and the same wheel lifted for the ring round it. */
export const HUE_RAMP = `linear-gradient(to right, ${HUES.map(hueHex).join(', ')})`;
export const HUE_EDGE = `linear-gradient(to right, ${HUES.map((d) => lighten(hueHex(d), LIFT)).join(', ')})`;

/**
 * A bar with no backdrop shows its rest colour, which is white at 16%. Over the
 * page it composites to this, and the bar is handed it flat: a see-through bed
 * lets the ring show through the whole of itself rather than only around the
 * edge, because the layer over it hides nothing.
 */
const PAGE = '#1d1f21';
export const REST_ON_PAGE = formatHex({
	mode: 'rgb',
	...(([r, g, b]) => ({ r, g, b }))(
		[1, 3, 5].map((i) => 0.16 + 0.84 * (parseInt(PAGE.slice(i, i + 2), 16) / 255)) as [
			number,
			number,
			number,
		],
	),
});
export const BED_EDGE = lighten(REST_ON_PAGE, LIFT);
