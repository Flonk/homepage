import type { Cheese, About, How } from '../schema';
import { BEASTS } from '../animals';
import { nameOf } from './Regions';

/*
 * A cheese of the map the graph has nothing else on, in the forms it is
 * told in: what it is, from the list it was found in or else from its
 * facts; how it is made; and what its seal stands for.
 */
const milkOf = (c: Cheese, and: string) => c.milk.map((m) => BEASTS[m].milk).join(and);
export const about = (c: Cheese): About => {
	const milk = milkOf(c, ' and ');
	const from = c.countries.map(nameOf).join(', ');
	const text = c.desc ?? `A ${c.firm ? `${c.firm} ` : ''}cheese${milk ? ` of ${milk} milk` : ''}${from ? ` from ${from}` : ''}.`;
	return { text, sources: c.sources };
};
const SET_WORD: Record<string, string> = { rennet: 'rennet', acid: 'lactic acid', 'rennet-acid': 'lactic acid and a little rennet', 'acid-heat': 'heat and acid', plant: 'a plant coagulant', heat: 'boiled down', none: 'melted' };
export const how = (c: Cheese): Omit<How, 'sources'> => ({
	table: [
		...(c.milk.length ? [{ k: 'Milk', v: milkOf(c, ', ') }] : []),
		...(c.coagulation ? [{ k: 'Set with', v: SET_WORD[c.coagulation] ?? c.coagulation }] : []),
		...(c.rind ? [{ k: 'Rind', v: c.rind }] : []),
		...(c.protected ? [{ k: 'Protected', v: c.protected }] : []),
	],
	// What its sources were, and what in it is not checked; the links themselves are with its paragraph.
	text: c.sources.text,
});
// Its seal, as pointing at it says it.
export const SEAL: Record<string, string> = {
	PDO: 'Protected designation of origin (PDO)',
	PGI: 'Protected geographical indication (PGI)',
	TSG: 'Traditional speciality guaranteed (TSG)',
};
