import { RULE_PX, DROP, TIER_GAP, SIDE_GAP, rulerLead, type Node } from '../client/base';
import type { NodeSizes, RulerAndPanelContents, RulerLists } from './types';

// Of the ways to put a ruler's lists in rows, the most rows tried.
const MOST_ROWS = 5;

/* Products hung under a ruler: each centred straight under its value,
   its arrow straight down into its middle; those at one value as one
   list, stacked one on another, the arrow into the top of it. */
export const hangUnderRulers = ({ photoRoom }: NodeSizes, { listsByValue }: RulerAndPanelContents): RulerLists => {
	// The arrows leave from the ruler pill's bottom edge, each where its value is along the ruler, centred in the pill.
	const rulerBottom = (r: Node) => r.h / 2;
	// Centred in the pill beside its photograph, unless that leaves too little room for what it measures before its nought.
	const rulerTickX = (r: Node, v: number) => {
		const nought = Math.max(r.x + photoRoom(r) / 2 - (r.scale!.to / 2) * RULE_PX, r.x - r.w / 2 + photoRoom(r) + rulerLead(r.scale!));
		return nought + v * RULE_PX;
	};
	const hungY = new Map<Node, number>();
	const listTopY = new Map<Node, number>();
	/* The lists in rows, no two that meet in one: of every way to put them
	   in rows, the one with the fewest arrows passing under a pill in a row
	   above, then the fewest rows, then the most in the upper ones. An
	   arrow may pass under a pill here, and only here, as arrows are drawn
	   under pills; but one that passes under another product reads as made
	   from it, so that is the last thing chosen. */
	const hangUnder = (r: Node) => {
		const lists = [...listsByValue(r)].sort(([a], [b]) => a - b).map(([v, ks]) => {
			const tick = rulerTickX(r, v);
			for (const k of ks) k.x = tick;
			const wide = ks[0].w;
			return { ks, tick, x0: tick - wide / 2, x1: tick + wide / 2, tall: ks.reduce((sum, k) => sum + k.h, 0) };
		});
		type List = (typeof lists)[number];
		const meet = (a: List, b: List) => a.x1 + SIDE_GAP > b.x0 && b.x1 + SIDE_GAP > a.x0;
		// The arrow down to b passes behind a, in a row above it.
		const passesUnder = (a: List, b: List) => b.tick > a.x0 - 2 && b.tick < a.x1 + 2;
		const most = Math.min(lists.length, MOST_ROWS);
		const rowOf: number[] = [];
		let best: number[] = lists.map((_, i) => i);
		let bestCost = Infinity;
		/* Built up a list at a time, its cost so far carried along, and given
		   up as soon as that is no better than the best found, which only
		   grows as more are placed; so it is quick, rows tried from the top. */
		const tryRows = (i: number, hidden: number, deepest: number, sum: number) => {
			const cost = hidden * 1e4 + deepest * 100 + sum;
			if (cost >= bestCost) return;
			if (i === lists.length) {
				[bestCost, best] = [cost, [...rowOf]];
				return;
			}
			for (let row = 0; row < most; row++) {
				let meets = false;
				let more = 0;
				for (let j = 0; j < i && !meets; j++) {
					if (rowOf[j] === row) meets = meet(lists[j], lists[i]);
					else if (rowOf[j] < row ? passesUnder(lists[j], lists[i]) : passesUnder(lists[i], lists[j])) more++;
				}
				if (meets) continue;
				rowOf[i] = row;
				tryRows(i + 1, hidden + more, Math.max(deepest, row), sum + row);
			}
		};
		tryRows(0, 0, 0, 0);
		// Each row as tall as its tallest list, and the rows down from the ruler.
		const rows = Math.max(0, ...best) + 1;
		const tallest = Array.from({ length: rows }, (_, row) => Math.max(0, ...lists.filter((_, i) => best[i] === row).map((l) => l.tall)));
		const rowTop = tallest.map((_, row) => rulerBottom(r) + DROP + tallest.slice(0, row).reduce((sum, h) => sum + h + TIER_GAP, 0));
		lists.forEach(({ ks }, i) => {
			let y = rowTop[best[i]];
			for (const k of ks) {
				listTopY.set(k, rowTop[best[i]]);
				hungY.set(k, y + k.h / 2);
				y += k.h;
			}
		});
	};
	return { rulerBottom, rulerTickX, hungY, listTopY, hangUnder };
};
