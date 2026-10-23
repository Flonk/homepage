import type { Node, About, How, Protected } from '../schema';
import { MILK } from './Beasts';
import { nameOf } from './Regions';
import { SAID as SET } from './Setting';

/*
 * A cheese the graph has nothing written on, told from its node's facts:
 * what it is; how it is made; and what its seal stands for.
 */
const milkOf = (n: Node, and: string) => (n.beasts ?? []).map((m) => MILK[m]).join(and);
export const about = (n: Node): About | undefined =>
	n.sources && {
		text: `A ${n.firm ? `${n.firm} ` : ''}cheese${n.beasts ? ` of ${milkOf(n, ' and ')} milk` : ''}${n.regions ? ` from ${n.regions.map(nameOf).join(', ')}` : ''}.`,
		sources: n.sources,
	};
export const how = (n: Node): Omit<How, 'sources'> => ({
	table: [
		...(n.beasts ? [{ k: 'Milk', v: milkOf(n, ', ') }] : []),
		...(n.setting ? [{ k: 'Set by', v: SET[n.setting] }] : []),
		...(n.rind ? [{ k: 'Rind', v: n.rind }] : []),
		...(n.protected ? [{ k: 'Protected', v: n.protected }] : []),
	],
	// What its sources were, and what in it is not checked; the links themselves are with its paragraph.
	...(n.sources && { text: n.sources.text }),
});
// Its seal, as pointing at it says it.
export const SEAL: Record<Protected, string> = {
	PDO: 'Protected designation of origin (PDO)',
	PGI: 'Protected geographical indication (PGI)',
	TSG: 'Traditional speciality guaranteed (TSG)',
};
