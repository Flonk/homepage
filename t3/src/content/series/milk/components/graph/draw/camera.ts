import { type Node, MAX_ZOOM } from '../client/base';
import { zoom, type ZoomTransform } from 'd3-zoom';
import type { Camera, Drawing } from './types';

const GLIDE_MS = 750;
// How long after the last zoom or pan the picture counts as still again.
const STILL_AFTER_MS = 150;

/* Looked round as a map is: the wheel or a pinch to zoom, a drag on the
   ground or a node to pan, a double-click or double-tap to zoom in. */
export const makeCamera = (G: Drawing): Camera => {
	const { viewport } = G;
	let stillTimer = 0;
	G.signal.addEventListener('abort', () => clearTimeout(stillTimer));
	const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
		.scaleExtent([0.5, MAX_ZOOM])
		.on('zoom', (e) => {
			viewport.zoom = e.transform;
			if (G.pointer.shownRemark) G.pointer.showRemark(null);
			if (G.story.shown) G.story.close();
			G.frames.moving = true;
			clearTimeout(stillTimer);
			stillTimer = window.setTimeout(() => {
				G.frames.moving = false;
				G.frames.requestPaint();
			}, STILL_AFTER_MS);
			G.frames.requestPaint();
		});
	return {
		zoomBehavior,
		glideTo: (to: ZoomTransform, glide = true) => viewport.canvasSelection.transition().duration(glide ? GLIDE_MS : 0).call(zoomBehavior.transform, to),
		framing: (nodes: Node[], least: number) => {
			const x0 = Math.min(...nodes.map((d) => d.x - d.w / 2));
			const x1 = Math.max(...nodes.map((d) => d.x + d.w / 2));
			const y0 = Math.min(...nodes.map((d) => d.y - d.h / 2));
			const y1 = Math.max(...nodes.map((d) => d.y + d.h / 2));
			const fits = Math.min((0.9 * viewport.paneWidth) / (viewport.fitScale * (x1 - x0)), (0.9 * viewport.paneHeight) / (viewport.fitScale * (y1 - y0)));
			return viewport.zoomCentredOn((x0 + x1) / 2, (y0 + y1) / 2, Math.min(MAX_ZOOM, Math.max(least, fits)));
		},
	};
};
