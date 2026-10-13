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
 *
 * Set up as soon as the page is in, on `astro:after-swap`, which comes before
 * the transition takes its picture of the new page: a deck set up any later
 * is caught with no card chosen and nothing drawn, and the reader sees it
 * fall into place after the fade. A script new to the visit is run before
 * its page's swap for the same reason (below). `astro:page-load` covers the
 * page landed on; whichever comes first for a page is the one that runs.
 */
export function eachPage(setup: (signal: AbortSignal) => void): void {
	let page: Element | null = null;
	const run = () => {
		if (page === document.body) return;
		page = document.body;
		const leaving = new AbortController();
		document.addEventListener('astro:before-swap', () => leaving.abort(), { once: true });
		setup(leaving.signal);
	};
	document.addEventListener('astro:after-swap', run);
	document.addEventListener('astro:page-load', run);
}

/*
 * The next page's scripts, run before it is swapped in rather than after.
 *
 * The router runs a page's scripts once the page is in, and each script once
 * a visit. So the first time a reader comes to a page with a script none of
 * the pages before had, a deck's say, the script arrives after the swap and
 * after the transition has taken its picture of the page: the page fades in
 * empty where the deck should be, and the deck turns up all at once after.
 * Run as the page is loaded instead, the script has set its `eachPage` up by
 * the swap, and the page fades in drawn.
 *
 * In the order the page has them, as the router would run them: a deck sets
 * its pictures going through events, and the pictures have to be listening
 * first. Fetched together, then run one by one. Nothing here runs twice when
 * the router comes to it, a module being run once however it is asked for;
 * but it runs while the page being left is still in, which is one more reason
 * a script sets up in `eachPage` and touches no page at its top.
 */
document.addEventListener('astro:before-preparation', (e) => {
	const load = e.loader;
	e.loader = async () => {
		await load();
		const ran = new Set([...document.scripts].map((script) => script.src));
		const scripts = [...e.newDocument.body.querySelectorAll('script[type="module"][src]')]
			.map((script) => new URL(script.getAttribute('src')!, e.to).href)
			.filter((src) => !ran.has(src));
		for (const src of scripts) {
			const link = document.createElement('link');
			link.rel = 'modulepreload';
			link.href = src;
			document.head.append(link);
		}
		for (const src of scripts) await import(/* @vite-ignore */ src).catch(() => {});
	};
});

/**
 * Custom properties a script sets on `<html>`, kept from one page to the
 * next. A swap gives `<html>` the attributes of the page coming in, its style
 * among them, and with it would go whatever a script had put there: the
 * split where the reader left it, the chrome's glow where the pointer had
 * pulled it. Put back the moment the new page is in, before anything is
 * worked out from them, so that one eased by a transition is not seen to
 * set off back to where it starts and then return.
 *
 * Only the names given are kept; whatever the page coming in sets on
 * `<html>` itself, such as its accent, is its own.
 */
export function keepOnRoot(...names: string[]): void {
	document.addEventListener('astro:before-swap', (e) => {
		const style = document.documentElement.style;
		const kept = names
			.map((name) => [name, style.getPropertyValue(name)] as const)
			.filter(([, value]) => value);
		const swap = e.swap;
		e.swap = () => {
			swap();
			for (const [name, value] of kept) style.setProperty(name, value);
		};
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
