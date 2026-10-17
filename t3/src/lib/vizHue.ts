/**
 * The n-th colour of a visualization's palette: one hue for each thing a viz
 * has to tell apart, like the parsers on a tape or the fields of a record.
 *
 * The palette sits outside the page's own hues on purpose. It is centred on
 * --ink-viz, which is --ink-accent turned half the wheel round, so whatever is
 * drawn in it reads as the subject matter (code, data, the thing being shown)
 * and never as the site's chrome. On a yellow post that makes it purples, and
 * on a green one magentas.
 *
 * The colours stay within ±HALF degrees of --ink-viz, which keeps them a
 * quarter of the wheel clear of the accent's own hue at the nearest. Inside
 * that band they are dealt out so the first few are as far apart as the band
 * allows, since a viz rarely has more than three or four things to tell apart:
 * the centre, then the two ends, then the middles of the two gaps that leaves,
 * and so on, each new colour halving the widest gap there is, alternating
 * sides. So:
 *
 *   0: centre   1: −HALF   2: +HALF   3: −HALF/2   4: +HALF/2   5: −HALF/4 …
 *
 * The first colour is --ink-viz exactly, so a name from the code on a card,
 * written in --ink-viz, is the same colour as that name in the viz.
 *
 * Lightness and chroma are --ink-viz's for every step, which is what makes
 * them read as text on the dark ground. Returns a CSS colour that resolves
 * where it is used, so the same markup retints with the post.
 */
const HALF = 90;

/* Where the i-th colour sits in the band, from −1 to 1. After the centre,
   pairs share a distance, one each side: 1, then ½, then ¼ and ¾, then ⅛, ⅜,
   ⅝ and ⅞, which is each level of halving in turn. */
function place(i: number): number {
	if (i === 0) return 0;
	const j = Math.floor((i - 1) / 2);
	const side = (i - 1) % 2 === 0 ? -1 : 1;
	if (j === 0) return side;
	const level = Math.floor(Math.log2(j)) + 1;
	const k = j - 2 ** (level - 1);
	return side * ((2 * k + 1) / 2 ** level);
}

export function vizHue(i: number): string {
	const offset = place(i) * HALF;
	return `oklch(from var(--ink-viz) l c calc(h + ${offset.toFixed(1)}))`;
}
