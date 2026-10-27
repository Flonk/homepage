import { CORNER, headLength, type Node } from '../client/base';
import type { StepLabelSizes } from './types';

/* A parent with this many tables (cheese types with their panels) or
   more sets them out below all else made from it, the quickest ripened
   first, in rows each one shorter than the one above, and feeds them by
   a bus: one arrow out of
   its pill's right side below its trunk, down before the trunk and on
   down beside the rows. At each row its strands turn off along over it,
   each dropping off into the top of its table's header. The rows' strands
   lie in the bus from the right, the first row's rightmost, so each turns
   off on the inside of those going on down; and within a row the
   leftmost table's lowest, so it drops off first and crosses none. */
export const BUS_LEAST = 3;
const BUS_ROWS = 3;
/* How long ripened, by its cheeses: the mean of the middles of their
   ripening, the quickest and slowest tenth left out, so one aged far
   longer than the rest (as among the pasta filata) does not drag
   the whole along. */
const TRIM = 0.1;
export const ripening = (cheeses: Node[]) => {
	const days = cheeses.flatMap((k) => (k.axes ? [(k.axes.days[0] + k.axes.days[1]) / 2] : [])).sort((a, b) => a - b);
	const cut = Math.floor(days.length * TRIM);
	const kept = days.slice(cut, days.length - cut);
	return kept.length ? kept.reduce((t, d) => t + d, 0) / kept.length : 0;
};

/* Where its lines go, from where all is placed: the vertical out of the
   parent's pill, its rows, each table's strand in the vertical (to its
   left the more) and in its row's bus (lower the more), and each row's
   room between its bus and its tables for the drop, its head, its label. */
export const busGeometry = (p: Node, tables: Node[], lineWidth: (n: Node) => number, labelHeight: (n: Node) => number, straightRun: number) => {
	// Each row one shorter than the one above it (6, 5, 4 for fifteen), the first as short as that lets it be.
	const rows: Node[][] = [];
	for (let at = 0, n = Math.ceil(tables.length / BUS_ROWS + (BUS_ROWS - 1) / 2); at < tables.length; at += n, n = Math.max(1, n - 1)) rows.push(tables.slice(at, at + n));
	const widthOf = (ks: Node[]) => ks.reduce((t, k) => t + lineWidth(k), 0);
	const width = widthOf(tables);
	// Down once clear of the pill by as much as any line runs straight out of it, round as tight as all its strands together let it.
	const x = p.x + p.w / 2 + straightRun + CORNER + width / 2;
	// In the vertical, from its left: the last row's first, on to the first row's last.
	const offset = new Map<Node, number>();
	let before = 0;
	for (const k of [...rows].reverse().flat()) {
		offset.set(k, width / 2 - before - lineWidth(k) / 2);
		before += lineWidth(k);
	}
	// In its row's bus, from the bottom: its first.
	const rowOffset = new Map<Node, number>();
	for (const row of rows) {
		let under = 0;
		for (const k of row) {
			rowOffset.set(k, widthOf(row) / 2 - under - lineWidth(k) / 2);
			under += lineWidth(k);
		}
	}
	const rowOf = (k: Node) => rows.find((row) => row.includes(k))!;
	const drop = (row: Node[]) => Math.max(...row.map((k) => Math.max(headLength(lineWidth(k)) + lineWidth(k) + 2 * CORNER, labelHeight(k))));
	// A row's top, its tables set level; and its bus's middle, above it by the drop.
	const middleY = (row: Node[]) => Math.min(...row.map((k) => k.y - k.h / 2)) - drop(row) - widthOf(row) / 2;
	return { width, x, rows, widthOf, offset, rowOffset, rowOf, drop, middleY };
};

// A table's label, beside the drop into it: as high as the drop must leave room for.
export const labelRoom = (labels: StepLabelSizes) => (k: Node) => (k.step ? labels.stepLabelFont(k) * 1.6 + labels.extraLabelHeight(k) : 0);
