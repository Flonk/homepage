import { NODE_H, ROW_GAP, SIDE_GAP, PANEL_PADDING, type Node } from '../client/base';
import type { Panel } from './types';

// How wide a tenfold of ripening time is across the grid.
const DECADE_WIDTH = 10 * NODE_H;
// The times marked along the top, in days.
const TIME_MARKS: [number, string][] = [
	[1, '1 day'], [7, '1 wk'], [14, '2 wk'], [30, '1 mo'], [60, '2 mo'], [90, '3 mo'], [180, '6 mo'], [365, '1 yr'], [730, '2 yr'], [1095, '3 yr'], [1825, '5 yr'],
];

const ripeningDays = (k: Node) => Math.sqrt(Math.max(1, k.axes!.days[0]) * Math.max(1, k.axes!.days[1]));

/* A family's cheeses on a grid: ripening time across, on a log scale, as
   a week and a month are as far apart as a month and four; firmness down,
   a row for each class from the softest to the firmest of its cheeses.
   Each cheese at the middle of its ripening; those in one row that would
   meet stacked one under another, so each stays at its own time. Hung
   straight under its family, whose pill is widened to the grid: the
   column under the family's photograph holds the rows' names. */
export const layRipeningGrid = (family: Node, cheeses: Node[], firmnesses: string[], photoSize: number): Panel => {
	const least = Math.min(...cheeses.map((k) => Math.max(1, k.axes!.days[0])));
	const most = Math.max(...cheeses.map((k) => k.axes!.days[1]));
	const from = [...TIME_MARKS].reverse().find(([d]) => d <= least) ?? TIME_MARKS[0];
	const to = TIME_MARKS.find(([d]) => d >= most) ?? TIME_MARKS.at(-1)!;
	const times = TIME_MARKS.filter(([d]) => d >= from[0] && d <= to[0]);
	// Room at the left for the widest cheese to sit at the very start.
	const lead = photoSize + PANEL_PADDING + Math.max(...cheeses.map((k) => k.w)) / 2;
	const xOf = (days: number) => lead + (Math.log10(Math.max(1, days)) - Math.log10(from[0])) * DECADE_WIDTH;
	/* A cheese whose time is a guess is not stacked on the one point its
	   family's usual time is, but spread evenly with the others like it
	   across that span, from its usual least to its usual most: somewhere
	   in there, as its question mark says. */
	const sure = cheeses.filter((k) => !k.unsure);
	const logDays = (i: 0 | 1) => (sure.length ? sure : cheeses).map((k) => Math.log10(Math.max(1, k.axes!.days[i]))).sort((a, b) => a - b);
	const median = (xs: number[]) => xs[Math.floor(xs.length / 2)];
	const [lo, hi] = [median(logDays(0)), median(logDays(1))];
	const guessed = cheeses.filter((k) => k.unsure);
	const placedDays = (k: Node) => {
		if (!k.unsure) return ripeningDays(k);
		const i = guessed.indexOf(k);
		return 10 ** (lo + ((hi - lo) * (i + 0.5)) / guessed.length);
	};
	const firmness = (k: Node) => firmnesses.indexOf(k.axes!.firm);
	const classes = cheeses.map(firmness);
	const at = new Map<Node, { x: number; y: number }>();
	const rows: Panel['rows'] = [];
	let y = PANEL_PADDING;
	for (let c = Math.min(...classes); c <= Math.max(...classes); c++) {
		const inRow = cheeses.filter((k) => firmness(k) === c).sort((a, b) => placedDays(a) - placedDays(b));
		const laneHeight = Math.max(...cheeses.map((k) => k.h)) + ROW_GAP;
		// How far right each lane is taken up so far.
		const lanes: number[] = [];
		for (const k of inRow) {
			const x = xOf(placedDays(k));
			let lane = lanes.findIndex((right) => right + SIDE_GAP <= x - k.w / 2);
			if (lane < 0) lane = lanes.push(-Infinity) - 1;
			lanes[lane] = x + k.w / 2;
			at.set(k, { x, y: y + ROW_GAP / 2 + lane * laneHeight + k.h / 2 });
		}
		const h = Math.max(1, lanes.length) * laneHeight;
		rows.push({ firm: firmnesses[c], y, h });
		y += h + PANEL_PADDING;
	}
	const w = Math.max(xOf(to[0]), ...[...at].map(([k, { x }]) => x + k.w / 2)) + PANEL_PADDING;
	family.w = Math.max(family.w, w);
	return { kind: 'grid', w: family.w, h: y, rows, times, xOf, at };
};
