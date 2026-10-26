import * as S from '../schema';
import { mustAll } from './must';

/* Each cheese type's table (see table in Node): its picks, and the
   outliers besides, by what its sources say of each of its cheeses: the
   quickest and the longest ripened, and one of each firmness, animal and
   way of setting the others leave out. The rest are not drawn, but named
   under the type, so the search finds it by them. */

type Axes = { firm: S.Firm; days: [number, number]; timeless?: true; row: string; column?: string };
const ORDER = { firm: S.Firm.options, beast: S.Beast.options, setting: [...S.Setting.options, 'none'] } as Record<string, readonly string[]>;
const middle = ([a, b]: [number, number]) => Math.sqrt(Math.max(1, a) * Math.max(1, b));
// The middle one of them.
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
// The one most of them are.
const most = <T>(xs: T[]) => {
	const count = new Map<T, number>();
	for (const x of xs) count.set(x, (count.get(x) ?? 0) + 1);
	return [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
};

export const tablesOf = (nodes: Record<string, S.Node>, membersOf: (type: string) => string[], famous: Set<string>) => {
	const shown = new Map<string, string[]>();
	const hidden = new Map<string, string[]>();
	const pages = new Map<string, NonNullable<S.PageNode['table']>>();
	const axesOf = new Map<string, Axes>();
	const unsure = new Set<string>();
	const standing = new Map<string, 'famous' | 'pick' | 'outlier'>();
	for (const [type, { table }] of Object.entries(nodes)) {
		if (!table) continue;
		const members = membersOf(type);
		mustAll(table.picks.map((p) => p.id), (id) => members.includes(id), `${type}'s table picks what is none of its cheeses:`);
		// What it is on an axis: how firm, whose milk (cow, where none is said), what sets it.
		const valueOf = (id: string, axis: 'firm' | 'beast' | 'setting') =>
			axis === 'firm' ? nodes[id].firm : axis === 'beast' ? (nodes[id].beasts?.[0] ?? 'cow') : nodes[id].setting;
		// Its picks, and any of the world's most made and best known cheeses among its own.
		const show = new Set([...table.picks.map((p) => p.id), ...members.filter((id) => famous.has(id))]);
		// Of several, the best known: a protected name, then something said of it, then by name.
		const best = (ids: string[]) =>
			[...ids].sort(
				(a, b) => Number(!!nodes[b].protected) - Number(!!nodes[a].protected) || Number(!!nodes[b].about) - Number(!!nodes[a].about) || a.localeCompare(b),
			)[0];
		// Outliers only by what is said of them, not by an estimate.
		const known = members.filter((id) => !nodes[id].estimated);
		const timed = known.filter((id) => nodes[id].days).sort((a, b) => middle(nodes[a].days!) - middle(nodes[b].days!));
		for (const id of [timed[0], timed.at(-1)]) if (id) show.add(id);
		const said = (id: string, axis: 'firm' | 'beast' | 'setting') => (axis === 'beast' ? nodes[id].beasts?.[0] : valueOf(id, axis));
		for (const axis of ['firm', 'beast', 'setting'] as const) {
			const left = new Map<string, string[]>();
			for (const id of known) {
				const v = said(id, axis);
				if (v && v !== 'none' && ![...show].some((s) => valueOf(s, axis) === v)) left.set(v, [...(left.get(v) ?? []), id]);
			}
			for (const ids of left.values()) show.add(best(ids));
		}
		// Where its sources say nothing, where most of its type's are, and marked so.
		const dated = members.filter((id) => nodes[id].days && !nodes[id].estimated);
		const usual = {
			firm: most(members.flatMap((id) => nodes[id].firm ?? [])) ?? 'semi-hard',
			days: [median(dated.map((id) => nodes[id].days![0])) ?? 30, median(dated.map((id) => nodes[id].days![1])) ?? 90].sort((a, b) => a - b) as [
				number,
				number,
			],
			setting: most(members.flatMap((id) => nodes[id].setting ?? [])) ?? 'rennet',
		};
		for (const id of show) {
			const n = nodes[id];
			if (!n.firm || !n.days || n.estimated || (table.across === 'setting' && !n.setting)) unsure.add(id);
			const firm = n.firm ?? usual.firm;
			axesOf.set(id, {
				firm,
				days: n.days ?? usual.days,
				...(!n.days && { timeless: true as const }),
				row: table.down === 'firm' ? firm : valueOf(id, 'beast')!,
				...(table.across === 'setting' && { column: n.setting ?? usual.setting }),
			});
		}
		const used = (key: 'row' | 'column') => [...new Set([...show].map((id) => axesOf.get(id)![key]))];
		const ordered = (axis: string, values: (string | undefined)[]) => ORDER[axis].filter((v) => values.includes(v));
		pages.set(type, {
			down: table.down,
			rows: ordered(table.down, used('row')),
			...(table.across === 'setting' && { columns: ordered('setting', used('column')) }),
		});
		shown.set(type, [...show]);
		for (const id of show) standing.set(id, famous.has(id) ? 'famous' : table.picks.some((p) => p.id === id) ? 'pick' : 'outlier');
		hidden.set(type, members.filter((id) => !show.has(id)));
	}
	return { shown, hidden, pages, axesOf, unsure, standing };
};
