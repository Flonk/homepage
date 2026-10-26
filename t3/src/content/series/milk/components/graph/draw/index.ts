import 'd3-transition';
import { setSpacing, type Graph } from '../client/base';
import { layout } from '../layout';
import type { Drawing } from './types';
import { makeViewport } from './viewport';
import { makeAppearance } from './appearance';
import { makeHighlight } from './highlight';
import { makePillPainter } from './pillPainter';
import { makeMarkPainter } from './markPainter';
import { makePanelPainter } from './panelPainter';
import { makeSpriteCache } from './sprites';
import { makeFramePainter } from './frames';
import { makeDevMarks } from './dev';
import { makePointer } from './pointer';
import { makeCamera } from './camera';
import { makeSearch } from './search';
import { makeInfoCard } from './infoCard';

/* Draws the graph given, the whole of it or what an animal filter left of
   it, into the figure's canvas, until `signal` aborts. Each part of the
   drawing is made in turn and added to it (see Drawing): a part uses the
   parts made before it as it is made, and any of them once running. */
export function draw(figure: HTMLElement, signal: AbortSignal, data: Graph, filtered = false) {
	// As the words in it are spaced (see measure).
	setSpacing(parseFloat(getComputedStyle(figure).letterSpacing) || 0);
	const G = { figure, signal, data, filtered, layout: layout(data) } as Drawing;
	G.viewport = makeViewport(G);
	G.appearance = makeAppearance(G);
	G.highlight = makeHighlight(G);
	G.pillPainter = makePillPainter(G);
	G.markPainter = makeMarkPainter(G);
	G.panelPainter = makePanelPainter(G);
	G.sprites = makeSpriteCache(G);
	G.frames = makeFramePainter(G);
	G.devMarks = makeDevMarks(G);
	G.pointer = makePointer(G);
	G.camera = makeCamera(G);
	G.search = makeSearch(G);
	G.infoCard = makeInfoCard(G);

	G.viewport.canvasSelection.call(G.camera.zoomBehavior);
	G.frames.sizeToPane();
	G.frames.resizeObserver.observe(G.viewport.canvas);
	G.frames.paintNow();
	G.frames.buildOverview();
	// Opened on the card's product, unless filtered, which is framed whole.
	if (figure.dataset.focus && !filtered) G.infoCard.focusOn(figure.dataset.focus, false);
}
