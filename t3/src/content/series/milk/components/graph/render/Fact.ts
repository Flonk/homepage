import type { Fact } from '../schema';
import { el, fact } from './dom';

/* A node's own facts on its card, a row each: what it is like, where it is
   from, what it is called; that it is made from raw milk, and that its
   cultures are alive, first. */
export const html = (facts: Pick<Fact, 'k' | 'v'>[], raw?: true, live?: true) => {
	const list = el('dl');
	if (raw) list.append(fact('Milk', 'raw'));
	if (live) list.append(fact('Cultures', 'alive, not heated after fermenting'));
	for (const { k, v } of facts) list.append(fact(k, v));
	return list;
};
