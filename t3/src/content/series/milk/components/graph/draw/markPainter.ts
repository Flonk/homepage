import type { Box } from '../layout';
import { type Pen, legible } from '../render/canvas';
import { type Node, corner, SERIF, SANS } from '../client/base';
import { MARK as ANIMAL_EMOJI } from '../render/Beasts';
import type { Drawing, MarkPainter, Remark, Spot } from './types';

// The protected names' seals, coloured as the EU's are.
const SEAL_COLOUR: Record<string, string> = { PDO: '#b8102a', PGI: '#1d4f9c' };
const SEAL_GOLD = '#f2c200';

// The marks on a pill's corners: its flags, its animals, its remarks, its seal.
export const makeMarkPainter = (G: Drawing): MarkPainter => {
	const { layout } = G;
	const colours = G.appearance.colours;
	const shadowPx = (s: number) => s * G.viewport.pixelRatio;

	const markRowBox = (spots: Spot[], below: number): Box => {
		const { r, y } = spots[0];
		return { x0: spots[0].x - r * 1.5, x1: spots.at(-1)!.x + r * 1.5, y0: y - r * 1.5, y1: y + r * below };
	};
	// A round mark, with the pills' soft shadow; and its edge, as a pill's is.
	const drawDisc = (g: Pen, x: number, y: number, r: number, fill: string, s: number) => {
		g.beginPath();
		g.arc(x, y, r, 0, Math.PI * 2);
		g.fillStyle = fill;
		g.shadowColor = 'rgb(0 0 0 / 0.18)';
		g.shadowBlur = r * 0.2 * shadowPx(s);
		g.shadowOffsetY = r * 0.08 * shadowPx(s);
		g.fill();
		g.shadowColor = 'transparent';
	};
	const drawDiscRim = (g: Pen, n: Node, x: number, y: number, r: number) => {
		g.beginPath();
		g.arc(x, y, r, 0, Math.PI * 2);
		g.lineWidth = 1.2 * layout.pillRimWidth(n);
		g.strokeStyle = colours.rim;
		g.stroke();
	};

	// A regional product's flags, on its top right corner, side by side leftwards from there.
	const flagSpots = (n: Node) => corner(n, n.regions!.length, true, false).map((at, i) => ({ ...at, country: n.regions![i] }));
	const drawFlags = (g: Pen, n: Node, s: number) => {
		let whole = true;
		for (const { country, r, x, y } of flagSpots(n)) {
			// On white, for a flag that does not fill its circle, as Nepal's does not.
			drawDisc(g, x, y, r, '#fff', s);
			// Round already in its file, so it needs no clipping here.
			const im = r * s >= 2 ? G.appearance.imageOf(`/assets/flags/${country.toLowerCase()}.webp`) : null;
			if (im) g.drawImage(im, x - r, y - r, 2 * r, 2 * r);
			else if (r * s >= 2) whole = false;
			drawDiscRim(g, n, x, y, r);
		}
		return whole;
	};

	/* The animals whose milk it is, on the bottom left corner: bare emoji,
	   bigger than a flag, with a soft shadow, each a little in from the
	   one before. */
	const animalSpots = (n: Node) => corner(n, n.beasts!.length, false, true, 0.3, 1.5).map((at, i) => ({ ...at, emoji: ANIMAL_EMOJI[n.beasts![i]] }));
	const drawAnimals = (g: Pen, n: Node, s: number) => {
		for (const { emoji, r, x, y } of animalSpots(n)) {
			if (!legible(r * 2, s)) continue;
			g.font = `${r * 2}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillStyle = '#000';
			g.shadowColor = 'rgb(0 0 0 / 0.35)';
			g.shadowBlur = r * 0.25 * shadowPx(s);
			g.shadowOffsetY = r * 0.1 * shadowPx(s);
			g.fillText(emoji, x, y);
			g.shadowColor = 'transparent';
		}
		return true;
	};

	// Its remarks, on the bottom right corner: a guess about it, then a note.
	const remarksOf = (n: Node): Remark[] => {
		const said = [
			...(n.unsure ? [{ kind: 'unsure' as const, text: n.unsure }] : []),
			...(n.note ? [{ kind: 'note' as const, text: n.note }] : []),
		];
		return corner(n, said.length, true, true).map((at, i) => ({ ...said[i], ...at, node: n }));
	};
	// A note blue, as an info mark is, with a white italic i; a guess amber, with a ?. Edged as a flag is.
	const drawRemarks = (g: Pen, n: Node, s: number) => {
		for (const { kind, r, x, y } of remarksOf(n)) {
			drawDisc(g, x, y, r, kind === 'note' ? colours.info : colours.unsure, s);
			drawDiscRim(g, n, x, y, r);
			if (!legible(r * 1.4, s)) continue;
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillStyle = '#fff';
			if (kind === 'note') {
				g.font = `italic 600 ${r * 1.4}px ${SERIF()}`;
				// A little low of the middle, as an italic i sits; 1 px at the pill's own size.
				g.fillText('i', x, y + r * 0.05 + layout.scaleOf(n));
			} else {
				g.font = `600 ${r * 1.3}px ${SERIF()}`;
				g.fillText('?', x, y + r * 0.08);
			}
		}
		return true;
	};

	// A protected name's seal on the top left corner: red ringed in gold for a PDO, blue for a PGI, with a gold star.
	const sealSpot = (n: Node) => corner(n, 1, false, false)[0];
	const drawSeal = (g: Pen, n: Node, s: number) => {
		const { r, x, y } = sealSpot(n);
		drawDisc(g, x, y, r, SEAL_COLOUR[n.protected!] ?? '#c08a00', s);
		g.beginPath();
		g.arc(x, y, r * 0.78, 0, Math.PI * 2);
		g.lineWidth = r * 0.16;
		g.strokeStyle = SEAL_GOLD;
		g.stroke();
		drawDiscRim(g, n, x, y, r);
		if (legible(r, s)) {
			g.font = `${r * 1.05}px ${SANS()}`;
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillStyle = SEAL_GOLD;
			g.fillText('★', x, y + r * 0.05);
		}
		return true;
	};

	return {
		flagSpots,
		animalSpots,
		remarksOf,
		sealSpot,
		sameRemark: (a, b) => a?.node === b?.node && a?.kind === b?.kind,
		markRowBox,
		drawFlags,
		drawAnimals,
		drawRemarks,
		drawSeal,
		drawDisc,
		drawDiscRim,
	};
};
