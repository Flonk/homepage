import type { Sourcing } from '../schema';
import { el, out, commas } from './dom';

/* Sourcing on a card: where what is said is from; Wikipedia, read more on;
   its other sources, named; or that it has none yet. */
export const html = (said: Sourcing) => {
	if ('unsourced' in said) return el('p', 'milk-about-source', 'No source yet');
	const [only] = said.links;
	const wiki = said.links.length === 1 && /wikipedia\.org$/.test(new URL(only.url).hostname);
	const from = el('p', 'milk-about-source', wiki ? '' : said.links.length > 1 ? 'Sources: ' : 'Source: ');
	from.append(...commas(said.links.map(({ name, url }) => out(wiki ? 'Read more on Wikipedia' : name, url))));
	return from;
};
