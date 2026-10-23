import { measure, SANS } from '../client/base';

/*
 * What every schema's drawing on the canvas shares: the pen it draws with,
 * the inks it reads from the page's colours, a font as the canvas wants it,
 * a rounded box, whether words are big enough to read at a zoom, and words
 * broken onto lines no wider than so many of their letters.
 */
export type Pen = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type Ink = Record<string, string>;
// What a drawing is given: the ink, the zoom it is drawn at, the screen's pixels to a unit there, and whether it is the one looked at.
export type Paint = { ink: Ink; s: number; px: number; on: boolean };

export const font = (px: number, face = '400', family = SANS()) => `${face} ${px}px ${family}`;
export const roundRect = (g: Pen, x: number, y: number, w: number, h: number, r: number | number[]) => {
	g.beginPath();
	g.roundRect(x, y, w, h, r);
};
export const legible = (px: number, s: number) => px * s >= 2.5;
/* A pill's body, a product's or a step of processing's: on the pills'
   white, lifted off the ground by a soft shadow as deep as it is tall,
   none where too small to see one; at `px` of the screen's pixels to a
   unit, as a canvas blurs in the screen's pixels whatever it is scaled by. */
export const pillBody = (g: Pen, x: number, y: number, w: number, h: number, r: number | number[], ink: Ink, px: number) => {
	roundRect(g, x, y, w, h, r);
	g.fillStyle = ink.pill;
	g.shadowColor = h * px < 16 ? 'transparent' : 'rgb(0 0 0 / 0.12)';
	g.shadowBlur = h * 0.1 * px;
	g.shadowOffsetY = h * 0.04 * px;
	g.fill();
	g.shadowColor = 'transparent';
};

/* Words broken onto lines no wider than `wide`, at the size `px` they are
   drawn at: measured there, as the page's letter spacing, so many pixels a
   letter whatever the size, is a good part of the smallest words' width.
   Kept, as measuring is not free. */
const broken = new Map<string, string[]>();
export const wrap = (said: string, wide: number, px: number, face: string, family?: string) => {
	const key = `${family}${face}${wide}/${px}${said}`;
	const kept = broken.get(key);
	if (kept) return kept;
	const out: string[] = [];
	for (const given of said.split('\n')) {
		let at = '';
		for (const word of given.split(' ')) {
			const tried = at ? `${at} ${word}` : word;
			if (at && measure(tried, px, face, family) > wide) {
				out.push(at);
				at = word;
			} else at = tried;
		}
		out.push(at);
	}
	broken.set(key, out);
	return out;
};
