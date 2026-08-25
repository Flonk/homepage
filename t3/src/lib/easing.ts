/**
 * Ways of arriving somewhere, for the motions that are not a back-and-forth.
 *
 * `shuttle` in lib/shuttle is the series' signature pacing and knows where it
 * is going from the start. These are the other two shapes the vizzes use: a
 * chase, which is told where to go while it is already moving, and a sine,
 * which is the obvious pacing the shuttle exists to argue against.
 */

/** How much of the gap is closed per second, by default. */
const RATE = 4;

/**
 * One frame of an exponential approach: a fraction of what is left, every
 * second, rather than a fixed step.
 *
 * Chosen for one property: the target is allowed to move. A path has to be
 * re-planned when its destination changes and an eased tween has to be
 * restarted, but a chase only ever reads where it is and where it is going, so
 * a target that jumps out from under it — every couple of seconds, on the
 * cube's corner tour — needs no special case at all.
 *
 * `dt` is seconds, so the rate is the same however often the frames come.
 */
export function approach(from: number, to: number, dt: number, rate = RATE): number {
	return from + (to - from) * (1 - Math.exp(-rate * dt));
}

/**
 * The same chase written as a function of time, for a caller that has to be
 * able to say where it would be at `t` rather than step it a frame at a time —
 * anything joining an animation context, which asks its motions for a value
 * and not for an update.
 *
 * The stops repeat, so the whole thing is periodic and `t` only has to be
 * walked from the top of the current lap.
 */
export function chaseAt(t: number, stops: number[], seconds: number, rate = RATE): number {
	const lap = stops.length * seconds;
	const into = ((t % lap) + lap) % lap;
	// Where the lap begins is where the previous one ended, which is the same
	// value every time round: settle it by running one lap from the first stop.
	let at = stops[0];
	for (const stop of stops) at = approach(at, stop, seconds, rate);
	for (let i = 0; i < stops.length; i++) {
		const span = Math.min(seconds, into - i * seconds);
		if (span <= 0) break;
		at = approach(at, stops[i], span, rate);
	}
	return at;
}
