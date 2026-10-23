import type { How, HowPage } from '../schema';
import { page as processingPage, html as processingHtml } from './Processing';
import { page as rowsPage, html as rowsHtml } from './Row';
import { el } from './dom';

/*
 * How a thing is made from its parent, in each of the forms it is drawn
 * in: as the page is given it; and its table on a card. On the canvas it
 * is its processing's chain and its rows' table (see Processing and Row).
 */

/* ---- As the page is given it ---- */

// Its processing as chips and whether any of it ferments; its rows as said; not the processing itself.
export const page = ({ processing, table, facts, ...rest }: How): HowPage => ({
	...rest,
	...(table && { table: rowsPage(table) }),
	...(facts && { facts: rowsPage(facts) }),
	...(processing && processingPage(processing)),
});

/* ---- On a card ---- */

// A ferment's microbe, on the bottom left corner of its table, and what it says when pointed at.
export const FERMENT_MARK = '🦠';
export const FERMENT_SAID = 'Fermented';

/* Its table, the same as on its arrow: its processing's chips and the
   microbes each brings, and its rows, or its facts where it has no rows,
   they being the rows said at length. */
export const html = (how: HowPage) => {
	const rows = how.table?.length ? how.table : (how.facts ?? []);
	const holds = how.holds ?? [];
	if (!rows.length && !holds.length) return [];
	const framed = el('div', 'milk-about-table');
	framed.append(...processingHtml(holds));
	if (rows.length) framed.append(rowsHtml(rows));
	if (how.fermented) {
		const mark = el('span', 'milk-about-ferment', FERMENT_MARK);
		mark.title = FERMENT_SAID;
		framed.append(mark);
	}
	return [framed];
};
