/**
 * Who is moving what, and what stops when a reader takes hold of something.
 *
 * A control that animates itself is easy right up to the moment there are
 * three of them showing one thing. The cube's channel bars are one colour
 * between them: taking hold of the red bar has to stop green and blue too, or
 * the colour a reader is trying to set goes on changing underneath them while
 * they set it. A bar that owns its own clock cannot know that. A bar that owns
 * nothing has to be driven from outside, which is what left four visualizations
 * each running a loop of their own.
 *
 * So the clock is neither in the control nor in the host: it is a context that
 * both join. A context holds any number of motions, runs them off one frame
 * loop, and — the part that matters — is held and released as a unit. Anything
 * in it can call `hold()`; everything in it stops, and they resume together
 * once the reader has been done for a few seconds.
 *
 *   const ctx = contextFor(el);       // the one on the nearest marked ancestor
 *   const drop = ctx.add(motion);     // returns how to leave again
 *   ctx.hold(6);                      // a reader is busy; back in six seconds
 *
 * A motion is a function of time and nothing else — no state to keep, no
 * direction to remember, nothing that can drift. `shuttle` in lib/shuttle.ts is
 * the one this series uses for anything that goes back and forth; a host with a
 * path of its own to walk supplies that instead and joins the same context, so
 * the same grab stops it too.
 */

export type Motion = {
	/** The value at `t` seconds into the run. */
	at(t: number): number;
	/** Where the value goes, every frame. */
	apply(value: number): void;
	/**
	 * Where to start the clock so the run passes through `value` on its way
	 * out. Without it a motion resumes from wherever its own clock had got to,
	 * which is right for a path and wrong for anything a reader can move.
	 */
	entry?(value: number): number;
};

export type Context = {
	/** Join. Returns the way out. */
	add(motion: Motion): () => void;
	/** Stop everything for `seconds`, then pick up where each motion now is. */
	hold(seconds: number): void;
	/** Running again now, rather than when the hold runs out. */
	release(): void;
	/** What the reader just did, so a resume starts from there. */
	note(motion: Motion, value: number): void;
	/** Off, and on again: a stage that has gone away, or come back. */
	stop(): void;
	start(): void;
	readonly held: boolean;
};

const CONTEXTS = new WeakMap<Element, Context>();

/**
 * The context an element belongs to: the one on its nearest ancestor marked
 * `data-anim-context`, or one of its own if there is no such ancestor.
 *
 * Declared in the markup rather than passed as a prop, because what shares a
 * clock is a question about the picture — these three bars are one colour —
 * and the markup is where that is already said.
 */
export function contextFor(el: Element): Context {
	const owner = el.closest('[data-anim-context]') ?? el;
	let found = CONTEXTS.get(owner);
	if (!found) CONTEXTS.set(owner, (found = makeContext()));
	return found;
}

export function makeContext(): Context {
	const motions = new Set<Motion>();
	/* One clock for the context, and an offset per motion into it, so a motion
	   joining late — or picking up after a reader has moved it — starts from
	   where its own value is rather than from wherever the others have got to. */
	const offset = new WeakMap<Motion, number>();
	const showing = new WeakMap<Motion, number>();
	const still = matchMedia('(prefers-reduced-motion: reduce)');

	let frame = 0;
	let last = 0;
	let clock = 0;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let held = false;
	let stopped = false;

	const pause = () => {
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
		last = 0;
	};

	const step = (now: number) => {
		clock += last ? (now - last) / 1000 : 0;
		last = now;
		for (const m of motions) {
			const value = m.at(clock - (offset.get(m) ?? 0));
			showing.set(m, value);
			m.apply(value);
		}
		frame = requestAnimationFrame(step);
	};

	const run = () => {
		if (frame || stopped || held || still.matches || !motions.size) return;
		last = 0;
		frame = requestAnimationFrame(step);
	};

	/* Where a motion would have to start to be showing what it is showing. */
	const reseat = (m: Motion) => offset.set(m, clock - (m.entry?.(showing.get(m) ?? 0) ?? 0));

	const ctx: Context = {
		add(motion) {
			motions.add(motion);
			reseat(motion);
			run();
			return () => {
				motions.delete(motion);
				if (!motions.size) pause();
			};
		},
		note(motion, value) {
			showing.set(motion, value);
		},
		hold(seconds) {
			held = true;
			pause();
			if (timer !== null) clearTimeout(timer);
			timer = setTimeout(() => ctx.release(), Math.max(0, seconds) * 1000);
		},
		release() {
			if (timer !== null) clearTimeout(timer);
			timer = null;
			held = false;
			// From what each is showing now, which a reader may well have moved.
			for (const m of motions) reseat(m);
			run();
		},
		stop() {
			stopped = true;
			pause();
		},
		start() {
			stopped = false;
			run();
		},
		get held() {
			return held;
		},
	};

	still.addEventListener('change', () => (still.matches ? pause() : run()));

	return ctx;
}
