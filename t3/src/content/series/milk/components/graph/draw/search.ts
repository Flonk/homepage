import { type Node, MAX_ZOOM, FOUND_HEIGHT, nextUid } from '../client/base';
import { el } from '../render/dom';
import type { Drawing, Search } from './types';
import { searchOf } from './page';

// How many matches the list shows.
const MOST_MATCHES = 8;
// Below this width, in rem, the card covers the whole pane.
const NARROW_REM = 40;

type Entry = { label: string; normalised: string; node: Node; hint: string };

// Lower case, without accents.
const normalise = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const displayName = (n: Node) => n.label.replace(/\n/g, ' ');
// Best first: the name starting with it, then a word in it starting with it, then anywhere.
const rank = (e: Entry, q: string) => (e.normalised.startsWith(q) ? 0 : e.normalised.split(/[\s(/,-]+/).some((w) => w.startsWith(q)) ? 1 : 2);

/* Finding a product: by its name, any of its other names, or an example
   of it, without minding case or accents. What is found is glided to and
   zoomed into until it reads, and selected. */
export const makeSearch = (G: Drawing): Search => {
	const { layout, viewport, highlight, camera } = G;
	const entries: Entry[] = [];
	for (const n of layout.nodes) {
		// Found as the product a link is of, not twice.
		if (n.hub || n.link) continue;
		const parent = layout.parent.get(n);
		entries.push({ label: displayName(n), normalised: normalise(displayName(n)), node: n, hint: n.example && parent ? `example of ${displayName(parent)}` : '' });
		for (const a of n.aka ?? []) entries.push({ label: a, normalised: normalise(a), node: n, hint: `= ${displayName(n)}` });
		for (const a of n.offTable ?? []) entries.push({ label: a, normalised: normalise(a), node: n, hint: `a ${displayName(n)}` });
	}
	// In the figure, or moved up into a sidebar deck's column of tools, which it works the same from.
	const box = searchOf(G.figure)!;
	const field = box.querySelector('input')!;
	const list = box.querySelector('ul')!;
	let matches: Entry[] = [];
	let chosen = 0;
	// Named for this graph alone, as another on the page would name its own the same.
	list.id = `${nextUid()}-found`;
	field.setAttribute('aria-controls', list.id);
	const openList = (open: boolean) => {
		list.hidden = !open;
		field.setAttribute('aria-expanded', String(open));
		if (open && matches[chosen]) field.setAttribute('aria-activedescendant', `${list.id}-${chosen}`);
		else field.removeAttribute('aria-activedescendant');
	};
	const showMatches = () => {
		list.replaceChildren(
			...matches.map((m, i) => {
				const li = el('li', '', m.label);
				li.id = `${list.id}-${i}`;
				li.setAttribute('role', 'option');
				li.setAttribute('aria-selected', String(i === chosen));
				if (m.hint) li.append(el('small', '', m.hint));
				li.addEventListener('mousedown', (e) => {
					e.preventDefault();
					goTo(m.node);
				});
				return li;
			}),
		);
		openList(matches.length > 0);
	};
	field.addEventListener(
		'input',
		() => {
			const q = normalise(field.value.trim());
			const seen = new Set<string>();
			matches = q
				? entries
						.filter((e) => e.normalised.includes(q))
						.sort((a, b) => rank(a, q) - rank(b, q) || a.label.length - b.label.length)
						.filter((e) => !seen.has(e.label + e.hint) && !!seen.add(e.label + e.hint))
						.slice(0, MOST_MATCHES)
				: [];
			chosen = 0;
			showMatches();
		},
		{ signal: G.signal },
	);
	field.addEventListener(
		'keydown',
		(e) => {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				if (!matches.length) return;
				chosen = (chosen + (e.key === 'ArrowDown' ? 1 : matches.length - 1)) % matches.length;
				showMatches();
			} else if (e.key === 'Enter' && matches[chosen]) {
				goTo(matches[chosen].node);
			} else if (e.key === 'Escape') {
				field.value = '';
				matches = [];
				showMatches();
			} else return;
			e.preventDefault();
		},
		{ signal: G.signal },
	);
	field.addEventListener('blur', () => openList(false), { signal: G.signal });
	field.addEventListener('focus', () => openList(matches.length > 0), { signal: G.signal });

	// Where the card covers the whole pane, finding a product only goes to it; a tap on it opens its card.
	const narrow = () => G.figure.clientWidth < NARROW_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
	/* Zoomed until its pill is about FOUND_HEIGHT tall on the screen, into
	   the middle of what the card leaves of the pane; a ruler, long and low,
	   until it is as wide as most of that, so its ruler reads. */
	const zoomToRead = (n: Node) => {
		// The card's width, not where it is, which while it slides in is not yet where it will be.
		const card = G.figure.querySelector<HTMLElement>('.milk-about')!;
		const left = card.classList.contains('is-open') ? card.offsetWidth : 0;
		const free = viewport.paneWidth - left;
		const k = Math.max(0.5, Math.min(MAX_ZOOM, n.scale ? Infinity : FOUND_HEIGHT / (n.h * viewport.fitScale), (0.8 * free) / (n.w * viewport.fitScale)));
		return viewport.zoomCentredOn(n.x, n.y, k, left + free / 2);
	};
	const goTo = (n: Node, quiet = false) => {
		if (n.link) n = layout.nodes.find((m) => m.id === n.link)!;
		openList(false);
		field.blur();
		if (narrow() || quiet) {
			G.infoCard.showNode(null);
			highlight.selected = n;
			highlight.lightArrowsOf(n);
		} else G.infoCard.showNode(n);
		camera.glideTo(zoomToRead(n));
	};
	return { field, displayName, goTo, zoomToRead };
};
