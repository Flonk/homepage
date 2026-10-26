import { FONT, MAP_PILL, PANEL_PADDING, type Node, type Graph } from '../client/base';
import type { Box, Panel, Pin } from './types';
import { group } from './util';

// The world map's width in the picture; its height is as its projection has it.
export const MAP_WIDTH = 9000;
/* A pin's head, round with the count in it, its point on the country's
   middle: bigger the more cheeses it has. Shown zoomed out, until the
   cheeses themselves can be read. */
export const PIN_RADIUS = 6;
export const PIN_GROWTH = 1.2;
// The screen's pixels to one of the picture's, with the map about framed.
export const PIN_FRAMED_SCALE = 700 / MAP_WIDTH;
/* Whether the map's cheeses are drawn as pills, readable, rather than as
   pins: decided at the zoom to a doubling its tiles are drawn at (see
   drawTiles), not the zoom itself, so a tile shows one or the other. */
export const mapPillsReadable = (scale: number) => FONT * MAP_PILL * 2 ** Math.round(Math.log2(scale)) >= 5;

// Whether a point is inside a country's rings, as flat x, y pairs.
const isInside = (rings: number[][], x: number, y: number) => {
	let inside = false;
	for (const r of rings)
		for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2)
			if (r[i + 1] > y !== r[j + 1] > y && x < ((r[j] - r[i]) * (y - r[i + 1])) / (r[j + 1] - r[i + 1]) + r[i]) inside = !inside;
	return inside;
};

// Boxes placed so far, in cells, so a place is checked only against what is near it.
const occupancy = () => {
	const CELL = 40;
	const MIN_GAP = 0.6;
	const cells = new Map<string, Box[]>();
	const cellsOf = (b: Box) => {
		const keys: string[] = [];
		for (let i = Math.floor(b.x0 / CELL); i <= Math.floor(b.x1 / CELL); i++)
			for (let j = Math.floor(b.y0 / CELL); j <= Math.floor(b.y1 / CELL); j++) keys.push(`${i},${j}`);
		return keys;
	};
	return {
		isFree: (b: Box) =>
			cellsOf(b).every((key) =>
				(cells.get(key) ?? []).every((o) => b.x1 + MIN_GAP <= o.x0 || o.x1 + MIN_GAP <= b.x0 || b.y1 + MIN_GAP <= o.y0 || o.y1 + MIN_GAP <= b.y0),
			),
		take: (b: Box) => cellsOf(b).forEach((key) => group(cells, key, b)),
	};
};

/* The world on Mercator's projection, MAP_WIDTH wide, its cheeses small
   on it (see MAP_PILL), each in its country, as near the country's
   middle (or its own known spot) as there is room: the nearest free
   place inside the country, else the nearest free place at all. The
   countries with most cheeses first, so each keeps its own ground. */
export const layWorldMap = (family: Node, cheeses: Node[], map: Graph['map']): Panel => {
	const at = new Map<Node, { x: number; y: number }>();
	const top = PANEL_PADDING;
	const h = map.height * MAP_WIDTH + 2 * PANEL_PADDING;
	const placed = occupancy();
	const widths = cheeses.map((k) => k.w).sort((a, b) => a - b);
	const stepX = widths[Math.floor(widths.length / 2)] / 2;
	const stepY = cheeses[0]?.h * 1.15;
	// Steps out from a point, nearest first, as far as any country needs.
	const NEAR: [number, number][] = [];
	for (let i = -120; i <= 120; i++) for (let j = -120; j <= 120; j++) NEAR.push([i, j]);
	NEAR.sort(([a, b], [c, d]) => Math.hypot(a * stepX, b * stepY) - Math.hypot(c * stepX, d * stepY));
	const toPicture = ([x, y]: [number, number]): [number, number] => [x * MAP_WIDTH, top + y * MAP_WIDTH];
	const spotOf = (k: Node, middle: [number, number]) => (k.spot ? toPicture(k.spot) : middle);
	const byCountry = new Map<string, Node[]>();
	for (const k of cheeses) group(byCountry, k.place!, k);
	const countries = [...byCountry].sort((a, b) => b[1].length - a[1].length);
	for (const [iso, list] of countries) {
		const country = map.countries[iso];
		if (!country) continue;
		const middle = toPicture(country.label);
		const rings = country.rings.map((r) => r.map((v, i) => (i % 2 ? top + v * MAP_WIDTH : v * MAP_WIDTH)));
		// Those whose spot is known first, nearest it; the protected first of those; the rest about the country's middle.
		list.sort((a, b) => Number(!!b.spot) - Number(!!a.spot) || Number(!!b.protected) - Number(!!a.protected) || a.label.localeCompare(b.label));
		for (const k of list) {
			const [sx, sy] = spotOf(k, middle);
			const nearestFree = (inCountry: boolean) => {
				for (const [i, j] of NEAR) {
					const x = sx + i * stepX;
					const y = sy + j * stepY;
					const b = { x0: x - k.w / 2, x1: x + k.w / 2, y0: y - k.h / 2, y1: y + k.h / 2 };
					if ((!inCountry || isInside(rings, x, y)) && placed.isFree(b)) {
						placed.take(b);
						return { x, y };
					}
				}
				return null;
			};
			at.set(k, (rings.length ? nearestFree(true) : null) ?? nearestFree(false) ?? { x: sx, y: sy });
		}
	}
	family.w = Math.max(family.w, MAP_WIDTH);
	/* A pin for each region, at the middle of its cheeses' places, and one
	   at the country's middle for those whose region is not known. */
	const pins: Pin[] = [];
	for (const [iso, list] of countries) {
		const country = map.countries[iso];
		if (!country) continue;
		const middle = toPicture(country.label);
		const byRegion = new Map<string | undefined, Node[]>();
		for (const k of list) group(byRegion, k.area, k);
		for (const [area, ks] of byRegion) {
			const spots = area ? ks.map((k) => spotOf(k, middle)) : [middle];
			pins.push({
				iso,
				areas: [area],
				name: area ? `${area}, ${country.name}` : country.name,
				x: spots.reduce((s, [x]) => s + x, 0) / spots.length,
				y: spots.reduce((s, [, y]) => s + y, 0) / spots.length,
				r: PIN_RADIUS + PIN_GROWTH * Math.sqrt(ks.length),
				n: ks.length,
			});
		}
	}
	return { kind: 'map', w: family.w, h, rows: [], times: [], xOf: () => 0, at, pins };
};
