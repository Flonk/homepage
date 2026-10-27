import MAP from '../../data/map.json';
import FAMOUS_CHEESES from '../../data/famous-cheeses.json';
import * as S from './schema';
import { GROUPS, LIGHT } from '../../data/families';
import fs from 'node:fs';
import path from 'node:path';
import { DIR, load, loadAnimals, loadReconciled } from './source';
import { herdOf } from './build/herd';
import { waysOf } from './ways';
import { WORLD_MILK } from '../../data/world';
import { page as howPage, type Told } from './render/How';
import { sourcingOf, tellUnsourced } from './build/sources';
import { panelsOf } from './build/panels';
import { mustAll, placed } from './build/must';
import { withoutMinorBrands } from './build/brands';
import { cheesesOf } from './build/cheeses';
import { tablesOf } from './build/tables';
import { chainsOf } from './build/reconcile';
import { page as picturePage } from './render/Picture';
import { about as cheeseAbout, facts as cheeseFacts } from './render/Cheese';

/*
 * The build step: the graph's data made into the tree the page draws (see
 * MilkGraph.astro and pages/milk-graph.json.ts), and into the map, and
 * checked as it is; run by scripts/milk-graph.ts, which writes it to
 * built/graph.json. Every node in nodes/, every process in processes/,
 * the arrows between them, and the rankings of the ways into a node in
 * rankings/: the tree is drawn along the first way in each ranking. A node that names one that is not there, a
 * process from or to one that is not, or one in two families, is a
 * mistake: said at build time, not drawn wrong.
 */

type Node = S.Node;

const { nodes, processes, rankings } = withoutMinorBrands(load());
// Each list of the families against its schema.
S.Group.array().parse(GROUPS);
const all = Object.entries(nodes);
const products = all.filter(([, n]) => !n.example);
const isProduct = (id: string) => id in nodes && !nodes[id].example;
const isExample = (id: string) => id in nodes && !!nodes[id].example;

/* Each process named for what it is made from and what it makes, and from
   and to nodes that are there. */
for (const [id, p] of Object.entries(processes)) {
	if (id.split('~')[0] !== `${p.from.join('+')}--${p.to.join('+')}`) throw new Error(`MilkGraph: process ${id} is not named for its from and to`);
	mustAll([...p.from, ...p.to], (x) => x in nodes, `process ${id} names unknown`);
}
/* The ways into each node; of each, the one it is drawn at the end of:
   the first its ranking has where there are several (see ways.ts). A way
   made since its node was ranked is ranked last, and said. */
const ways = waysOf(processes, rankings);
const wrong = ways.problems();
if (wrong.length) throw new Error(`MilkGraph: ${wrong.join('; ')}`);
mustAll(Object.keys(rankings), (id) => id in nodes, 'a ranking of what is no node:');
for (const id of Object.keys(rankings)) if (ways.unranked(id).length) console.warn(`MilkGraph: ${id} has ways not in its ranking yet, ranked last: ${ways.unranked(id).join(', ')}`);
const drawnWay = new Map<string, S.Process>();
for (const id of ways.into.keys()) drawnWay.set(id, processes[ways.drawn(id)!]);
const waysInto = ways.into;
// What a product is drawn made from: one parent, a product.
const fromOf = (id: string) => {
	const p = drawnWay.get(id);
	if (!p) return undefined;
	if (p.from.length > 1) throw new Error(`MilkGraph: ${id} is drawn made from ${p.from.join(' and ')}, a blend, which the tree has no room for`);
	return p.from[0];
};
/* What is said of it on its way in. Where its process makes several, only
   its own leg: its step ("the whey"), its steps, its paragraph; what they
   all go through before they part is said on the split (see splits). */
const wayIn = (id: string): (Told & { step?: string }) | undefined => {
	const p = drawnWay.get(id);
	if (!p) return undefined;
	if (p.to.length < 2) return { step: p.step, text: p.text, sources: p.sources, processing: p.processing };
	const leg = p.legs?.[id] ?? {};
	const steps = leg.processing?.steps ?? [];
	const vouched = leg.processing?.sources ?? p.processing?.sources;
	return { step: leg.step, text: leg.text, sources: leg.sources ?? p.sources, processing: steps.length && vouched ? { steps, sources: vouched } : undefined };
};
// Its steps as drawn: those minor left out, kept in the data (see Held in schemas/steps.ts).
const major = (processing: Told['processing']) => {
	const steps = processing?.steps.filter((s) => !s.minor) ?? [];
	return steps.length ? { ...processing!, steps } : undefined;
};
const told = ({ text, sources, processing }: Told) => (text || sources || major(processing) ? howPage({ text, sources, processing: major(processing) }) : undefined);
/* For the page's dev mode, of the way a node is drawn along: that it has
   no sources at all, or something on it has none yet; that it was not
   picked by a share, where it is made several ways. */
const devOf = (id: string) => {
	const p = drawnWay.get(id);
	if (!p) return undefined;
	const said = [p, ...(p.to.length > 1 && p.legs?.[id] ? [p.legs[id]] : [])].flatMap(sourcingOf);
	const unsourced = !said.length || said.some((x) => 'unsourced' in x);
	// How many ways lead in, where the one drawn was picked by no share.
	const unranked = ways.rated(id) ? undefined : ways.into.get(id)!.length;
	return unsourced || unranked ? { ...(unsourced && { unsourced: true as const }), ...(unranked && { unranked }) } : undefined;
};
// A label on one line, its line breaks spaces.
const flat = (label: string) => label.replace(/\n/g, ' ');

/* Each example is named by at most one product, which it is drawn under;
   a cheese no product names is of its family. */
const ofProduct = new Map<string, string>();
for (const [id, n] of products) {
	mustAll(n.examples ?? [], isExample, `${id} names as its example what is no example:`);
	mustAll(n.examples ?? [], (x) => !ofProduct.has(x), `named by two products:`);
	for (const x of n.examples ?? []) ofProduct.set(x, id);
}
// A variant arrow runs from a product to its own examples, and an arrow to an example is a variant one.
for (const [id, p] of Object.entries(processes)) {
	const toExamples = p.to.filter(isExample);
	if (!p.variant && toExamples.length) throw new Error(`MilkGraph: ${id} leads to an example, ${toExamples[0]}, but is no variant arrow`);
	if (p.variant) mustAll(p.to, (x) => p.from.length === 1 && ofProduct.get(x) === p.from[0], `${id} is a variant arrow, but not from the product naming as its example`);
}
for (const [id, n] of all) {
	mustAll([n.family, n.also].filter((f) => f !== undefined), isProduct, `${id} is of an unknown family:`);
	if (n.example && !ofProduct.has(id) && !n.family) throw new Error(`MilkGraph: ${id} is an example of nothing`);
}

// Every parent named must be a product, and no product its own ancestor.
for (const [id, { at, link, below }] of products) {
	const from = fromOf(id);
	const step = wayIn(id)?.step;
	/* Hung under a ruler, the arrow in has its value, not a step; anything
	   else made from a product with a ruler branches off as from any other. */
	const ruled = at !== undefined;
	if (ruled && !nodes[from!]?.scale) throw new Error(`MilkGraph: ${id} has a value on a ruler, but ${from} has none`);
	// One made with others by a split has its step on the split, and may have none of its own.
	const split = (drawnWay.get(id)?.to.length ?? 0) > 1;
	if (from !== undefined && !ruled && !step && !split) throw new Error(`MilkGraph: ${id} has no step`);
	/* Two at one value share its arrow; two nearly at one would hang one's
	   arrow down beside the other's. */
	const gap = (n: Node) => Math.abs(n.at! - at!);
	if (ruled && products.some(([o, n]) => o !== id && fromOf(o) === from && gap(n) > 0 && gap(n) < 1)) throw new Error(`MilkGraph: ${id} is too near another on its ruler`);
	if (link !== undefined && (!isProduct(link) || nodes[link].link)) throw new Error(`MilkGraph: ${id} links to ${link}, which is not a product`);
	// Drawn again, or hung under a ruler, it has no examples of its own.
	if (link !== undefined && nodes[id].examples?.length) throw new Error(`MilkGraph: ${id} links to ${link}, so its examples belong there`);
	if (ruled && nodes[id].examples?.length) throw new Error(`MilkGraph: ${id} hangs under a ruler, which leaves no room for examples`);
	if (ruled && products.some(([o]) => fromOf(o) === id)) throw new Error(`MilkGraph: ${id} hangs under a ruler, which leaves no room for anything made from it`);
	if (below !== undefined && fromOf(below) !== from) throw new Error(`MilkGraph: ${id} is drawn below ${below}, which is no sibling of it`);
	mustAll((waysInto.get(id) ?? []).flatMap((w) => processes[w].from), isProduct, `${id} is made from what is no product:`);
	for (let up = from, seen = new Set([id]); up !== undefined; up = fromOf(up)) {
		if (seen.has(up)) throw new Error(`MilkGraph: ${id} is made from itself`);
		seen.add(up);
	}
	// What a product is, said on its card.
	if (!nodes[link ?? id].about) throw new Error(`MilkGraph: nothing said about ${id}`);
}

const groupOf = placed(GROUPS, 'group', isProduct);
// Milk is in none.
mustAll(products.map(([id]) => id), (id) => id === 'raw' || groupOf.has(id), 'in no group:');
/* A process making several products at once, each drawn with an arrow of
   its own, side by side out of one double arrow, which carries its step
   and what is done before they part; each part says only what it is
   besides. Making examples, it is not drawn. */
const splits: S.SplitPage[] = Object.entries(processes).flatMap(([id, p]) => {
	if (p.to.length < 2 || !p.to.some(isProduct)) return [];
	mustAll(p.to, (to) => isProduct(to) && drawnWay.get(to) === p, `${id} splits into what is not drawn made by it:`);
	if (p.from.length > 1 || !p.step) throw new Error(`MilkGraph: ${id} splits, so needs one input and a step`);
	mustAll(p.to, (to) => !p.legs?.[to]?.step?.startsWith(p.step!), `repeats the step "${p.step}" it is split off by:`);
	return [{ from: p.from[0], step: p.step, how: told({ text: p.text, sources: p.sources, processing: p.processing }), ids: p.to }];
});

const map = S.WorldMap.parse(MAP);
// Every country named, one on the map, with its flag.
mustAll(all.flatMap(([, n]) => n.regions ?? []), (c) => c in map.countries, 'not a country on the map:');
// And with its flag drawn: public/assets/flags/<code>.webp, round (see markPainter).
const FLAGS = path.resolve(DIR, '../../../../../public/assets/flags');
mustAll(new Set(all.flatMap(([, n]) => n.regions ?? [])), (c) => fs.existsSync(path.join(FLAGS, `${c.toLowerCase()}.webp`)), 'no flag in public/assets/flags for');

tellUnsourced(nodes, processes, rankings, map);
// The drawn arrows not reconciled since they or any above them changed (see schemas/reconciled.ts).
const chains = chainsOf(processes, ways);
const unreconciled = chains.stale(loadReconciled()).length;
if (unreconciled) console.warn(`MilkGraph: ${unreconciled} of ${chains.drawn.length} arrows drawn are to be reconciled (milk:graph reconcile plan)`);

const cheesy = (id: string) => !!nodes[id].cheese || GROUPS[groupOf.get(id) ?? -1]?.name === 'Cheese';
const { world, ownerOf, uncrowded, unlisted } = cheesesOf(nodes, ofProduct, cheesy);
// The world's most made and best known cheeses, each one there is a node for.
const fame = new Map(S.FamousCheeses.parse(FAMOUS_CHEESES).cheeses.flatMap((c) => (c.id ? [[c.id, c.rank] as const] : [])));
const famous = new Set(fame.keys());
mustAll(famous, (id) => id in nodes, 'famous-cheeses.json names what is no node:');
const tables = tablesOf(nodes, (type) => world.map(([id]) => id).filter((id) => ownerOf(id) === type), famous);

const { panelled, unsure, axesOf, UNSURE_SAID } = panelsOf(nodes);

// The animals to filter by: those any node is marked with, the cow first.
const marked = (n: Node) => (n.beasts && n.beasts.join() !== 'cow' ? n.beasts : undefined);
export const herd = S.Beast.options.filter((b) => b === 'cow' || all.some(([, n]) => marked(n)?.includes(b)));

const exampleFile = (name: string) =>
	`ex-${name
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')}`;

/**
 * An example as the page has it: drawn as a leaf under its product, in its
 * panel, or on the map. It is a kind of its product, not made from it: its
 * line carries the way it is made, from whatever it is made from, and it
 * takes its product's family.
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
		beasts: marked(n),
		axes: tables.axesOf.get(id) ?? axesOf.get(id),
		standing: tables.standing.get(id) ?? (famous.has(id) ? ('famous' as const) : undefined),
		fame: fame.get(id),
		protected: n.protected,
		composition: n.composition,
		facts: [...(cheese ? cheeseFacts(n) : []), ...(n.facts ?? []).map(({ k, v }) => ({ k, v }))],
		raw: n.raw,
		live: n.live,
		// Its sources, where they are not with its paragraph.
		sources: n.sources && JSON.stringify(n.sources) !== JSON.stringify(n.about?.sources) ? n.sources : undefined,
		unsure: unsure.has(id) || tables.unsure.has(id) ? UNSURE_SAID : undefined,
		step: wayIn(id)?.step,
		how: wayIn(id) && told(wayIn(id)!),
		dev: devOf(id),
		example: true as const,
		niche: 2 as const,
	};
};
// Drawn under its product: those on its table; else the examples it names, and the cheeses of its family it does not name.
// Of the examples it names, those not hidden for there being too many (see hidden in Node).
const drawnOf = (examples: string[]) => examples.filter((x) => !nodes[x].hidden);
const leaves = products.flatMap(([kind, { examples = [] }]) =>
	(tables.shown.get(kind) ?? [...drawnOf(examples), ...uncrowded.filter((id) => ownerOf(id) === kind)]).map((id, rank) => ({
		...exampleOf(id),
		id,
		kind,
		rank,
		group: groupOf.get(kind) ?? -1,
	})),
);
const examples = leaves;

export const graph = S.Payload.parse({
	light: LIGHT,
	groups: GROUPS.map(({ name }) => ({ name })),
	splits,
	// How firm a cheese can be, softest first: a panel's rows.
	firms: S.Firm.options,
	nodes: [
		...products.map(([id, { label, scale, at, below, link, aka = [], examples: named = [], niche }]) => {
			const own = nodes[link ?? id];
			return {
				id,
				label,
				// Not drawn, but found by the search: its other names; and, not said on its card, those of its cheeses left off its table.
				aka,
				offTable: [...(tables.hidden.get(id) ?? unlisted(id)), ...(nodes[id].examples ?? []).filter((x) => nodes[x].hidden)].flatMap((x) => [flat(nodes[x].label), ...(nodes[x].aka ?? [])]),
				image: own.picture && picturePage(link ?? id, own.picture),
				about: own.about,
				regions: own.regions,
				how: wayIn(id) && told(wayIn(id)!),
				dev: devOf(id),
				// All its examples, for the card that tells of it, by name.
				named: named.map((x) => nodes[x].label),
				step: wayIn(id)?.step,
				scale,
				at,
				panel: tables.pages.has(id) || panelled(id) || undefined,
				table: tables.pages.get(id),
				below,
				link,
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
		...products.filter(([id]) => fromOf(id) !== undefined).map(([target]) => ({ source: fromOf(target)!, target, weight: nodes[target].light ? LIGHT : 1 })),
		...examples.map(({ id, kind }) => ({ source: kind, target: id, weight: 1 })),
	],
	animals: herdOf(loadAnimals()),
});
