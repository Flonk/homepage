import type { Processing, Chip } from '../schema';
import { MONO } from '../client/base';
import { chip, card, drawCard, html as chipHtml, CARD, type Card } from './ProcessingStep';
import { font, type Paint, type Pen } from './canvas';
import { el } from './dom';

/*
 * A processing, the steps a thing is made by, in each of the forms it is
 * drawn in: as the page is given it, its steps as chips and whether any of
 * them ferments; as a chain of cards on the canvas; and on a card, its
 * chips in a row and the microbes each brings.
 */

/* ---- As the page is given it ---- */

export const page = (p: Processing) => ({ holds: p.steps.map(chip), ...(p.steps.some((h) => h.type === 'ferment') && { fermented: true as const }) });

/* ---- On the canvas ---- */

/* Its cards along one line, however long, each centred on it, and an
   arrow between each two on its middle; laid out from its own top left. */
export type Strip = { w: number; h: number; cards: Card[]; joins: { x: number; y: number }[] };
export const strip = (chips: Chip[], f: number): Strip => {
	const laid: Strip = { w: 0, h: 0, cards: [], joins: [] };
	let x = 0;
	chips.forEach((c, i) => {
		const one = card(c, f);
		if (i) {
			laid.joins.push({ x: x + (CARD.gap * f) / 2, y: 0 });
			x += CARD.gap * f;
		}
		one.x = x;
		laid.cards.push(one);
		x += one.w;
		laid.h = Math.max(laid.h, one.h);
	});
	laid.w = x;
	for (const c of laid.cards) c.y = (laid.h - c.h) / 2;
	for (const j of laid.joins) j.y = laid.h / 2;
	return laid;
};
export const drawStrip = (g: Pen, laid: Strip, left: number, top: number, f: number, paint: Paint) => {
	for (const c of laid.cards) drawCard(g, c, left + c.x, top + c.y, f, paint);
	// In the ground's colour, as if cut out of the line they are on (see JOIN in layout).
	g.textAlign = 'center';
	g.textBaseline = 'middle';
	g.fillStyle = paint.ink.ground;
	g.font = font(CARD.said * f, '700', MONO());
	for (const j of laid.joins) g.fillText('→', left + j.x, top + j.y);
};

/* ---- On a card ---- */

// Its chips in a row, an arrow between each two, and under them the microbes each brings.
export const html = (chips: Chip[]) => {
	const parts: HTMLElement[] = [];
	const row = el('p', 'milk-about-holds');
	chips
		.filter((c) => c.said || c.title)
		.forEach((c, i) => {
			if (i) row.append(el('span', 'milk-about-then', '→'));
			row.append(chipHtml(c));
		});
	if (row.childElementCount) parts.push(row);
	const bringing = chips.filter((c) => c.microbes);
	for (const c of bringing) parts.push(el('p', 'milk-about-microbes', `${bringing.length > 1 ? `${c.done}: ` : ''}${c.microbes}`));
	return parts;
};
