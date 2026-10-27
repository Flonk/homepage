import type { Box } from '../layout';
import { SHOWN } from '../settings';
import { type Pen, shownAt } from '../render/canvas';
import { type Node, corner, SERIF, SANS, MONO } from '../client/base';
import { MARK as ANIMAL_EMOJI } from '../render/Beasts';
import type { Drawing, MarkPainter, Remark, Spot } from './types';

// The protected names' seals, coloured as the EU's are.
const SEAL_COLOUR: Record<string, string> = { PDO: '#b8102a', PGI: '#1d4f9c' };
const SEAL_GOLD = '#f2c200';
// How many times an animal is drawn over its own glow, to make it dense.
const GLOW_PASSES = 3;
// A story's speech bubble, wide and tall, in the radius of a corner's mark.
const STORY_W = 3;
const STORY_H = 2.1;
const STORY_TAIL = 0.6;
/* Hovered, it rises: this much bigger, this far up in its corner mark's
   radius, and from Material's elevation 2 to 8 in its shadows (umbra,
   penumbra, ambient: y, blur and opacity, in dp; their spread, which a
   canvas has not, left out). A dp this much of that radius. */
const STORY_RAISED = 1.1;
const STORY_LIFT = 0.3;
const STORY_DP = 0.12;
const ELEVATION_2 = [[3, 1, 0.2], [2, 2, 0.14], [1, 5, 0.12]];
const ELEVATION_8 = [[5, 5, 0.2], [8, 10, 0.14], [3, 14, 0.12]];
// So far off, in device pixels, a shadow is cast from: its shape out of sight, only its shadow put down.
const FAR = 1e5;
// The site's fake luminosity border on black (--flb in global.css).
const FLB = 'rgb(255 255 255 / 0.2)';

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

	/* Along its bottom right corner, left to right: its flags, its remarks,
	   and its seal, always rightmost. Each its spot in that row. */
	const bottomRow = (n: Node) => {
		const flags = n.regions?.length ?? 0;
		const remarks = n.unsure ? 1 : 0;
		const row = corner(n, flags + remarks + (n.protected ? 1 : 0), true, true);
		return { flags: row.slice(0, flags), remarks: row.slice(flags, flags + remarks), seal: row[flags + remarks] };
	};
	// A regional product's flags, first on its bottom right corner.
	const flagSpots = (n: Node) => bottomRow(n).flags.map((at, i) => ({ ...at, country: n.regions![i] }));
	const drawFlags = (g: Pen, n: Node, s: number) => {
		let whole = true;
		for (const { country, r, x, y } of flagSpots(n)) {
			// On white, for a flag that does not fill its circle, as Nepal's does not.
			drawDisc(g, x, y, r, '#fff', s);
			// Round already in its file, so it needs no clipping here.
			const im = shownAt(2 * r, s, SHOWN.flag) ? G.appearance.imageOf(`/assets/flags/${country.toLowerCase()}.webp`) : null;
			if (im) g.drawImage(im, x - r, y - r, 2 * r, 2 * r);
			else if (shownAt(2 * r, s, SHOWN.flag)) whole = false;
			drawDiscRim(g, n, x, y, r);
		}
		return whole;
	};

	/* The animals whose milk it is, on the bottom left corner: bare emoji,
	   bigger than a flag, with a shadow and a glow, each a little in from the
	   one before. */
	const animalSpots = (n: Node) => corner(n, n.beasts!.length, false, true, 0.3, 1.5).map((at, i) => ({ ...at, emoji: ANIMAL_EMOJI[n.beasts![i]] }));
	const drawAnimals = (g: Pen, n: Node, s: number) => {
		for (const { emoji, r, x, y } of animalSpots(n)) {
			if (!shownAt(r * 2, s)) continue;
			g.font = `${r * 2}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillStyle = '#000';
			// A soft shadow under each; over it a small, dense glow in the pills' white, drawn over itself to thicken it.
			g.shadowColor = 'rgb(0 0 0 / 0.35)';
			g.shadowBlur = r * 0.25 * shadowPx(s);
			g.shadowOffsetY = r * 0.1 * shadowPx(s);
			g.fillText(emoji, x, y);
			g.shadowColor = colours.pill;
			g.shadowBlur = r * 0.06 * shadowPx(s);
			g.shadowOffsetY = 0;
			for (let i = 0; i < GLOW_PASSES; i++) g.fillText(emoji, x, y);
			g.shadowColor = 'transparent';
		}
		return true;
	};

	// Its remarks, on the bottom right corner, between its flags and its seal: a guess about it.
	const remarksOf = (n: Node): Remark[] => {
		const said = n.unsure ? [{ kind: 'unsure' as const, text: n.unsure }] : [];
		return bottomRow(n).remarks.map((at, i) => ({ ...said[i], ...at, node: n }));
	};
	// A guess amber, with a ?. Edged as a flag is.
	const drawRemarks = (g: Pen, n: Node, s: number) => {
		for (const { r, x, y } of remarksOf(n)) {
			drawDisc(g, x, y, r, colours.unsure, s);
			drawDiscRim(g, n, x, y, r);
			if (!shownAt(r * 1.4, s)) continue;
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillStyle = '#fff';
			g.font = `600 ${r * 1.3}px ${SERIF()}`;
			g.fillText('?', x, y + r * 0.08);
		}
		return true;
	};

	/* A protected name's seal on the bottom right corner, a rosette: red
	   ringed in gold for a PDO, blue for a PGI, with a gold star, and two
	   ribbon tails hanging behind it, notched at their ends. Its tails and
	   its rosette drawn apart, the flags between them (see sprites.ts). */
	const sealSpot = (n: Node) => bottomRow(n).seal;
	// How far below the seal's middle its tails reach, in its radius.
	const TAIL = 2.1;
	const sealColour = (n: Node) => SEAL_COLOUR[n.protected!] ?? '#c08a00';
	const drawSealTails = (g: Pen, n: Node, s: number) => {
		const { r, x, y } = sealSpot(n);
		const colour = sealColour(n);
		for (const side of [-1, 1]) {
			// Each tail a strip leaning out, from behind the middle down to a V cut into its end.
			const top = x + side * r * 0.15;
			const foot = x + side * r * 0.75;
			const w = r * 0.32;
			g.beginPath();
			g.moveTo(top - w, y);
			g.lineTo(top + w, y);
			g.lineTo(foot + w, y + r * TAIL);
			g.lineTo(foot, y + r * (TAIL - 0.35));
			g.lineTo(foot - w, y + r * TAIL);
			g.closePath();
			g.fillStyle = colour;
			g.shadowColor = 'rgb(0 0 0 / 0.18)';
			g.shadowBlur = r * 0.2 * shadowPx(s);
			g.shadowOffsetY = r * 0.08 * shadowPx(s);
			g.fill();
			g.shadowColor = 'transparent';
			// A darker fold down its inner edge, so it reads as ribbon.
			g.fillStyle = 'rgb(0 0 0 / 0.18)';
			g.beginPath();
			g.moveTo(top - side * w, y);
			g.lineTo(top - side * w * 0.2, y);
			g.lineTo(foot - side * w * 0.2, y + r * (TAIL - 0.3));
			g.lineTo(foot - side * w, y + r * TAIL);
			g.closePath();
			g.fill();
		}
		return true;
	};
	const drawSeal = (g: Pen, n: Node, s: number) => {
		const { r, x, y } = sealSpot(n);
		drawDisc(g, x, y, r, sealColour(n), s);
		g.beginPath();
		g.arc(x, y, r * 0.78, 0, Math.PI * 2);
		g.lineWidth = r * 0.16;
		g.strokeStyle = SEAL_GOLD;
		g.stroke();
		drawDiscRim(g, n, x, y, r);
		if (shownAt(r, s)) {
			g.font = `${r * 1.05}px ${SANS()}`;
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillStyle = SEAL_GOLD;
			g.fillText('★', x, y + r * 0.05);
		}
		return true;
	};

	/* A story to tell of it, right of its pill and level with its middle:
	   the site's mark as a speech bubble, a black rounded box with T3 cut
	   out of it (see T3Mark), its tail under it, slanting left; edged
	   inside with the FLB, as the site's panels are, and with a drop
	   shadow. Hovered, it rises, eased (see rise in pointer.ts). Drawn in a little canvas of its own, so the letters cut
	   through the box alone, and set down with its shadow. Pressed, it
	   opens the story (see story.ts). */
	// Clear of the marks on its corner.
	const storyBox = (n: Node): Box => {
		const r = n.h * 0.2;
		const x0 = n.x + n.w / 2 + r * 0.9;
		return { x0, x1: x0 + r * STORY_W, y0: n.y - (r * STORY_H) / 2, y1: n.y + (r * STORY_H) / 2 };
	};
	const drawStory = (g: Pen, n: Node, s: number) => {
		const r = n.h * 0.2;
		const { x0, x1, y0, y1 } = storyBox(n);
		const tail = r * STORY_TAIL;
		const mid = (x0 + x1) / 2;
		const v = G.pointer?.raised.get(n) ?? 0;
		const up = v * v * (3 - 2 * v);
		const grown = 1 + (STORY_RAISED - 1) * up;
		g.save();
		g.translate(mid, n.y - r * STORY_LIFT * up);
		g.scale(grown, grown);
		g.translate(-mid, -n.y);
		// In device pixels, as the pen draws; never a bigger canvas than a sprite.
		const t = g.getTransform();
		const k = Math.min(Math.hypot(t.a, t.b), 512 / (x1 - x0));
		const box = new OffscreenCanvas(Math.max(1, Math.ceil((x1 - x0) * k)), Math.max(1, Math.ceil((y1 - y0 + tail) * k)));
		const b = box.getContext('2d')!;
		b.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
		// Its outline in one, the tail let into its bottom edge, so the FLB runs round both.
		const round = r * 0.45;
		const outline = new Path2D();
		outline.moveTo(x0 + round, y0);
		outline.arcTo(x1, y0, x1, y1, round);
		outline.arcTo(x1, y1, x0, y1, round);
		outline.lineTo(mid + r * 0.1, y1);
		outline.lineTo(mid - r * 1.05, y1 + tail);
		outline.lineTo(mid - r * 0.95, y1);
		outline.arcTo(x0, y1, x0, y0, round);
		outline.arcTo(x0, y0, x1, y0, round);
		outline.closePath();
		b.fillStyle = '#000';
		b.fill(outline);
		if (shownAt(r, s)) {
			b.font = `700 ${r * 1.05}px ${MONO()}`;
			b.textAlign = 'center';
			b.textBaseline = 'middle';
			b.globalCompositeOperation = 'destination-out';
			b.fillText('T3', mid, n.y + r * 0.06);
			b.globalCompositeOperation = 'source-over';
		}
		// A CSS pixel wide, inside its edge: drawn twice as wide, clipped to the inside.
		b.save();
		b.clip(outline);
		b.lineWidth = 2 / s;
		b.strokeStyle = FLB;
		b.stroke(outline);
		b.restore();
		// Each shadow cast by its shape drawn far off, then the shape itself.
		const dp = r * STORY_DP * shadowPx(s);
		const far = FAR / Math.hypot(t.a, t.b);
		ELEVATION_2.forEach(([y, blur, alpha], i) => {
			const [y8, blur8, alpha8] = ELEVATION_8[i];
			g.shadowColor = `rgb(0 0 0 / ${alpha + (alpha8 - alpha) * up})`;
			g.shadowBlur = (blur + (blur8 - blur) * up) * dp;
			g.shadowOffsetX = FAR;
			g.shadowOffsetY = (y + (y8 - y) * up) * dp;
			g.drawImage(box, x0 - far, y0, x1 - x0, y1 - y0 + tail);
		});
		g.shadowColor = 'transparent';
		g.shadowOffsetX = 0;
		g.drawImage(box, x0, y0, x1 - x0, y1 - y0 + tail);
		g.restore();
		return true;
	};

	return {
		flagSpots,
		storyBox,
		drawStory,
		animalSpots,
		remarksOf,
		sealSpot,
		sameRemark: (a, b) => a?.node === b?.node && a?.kind === b?.kind,
		markRowBox,
		drawFlags,
		drawAnimals,
		drawRemarks,
		drawSeal,
		drawSealTails,
		drawDisc,
		drawDiscRim,
	};
};
