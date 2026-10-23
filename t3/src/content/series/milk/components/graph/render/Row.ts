import type { How } from '../schema';
import { measure } from '../client/base';
import { font, roundRect, wrap, type Paint, type Pen } from './canvas';
import { el } from './dom';

/*
 * A table's rows, in each of the forms they are drawn in: as the page is
 * given them; as a table on the canvas, measured and drawn; and as a table
 * on a card.
 */
type Row = NonNullable<How['table']>[number];

/* ---- As the page is given them ---- */

// What they say, their own sources left with the graph's records.
export const page = (rows?: Row[]) => rows?.map(({ k, v }) => ({ k, v }));

/* ---- On the canvas ---- */

/* A row a fact, what it is on the left and its value on the right, each
   broken onto lines no wider than so many of its letters, a key narrower
   than a value, so a long list reads down the table and not off across the
   graph; a row as tall as its key's lines or its value's, and its padding. */
export const ROW = 1.3;
const KEY_WIDE = 9;
const VALUE_WIDE = 18;
export const keyLines = (k: string) => wrap(k, KEY_WIDE, '600');
export const rowLines = (v: string) => wrap(v, VALUE_WIDE, '400');
// The room in a cell round its words.
export const pad = (f: number) => f * 0.6;
export const columns = (rows: { k: string; v: string }[], f: number) => {
	const widest = (said: string[], face: string) => Math.max(...said.map((t) => measure(t, f, face)));
	return { key: widest(rows.flatMap(({ k }) => keyLines(k)), '600'), value: widest(rows.flatMap(({ v }) => rowLines(v)), '400') };
};
export const rowHeight = ({ k, v }: { k: string; v: string }, f: number) => Math.max(keyLines(k).length, rowLines(v).length) * ROW * f + pad(f);

/* On the pills' white, the names' column a shade darker, ruled, framed;
   where it is, its column's edge, how wide and how tall. */
export type At = { left: number; top: number; split: number; w: number; h: number };
export const draw = (g: Pen, rows: { k: string; v: string }[], { left, top, split, w, h }: At, f: number, { ink, on }: Paint) => {
	const r = f * (4 / 16) * 1.5;
	roundRect(g, left, top, w, h, r);
	g.fillStyle = ink.pill;
	g.fill();
	roundRect(g, left, top, split - left, h, [r, 0, 0, r]);
	g.fillStyle = ink.names;
	g.fill();
	g.lineWidth = f * 0.08;
	g.strokeStyle = on ? ink.lit : ink.dim;
	g.globalAlpha = on ? 1 : 0.5;
	g.beginPath();
	g.moveTo(split, top);
	g.lineTo(split, top + h);
	let y = top;
	rows.forEach((row, i) => {
		if (i) {
			g.moveTo(left, y);
			g.lineTo(left + w, y);
		}
		y += rowHeight(row, f);
	});
	g.stroke();
	roundRect(g, left, top, w, h, r);
	g.stroke();
	g.globalAlpha = 1;
	const p = pad(f);
	g.fillStyle = on ? ink.lit : ink.dim;
	g.textBaseline = 'alphabetic';
	y = top;
	for (const row of rows) {
		const baseline = y + p / 2 + f * 0.95;
		g.font = font(f, '600');
		g.textAlign = 'right';
		keyLines(row.k).forEach((said, j) => g.fillText(said, split - p, baseline + j * ROW * f));
		g.font = font(f);
		g.textAlign = 'left';
		rowLines(row.v).forEach((said, j) => g.fillText(said, split + p, baseline + j * ROW * f));
		y += rowHeight(row, f);
	}
};

/* ---- On a card ---- */

export const html = (rows: { k: string; v: string }[]) => {
	const table = el('table');
	for (const { k, v } of rows) {
		const row = el('tr');
		row.append(el('th', '', k), el('td', '', v));
		table.append(row);
	}
	return table;
};
