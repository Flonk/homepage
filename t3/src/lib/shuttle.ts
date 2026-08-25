/**
 * The pacing every back-and-forth in the Colour series walks to.
 *
 * Three of them had grown their own copy of the same triangle wave — the cone
 * curves' mark, the photon's frequency, the knob between two colours — and a
 * constant rate has the same fault in all three: it arrives at the end of the
 * run at full speed and reverses on the spot. The eye reads that as a bounce
 * off a wall, and the ends of a run are usually the part worth looking at.
 *
 * Not a sine, though, which is the obvious fix and the wrong one. A sinusoid
 * is easing everywhere and constant nowhere, so nothing in the middle of the
 * run has a steady rate to be read against; it always looks like something
 * being swung rather than something being scanned. What this does instead is
 * the trapezoid a machine tool moves on: accelerate briefly, hold one speed
 * across the middle, decelerate briefly, and then *stop* — a couple of seconds
 * at each end, so the turn reads as a decision rather than a rebound, and so a
 * reader glancing up at the far end of the run has time to see it.
 *
 * Everything here is in phase, 0 to 1. What that phase means — nanometres,
 * a frequency decade, how much of one colour is in another — is the caller's
 * business, and every one of them maps it differently.
 */

/** How a shuttle spends its time. Seconds, except `edge`. */
export type Shuttle = {
	/** One round trip of travel, not counting the pauses at either end. */
	seconds: number;
	/** How long it rests at each end before starting back. */
	hold?: number;
	/**
	 * The fraction of a single leg spent getting up to speed, and again coming
	 * off it. Small on purpose: this is a run at a steady rate with the corners
	 * taken off, not an ease. At 0.5 the middle disappears and what is left is
	 * a smoothstep — soft, and no longer honest about rate.
	 */
	edge?: number;
};

const HOLD = 2;
const EDGE = 0.2;

/* The trapezoid, integrated. Velocity ramps from nothing to `top` over the
   first `e` of the leg, holds, and ramps back down over the last `e`; `top` is
   whatever makes the whole leg add up to exactly 1. */
function ease(p: number, e: number): number {
	if (e <= 0) return p;
	const top = 1 / (1 - e);
	if (p < e) return (top * p * p) / (2 * e);
	if (p <= 1 - e) return top * (p - e / 2);
	const left = 1 - p;
	return 1 - (top * left * left) / (2 * e);
}

/** The same curve read backwards: which p arrives at this position. */
function unease(x: number, e: number): number {
	if (e <= 0) return x;
	const top = 1 / (1 - e);
	const first = (top * e) / 2;
	if (x < first) return Math.sqrt((2 * e * x) / top);
	if (x <= 1 - first) return x / top + e / 2;
	return 1 - Math.sqrt((2 * e * (1 - x)) / top);
}

/**
 * Where the shuttle stands, `t` seconds into its run: out, a pause, back, a
 * pause, forever.
 */
export function shuttleAt(t: number, { seconds, hold = HOLD, edge = EDGE }: Shuttle): number {
	const leg = Math.max(0.001, seconds / 2);
	const period = 2 * leg + 2 * hold;
	const u = ((t % period) + period) % period;
	if (u < leg) return ease(u / leg, edge);
	if (u < leg + hold) return 1;
	if (u < 2 * leg + hold) return 1 - ease((u - leg - hold) / leg, edge);
	return 0;
}

/**
 * The clock reading that puts the shuttle at `at` on its way out.
 *
 * For picking the walk back up after a reader has moved the thing themselves:
 * start the clock here and it carries on from where they left it rather than
 * jumping to wherever it would have got to on its own.
 */
export function shuttleEntry(at: number, { seconds, edge = EDGE }: Shuttle): number {
	const leg = Math.max(0.001, seconds / 2);
	return unease(Math.min(1, Math.max(0, at)), edge) * leg;
}

/**
 * The sinusoid the trapezoid above exists to argue against, on the same clock
 * so the two can be swapped and compared.
 *
 * It takes `hold` only to match the round trip: a sine has no pause at the
 * ends — that is the whole of what is wrong with it — but a shape that also
 * took less time would be telling you two things at once.
 */
export function sineAt(t: number, { seconds, hold = HOLD }: Shuttle): number {
	const cycle = seconds + 2 * hold;
	return 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / cycle);
}
