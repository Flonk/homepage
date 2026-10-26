import type { Node, Arrow } from '../client/base';
import type { Drawing, Highlight } from './types';

/* Picking out a product: pointing at it, or having selected it, lights
   every arrow it is made along and everything made from it. A selected
   one stays so until the card is closed or another is selected. */
export const makeHighlight = (G: Drawing): Highlight => {
	// Looks different now: its sprites worked out again, and painted.
	const changed = () => {
		G.frames.sprites = null;
		G.frames.requestPaint();
	};
	const highlight: Highlight = {
		selected: null,
		selectedStep: null,
		inkedStep: null,
		litArrows: new Set(),
		/* Its own arrows, and on through any branch point at their far end,
		   which is no product of its own: pasteurised milk lights soured milk
		   and yoghurt past the point where "ferment" splits. */
		lightArrowsOf: (n) => {
			const lit = new Set<Arrow>();
			const follow = (from: Node, outward: boolean) => {
				for (const a of G.layout.arrows) {
					const next = outward ? (a.source === from ? a.target : null) : a.target === from ? a.source : null;
					if (!next) continue;
					lit.add(a);
					if (next.hub) follow(next, outward);
				}
			};
			// A branch point, a split's step, has no arrow of its own: every one through it.
			const through = (a: Arrow) => {
				for (let p = G.layout.parent.get(a.target); p && p !== a.source; p = G.layout.parent.get(p)) if (p === n) return true;
				return false;
			};
			if (n?.hub) for (const a of G.layout.arrows) if (through(a)) lit.add(a);
			if (n) {
				follow(n, true);
				follow(n, false);
			}
			highlight.litArrows = lit;
			changed();
		},
		inkStep: (n) => {
			highlight.inkedStep = n;
			changed();
		},
		drawingPlain: false,
		drawPlain: (draw) => {
			highlight.drawingPlain = true;
			try {
				draw();
			} finally {
				highlight.drawingPlain = false;
			}
		},
	};
	return highlight;
};
