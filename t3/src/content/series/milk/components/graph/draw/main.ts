import { eachPage } from '../../../../../../lib/page';
import { FACES, SANS, only, type Graph } from '../client/base';
import type { Beast } from '../schema';
import { draw } from './index';
import { searchOf, focusOf } from './page';

/* The graph, from its own file (see pages/milk-graph.json.ts), fetched
   once a page and kept as text: each drawing lays out a copy of its own. */
const graphs = new Map<string, Promise<string>>();
const graphAt = (url: string) => {
	if (!graphs.has(url)) graphs.set(url, fetch(url).then((r) => r.text()));
	return graphs.get(url)!;
};

eachPage((signal) => {
	for (const figure of document.querySelectorAll<HTMLElement>('[data-milk-graph]')) {
		// Asked for at once, while the rest of the page is still coming in.
		const fetched = graphAt(figure.dataset.milkGraph!);
		const phase = figure.closest<HTMLElement>('[data-viz-phase]');
		const host = phase ?? figure.closest<HTMLElement>('[data-viz-stage]');
		/* What a card has asked it to focus on before it is drawn, kept for
		   it to open on (see focusOn). */
		host?.addEventListener(
			'viz:props',
			(e) => {
				const focus = focusOf(e);
				if (focus !== undefined) figure.dataset.focus = focus ?? '';
			},
			{ signal },
		);
		/* Laid out to the pane's shape, so not before the pane has one, nor
		   while its phase is out of sight: there it is not laid out (see
		   VizPhase), and would be measured wrong. Drawn when it is first shown. */
		let started = false;
		const start = () => {
			if (started) return true;
			if (phase && phase.dataset.vizActive !== 'true') return false;
			const { width, height } = figure.getBoundingClientRect();
			if (!width || !height) return false;
			started = true;
			// Once it and its font are in, as its words are measured on a canvas (see measure).
			Promise.all([fetched, ...FACES.map((face) => document.fonts.load(`${face} 13px ${SANS()}`))]).then(([text]) => {
				if (signal.aborted) return;
				const data = JSON.parse(text as string) as Graph;
				/* Drawn again from scratch when an animal is pressed, the
				   drawing before let go of. */
				let drawing = new AbortController();
				signal.addEventListener('abort', () => drawing.abort());
				const redraw = (shown: Graph, filtered = false) => {
					drawing.abort();
					drawing = new AbortController();
					draw(figure, AbortSignal.any([signal, drawing.signal]), shown, filtered);
				};
				redraw(data);
				// Under the search, wherever that is.
				const chips = [...(searchOf(figure)?.querySelectorAll<HTMLButtonElement>('.milk-beasts button') ?? [])];
				for (const chip of chips)
					chip.addEventListener(
						'click',
						() => {
							chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
							const milks = new Set(chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.milk as Beast));
							redraw(only(data, milks), milks.size > 0);
						},
						{ signal },
					);
			});
			return true;
		};
		// A frame on, once the deck has said which phase is shown.
		requestAnimationFrame(() => {
			if (signal.aborted || start()) return;
			const watch = new ResizeObserver(() => start() && watch.disconnect());
			watch.observe(figure);
			phase?.addEventListener('viz:enter', () => start() && watch.disconnect(), { signal });
			signal.addEventListener('abort', () => watch.disconnect());
		});
	}
});

