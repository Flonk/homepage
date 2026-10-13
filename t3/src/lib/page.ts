/**
 * The life of a page, under Astro's client router.
 *
 * Clicking a post no longer loads a new document: the router fetches the next
 * page, swaps it in and keeps the post tree where it is. That changes what a
 * component's script can assume. A bundled script runs once per visit, not
 * once per page, so a script that set itself up at the top level would find
 * the first page's elements and nothing after; and whatever it hung on
 * `window` or `document`, or left running in an animation frame, would carry
 * on after its page had gone, once more for every page that had it.
 *
 * So a component sets up in `eachPage` instead. `setup` runs for the page the
 * reader lands on and again for every page swapped in after it, and the
 * signal it is handed aborts as that page is swapped out: pass it to every
 * listener added outside the component's own elements, and stop anything
 * still running when it fires.
 */
export function eachPage(setup: (signal: AbortSignal) => void): void {
	document.addEventListener('astro:page-load', () => {
		const page = new AbortController();
		document.addEventListener('astro:before-swap', () => page.abort(), { once: true });
		setup(page.signal);
	});
}

/**
 * Hands a WebGL context back when its page goes. A browser keeps only a
 * handful alive at once and drops the oldest past that, so a page that left
 * its contexts behind would, a few pages later, blank a picture on screen.
 */
export function releaseOnLeave(gl: WebGLRenderingContext | WebGL2RenderingContext, signal: AbortSignal): void {
	signal.addEventListener('abort', () => gl.getExtension('WEBGL_lose_context')?.loseContext(), {
		once: true,
	});
}
