/* The field, in micrometres across, and how many globules and micelles
   are in it. */
export const FIELD = 30;
export const GLOBULES = 30;
export const MICELLES = 380;
/* The focus, at the front of the drop (0 the front, 1 the back); and how
   shallow it is: something this far behind it is as soft as it gets,
   SOFTEST micrometres of blur, and has all but faded into the water. */
export const FOCUS = 0;
export const DEPTH_OF_FIELD = 0.8;
export const SOFTEST = 2.6;
/* The large one, its centre outside the round field (radius FIELD / 2)
   so that a cap of it 2.5 µm deep reaches in. */
export const BIG = (() => {
	const r = 7;
	const a = -Math.PI / 5;
	const d = FIELD / 2 + r - 2.5;
	return { x: FIELD / 2 + Math.cos(a) * d, y: FIELD / 2 + Math.sin(a) * d, r, depth: 0.3 };
})();
// How far out of focus something at a depth is, 0 sharp to 1 as soft as it gets.
export const defocus = (depth: number) => Math.min(1, Math.abs(depth - FOCUS) / DEPTH_OF_FIELD);

/* A globule: where it is, how big, and its depth, 0 at the front of the
   drop and 1 at its back; drawn once, as out of focus as it is. */
export type Globule = { x: number; y: number; r: number; depth: number; sprite?: HTMLCanvasElement };
export type Micelle = { x: number; y: number; r: number; depth: number };

export const random = (a: number, b: number) => a + Math.random() * (b - a);
// Lognormal round a median of 3.5 µm across, as raw milk's globules are.
export const diameter = () =>
	Math.min(9, Math.max(0.8, 3.5 * Math.exp(0.45 * Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.cos(2 * Math.PI * Math.random()))));
