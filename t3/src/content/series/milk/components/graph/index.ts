import NODES from './nodes.json';
import MAP from './map.json';
import * as S from './schema';
import { GROUPS, KINDS, SPLITS, LIGHT } from './families';
import { WORLD_MILK } from './world';
import { page as howPage } from './render/How';
import { page as picturePage } from './render/Picture';
import { about as cheeseAbout, facts as cheeseFacts } from './render/Cheese';

/*
 * The graph handed to the page (see MilkGraph.astro and
 * pages/milk-graph.json.ts): every node in nodes.json, a product or an
 * example, put together into the tree and the map, and checked as it is. A
 * node that names one that is not there, a product made from one that is
 * not, or one in two families, is a mistake: said at build time, not drawn
 * wrong.
 */

type Node = S.Node;

const nodes: Record<string, Node> = S.Nodes.parse(NODES);
// Each list of the families against its schema.
S.Group.array().parse(GROUPS);
S.Kind.array().parse(KINDS);
S.Split.array().parse(SPLITS);
const mustAll = (keys: Iterable<string>, ok: (key: string) => boolean, said: string) => {
	for (const key of keys) if (!ok(key)) throw new Error(`MilkGraph: ${said} ${key}`);
};
const all = Object.entries(nodes);
const products = all.filter(([, n]) => !n.example);
const isProduct = (id: string) => id in nodes && !nodes[id].example;
const isExample = (id: string) => id in nodes && !!nodes[id].example;
// A label on one line, its line breaks spaces.
const flat = (label: string) => label.replace(/\n/g, ' ');

/* Each example is named by at most one product, which it is drawn under;
   one no product names is a cheese of the world's, on the map only. */
const ofProduct = new Map<string, string>();
for (const [id, n] of products) {
	mustAll(n.examples ?? [], isExample, `${id} names as its example what is no example:`);
	mustAll(n.examples ?? [], (x) => !ofProduct.has(x), `named by two products:`);
	for (const x of n.examples ?? []) ofProduct.set(x, id);
}
for (const [id, n] of all) {
	mustAll([n.family, n.also].filter((f) => f !== undefined), isProduct, `${id} is of an unknown family:`);
	if (n.example && !ofProduct.has(id) && !n.family) throw new Error(`MilkGraph: ${id} is an example of nothing`);
}

// Every parent named must be a product, and no product its own ancestor.
for (const [id, { from, alsoFrom = [], at, step, link, mapped, below }] of products) {
	/* Hung under a ruler, the arrow in has its value, not a step; anything
	   else made from a product with a ruler branches off as from any other.
	   A family only on the map has no arrow at all. */
	const ruled = at !== undefined;
	if (ruled && !nodes[from!]?.scale) throw new Error(`MilkGraph: ${id} has a value on a ruler, but ${from} has none`);
	if (from !== undefined && !ruled && !mapped && !step) throw new Error(`MilkGraph: ${id} has no step`);
	if (from && nodes[from]?.mapped && !mapped) throw new Error(`MilkGraph: ${id} hangs from ${from}, which is only on the map`);
	/* Two at one value share its arrow; two nearly at one would hang one's
	   arrow down beside the other's. */
	const gap = (n: Node) => Math.abs(n.at! - at!);
	if (ruled && products.some(([o, n]) => o !== id && n.from === from && gap(n) > 0 && gap(n) < 1))
		throw new Error(`MilkGraph: ${id} is too near another on its ruler`);
	if (link !== undefined && (!isProduct(link) || nodes[link].link)) throw new Error(`MilkGraph: ${id} links to ${link}, which is not a product`);
	if (below !== undefined && nodes[below]?.from !== from) throw new Error(`MilkGraph: ${id} is drawn below ${below}, which is no sibling of it`);
	mustAll([from, ...alsoFrom].filter((p) => p !== undefined), isProduct, `${id} is made from unknown`);
	for (let up = from, seen = new Set([id]); up !== undefined; up = nodes[up].from) {
		if (seen.has(up)) throw new Error(`MilkGraph: ${id} is made from itself`);
		seen.add(up);
	}
	// What a product is, said on its card; a family only on the map has no card of its own.
	if (!mapped && !nodes[link ?? id].about) throw new Error(`MilkGraph: nothing said about ${id}`);
}

// Each product, of exactly one of the lists: by its place in them.
const placed = (lists: { ids: string[] }[], what: string) => {
	const at = new Map<string, number>();
	lists.forEach(({ ids }, i) => {
		mustAll(ids, isProduct, `${what} names unknown`);
		mustAll(ids, (id) => !at.has(id), `in two of a ${what}:`);
		for (const id of ids) at.set(id, i);
	});
	return at;
};
const groupOf = placed(GROUPS, 'group');
placed(KINDS, 'kind');
// Milk is in none; nor is a family only on the map, which is not drawn.
mustAll(
	products.map(([id]) => id),
	(id) => id === 'raw' || !!nodes[id].mapped || groupOf.has(id),
	'in no group:',
);
for (const { from, ids } of SPLITS) mustAll(ids, (id) => nodes[id]?.from === from, `split off ${from} but not made from it:`);
// The step is written once, on the arrow before it splits; each part says only what it is.
for (const { step, ids } of SPLITS) mustAll(ids, (id) => !nodes[id].step?.startsWith(step), `repeats the step "${step}" it is split off by:`);

const map = S.WorldMap.parse(MAP);
// Every country named, one on the map, with its flag.
mustAll(
	all.flatMap(([, n]) => n.regions ?? []),
	(c) => c in map.countries,
	'not a country on the map:',
);

// How much of what is said has no source yet, told once; and how many nodes have none at all.
{
	const said: S.Sourcing[] = all
		.flatMap(([, n]) => [
			n.sources,
			n.about?.sources,
			n.picture?.sources,
			n.share?.sources,
			n.how?.sources,
			n.how?.processing?.sources,
			// Sources of their own, inside it: a step's, a microbe's, a row's.
			...(n.how?.processing?.steps ?? []).flatMap((x) => [x.sources, ...(x.type === 'ferment' ? (x.adds?.microbes ?? []).map((m) => m.sources) : [])]),
			...(n.facts ?? []).map((r) => r.sources),
			n.composition?.sources,
		])
		.concat(
			KINDS.map((k) => k.how.sources),
			map.sources,
		)
		.filter((x) => x !== undefined);
	const unsourced = said.filter((x) => 'unsourced' in x).length;
	if (unsourced) console.warn(`MilkGraph: ${unsourced} of ${said.length} things said have no source yet (see Unsourced in milk/graph/schema.ts)`);
	const bare = products.filter(([, n]) => !n.sources).length;
	if (bare) console.warn(`MilkGraph: ${bare} of ${products.length} products have no sources for what they are made from and called`);
}

/* The world's cheeses on the map under cheese: every example that is a
   cheese, those the inventory of the world's cheeses has first (each with
   its family), then the cheese families' own the inventory does not, in
   the order nodes.json has them. */
const cheesy = (id: string) => !!nodes[id].mapped || !!nodes[id].cheese;
const world = all.filter(([id, n]) => n.example && (n.family !== undefined || cheesy(ofProduct.get(id) ?? '')));

/* A family drawn in the tree that is ripened long enough for time to tell
   its cheeses apart is drawn as a panel, once it has enough of them; each
   placed where its sources put it, else where most of its family's go,
   and marked so (see unsure). */
const panelled = (id: string) => !!nodes[id].panel || (!!nodes[id].ripened && (nodes[id].examples?.length ?? 0) >= 6);
const UNSURE_SAID = 'Not found in a source: placed where its family’s cheeses usually are';
const middling = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
// The one most of them are.
const most = <T,>(xs: T[]) => {
	const count = new Map<T, number>();
	for (const x of xs) count.set(x, (count.get(x) ?? 0) + 1);
	return [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
};
const unsure = new Set<string>();
const axesOf = new Map<string, { firm: S.Firm; days: [number, number] }>();
for (const [id, n] of all) {
	// Drawn under its product, placed by a guess; on the map, it is where it is made.
	if (ofProduct.has(id) && (n.estimated || n.confidence === 'low')) unsure.add(id);
	if (n.example && n.firm && n.days) axesOf.set(id, { firm: n.firm, days: n.days });
}
for (const [id, n] of products) {
	if (!panelled(id)) continue;
	const names = n.examples ?? [];
	// Placed in a panel, none on a line of no time.
	for (const x of names) {
		const a = axesOf.get(x);
		if (a) axesOf.set(x, { firm: a.firm, days: [Math.max(1, a.days[0]), Math.max(1, a.days[1])] });
	}
	const placedAt = names.flatMap((x) => axesOf.get(x) ?? []);
	const usual = {
		firm: most(placedAt.map((a) => a.firm)) ?? 'semi-hard',
		days: [middling(placedAt.map((a) => a.days[0])) ?? 30, middling(placedAt.map((a) => a.days[1])) ?? 90] as [number, number],
	};
	for (const x of names) {
		if (nodes[x].confidence === undefined || nodes[x].estimated) unsure.add(x);
		if (!axesOf.has(x)) axesOf.set(x, usual);
	}
}

// The animals to filter by: those any node is marked with, the cow first.
const marked = (n: Node) => (n.beasts && n.beasts.join() !== 'cow' ? n.beasts : undefined);
export const herd = S.Beast.options.filter((b) => b === 'cow' || all.some(([, n]) => marked(n)?.includes(b)));

const exampleFile = (name: string) =>
	`ex-${name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

/**
 * An example as the page has it: drawn as a leaf under its product, in its
 * panel, or on the map. It is not made from its product, so its line has no
 * step written on it, and it takes its product's family.
 */
const exampleOf = (id: string) => {
	const n = nodes[id];
	const cheese = n.family !== undefined;
	return {
		label: n.label,
		image: n.picture && picturePage(exampleFile(n.label), n.picture),
		about: n.about ?? (cheese ? cheeseAbout(n) : undefined),
		regions: n.regions?.slice(0, S.MOST_COUNTRIES),
		aka: n.aka,
		note: n.note,
		beasts: marked(n),
		axes: axesOf.get(id),
		protected: n.protected,
		composition: n.composition,
		facts: [...(cheese ? cheeseFacts(n) : []), ...(n.facts ?? []).map(({ k, v }) => ({ k, v }))],
		raw: n.raw,
		live: n.live,
		// Its sources, where they are not with its paragraph.
		sources: n.sources && JSON.stringify(n.sources) !== JSON.stringify(n.about?.sources) ? n.sources : undefined,
		unsure: unsure.has(id) ? UNSURE_SAID : undefined,
		step: n.how?.label,
		how: n.how && howPage(n.how),
		example: true as const,
		niche: 2 as const,
	};
};
const drawn = products.filter(([, { mapped }]) => !mapped);
const leaves = drawn.flatMap(([kind, { examples = [] }]) =>
	examples.map((id, rank) => ({ ...exampleOf(id), id, kind, rank, group: groupOf.get(kind) ?? -1 })),
);
/* The map's cheeses: each where it is made, the first of its countries;
   one with none known is left off. No step on its line, which is not
   drawn: the map is under cheese, as the panels are under their families. */
const atlas = world
	.filter(([, n]) => n.regions?.length)
	.map(([id, n], rank) => {
		const of = ofProduct.get(id);
		const family = of && nodes[of].mapped ? nodes[of].label : n.family && nodes[n.family].label;
		return {
			...exampleOf(id),
			id: `atlas:${id}`,
			kind: 'cheese',
			onMap: true as const,
			place: n.regions![0],
			area: n.place?.region,
			spot: n.place?.x !== undefined ? ([n.place.x, n.place.y!] as [number, number]) : undefined,
			guessed: n.place?.located === 'guess',
			family: family && flat(family),
			rank,
			group: groupOf.get('cheese') ?? -1,
			step: undefined,
		};
	});
const examples = [...leaves, ...atlas];
// The names of the families only on the map, and their other names: found by the search, as the map.
const onTheMap = products.flatMap(([, n]) => (n.mapped ? [flat(n.label), ...(n.aka ?? [])] : []));

export const graph = S.Payload.parse({
	light: LIGHT,
	groups: GROUPS.map(({ name, hub }) => ({ name, hub: hub ?? null })),
	splits: SPLITS,
	kinds: KINDS.map(({ step, ids, how }) => ({ step, ids, how: howPage(how) })),
	// How firm a cheese can be, softest first: a panel's rows.
	firms: S.Firm.options,
	nodes: [
		...drawn.map(([id, { label, step, scale, at, map, below, link, note, aka = [], examples: named = [], niche }]) => {
			const own = nodes[link ?? id];
			return {
				id,
				label,
				// Not drawn, but found by the search: its other names; a map's, the names of the families on it.
				aka: map ? [...aka, ...onTheMap] : aka,
				image: own.picture && picturePage(link ?? id, own.picture),
				about: own.about,
				regions: own.regions,
				how: nodes[id].how && howPage(nodes[id].how!),
				// All its examples, for the card that tells of it, by name.
				named: named.map((x) => nodes[x].label),
				step,
				scale,
				at,
				panel: panelled(id) || undefined,
				map,
				below,
				link,
				note,
				beasts: marked(own),
				composition: own.composition,
				facts: own.facts?.map(({ k, v }) => ({ k, v })),
				raw: own.raw,
				live: own.live,
				group: groupOf.get(id) ?? -1,
				niche: niche ?? 2,
				// How much of the world's milk goes its way, in Mt a year and in percent, and how that was worked out (see world.ts).
				share: nodes[id].share && { mt: nodes[id].share!.mt, percent: (nodes[id].share!.mt / WORLD_MILK) * 100, sources: nodes[id].share!.sources },
			};
		}),
		...examples.map(({ kind, ...x }) => x),
	],
	links: [
		...drawn.filter(([, { from }]) => from !== undefined).map(([target, { from }]) => ({ source: from!, target, weight: nodes[target].light ? LIGHT : 1 })),
		...examples.map(({ id, kind }) => ({ source: kind, target: id, weight: 1 })),
	],
	// The world's outline, for the map under cheese (see map.json); where it is from stays here.
	map: { height: map.height, countries: map.countries },
});
