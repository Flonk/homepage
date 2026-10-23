import type { Node, About, Protected } from '../schema';
import { MILK } from './Beasts';
import { nameOf } from './Regions';
import { SAID as SET } from './Setting';

/*
 * A cheese the graph has nothing written on, told from its node's facts:
 * what it is; its facts; and what its seal stands for.
 */
const milkOf = (n: Node, and: string) => (n.beasts ?? []).map((m) => MILK[m]).join(and);
export const about = (n: Node): About | undefined =>
	n.sources && {
		text: `A ${n.firm ? `${n.firm} ` : ''}cheese${n.beasts ? ` of ${milkOf(n, ' and ')} milk` : ''}${n.regions ? ` from ${n.regions.map(nameOf).join(', ')}` : ''}.`,
		sources: n.sources,
	};
// Its facts as its fields say them, told on its card before its own.
export const facts = (n: Node) => [
	...(n.beasts ? [{ k: 'Milk', v: milkOf(n, ', ') }] : []),
	...(n.setting ? [{ k: 'Set by', v: SET[n.setting] }] : []),
	...(n.rind ? [{ k: 'Rind', v: n.rind }] : []),
	...(n.protected ? [{ k: 'Protected', v: n.protected }] : []),
];
// Its seal, as pointing at it says it.
export const SEAL: Record<Protected, string> = {
	PDO: 'Protected designation of origin (PDO)',
	PGI: 'Protected geographical indication (PGI)',
	TSG: 'Traditional speciality guaranteed (TSG)',
};
