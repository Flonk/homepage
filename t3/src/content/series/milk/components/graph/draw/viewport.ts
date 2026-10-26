import { MARGIN } from '../client/base';
import { select } from 'd3-selection';
import { zoomIdentity } from 'd3-zoom';
import type { Drawing, Viewport } from './types';

/* The canvas, and the picture fitted into it: the whole framed and
   centred, as a viewBox would, with a margin round it as wide on the
   screen as the frame's gutter is, however big the pane. The zoom is in
   the pane's pixels on top of that. */
export const makeViewport = ({ figure, layout }: Drawing): Viewport => {
	const canvas = figure.querySelector<HTMLCanvasElement>('canvas.milk-canvas')!;
	const { bounds } = layout;
	const paneWidth = canvas.clientWidth || 1;
	const paneHeight = canvas.clientHeight || 1;
	const margin = MARGIN / (Math.min((paneWidth - 2 * MARGIN) / bounds.width, (paneHeight - 2 * MARGIN) / bounds.height) || 1);
	const view: Viewport = {
		canvas,
		canvasSelection: select(canvas),
		ctx: canvas.getContext('2d')!,
		paneWidth,
		paneHeight,
		pixelRatio: 1,
		framedBox: { x: bounds.x - margin, y: bounds.y - margin, width: bounds.width + 2 * margin, height: bounds.height + 2 * margin },
		fitScale: 1,
		fitOffsetX: 0,
		fitOffsetY: 0,
		zoom: zoomIdentity,
		refit: () => {
			const box = view.framedBox;
			view.fitScale = Math.min(view.paneWidth / box.width, view.paneHeight / box.height) || 1;
			view.fitOffsetX = (view.paneWidth - box.width * view.fitScale) / 2 - view.fitScale * box.x;
			view.fitOffsetY = (view.paneHeight - box.height * view.fitScale) / 2 - view.fitScale * box.y;
		},
		screenScale: () => view.zoom.k * view.fitScale,
		pictureToScreen: (x, y) => {
			const [px, py] = toPane(x, y);
			return [px * view.zoom.k + view.zoom.x, py * view.zoom.k + view.zoom.y] as const;
		},
		screenToPicture: (sx, sy) => ({
			x: ((sx - view.zoom.x) / view.zoom.k - view.fitOffsetX) / view.fitScale,
			y: ((sy - view.zoom.y) / view.zoom.k - view.fitOffsetY) / view.fitScale,
		}),
		zoomCentredOn: (x, y, k, cx = view.paneWidth / 2, cy = view.paneHeight / 2) => {
			const [px, py] = toPane(x, y);
			return zoomIdentity.translate(cx - k * px, cy - k * py).scale(k);
		},
	};
	// Unzoomed: where a point of the picture is in the pane.
	const toPane = (x: number, y: number) => [view.fitScale * x + view.fitOffsetX, view.fitScale * y + view.fitOffsetY] as const;
	view.refit();
	return view;
};
