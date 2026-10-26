import { CORNER, headWidth, headLength } from '../client/base';
import type { ArrowRoute, Point } from './types';

// Unit direction from point i to point i + 1.
const direction = (points: Point[], i: number): Point => {
	const [ax, ay] = points[i];
	const [bx, by] = points[i + 1];
	const len = Math.hypot(bx - ax, by - ay) || 1;
	return [(bx - ax) / len, (by - ay) / len];
};
const segmentLength = (points: Point[], i: number) => Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
// The left of going in direction `d`.
const leftOf = (d: Point): Point => [-d[1], d[0]];
// A point moved sideways off a line going in direction `d`: to its left for positive `by`.
const sideways = (q: Point, d: Point, by: number): Point => [q[0] - d[1] * by, q[1] + d[0] * by];
/* A corner moved sideways by `by` off both lines meeting there, to where
   the two lines so moved cross: further out the sharper the turn. */
const cornerSideways = (q: Point, din: Point, dout: Point, by: number): Point => {
	const [a, b] = [leftOf(din), leftOf(dout)];
	const k = by / (1 + a[0] * b[0] + a[1] * b[1]);
	return [q[0] + (a[0] + b[0]) * k, q[1] + (a[1] + b[1]) * k];
};
// Which way a corner turns: 1 to the left, -1 to the right, 0 straight on.
const turnOf = (din: Point, dout: Point) => Math.sign(din[0] * dout[1] - din[1] * dout[0]);
// How far from a corner a curve of radius r round it begins and ends: r for a quarter turn, less for a gentler one.
const tangentLength = (din: Point, dout: Point, r: number) => r * Math.tan(Math.acos(Math.max(-1, Math.min(1, din[0] * dout[0] + din[1] * dout[1]))) / 2);

/* The same route moved sideways by `by`, as a strand lies beside the
   middle of the line it is in: each corner moved off both segments
   meeting there, and rounder round the outside of a bend, tighter round
   the inside. */
export const offsetRoute = ({ points, bends }: ArrowRoute, by: number): ArrowRoute => {
	const n = points.length - 1;
	const dir = (i: number) => direction(points, i);
	return {
		points: points.map((q, i) => (i === 0 ? sideways(q, dir(0), by) : i === n ? sideways(q, dir(n - 1), by) : cornerSideways(q, dir(i - 1), dir(i), by))),
		bends: bends.map((r, i) => (i === 0 || i >= n ? r : Math.max(0, r - turnOf(dir(i - 1), dir(i)) * by))),
	};
};

/* An arrow as one filled shape, SVG path data: both edges of a line
   `width` wide, round its corners, and with `withHead`, in to a point.
   Not a stroked line with a head put on its end, which shows a hairline
   seam between the two. */
export const arrowOutlinePath = ({ points: p, bends }: ArrowRoute, width: number, withHead: boolean) => {
	const w = width / 2;
	const n = p.length - 1;
	const dir = (i: number) => direction(p, i);
	const len = (i: number) => segmentLength(p, i);
	// Each corner's middle radius, no rounder than both segments meeting there have room for.
	const radius = (i: number) => {
		const t = tangentLength(dir(i - 1), dir(i), 1);
		return Math.min(bends[i] ?? CORNER, t ? Math.min(len(i - 1), len(i)) / t : Infinity);
	};
	// One edge, `side` 1 the left and -1 the right: each point, and the control point of the curve into it if it is one.
	const edge = (side: number) => {
		const out: { p: Point; c?: Point }[] = [{ p: sideways(p[0], dir(0), side * w) }];
		for (let i = 1; i < n; i++) {
			const din = dir(i - 1);
			const dout = dir(i);
			const corner = cornerSideways(p[i], din, dout, side * w);
			// On the inside of the turn this edge's curve is tighter than the middle's, on the outside rounder.
			const r = radius(i) - side * turnOf(din, dout) * w;
			const t = tangentLength(din, dout, r);
			if (r <= 0 || !t) out.push({ p: corner });
			else {
				out.push({ p: [corner[0] - din[0] * t, corner[1] - din[1] * t] });
				out.push({ p: [corner[0] + dout[0] * t, corner[1] + dout[1] * t], c: corner });
			}
		}
		const d = dir(n - 1);
		if (withHead) {
			// The head: from as far back as it is long, out to its width, in to the point.
			const curve = n > 1 ? tangentLength(dir(n - 2), d, radius(n - 1)) : 0;
			const back = Math.max(0, Math.min(headLength(2 * w), len(n - 1) - curve));
			const base: Point = [p[n][0] - d[0] * back, p[n][1] - d[1] * back];
			out.push({ p: sideways(base, d, side * w) });
			out.push({ p: sideways(base, d, (side * headWidth(2 * w)) / 2) });
		} else out.push({ p: sideways(p[n], d, side * w) });
		return out;
	};
	const left = edge(1);
	const right = edge(-1);
	const to = ({ p: [x, y], c }: { p: Point; c?: Point }) => (c ? `Q${c[0]},${c[1]} ${x},${y}` : `L${x},${y}`);
	let d = `M${left[0].p[0]},${left[0].p[1]}` + left.slice(1).map(to).join('');
	if (withHead) d += `L${p[n][0]},${p[n][1]}`;
	// Back along the other edge, each curve now from its other end.
	for (let i = right.length - 1; i >= 0; i--) d += i === right.length - 1 ? `L${right[i].p[0]},${right[i].p[1]}` : to({ p: right[i].p, c: right[i + 1].c });
	return d + 'Z';
};

/* A route's middle line, SVG path data: straight segments with each
   corner rounded off by as much as both segments meeting there have room for. */
export const centreLinePath = ({ points: p, bends }: ArrowRoute) => {
	let d = `M${p[0][0]},${p[0][1]}`;
	for (let i = 1; i < p.length - 1; i++) {
		const din = direction(p, i - 1);
		const dout = direction(p, i);
		const t = Math.min(tangentLength(din, dout, bends[i] ?? CORNER), segmentLength(p, i - 1), segmentLength(p, i));
		const [cx, cy] = p[i];
		if (t < 0.5) {
			d += `L${cx},${cy}`;
			continue;
		}
		d += `L${cx - din[0] * t},${cy - din[1] * t}Q${cx},${cy} ${cx + dout[0] * t},${cy + dout[1] * t}`;
	}
	const [lx, ly] = p[p.length - 1];
	return d + `L${lx},${ly}`;
};
