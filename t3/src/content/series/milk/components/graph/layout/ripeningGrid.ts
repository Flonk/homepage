import { MARK_OVERHANG, NODE_H, ROW_GAP, SIDE_GAP, PANEL_PADDING, type Node } from '../client/base';
import type { Panel } from './types';

// How wide the grid's time is across, from the quickest ripened of its cheeses to the longest.
const TIME_WIDTH = 28 * NODE_H;
// The least a column of a table set out by what sets its cheeses is wide.
const COLUMN_LEAST = 4 * NODE_H;
/* Time is set out evenly, a day as wide as any other; marked a week, a
   month, three months, six or a year apart, whichever puts no more than
   this many marks along it. */
const MOST_MARKS = 8;
const STEPS = [7, 14, 30, 90, 180, 365];
// A mark said in the unit of its step: weeks, months or years.
const said = (days: number, step: number) => (days === 0 ? '0' : step < 30 ? `${days / 7} wk` : step < 365 ? `${days / 30} mo` : `${days / 365} yr`);

const ripeningDays = (k: Node) => (k.axes!.days[0] + k.axes!.days[1]) / 2;

/* A family's cheeses on a grid: ripening time across; firmness down,
   a row for each class from the softest to the firmest of its cheeses. A
   cheese type's table has its own rows (see table in Node), and what sets
   its cheeses across instead of time where they are not ripened, a column
   to each.
   Each cheese at the middle of its ripening; those in one row that would
   meet stacked one under another, so each stays at its own time. Hung
   straight under its family, whose pill is widened to the grid: the
   column under the family's photograph holds the rows' names. */
export const layRipeningGrid = (family: Node, cheeses: Node[], firmnesses: string[], photoSize: number): Panel => {
	const columns = family.table?.columns;
	// By the middles of their ripening, where they are put: a span begun at nothing does not pull the scale back to it.
	const least = Math.min(...cheeses.map(ripeningDays));
	const most = Math.max(least + 1, ...cheeses.map((k) => k.axes!.days[1]));
	const step = STEPS.find((d) => (most - least) / d <= MOST_MARKS) ?? 365 * Math.ceil((most - least) / 365 / MOST_MARKS);
	/* From the quickest, to the mark at or after the longest; marked at
	   each whole step between. */
	const start = least;
	const end = Math.ceil(most / step) * step;
	const first = Math.ceil(start / step) * step;
	const times: Panel['times'] = columns ? columns.map((c, i) => [i, c]) : Array.from({ length: (end - first) / step + 1 }, (_, i) => [first + i * step, said(first + i * step, step)]);
	// Room at the left for the widest cheese to sit at the very start.
	const lead = photoSize + PANEL_PADDING + Math.max(...cheeses.map((k) => k.w)) / 2;
	/* Each column as wide as its widest cheese, so one big cheese widens
	   only its own; each from the end of the one before. */
	const columnWidths = (columns ?? []).map((c) => Math.max(COLUMN_LEAST, ...cheeses.filter((k) => k.axes!.column === c).map((k) => k.w + SIDE_GAP)));
	const columnX = (i: number) => photoSize + PANEL_PADDING + columnWidths.slice(0, i).reduce((t, v) => t + v, 0) + columnWidths[i] / 2;
	const xOf = (days: number) => (columns ? columnX(days) : lead + ((Math.min(Math.max(days, start), end) - start) / (end - start)) * TIME_WIDTH);
	/* A cheese whose time is a guess is not stacked on the one point its
	   family's usual time is, but spread evenly with the others like it
	   across that span, from its usual least to its usual most: somewhere
	   in there, as its question mark says. */
	const sure = cheeses.filter((k) => !k.axes!.timeless);
	const spanDays = (i: 0 | 1) => (sure.length ? sure : cheeses).map((k) => k.axes!.days[i]).sort((a, b) => a - b);
	const median = (xs: number[]) => xs[Math.floor(xs.length / 2)];
	const [lo, hi] = [median(spanDays(0)), median(spanDays(1))];
	const guessed = cheeses.filter((k) => k.axes!.timeless);
	const placedDays = (k: Node) => {
		if (columns) return columns.indexOf(k.axes!.column!);
		if (!k.axes!.timeless) return ripeningDays(k);
		const i = guessed.indexOf(k);
		return lo + ((hi - lo) * (i + 0.5)) / guessed.length;
	};
	const rowNames = family.table?.rows ?? firmnesses;
	const firmness = (k: Node) => rowNames.indexOf(family.table ? k.axes!.row! : k.axes!.firm);
	const classes = cheeses.map(firmness);
	const at = new Map<Node, { x: number; y: number }>();
	const rows: Panel['rows'] = [];
	let y = PANEL_PADDING;
	for (let c = Math.min(...classes); c <= Math.max(...classes); c++) {
		/* What each takes up along its lane: its pill, and the line of its
		   ripening behind it, so no line runs through another's pill. */
		const extent = (k: Node) => {
			const x = xOf(placedDays(k));
			const spanned = !columns && !k.axes!.timeless;
			return { x, left: Math.min(x - k.w / 2, spanned ? xOf(k.axes!.days[0]) : Infinity), right: Math.max(x + k.w / 2, spanned ? xOf(k.axes!.days[1]) : -Infinity) };
		};
		const inRow = cheeses.filter((k) => firmness(k) === c).sort((a, b) => extent(a).left - extent(b).left);
		// How far right each lane is taken up so far, and which lane each cheese is put in.
		const lanes: number[] = [];
		const laneOf = new Map<Node, number>();
		for (const k of inRow) {
			const { left, right } = extent(k);
			let lane = lanes.findIndex((taken) => taken + SIDE_GAP <= left);
			if (lane < 0) lane = lanes.push(-Infinity) - 1;
			lanes[lane] = right;
			laneOf.set(k, lane);
		}
		/* Each lane the height of the tallest pill in it, and room besides for
		   the marks on its corners (see corner), which stand out past its
		   edges: a seal below one pill, a flag above the next, do not meet. */
		const laneHeights = lanes.map((_, i) => Math.max(...inRow.filter((k) => laneOf.get(k) === i).map((k) => k.h)) * (1 + MARK_OVERHANG) + ROW_GAP);
		const laneTop = (i: number) => laneHeights.slice(0, i).reduce((t, v) => t + v, 0);
		for (const k of inRow) {
			const lane = laneOf.get(k)!;
			at.set(k, { x: extent(k).x, y: y + laneTop(lane) + laneHeights[lane] / 2 });
		}
		const h = Math.max(laneTop(lanes.length), NODE_H + ROW_GAP);
		rows.push({ firm: rowNames[c], y, h });
		y += h + PANEL_PADDING;
	}
	const w = Math.max(columns ? photoSize + PANEL_PADDING + columnWidths.reduce((t, v) => t + v, 0) : xOf(end), ...[...at].map(([k, { x }]) => x + k.w / 2)) + PANEL_PADDING;
	family.w = Math.max(family.w, w);
	const named = columns ? 'set with' : 'age';
	return { kind: 'grid', w: family.w, h: y, rows, times, xOf, at, columns: !!columns, named };
};
