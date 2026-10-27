import type { Node } from '../client/base';
import type { Box } from '../layout';
import { said as regionsSaid } from '../render/Regions';
import { said as animalsSaid } from '../render/Beasts';
import { SEAL } from '../render/Cheese';
import type { Drawing, Hit, Pointer, Remark } from './types';

// How wide, in screen pixels, the unseen band along an arrow is that hovers or clicks it.
const ARROW_HIT_WIDTH = 14;

const within = (b: Box, x: number, y: number) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1;

/* Hovering and clicking: what is under the pointer is lit, its hint
   given as the canvas's title, a remark's mark said in a tip; clicked,
   a pill or step opens its card. */
export const makePointer = (G: Drawing): Pointer => {
	const { layout, viewport, highlight, markPainter } = G;
	const { canvas } = viewport;

	/* A pill (milk a circle), a remark's mark, or failing those a step with
	   something to tell: its card chain, its label, or a band along its
	   arrow. A flag, an animal, a seal or a photograph gives its hint. */
	const hitTest = (e: MouseEvent): Hit => {
		const rect = canvas.getBoundingClientRect();
		const sx = e.clientX - rect.left;
		const sy = e.clientY - rect.top;
		const { x, y } = viewport.screenToPicture(sx, sy);
		const s = viewport.screenScale();
		let hint = '';
		// Within a round mark, or so much further out.
		const hit = (m: { x: number; y: number; r: number }, slack = 1) => Math.hypot(x - m.x, y - m.y) <= m.r * slack;
		// Only those near the pointer, their marks reaching a little past their edges.
		const near = layout.nodesWithPills.filter((d) => d === layout.root || (Math.abs(x - d.x) <= d.w / 2 + d.h && Math.abs(y - d.y) <= d.h * 1.5));
		// The last said wins: a seal over animals over flags.
		for (const d of near) {
			if (d.regions?.length && markPainter.flagSpots(d).some((f) => hit(f))) hint = regionsSaid(d.regions);
			if (d.beasts?.length && markPainter.animalSpots(d).some((b) => hit(b))) hint = animalsSaid(d.beasts);
			if (d.protected && hit(markPainter.sealSpot(d))) hint = SEAL[d.protected] ?? d.protected;
		}
		// Dev mode's marks are on arrows, so looked for on every node; then remarks on the pills near. A little past the mark, to be tapped.
		const remark =
			(G.devMarks.enabled() ? layout.nodesWithPills.flatMap((d) => G.devMarks.marksOf(d)).find((m) => hit(m, 1.3)) : undefined) ??
			near.flatMap((d) => (d.unsure ? markPainter.remarksOf(d) : [])).find((m) => hit(m, 1.3)) ??
			null;
		// A story's bubble, over everything on its pill.
		const story = [...near].reverse().find((d) => d.story && within(markPainter.storyBox(d), x, y)) ?? null;
		let pill: Node | null = null;
		for (let i = near.length - 1; i >= 0 && !pill && !remark && !story; i--) {
			const d = near[i];
			const over = d === layout.root ? Math.hypot(x - d.x, y - d.y) <= layout.milkRadius : Math.abs(x - d.x) <= d.w / 2 && Math.abs(y - d.y) <= d.h / 2;
			if (!over) continue;
			pill = d;
			if (!hint && d.image && x <= d.x - d.w / 2 + layout.photoSize(d)) hint = d.image.credit;
		}
		let step: Node | null = null;
		if (!pill && !remark && !story) {
			step =
				layout.nodesWithCardChain.find((n) => layout.hasStepDetails(n) && within(layout.cardChainOf(n).area, x, y)) ??
				layout.nodesWithStepLabel.find((n) => layout.hasStepDetails(n) && !layout.hasCardChain(n) && within(layout.stepLabelBox(n), x, y)) ??
				null;
			if (!step) {
				const [ox, oy] = viewport.pictureToScreen(0, 0);
				viewport.ctx.setTransform(s, 0, 0, s, ox, oy);
				viewport.ctx.lineWidth = ARROW_HIT_WIDTH;
				step = layout.clickableArrows.find((a) => viewport.ctx.isPointInStroke(layout.arrowCentreLine.get(a)!, sx, sy))?.target ?? null;
			}
		}
		return { pill, step, hint, remark, story };
	};

	// Gone once the picture moves.
	const tip = G.figure.querySelector<HTMLElement>('.milk-note')!;
	const showRemark = (r: Remark | null, pin = false) => {
		pointer.shownRemark = r;
		pointer.remarkPinned = !!r && pin;
		tip.hidden = !r;
		if (!r) return;
		tip.textContent = r.text;
		const [x, y] = viewport.pictureToScreen(r.x, r.y);
		tip.style.left = `${canvas.offsetLeft + x}px`;
		tip.style.top = `${canvas.offsetTop + y + r.r * viewport.screenScale()}px`;
	};
	const pointer: Pointer = { hitTest, showRemark, shownRemark: null, remarkPinned: false, hovered: { pill: null, step: null, story: null }, raised: new Map() };

	/* A story's bubble rising as it is hovered and settling as it is left:
	   how far up each is, 0 to 1 (eased in drawStory). Off the ground it
	   is drawn over the rest every frame, its sprite let be (see frames.ts),
	   so the sprites are listed again as one leaves the ground or lands. */
	const RISE_MS = 160;
	let rising = 0;
	const rise = (story: Node | null) => {
		if (story && !pointer.raised.has(story)) {
			pointer.raised.set(story, 0);
			G.frames.sprites = null;
		}
		let last = performance.now();
		const tick = (now: number) => {
			if (G.signal.aborted) return;
			// A frame's time can be a little before the moment it was asked for.
			const step = Math.max(0, now - last) / RISE_MS;
			last = now;
			const aim = (n: Node) => (n === pointer.hovered.story ? 1 : 0);
			for (const [n, v] of pointer.raised) {
				const next = aim(n) > v ? Math.min(1, v + step) : Math.max(0, v - step);
				if (next > 0 || aim(n)) pointer.raised.set(n, next);
				else {
					pointer.raised.delete(n);
					G.frames.sprites = null;
				}
			}
			G.frames.requestPaint();
			rising = [...pointer.raised].some(([n, v]) => v !== aim(n)) ? requestAnimationFrame(tick) : 0;
		};
		if (!rising) rising = requestAnimationFrame(tick);
	};

	canvas.addEventListener(
		'pointermove',
		(e) => {
			if (e.pointerType !== 'mouse' || e.buttons) return;
			const { pill, step, hint, remark, story } = hitTest(e);
			if (!pointer.remarkPinned && !markPainter.sameRemark(remark, pointer.shownRemark)) showRemark(remark);
			if (pill !== pointer.hovered.pill) highlight.lightArrowsOf(pill ?? highlight.selected);
			if (step !== pointer.hovered.step && !highlight.selectedStep) highlight.inkStep(step);
			const storyChanged = story !== pointer.hovered.story;
			pointer.hovered = { pill, step, story };
			if (storyChanged) rise(story);
			canvas.style.cursor = story || step || remark || pill?.link ? 'pointer' : '';
			canvas.title = hint;
		},
		{ signal: G.signal },
	);
	canvas.addEventListener(
		'pointerleave',
		() => {
			if (!pointer.remarkPinned) showRemark(null);
			if (pointer.hovered.pill) highlight.lightArrowsOf(highlight.selected);
			if (pointer.hovered.step && !highlight.selectedStep) highlight.inkStep(null);
			const wasStory = pointer.hovered.story;
			pointer.hovered = { pill: null, step: null, story: null };
			if (wasStory) rise(null);
		},
		{ signal: G.signal },
	);
	canvas.addEventListener(
		'click',
		(e) => {
			const { pill, step, remark, story } = hitTest(e);
			/* A story's bubble opens its story. Open, a tap anywhere only shuts
			   it, as a popover is shut; on another bubble, that one opens. */
			const wasTold = G.story.shown;
			if (wasTold) G.story.close();
			if (story && story !== wasTold) return G.story.open(story);
			if (wasTold) return;
			// A remark's mark only says it, pinned; tapped again, unpinned.
			if (remark) return showRemark(markPainter.sameRemark(pointer.shownRemark, remark) && pointer.remarkPinned ? null : remark, true);
			showRemark(null);
			// A link only goes to the product it is of, lit, without its card.
			if (pill?.link) G.search.goTo(pill, true);
			else if (pill) G.infoCard.showNode(pill);
			else if (step) G.infoCard.showStep(step);
			else G.infoCard.close();
		},
		{ signal: G.signal },
	);
	return pointer;
};
