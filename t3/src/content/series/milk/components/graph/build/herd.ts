import * as S from '../schema';
import { ROOT } from '../client/base';
import { WORLD_MILK } from '../../../data/world';

/*
 * The herd as the page has it (see schemas/animal.ts): the animals milk
 * comes from, a tree of their own converging on milk, laid out on its
 * left (see layoutWithHerd). Each by its id with "animal:" before it, so
 * none is taken for a product. A group, species or type carries its share
 * of the world's milk, by which its arrow is as wide as a product's of the
 * same share; a breed is a leaf. What is told of each, its figures, on its
 * card as rows.
 */
export const ANIMAL = 'animal:';
const idOf = (id: string) => (id === 'milk' ? ROOT : ANIMAL + id);

const number = (n: number) =>
	n >= 1e9 ? `${+(n / 1e9).toFixed(2)} billion` : n >= 1e6 ? `${+(n / 1e6).toFixed(1)} million` : n >= 1e4 ? `${Math.round(n / 1e3)} thousand` : n.toLocaleString('en');
// A range as it is said: "4–5", "about 4", "at least 4".
const range = ({ min, max, about }: S.Range, unit = '') => {
	const said = min !== undefined && max !== undefined ? (min === max ? `${min}` : `${min}–${max}`) : min !== undefined ? `at least ${min}` : `up to ${max}`;
	return `${about ? 'about ' : ''}${said}${unit}`;
};

// Its figures, each a row of its card.
const rowsOf = (a: S.Animal): S.PageNode['facts'] => {
	const rows: { k: string; v: string }[] = [];
	if (a.milk) rows.push({ k: 'Milk', v: `${a.milk.mt} Mt a year (${a.milk.year}${a.milk.estimated ? ', estimated' : ''})` });
	for (const h of a.head ?? []) rows.push({ k: h.milked ? 'Milked' : 'Head', v: `${number(h.count)} (${h.year}, ${h.where === 'world' ? 'world' : h.where}${h.estimated ? ', estimated' : ''})` });
	if (a.yield) {
		const said = [
			a.yield.perLactation && `${range(a.yield.perLactation, ' kg')} a lactation`,
			a.yield.lactationDays && `over ${range(a.yield.lactationDays, ' days')}`,
			a.yield.perYear && `${range(a.yield.perYear, ' kg')} a year`,
		].filter(Boolean);
		rows.push({ k: 'Yield', v: said.join(', ') + (a.yield.where ? ` (${a.yield.where})` : '') });
	}
	if (a.composition) {
		const { fat, protein, lactose, solids } = a.composition;
		const said = [fat && `fat ${range(fat, ' %')}`, protein && `protein ${range(protein, ' %')}`, lactose && `lactose ${range(lactose, ' %')}`, solids && `solids ${range(solids, ' %')}`].filter(Boolean);
		rows.push({ k: 'Its milk', v: said.join(', ') });
	}
	if (a.domestication) rows.push({ k: 'First kept', v: `${a.domestication.where}, ${range(a.domestication.yearsAgo)} years ago` });
	if (a.origin?.place) rows.push({ k: 'From', v: a.origin.place + (a.origin.formed ? `, ${range(a.origin.formed)}` : '') });
	if (a.purposes) rows.push({ k: 'Kept for', v: a.purposes.purposes.join(', ') });
	if (a.risk) rows.push({ k: 'Status', v: a.risk.status + (a.risk.year ? ` (${a.risk.year})` : '') });
	if (a.taxon) rows.push({ k: 'Taxon', v: a.taxon.name });
	for (const f of a.facts ?? []) rows.push({ k: f.k, v: f.v });
	return rows.length ? rows : undefined;
};

export const herdOf = (animals: Record<string, S.Animal>) => {
	// Only those whose way to milk is all there: one whose parent is not written yet waits for it.
	const reaches = (id: string, seen = new Set<string>()): boolean => {
		if (seen.has(id)) return false;
		seen.add(id);
		const a = animals[id];
		return !!a && (a.parent === 'milk' || reaches(a.parent, seen));
	};
	const kept = Object.entries(animals).filter(([id]) => reaches(id));
	const kids = (id: string) => kept.filter(([, a]) => a.parent === id).map(([k]) => k);
	// A group's milk, its species' together; a species' its own, else its types'.
	const mtOf = (id: string): number | undefined => {
		const a = animals[id];
		if (a.milk) return a.milk.mt;
		const of = kids(id).filter((k) => animals[k].kind !== 'breed').map(mtOf);
		return of.length && of.every((m) => m !== undefined) ? of.reduce((t, m) => t! + m!, 0) : undefined;
	};
	const shareOf = (id: string): S.PageNode['share'] => {
		const mt = mtOf(id);
		if (mt === undefined) return undefined;
		const a = animals[id];
		const sources: S.Sourcing = a.milk
			? a.milk.sources
			: { unsourced: true, text: 'The milk of the animals under it together, each sourced on its own card.' };
		return { mt, percent: Math.min(100, (mt / WORLD_MILK) * 100), sources };
	};
	const nodes: S.PageNode[] = kept.map(([id, a]) => ({
		id: idOf(id),
		label: a.label,
		aka: a.aka,
		about: a.about,
		regions: (a.origin?.regions ?? a.domestication?.regions)?.slice(0, S.MOST_COUNTRIES),
		facts: rowsOf(a),
		group: -1,
		niche: a.kind === 'breed' ? 2 : a.kind === 'type' ? 1 : 0,
		...(a.kind === 'breed' ? { example: true as const } : { share: shareOf(id) }),
	}));
	const links = kept.map(([id, a]) => ({ source: idOf(a.parent), target: idOf(id), weight: 1 }));
	return { nodes, links };
};
