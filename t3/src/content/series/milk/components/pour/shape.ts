/* The glass, a nosing glass, in metres, the bowl's floor's middle at the
   origin and y up: a round bowl, widest a third of the way up, closing
   to a chimney half as wide that flares a little at the lip, so the thin
   layers at the top stand taller there. Under it a solid foot.
   Its half-width at heights up the bowl, curved through. */
export const HEIGHT = 2.2;
export const KNOTS: [number, number][] = [
	[0, 0.36],
	[0.12, 0.66],
	[0.35, 0.9],
	[0.65, 0.97],
	[1, 0.86],
	[1.4, 0.62],
	[1.8, 0.47],
	[2.05, 0.445],
	[2.2, 0.44],
];
/* A spline through points (centripetal Catmull-Rom, which keeps to them
   without looping or cusping), each segment sampled this many times; the
   first and last points only guide it. */
export const spline = (points: number[][], each: number) => {
	const out: number[][] = [];
	const gap = (a: number[], b: number[]) => Math.max(1e-6, Math.hypot(b[0] - a[0], b[1] - a[1]) ** 0.5);
	const lerp = (a: number[], b: number[], ta: number, tb: number, t: number) =>
		a.map((v, k) => ((tb - t) / (tb - ta)) * v + ((t - ta) / (tb - ta)) * b[k]);
	for (let i = 1; i < points.length - 2; i++) {
		const [p0, p1, p2, p3] = [points[i - 1], points[i], points[i + 1], points[i + 2]];
		const t1 = gap(p0, p1);
		const t2 = t1 + gap(p1, p2);
		const t3 = t2 + gap(p2, p3);
		for (let j = 0; j < each; j++) {
			const t = t1 + ((t2 - t1) * j) / each;
			const a1 = lerp(p0, p1, 0, t1, t);
			const a2 = lerp(p1, p2, t1, t2, t);
			const a3 = lerp(p2, p3, t2, t3, t);
			out.push(lerp(lerp(a1, a2, 0, t2, t), lerp(a2, a3, t1, t3, t), t1, t2, t));
		}
	}
	out.push(points[points.length - 2]);
	return out;
};
// The bowl's inside, as [half-width, height] from its floor up, finely.
export const CURVE = spline(
	[[KNOTS[0][1], -0.15], ...KNOTS.map(([y, x]) => [x, y]), [KNOTS[KNOTS.length - 1][1], HEIGHT + 0.15]],
	30,
);
// Its half-width at a height, along it.
export const halfWidth = (y: number) => {
	if (y <= CURVE[0][1]) return CURVE[0][0];
	for (let k = 1; k < CURVE.length; k++) {
		const [x0, y0] = CURVE[k - 1];
		const [x1, y1] = CURVE[k];
		if (y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0 || 1);
	}
	return CURVE[CURVE.length - 1][0];
};
// The same more roughly, for the liquid's walls, which need no more.
export const SIDE = CURVE.filter((_, k) => k % 6 === 0 || k === CURVE.length - 1);
export const FLOOR = KNOTS[0][1];
export const WIDEST = Math.max(...SIDE.map(([x]) => x));
// The foot: a short stem down to a disc as wide as this.
export const FOOT = 0.4;
export const FOOT_WIDTH = 0.8;
// The glass's thickness: its walls, and under the bowl, solid down to the stem.
export const WALL = 0.035;
export const BOTTOM = 0.12;
/* A particle's radius: the water's, the finer one of the thin layers on
   it, so that they are layers of many drops and not a row of a few, and
   finer still for the minerals, the thinnest of them. */
export const RADIUS = 0.045;
export const FINE = 0.0112;
export const FINEST = FINE / 2;
// A particle is drawn larger than it is, that touching ones merge into one liquid.
export const DRAWN = 1.6;
// How much of the glass's height the milk fills.
export const FILL = 0.68;
/* As many particles as fill it that far, each taking about this much
   room, in squared radii, once the liquid has settled under its own weight. */
export const ROOM = 2.1;
export let area = 0;
for (let y = 0; y < FILL * HEIGHT; y += 0.005) area += 2 * halfWidth(y) * 0.005;
// The spout: straight over the mouth, a little above it, this many particles wide.
export const SPOUT_Y = HEIGHT + 0.35;
export const LANES = 4;
export const FINE_LANES = 4;
/* Each part poured at a slant, from over the mouth's left towards its
   right, so that it spreads as it lands rather than standing in a column:
   the water fast, the rest gently, so it does not plunge through the
   layers under it. Their speeds down, and across. */
export const SPOUT_SPEED = 6;
export const GENTLE_SPEED = 1.5;
export const SLANT = { x: -0.2, water: 1.2, rest: 0.8 };
// How much of the picture's height the glass, its foot and the spout over it take.
export const FRAME = FOOT + SPOUT_Y + 0.2;

/* The inside of the bowl, the corner where its wall meets its floor
   rounded, as glass is blown: from the wall FILLET up it to the floor
   as far in again, the corner the curve's guide. The liquid's own
   floor is the plain one; the difference is too small to see. */
export const FILLET = 0.06;
export const walls = CURVE.filter(([, y]) => y >= FILLET);
/* The glass's outside: one curve, the right side's, from its lip down
   the bowl's wall, round under its solid bottom into the stem, out
   along the foot's flare, round its edge and in along its flat bottom;
   the bowl's part of it through its knots, thick as WALL. */
export const OUTER = spline(
	[
		[KNOTS[KNOTS.length - 1][1] + WALL, HEIGHT + 0.15],
		...[...KNOTS].reverse().filter(([y]) => y >= 0.12).map(([y, x]) => [x + WALL, y]),
		[0.5, 0.02],
		[0.33, -0.06],
		[0.23, -0.13],
		[0.19, -0.2],
		[0.22, -0.27],
		[0.36, -0.33],
		[0.6, -FOOT + 0.048],
		[FOOT_WIDTH - 0.03, -FOOT + 0.038],
		[FOOT_WIDTH, -FOOT + 0.02],
		[FOOT_WIDTH - 0.025, -FOOT],
		[FOOT_WIDTH * 0.6, -FOOT],
		[0, -FOOT],
	],
	30,
);
// How wide the base is at a height, from the curve: the outermost of it there.
export const baseWidth = (y: number) => {
	let widest = 0;
	for (let k = 1; k < OUTER.length; k++) {
		const [x0, y0] = OUTER[k - 1];
		const [x1, y1] = OUTER[k];
		if ((y - y0) * (y - y1) > 0 || y0 === y1) continue;
		widest = Math.max(widest, x0 + ((x1 - x0) * (y - y0)) / (y1 - y0));
	}
	return widest;
};
/* The base's width down its height, worked out once: the strips the
   glass is shaded in each follow it, and it is the same every time the
   glass is drawn. */
export const FOOT_YS = Array.from({ length: 301 }, (_, k) => (-FOOT * k) / 300);
export const FOOT_WIDTHS = FOOT_YS.map(baseWidth);
