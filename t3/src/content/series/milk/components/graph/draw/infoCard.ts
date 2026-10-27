import { type Node } from '../client/base';
import { el, fact, commas } from '../render/dom';
import { html as shareHtml } from '../render/Share';
import { html as sourcesHtml } from '../render/Sourcing';
import { html as compositionHtml } from '../render/Composition';
import { html as factsHtml } from '../render/Fact';
import { html as axesHtml } from '../render/Axes';
import { html as howHtml } from '../render/How';
import { credit } from '../render/Picture';
import { zoomIdentity } from 'd3-zoom';
import type { Drawing, InfoCard } from './types';
import { focusOf } from './page';
import { keepLinked } from './link';

/* The card over the picture telling of a product or an example: its
   photograph and name, what else it is called, what it is, and where it
   sits in the tree, each product named there a way to it; or of a step,
   the arrow into a product. */
export const makeInfoCard = (G: Drawing): InfoCard => {
	const { layout, highlight, camera, search } = G;
	const card = G.figure.querySelector<HTMLElement>('.milk-about')!;
	const body = card.querySelector<HTMLElement>('.milk-about-body')!;
	const { displayName } = search;
	// Opened, labelled for what it tells of, with these in it; or closed, for null.
	const fill = (label: string | null, parts: HTMLElement[] = []) => {
		card.classList.toggle('is-open', label !== null);
		card.inert = label === null;
		if (label === null) return;
		card.setAttribute('aria-label', label);
		body.replaceChildren(...parts);
		body.scrollTop = 0;
	};
	const linkTo = (n: Node) => {
		const b = el('button', 'milk-about-to', displayName(n));
		b.type = 'button';
		b.addEventListener('click', () => search.goTo(n));
		return b;
	};
	// What it is made from, past any branch point between.
	const madeFrom = (n: Node) => {
		const p = layout.parent.get(n);
		return p?.hub ? layout.parent.get(p) : p;
	};

	const showNode = (n: Node | null) => {
		highlight.selected = n;
		highlight.lightArrowsOf(n);
		if (!n) return fill(null);
		const header = el('header');
		if (n.image) {
			const img = el('img');
			img.src = n.image.src;
			img.alt = '';
			header.append(img);
		}
		const title = el('div');
		const p = madeFrom(n);
		if (n.example && p) {
			const kind = el('p', 'milk-about-kind', 'Example of ');
			kind.append(linkTo(p));
			title.append(kind);
		}
		title.append(el('h3', '', displayName(n)));
		if (n.aka?.length) title.append(el('p', 'milk-about-aka', `Also known as ${n.aka.join(', ')}`));
		if (n.share) title.append(...shareHtml(n.share));
		header.append(title);
		header.classList.toggle('has-image', !!n.image);
		const parts: HTMLElement[] = [header];
		if (n.about) {
			parts.push(el('p', 'milk-about-text', n.about.text));
			parts.push(sourcesHtml(n.about.sources));
		}
		// What it is as it comes out, and its own facts.
		if (n.composition) parts.push(compositionHtml(n.composition));
		if (n.facts?.length || n.raw || n.live) parts.push(factsHtml(n.facts ?? [], n.raw, n.live));
		/* A cheese in a panel has no arrow to show its card chain on: shown
		   here instead, after where the panel puts it, with the rest of how
		   it is made and where that is from. */
		if (n.axes && layout.panelContaining(n)) {
			const how = n.how;
			if (n.axes) parts.push(axesHtml(n.axes));
			if (how) parts.push(...howHtml(how));
			if (how?.text) parts.push(el('p', 'milk-about-text', how.text));
			if (how?.sources) parts.push(sourcesHtml(how.sources));
		}
		if (n.sources) parts.push(sourcesHtml(n.sources));
		// What it is made from and into, the picture shows round it already: only its examples, each a link where drawn.
		const facts = el('dl');
		if (n.named?.length) {
			const drawn = new Map([...(layout.children.get(n) ?? []), ...(layout.panelContents.get(n) ?? [])].filter((k) => k.example).map((k) => [k.label, k]));
			facts.append(
				fact(
					'Examples',
					n.named.map((x) => {
						const k = drawn.get(x);
						return k ? linkTo(k) : x;
					}),
				),
			);
		}
		if (facts.childElementCount) parts.push(facts);
		if (n.image) parts.push(credit(n.image));
		fill(displayName(n), parts);
		keepLinked(n.id);
	};
	// Closed, and the step selected with it let go of.
	const close = () => {
		showNode(null);
		highlight.selectedStep = null;
		highlight.inkStep(null);
	};
	// What it is made from and how, the facts of it, and where they come from.
	const showStep = (n: Node) => {
		const p = layout.parent.get(n)!;
		showNode(null);
		highlight.selected = n;
		highlight.lightArrowsOf(n);
		highlight.selectedStep = n;
		highlight.inkStep(n);
		const header = el('header');
		const title = el('div');
		const kind = el('p', 'milk-about-kind');
		// A branch point has no name: what its arrow leads to, then.
		const into = n.hub ? (layout.children.get(n) ?? []).filter((k) => !k.hub && !k.example) : [n];
		kind.append(linkTo(p.hub ? layout.parent.get(p)! : p), ' → ', ...commas(into.map(linkTo)));
		// Under a ruler, its value along it.
		title.append(kind, el('h3', '', n.step ?? (p.scale && n.at != null ? `${n.at} ${p.scale.unit} ${p.scale.name}` : '')));
		header.append(title);
		const parts: HTMLElement[] = [header];
		const how = n.how;
		if (how?.text) parts.push(el('p', 'milk-about-text', how.text));
		if (how) parts.push(...howHtml(how));
		if (how?.sources) parts.push(sourcesHtml(how.sources));
		fill(n.step ?? displayName(n), parts);
	};
	card.querySelector('.milk-about-close')!.addEventListener('click', close, { signal: G.signal });
	// A product named in the words beside it, pressed (see MilkLink).
	document.addEventListener(
		'milk:go',
		(e) => {
			const id = (e as CustomEvent<string>).detail;
			const n = layout.nodes.find((n) => (n.example ? n.label === id : n.id === id));
			if (n) search.goTo(n, true);
			else console.warn(`MilkGraph: no product or drawn example ${id}`);
		},
		{ signal: G.signal },
	);
	document.addEventListener('keydown', (e) => e.key === 'Escape' && highlight.selected && e.target !== search.field && close(), { signal: G.signal });

	// Framed with everything made from it, with a margin, and selected.
	const focusOn = (id: string | null, glide: boolean) => {
		const n = id ? layout.nodes.find((n) => n.id === id) : null;
		if (id && !n) console.warn(`MilkGraph: no product ${id} to focus on`);
		if (!n) {
			highlight.selected = null;
			highlight.lightArrowsOf(null);
			camera.glideTo(zoomIdentity, glide);
			return;
		}
		const madeFromIt = new Set([n]);
		for (let grew = true; grew; ) {
			grew = false;
			for (const a of layout.arrows)
				if (madeFromIt.has(a.source) && !madeFromIt.has(a.target)) {
					madeFromIt.add(a.target);
					grew = true;
				}
		}
		highlight.selected = n;
		highlight.lightArrowsOf(n);
		// Nothing made from it: into it alone, as a link to it goes.
		camera.glideTo(madeFromIt.size === 1 ? search.zoomToRead(n) : camera.framing([...madeFromIt], 0.5), glide);
	};
	// Asked by a card of the deck to focus on another product, or the whole.
	const host = G.figure.closest<HTMLElement>('[data-viz-phase]') ?? G.figure.closest<HTMLElement>('[data-viz-stage]');
	host?.addEventListener(
		'viz:props',
		(e) => {
			const focus = focusOf(e);
			if (focus !== undefined) focusOn(focus, true);
		},
		{ signal: G.signal },
	);
	return { showNode, showStep, close, focusOn };
};
