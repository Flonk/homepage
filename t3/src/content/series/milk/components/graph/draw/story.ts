import type { Node } from '../client/base';
import { el } from '../render/dom';
import type { Drawing, Story } from './types';

// The least room, in CSS pixels, between the popover and the pane's edges, and between it and its bubble.
const EDGE = 12;
const GAP = 6;

/* A story told of a product, in a popover that grows out of the T3
   bubble on its pill: on the page's own dark ground, in its serif, under
   its name, its component, rendered into the page once (see
   stories/index.ts). Below its bubble, or above where there is no room
   below; shut by its button, Escape, a tap anywhere, or the picture
   moving. */
export const makeStory = (G: Drawing): Story => {
	const { viewport, markPainter, search } = G;
	const pop = G.figure.querySelector<HTMLElement>('.milk-story')!;
	const body = pop.querySelector<HTMLElement>('.milk-story-body')!;

	const open = (n: Node) => {
		const told = G.figure.querySelector<HTMLTemplateElement>(`template[data-milk-story="${n.id}"]`)!;
		body.replaceChildren(el('h3', '', search.displayName(n)), told.content.cloneNode(true));
		body.scrollTop = 0;
		pop.setAttribute('aria-label', `A story of ${search.displayName(n)}`);

		// Placed by its bubble on the screen, kept within the pane; grown from the bubble.
		const b = markPainter.storyBox(n);
		const [x0, y0] = viewport.pictureToScreen(b.x0, b.y0);
		const [x1, y1] = viewport.pictureToScreen(b.x1, b.y1);
		const { canvas } = viewport;
		const w = pop.offsetWidth;
		const h = pop.offsetHeight;
		const left = Math.max(EDGE, Math.min(x0, viewport.paneWidth - w - EDGE));
		const below = y1 + GAP + h <= viewport.paneHeight - EDGE || y0 - GAP - h < EDGE;
		const top = below ? Math.min(y1 + GAP, Math.max(EDGE, viewport.paneHeight - h - EDGE)) : y0 - GAP - h;
		pop.style.left = `${canvas.offsetLeft + left}px`;
		pop.style.top = `${canvas.offsetTop + top}px`;
		pop.style.transformOrigin = `${(x0 + x1) / 2 - left}px ${(below ? y0 : y1) - top}px`;
		pop.classList.add('is-open');
		pop.inert = false;
		story.shown = n;
	};
	const close = () => {
		pop.classList.remove('is-open');
		pop.inert = true;
		story.shown = null;
	};
	pop.querySelector('.milk-story-close')!.addEventListener('click', close, { signal: G.signal });
	document.addEventListener('keydown', (e) => e.key === 'Escape' && story.shown && close(), { signal: G.signal });
	// A press anywhere but on it or the picture (whose taps the pointer sees to, see pointer.ts).
	document.addEventListener('pointerdown', (e) => story.shown && !pop.contains(e.target as globalThis.Node) && e.target !== viewport.canvas && close(), { signal: G.signal });

	const story: Story = { shown: null, open, close };
	return story;
};
