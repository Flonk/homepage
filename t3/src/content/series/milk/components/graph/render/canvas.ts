import { measure, SANS } from '../client/base';

/*
 * What every schema's drawing on the canvas shares: the pen it draws with,
 * the inks it reads from the page's colours, a font as the canvas wants it,
 * a rounded box, whether words are big enough to read at a zoom, and words
 * broken onto lines no wider than so many of their letters.
 */
export type Pen = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type Ink = Record<string, string>;
// What a drawing is given: the ink, the zoom it is drawn at, and whether it is the one looked at.
export type Paint = { ink: Ink; s: number; on: boolean };

export const font = (px: number, face = '400', family = SANS()) => `${face} ${px}px ${family}`;
export const roundRect = (g: Pen, x: number, y: number, w: number, h: number, r: number | number[]) => {
	g.beginPath();
	g.roundRect(x, y, w, h, r);
};
export const legible = (px: number, s: number) => px * s >= 2.5;

/* Words broken onto lines no wider than so many of their letters high.
   Kept, as measuring is not free and the size does not change what breaks
   where. */
const broken = new Map<string, string[]>();
export const wrap = (said: string, wide: number, face: string, family?: string) => {
	const key = `${family}${face}${wide}${said}`;
	const kept = broken.get(key);
	if (kept) return kept;
	const out: string[] = [];
	for (const given of said.split('\n')) {
		let at = '';
		for (const word of given.split(' ')) {
			const tried = at ? `${at} ${word}` : word;
			if (at && measure(tried, 100, face, family) / 100 > wide) {
				out.push(at);
				at = word;
			} else at = tried;
		}
		out.push(at);
	}
	broken.set(key, out);
	return out;
};
