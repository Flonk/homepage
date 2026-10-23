import { z } from 'astro/zod';
import ABOUT from './about.json';
import STEPS from './steps.json';
import REGIONS from './regions.json';
import CHEESES from './cheeses.json';
import MAP from './map.json';
import * as S from './schema';
import { NODES, type Product } from './products';
import { IMAGES, EXAMPLE_IMAGES } from './pictures';
import { EXAMPLE_AKA, EXAMPLE_NOTES, EXAMPLE_AXES } from './examples';
import { MILK_OF } from './animals';
import { GROUPS, KINDS, SPLITS, TREATED, LIGHT, STAPLE, KNOWN } from './families';
import { WORLD_MILK, SHARES } from './shares';
import { page as howPage } from './render/How';
import { page as picturePage } from './render/Picture';
import { about as cheeseAbout, how as cheeseHow } from './render/Cheese';

/*
 * The graph handed to the page (see MilkGraph.astro and
 * pages/milk-graph.json.ts): every record in milk/ put together by product
 * id, and by name for an example, and checked as it is. A record for a
 * product or an example that is not there, a product made from one that is
 * not, or one in two families, is a mistake: said at build time, not drawn
 * wrong.
 */

type Cheese = S.Cheese;
type How = S.How;

// The examples every product names, by name; and whether a key is a product's id, or that or an example's name.
const named = new Set(Object.values(NODES).flatMap(({ examples = [] }) => examples));
const isProduct = (key: string) => key in NODES;
const isKnown = (key: string) => key in NODES || named.has(key);
const mustAll = (keys: Iterable<string>, ok: (key: string) => boolean, said: string) => {
	for (const key of keys) if (!ok(key)) throw new Error(`MilkGraph: ${said} ${key}`);
};
// A label on one line, its line breaks spaces.
const flat = (label: string) => label.replace(/\n/g, ' ');

// Each record against its schema, and against the products and examples there are.
z.record(S.ProductId, S.Product).parse(NODES);
z.array(S.Group).parse(GROUPS);
z.array(S.Kind).parse(KINDS);
z.array(S.Split).parse(SPLITS);
z.record(z.string(), z.array(z.string().min(1)).min(1)).parse(EXAMPLE_AKA);
z.record(z.string(), z.string().min(1)).parse(EXAMPLE_NOTES);
z.record(z.string(), S.Axes).parse(EXAMPLE_AXES);
const pictures = z.record(z.string(), S.Picture).parse(IMAGES);
const examplePictures = z.record(z.string(), S.Picture).parse(EXAMPLE_IMAGES);
mustAll(Object.keys(pictures), isProduct, 'picture for unknown');
mustAll(Object.keys(examplePictures), (k) => named.has(k), 'picture for unknown example');
mustAll(Object.keys(EXAMPLE_AKA), (k) => named.has(k), 'other names for unknown example');
mustAll(Object.keys(EXAMPLE_NOTES), (k) => named.has(k), 'note for unknown example');
mustAll(Object.keys(EXAMPLE_AXES), (k) => named.has(k), 'axes for unknown example');
z.record(z.string(), S.Beasts).parse(MILK_OF);
mustAll(Object.keys(MILK_OF), isKnown, 'milk of unknown');

/**
 * Where a regional product or example comes from: up to four countries, as
 * ISO codes, each drawn as its flag (public/assets/flags/). Made in more
 * places than that, it is not regional, and has none. Kept in
 * regions.json, by product id, and by name for an example.
 */
const regions = z.record(z.string(), S.Countries).parse(REGIONS);
mustAll(Object.keys(regions), isKnown, 'region for unknown');

/**
 * How a step is done, told when its arrow is clicked: the facts of it
 * (milk, set, cultures, curd, shaping, salting, ripening, rind), what they do
 * to what is made, and the sources they are from: the product's own
 * specification where it has one; `table`, the few facts written under the
 * arrow itself, a row each. Kept in steps.json, by product id, and by name
 * for an example, whose arrow gets its `label` written on it.
 */
const steps: Record<string, How> = S.Steps.parse(STEPS);
mustAll(Object.keys(steps), isKnown, 'how is made unknown');
// A step as the page has it (see render/How).
const stepOf = (key: string) => steps[key] && howPage(steps[key]);

/**
 * What each product and each example drawn is, shown when it is clicked: the
 * first paragraph of its Wikipedia article, with a link to it, or, for the
 * ones Wikipedia has none on, a paragraph written here from the source it
 * names. Kept in about.json, by product id, and by name for an example. A
 * family only on the map needs none: it has no card of its own.
 */
const about = S.AboutFile.parse(ABOUT);
mustAll(Object.keys(about.products), isProduct, 'about for unknown');
mustAll(Object.keys(about.examples), (k) => named.has(k), 'about for unknown example');
mustAll(Object.keys(NODES), (id) => !!NODES[id].mapped || !!about.products[NODES[id].link ?? id], 'nothing said about');

/* The world's cheeses (see cheeses.json), gathered from Wikipedia's lists of
   cheeses and looked up one by one: every one on the map under cheese, by
   the name the graph has it under if it has it, and that one, an example of
   a family, takes its facts. Then the families' examples the inventory does
   not have, where their flags say. */
const plainName = (said: string) =>
	said.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// The families of cheese: those only on the map, and those drawn in the tree that are cheeses too.
const CHEESY = [
	...Object.keys(NODES).filter((id) => NODES[id].mapped),
	...['lacticCheese', 'sourMilkCheese', 'plantCheese', 'steamedCheese', 'quark', 'cottageCheese', 'creamCheese', 'mascarpone', 'paneer', 'chhena', 'ricotta', 'wheyCheese', 'processed', 'byaslag', 'eezgii', 'buttermilkCheese', 'hardChhurpi', 'stillCheese', 'cookedCheese', 'mish'],
];
mustAll(CHEESY, isProduct, 'cheese family unknown');
const cheeses = S.Cheeses.parse(CHEESES);
mustAll(
	cheeses.flatMap((c) => [c.family, ...(c.secondary ? [c.secondary] : [])]),
	isProduct,
	'cheese of unknown family',
);
const CHEESE: Record<string, Cheese> = {};
const WORLD: string[] = [];
{
	const had = new Map<string, string>();
	for (const x of named) had.set(plainName(x), x);
	const onMap = new Set<string>();
	for (const c of cheeses) {
		const same = [c.name, ...c.aka].map(plainName).map((n) => had.get(n)).find(Boolean) ?? c.name;
		if (onMap.has(same)) continue;
		onMap.add(same);
		CHEESE[same] ??= c;
		WORLD.push(same);
	}
	for (const id of CHEESY) for (const x of NODES[id].examples ?? []) if (!onMap.has(x)) WORLD.push(x);
}

/* A family drawn in the tree that is ripened long enough for time to tell
   its cheeses apart is drawn as a panel, once it has enough of them; each
   placed by the inventory where it has a source, else where most of its
   family's go, and marked so (see UNSURE). */
const RIPENED = ['lacticCheese', 'sourMilkCheese', 'plantCheese', 'steamedCheese'];
for (const id of RIPENED) if ((NODES[id].examples?.length ?? 0) >= 6) NODES[id].panel = true;
const UNSURE = new Set<string>();
const UNSURE_SAID = 'Not found in a source: placed where its family’s cheeses usually are';
const middling = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
// The one most of them are.
const most = <T,>(xs: T[]) => {
	const count = new Map<T, number>();
	for (const x of xs) count.set(x, (count.get(x) ?? 0) + 1);
	return [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
};
for (const n of Object.values(NODES)) {
	const names = n.examples ?? [];
	for (const x of names) {
		const c = CHEESE[x];
		if (c && (c.estimated || c.confidence === 'low')) UNSURE.add(x);
		if (!n.panel || !c?.firm || !c.days || (EXAMPLE_AXES[x] && c.estimated)) continue;
		const [least, longest] = c.days.map((d) => Math.max(1, d));
		EXAMPLE_AXES[x] = { firm: c.firm, days: [Math.min(least, longest), Math.max(least, longest)] };
	}
	if (!n.panel) continue;
	const placed = names.filter((x) => EXAMPLE_AXES[x]).map((x) => EXAMPLE_AXES[x]);
	const usual = {
		firm: most(placed.map((a) => a.firm)) ?? 'semi-hard',
		days: [middling(placed.map((a) => a.days[0])) ?? 30, middling(placed.map((a) => a.days[1])) ?? 90] as [number, number],
	};
	for (const x of names) {
		if (!CHEESE[x] || CHEESE[x].estimated) UNSURE.add(x);
		EXAMPLE_AXES[x] ??= usual;
	}
}

const beastsOf = (key: string): S.Beasts | undefined => MILK_OF[key];
// The animals to filter by: those any product is marked with, the cow first.
export const herd = S.Beast.options.filter((b) => b === 'cow' || Object.values(MILK_OF).some((of) => of.includes(b)));

const exampleFile = (name: string) =>
	`ex-${name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

// Each product, or example, of exactly one of the lists: by its place in them.
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
mustAll(Object.keys(NODES), (id) => id === 'raw' || !!NODES[id].mapped || groupOf.has(id), 'in no group:');
for (const { from, ids } of SPLITS) mustAll(ids, (id) => NODES[id]?.from === from, `split off ${from} but not made from it:`);
// The step is written once, on the arrow before it splits; each part says only what it is.
for (const { step, ids } of SPLITS) mustAll(ids, (id) => !NODES[id].step?.startsWith(step), `repeats the step "${step}" it is split off by:`);
mustAll([...STAPLE, ...KNOWN], isProduct, 'significance names unknown');
mustAll(STAPLE, (id) => !KNOWN.has(id), 'both a staple and well known:');
mustAll(TREATED, isProduct, 'treated names unknown');
const shares = z.record(z.string(), S.Share).parse(SHARES);
mustAll(Object.keys(shares), isProduct, 'share for unknown');
const map = S.WorldMap.parse(MAP);
// Every country named, one on the map, with its flag.
mustAll(
	[...Object.values(regions).flat(), ...cheeses.flatMap((c) => c.countries)],
	(c) => c in map.countries,
	'not a country on the map:',
);

// How much of what is said has no source yet, told once.
{
	const said: S.Sourcing[] = [
		...[...Object.values(about.products), ...Object.values(about.examples)].map((a) => a.sources),
		...Object.values(steps).flatMap((h) => [
			h.sources,
			...(h.processing ? [h.processing.sources] : []),
			// Sources of their own, inside it: a step's, a microbe's, a row's.
			...(h.processing?.steps ?? []).flatMap((x) => [x.sources, ...(x.type === 'ferment' ? (x.adds?.microbes ?? []).map((m) => m.sources) : [])]),
			...[...(h.table ?? []), ...(h.facts ?? [])].map((r) => r.sources),
		]).filter((x) => x !== undefined),
		...KINDS.map((k) => k.how.sources),
		...[...Object.values(pictures), ...Object.values(examplePictures)].map((x) => x.sources),
		...Object.values(shares).map((x) => x.sources),
		...Object.values(CHEESE).map((c) => c.sources),
		map.sources,
	];
	const unsourced = said.filter((x) => 'unsourced' in x).length;
	if (unsourced) console.warn(`MilkGraph: ${unsourced} of ${said.length} things said have no source yet (see Unsourced in milk/graph/schema.ts)`);
}

// Every parent named must be a product, and no product its own ancestor.
for (const [id, { from, alsoFrom = [], at, step, link, mapped }] of Object.entries(NODES)) {
	/* Hung under a ruler, the arrow in has its value, not a step; anything
	   else made from a product with a ruler branches off as from any other.
	   A family only on the map has no arrow at all. */
	const ruled = at !== undefined;
	if (ruled && !NODES[from!]?.scale) throw new Error(`MilkGraph: ${id} has a value on a ruler, but ${from} has none`);
	if (from !== undefined && !ruled && !mapped && !step) throw new Error(`MilkGraph: ${id} has no step`);
	if (from && NODES[from]?.mapped && !mapped) throw new Error(`MilkGraph: ${id} hangs from ${from}, which is only on the map`);
	/* Two at one value share its arrow; two nearly at one would hang one's
	   arrow down beside the other's. */
	const gap = (n: Product) => Math.abs(n.at! - at!);
	if (ruled && Object.entries(NODES).some(([o, n]) => o !== id && n.from === from && gap(n) > 0 && gap(n) < 1))
		throw new Error(`MilkGraph: ${id} is too near another on its ruler`);
	if (link !== undefined && (!(link in NODES) || NODES[link].link)) throw new Error(`MilkGraph: ${id} links to ${link}, which is not a product`);
	mustAll([from, ...alsoFrom].filter((p) => p !== undefined), isProduct, `${id} is made from unknown`);
	for (let up = from, seen = new Set([id]); up !== undefined; up = NODES[up].from) {
		if (seen.has(up)) throw new Error(`MilkGraph: ${id} is made from itself`);
		seen.add(up);
	}
}

/**
 * A product's `examples`, drawn as leaves under it, every one of them by
 * name. An example is not made from its product, so its line has no step
 * written on it and no arrowhead, and it takes its product's family. (`aka`
 * is the same product under other names, and is not drawn.)
 */
// What is known of an example, or a cheese on the map, by its name.
const factsOf = (label: string) => {
	const c = CHEESE[label];
	return {
		image: examplePictures[label] && picturePage(exampleFile(label), examplePictures[label]),
		about: about.examples[label] ?? (c && cheeseAbout(c)),
		regions: regions[label] ?? (c?.countries.length ? c.countries.slice(0, S.MOST_COUNTRIES) : undefined),
		aka: EXAMPLE_AKA[label],
		note: EXAMPLE_NOTES[label],
		beasts: beastsOf(label) ?? (c && c.milk.length && c.milk.join() !== 'cow' ? c.milk : undefined),
		axes: EXAMPLE_AXES[label] ?? (c?.firm && c.days ? { firm: c.firm, days: c.days } : undefined),
		protected: c?.protected ?? undefined,
		unsure: UNSURE.has(label) ? UNSURE_SAID : undefined,
		step: steps[label]?.label,
		// A cheese's sources once: with its paragraph where that is its own, else with how it is made.
		how: stepOf(label) ?? (c && { ...cheeseHow(c), ...(about.examples[label] && { sources: c.sources }) }),
	};
};
const drawn = Object.entries(NODES).filter(([, { mapped }]) => !mapped);
// The family a cheese on the map is of, by its name, where one names it.
const familyOf = new Map(Object.values(NODES).flatMap(({ label, mapped, examples: names = [] }) => (mapped ? names.map((x) => [x, label] as const) : [])));
const leaf = { example: true as const, niche: 2 };
const examples = drawn.flatMap(([kind, { examples: names = [] }]) =>
	names.map((label, i) => ({ id: `${kind}:${i}`, label, kind, ...leaf, rank: i, group: groupOf.get(kind) ?? -1, ...factsOf(label) })),
);
/* The map's cheeses (see WORLD): each where it is made, the first of its
   countries; one with none known is left off. No step on its line, which
   is not drawn: the map is under cheese, as the panels are under
   their families. */
const atlas = WORLD.map((label) => ({ label, ...factsOf(label) }))
	.filter((x) => x.regions?.length)
	.map((x, i) => {
		const c = CHEESE[x.label];
		const family = familyOf.get(x.label) ?? (c && NODES[c.family]?.label);
		return {
			...x,
			id: `atlas:${i}`,
			kind: 'cheese',
			...leaf,
			onMap: true,
			place: x.regions![0],
			area: c?.region ?? undefined,
			spot: c?.x != null ? ([c.x, c.y!] as [number, number]) : undefined,
			guessed: c?.located === 'guess',
			family: family && flat(family),
			rank: i,
			group: groupOf.get('cheese') ?? -1,
			step: undefined,
		};
	});
const leaves = [...examples, ...atlas];
// The names of the families only on the map, and their other names: found by the search, as the map.
const onTheMap = Object.values(NODES).flatMap((n) => (n.mapped ? [flat(n.label), ...(n.aka ?? [])] : []));

export const graph = S.Payload.parse({
	light: LIGHT,
	groups: GROUPS.map(({ name, hub }) => ({ name, hub: hub ?? null })),
	splits: SPLITS,
	kinds: KINDS.map(({ step, ids, how }) => ({ step, ids, how: howPage(how) })),
	// How firm a cheese can be, softest first: a panel's rows.
	firms: S.Firm.options,
	nodes: [
		...drawn.map(([id, { label, step, scale, at, panel, map, below, link, note, aka = [], examples: named = [] }]) => {
			const own = link ?? id;
			return {
				id,
				label,
				// Not drawn, but found by the search: its other names; a map's, the names of the families on it.
				aka: map ? [...aka, ...onTheMap] : aka,
				image: pictures[own] && picturePage(own, pictures[own]),
				about: about.products[own],
				regions: regions[own],
				how: stepOf(id),
				// All its examples, for the card that tells of it.
				named,
				step,
				scale,
				at,
				panel,
				map,
				below,
				link,
				note,
				beasts: beastsOf(own),
				group: groupOf.get(id) ?? -1,
				// 0 a staple, 1 well known, 2 niche.
				niche: STAPLE.has(id) ? 0 : KNOWN.has(id) ? 1 : 2,
				// How much of the world's milk goes its way, in Mt a year and in percent, and how that was worked out (see SHARES).
				share: shares[id] && { mt: shares[id].mt, percent: (shares[id].mt / WORLD_MILK) * 100, sources: shares[id].sources },
			};
		}),
		...leaves.map(({ kind, ...x }) => x),
	],
	links: [
		...drawn.filter(([, { from }]) => from !== undefined).map(([target, { from }]) => ({ source: from!, target, weight: TREATED.has(target) ? LIGHT : 1 })),
		...leaves.map(({ id, kind }) => ({ source: kind, target: id, weight: 1 })),
	],
	// The world's outline, for the map under cheese (see map.json); where it is from stays here.
	map: { height: map.height, countries: map.countries },
});
