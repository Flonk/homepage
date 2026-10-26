import type { How, HowPage, Sourcing } from '../schema';
import { page as processingPage, html as processingHtml } from './Processing';
import { el } from './dom';

/*
 * How a thing is made, along the way it is drawn at the end of, in each
 * of the forms it is drawn in: as the page is given it; and on a card. On
 * the canvas it is its processing's chain (see Processing).
 */

/* ---- As the page is given it ---- */

// What is said of how: a kind's, a process's, a leg's; their sources, where there are any.
export type Told = Omit<How, 'sources'> & { sources?: Sourcing };

// Its processing as chips and whether any of it ferments; not the processing itself.
export const page = ({ processing, ...rest }: Told): HowPage => ({ ...rest, ...(processing && processingPage(processing)) });

/* ---- On a card ---- */

// A ferment's microbe, on the bottom left corner of its chain, and what it says when pointed at.
export const FERMENT_MARK = '🦠';
export const FERMENT_SAID = 'Fermented';

// Its chain, the same as on its arrow, and the microbes each step brings.
export const html = (how: HowPage) => {
	const holds = how.holds ?? [];
	if (!holds.length) return [];
	const framed = el('div', 'milk-about-table');
	framed.append(...processingHtml(holds));
	if (how.fermented) {
		const mark = el('span', 'milk-about-ferment', FERMENT_MARK);
		mark.title = FERMENT_SAID;
		framed.append(mark);
	}
	return [framed];
};
