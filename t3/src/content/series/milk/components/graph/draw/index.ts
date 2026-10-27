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
import { makeStory } from './story';
import { linked } from './link';

/* Draws the graph given, the whole of it or what an animal filter left of
   it, into the figure's canvas, until `signal` aborts. Each part of the
   drawing is made in turn and added to it (see Drawing): a part uses the
   parts made before it as it is made, and any of them once running. */
export function draw(figure: HTMLElement, signal: AbortSignal, data: Graph, filtered = false) {
	// As the words in it are spaced (see measure).
	setSpacing(parseFloat(getComputedStyle(figure).letterSpacing) || 0);
	const G = { figure, signal, data, filtered, layout: layout(data) } as Drawing;
	// Those with a story, each rendered into the page in a template of its own (see MilkGraph.astro).
	const told = new Set([...figure.querySelectorAll<HTMLTemplateElement>('template[data-milk-story]')].map((t) => t.dataset.milkStory));
	for (const n of G.layout.nodes) if (told.has(n.id)) n.story = true;
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
	G.story = makeStory(G);

	G.viewport.canvasSelection.call(G.camera.zoomBehavior);
	G.frames.sizeToPane();
	G.frames.resizeObserver.observe(G.viewport.canvas);
	G.frames.paintNow();
	G.frames.buildOverview();
	/* Opened on the product in the address (see link.ts), lit but without
	   its card; else on the card's product. Unless filtered, which is
	   framed whole. */
	const link = linked();
	const open = link ? G.layout.nodes.find((n) => n.id === link) : undefined;
	if (link && !open) console.warn(`MilkGraph: no node ${link} to open on`);
	if (filtered) return;
	if (open) G.search.goTo(open, true);
	else if (figure.dataset.focus) G.infoCard.focusOn(figure.dataset.focus, false);
}
