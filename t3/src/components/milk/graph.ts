import ABOUT from './about.json';
import STEPS from './steps.json';
import REGIONS from './regions.json';
import CHEESES from './cheeses.json';
import MAP from './map.json';
import * as S from './schema';
import { NODES, type Product } from './products';
import { IMAGES, EXAMPLE_IMAGES, type Picture } from './pictures';
import { EXAMPLE_AKA, EXAMPLE_NOTES, FIRMS, EXAMPLE_AXES } from './examples';
import { BEASTS, MILK_OF } from './animals';
import { GROUPS, KINDS, SPLITS, TREATED, LIGHT, STAPLE, KNOWN } from './families';
import { WORLD_MILK, SHARES } from './shares';

for (const id of Object.keys(IMAGES)) if (!(id in NODES)) throw new Error(`MilkGraph: picture for unknown ${id}`);
/* The world's cheeses (see cheeses.json), gathered from Wikipedia's
   lists of cheeses and looked up one by one: every one on the map under
   cheese (see WORLD), by the name the graph has it under if it has
   it, and that one, an example of a family, takes its facts. */
type Cheese = S.Cheese;
const plainName = (said: string) =>
	said.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// Ripened long enough for time to tell their cheeses apart: drawn as panels once they have enough of them.
const RIPENED = ['soft', 'bloomy', 'washed', 'semiHard', 'washedCurd', 'hard', 'alpine', 'cheddared', 'blue', 'brined', 'pastaFilata', 'lacticCheese', 'sourMilkCheese', 'plantCheese', 'tulum', 'steamedCheese'];
const CHEESE: Record<string, Cheese> = {};
// The families of cheese, whose examples not in the inventory go on the map too, where their flags say.
const CHEESY = [...RIPENED, 'freshCheese', 'quark', 'cottageCheese', 'creamCheese', 'mascarpone', 'paneer', 'chhena', 'ricotta', 'wheyCheese', 'grilling', 'processed', 'insect', 'lumpCheese', 'bryndza', 'sunDriedCheese', 'byaslag', 'eezgii', 'buttermilkCheese', 'hardChhurpi', 'stillCheese', 'cookedCheese', 'mish', 'stracciatella'];
const WORLD: string[] = [];
{
	const had = new Map<string, string>();
	for (const { examples = [] } of Object.values(NODES)) for (const x of examples) had.set(plainName(x), x);
	const onMap = new Set<string>();
	for (const c of S.Cheeses.parse(CHEESES)) {
		const same = [c.name, ...c.aka].map(plainName).map((n) => had.get(n)).find(Boolean) ?? c.name;
		if (onMap.has(same)) continue;
		onMap.add(same);
		CHEESE[same] ??= c;
		WORLD.push(same);
	}
	for (const id of CHEESY) for (const x of NODES[id]?.examples ?? []) if (!onMap.has(x)) WORLD.push(x);
	for (const id of RIPENED) if ((NODES[id].examples?.length ?? 0) >= 6) NODES[id].panel = true;
}
const named = new Set(Object.values(NODES).flatMap(({ examples = [] }) => examples));
for (const name of Object.keys(EXAMPLE_IMAGES)) if (!named.has(name)) throw new Error(`MilkGraph: picture for unknown example ${name}`);
for (const name of Object.keys(EXAMPLE_AKA)) if (!named.has(name)) throw new Error(`MilkGraph: other names for unknown example ${name}`);
for (const name of Object.keys(EXAMPLE_NOTES)) if (!named.has(name)) throw new Error(`MilkGraph: note for unknown example ${name}`);
for (const name of Object.keys(EXAMPLE_AXES)) if (!named.has(name)) throw new Error(`MilkGraph: axes for unknown example ${name}`);
/* The rest from the inventory, and its over the guesses above where it has
   a source. A cheese whose place it could not find in a source is marked
   so (see UNSURE); one in a panel it has nothing for at all goes where most
   of its family's go. */
const UNSURE = new Set<string>();
const middling = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
for (const n of Object.values(NODES)) {
	const names = n.examples ?? [];
	for (const x of names) {
		const c = CHEESE[x];
		if (c && (c.estimated || c.confidence === 'low')) UNSURE.add(x);
		if (!n.panel || !c?.firm || !c.days || (EXAMPLE_AXES[x] && c.estimated)) continue;
		const [least, most] = c.days.map((d) => Math.max(1, d));
		EXAMPLE_AXES[x] = { firm: c.firm as (typeof FIRMS)[number], days: [Math.min(least, most), Math.max(least, most)] };
	}
	if (!n.panel) continue;
	const placed = names.filter((x) => EXAMPLE_AXES[x]).map((x) => EXAMPLE_AXES[x]);
	const firms = placed.map((a) => a.firm);
	const usual = {
		firm: firms.sort((a, b) => firms.filter((v) => v === b).length - firms.filter((v) => v === a).length)[0] ?? 'semi-hard',
		days: [middling(placed.map((a) => a.days[0])) ?? 30, middling(placed.map((a) => a.days[1])) ?? 90] as [number, number],
	};
	for (const x of names) {
		if (!CHEESE[x] || CHEESE[x].estimated) UNSURE.add(x);
		if (EXAMPLE_AXES[x]) continue;
		EXAMPLE_AXES[x] = usual;
	}
}
const UNSURE_SAID = 'Not found in a source: placed where its family’s cheeses usually are';
/* What the inventory says of a cheese the graph has nothing else on: what
   it is, from the list it was found in or else from its facts, and how it
   is made, for its card. */
const regionName = new Intl.DisplayNames(['en'], { type: 'region' });
const MILK_WORD: Record<string, string> = { cow: 'cow', sheep: 'sheep', goat: 'goat', buffalo: 'buffalo', camel: 'camel', yak: 'yak', horse: 'mare', donkey: 'donkey', reindeer: 'reindeer' };
const cheeseAbout = (c: Cheese): About => {
	const milk = c.milk.map((m) => MILK_WORD[m] ?? m).join(' and ');
	const from = c.countries.map((k) => regionName.of(k)).join(', ');
	const text = c.desc ?? `A ${c.firm ? `${c.firm} ` : ''}cheese${milk ? ` of ${milk} milk` : ''}${from ? ` from ${from}` : ''}.`;
	return { text, sources: c.sources };
};
const SET_WORD: Record<string, string> = { rennet: 'rennet', acid: 'lactic acid', 'rennet-acid': 'lactic acid and a little rennet', 'acid-heat': 'heat and acid', plant: 'a plant coagulant', heat: 'boiled down', none: 'melted' };
const cheeseHow = (c: Cheese): Omit<How, 'sources'> => ({
	table: [
		...(c.milk.length ? [{ k: 'Milk', v: c.milk.map((m) => MILK_WORD[m] ?? m).join(', ') }] : []),
		...(c.coagulation ? [{ k: 'Set with', v: SET_WORD[c.coagulation] ?? c.coagulation }] : []),
		...(c.rind ? [{ k: 'Rind', v: c.rind }] : []),
		...(c.protected ? [{ k: 'Protected', v: c.protected }] : []),
	],
	// What its sources were, and what in it is not checked; the links themselves are with its paragraph.
	text: c.sources.text,
});
for (const key of Object.keys(MILK_OF)) if (!(key in NODES) && !named.has(key)) throw new Error(`MilkGraph: milk of unknown ${key}`);
const beastsOf = (key: string) => MILK_OF[key]?.map((b) => BEASTS[b]);
// The animals to filter by: those any product is marked with, the cow first.
export const herd = Object.values(BEASTS).filter((b) => b.milk === 'cow' || Object.values(MILK_OF).some((of) => of.some((k) => BEASTS[k] === b)));

/**
 * How a step is done, told when its arrow is clicked: the facts of it
 * (milk, set, cultures, curd, shaping, salting, ripening, rind), what they do
 * to what is made, and the sources they are from: the product's own
 * specification where it has one. Kept in steps.json, by product id,
 * and by name for an example, whose arrow gets its `label` written on it.
 */
/**
 * Where a regional product or example comes from: up to four countries, as
 * ISO codes, each drawn as its flag (public/assets/flags/). Made in more
 * places than that, it is not regional, and has none. Kept in
 * regions.json, by product id, and by name for an example.
 */
const regions = REGIONS as Record<string, string[]>;
for (const [key, codes] of Object.entries(regions)) {
	if (!(key in NODES) && !named.has(key)) throw new Error(`MilkGraph: region for unknown ${key}`);
	if (codes.length < 1 || codes.length > 4 || codes.some((c) => !/^[A-Z]{2}$/.test(c)))
		throw new Error(`MilkGraph: ${key} has to come from one to four countries`);
}

// `table`: the few facts written under the arrow itself, a row each.
type How = S.How;
const steps: Record<string, How> = S.Steps.parse(STEPS);
for (const key of Object.keys(steps))
	if (!(key in NODES) && !named.has(key)) throw new Error(`MilkGraph: how unknown ${key} is made`);
const exampleFile = (name: string) =>
	`ex-${name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
const pictured = (file: string, { file: what, author, license, sources }: Picture) => ({
	src: `/assets/milk/${file}.webp`,
	credit: `${what} · ${author} · ${license}`,
	author,
	license,
	source: 'links' in sources ? sources.links[0].url : '',
});

/**
 * What each product and each example drawn is, shown when it is clicked: the
 * first paragraph of its Wikipedia article, with a link to it, or, for the
 * ones Wikipedia has none on, a paragraph written here from the source it
 * names. Kept in about.json, by product id, and by name for an example.
 */
type About = S.About;
const about = S.AboutFile.parse(ABOUT);
for (const id of Object.keys(about.products)) if (!(id in NODES)) throw new Error(`MilkGraph: about for unknown ${id}`);
for (const [id, { link }] of Object.entries(NODES)) if (!about.products[link ?? id]) throw new Error(`MilkGraph: nothing said about ${id}`);
for (const name of Object.keys(about.examples)) if (!named.has(name)) throw new Error(`MilkGraph: about for unknown example ${name}`);

// A product in no family, or in two, or a family naming one that is gone, is
// a mistake in the lists above: said at build time, not drawn wrong.
const groupOf = new Map<string, number>();
GROUPS.forEach(({ ids }, g) =>
	ids.forEach((id) => {
		if (!(id in NODES)) throw new Error(`MilkGraph: group ${GROUPS[g].name} names unknown ${id}`);
		if (groupOf.has(id)) throw new Error(`MilkGraph: ${id} is in two groups`);
		groupOf.set(id, g);
	}),
);
for (const id of Object.keys(NODES))
	if (id !== 'raw' && !groupOf.has(id)) throw new Error(`MilkGraph: ${id} is in no group`);
for (const [k, { ids }] of KINDS.entries())
	for (const id of ids) {
		if (!(id in NODES)) throw new Error(`MilkGraph: kind ${KINDS[k].step} names unknown ${id}`);
		if (KINDS.some((o, j) => j !== k && o.ids.includes(id))) throw new Error(`MilkGraph: ${id} is of two kinds`);
	}
for (const { from, ids } of SPLITS)
	for (const id of ids) if (NODES[id]?.from !== from) throw new Error(`MilkGraph: ${id} is split off ${from} but not made from it`);
for (const id of [...STAPLE, ...KNOWN])
	if (!(id in NODES)) throw new Error(`MilkGraph: significance names unknown ${id}`);
for (const id of Object.keys(SHARES)) if (!(id in NODES)) throw new Error(`MilkGraph: share for unknown ${id}`);
{
	const said: S.Sourcing[] = [
		...[...Object.values(about.products), ...Object.values(about.examples)].map((a) => a.sources),
		...Object.values(steps).map((h) => h.sources),
		...KINDS.map((k) => S.How.parse(k.how).sources),
		...[...Object.values(IMAGES), ...Object.values(EXAMPLE_IMAGES)].map((x) => S.Picture.parse(x).sources),
		...Object.values(SHARES).map((x) => S.Share.parse(x).sources),
		...Object.values(CHEESE).map((c) => c.sources),
		S.WorldMap.parse(MAP).sources,
	];
	const unsourced = said.filter((x) => 'unsourced' in x).length;
	if (unsourced) console.warn(`MilkGraph: ${unsourced} of ${said.length} things said have no source yet (see Unsourced in milk/schema.ts)`);
}

// Every parent named must be a product, and no product its own ancestor.
for (const [id, { from, alsoFrom = [] }] of Object.entries(NODES)) {
	// Under a ruler the arrow in has its value, not a step.
	const ruled = from !== undefined && !!NODES[from]?.scale;
	if (from !== undefined && !ruled && !NODES[id].step) throw new Error(`MilkGraph: ${id} has no step`);
	if (ruled !== (NODES[id].at !== undefined)) throw new Error(`MilkGraph: ${id} must have a value on a ruler if and only if it hangs from one`);
	/* Two at one value share its arrow; two nearly at one would hang one's
	   arrow down beside the other's. */
	const gap = (n: Product) => Math.abs(n.at! - NODES[id].at!);
	if (ruled && Object.entries(NODES).some(([o, n]) => o !== id && n.from === from && gap(n) > 0 && gap(n) < 1))
		throw new Error(`MilkGraph: ${id} is too near another on its ruler`);
	const { link } = NODES[id];
	if (link !== undefined && (!(link in NODES) || NODES[link].link)) throw new Error(`MilkGraph: ${id} links to ${link}, which is not a product`);
	for (const p of [from, ...alsoFrom])
		if (p !== undefined && !(p in NODES)) throw new Error(`MilkGraph: ${id} is made from unknown ${p}`);
	for (let at = from, seen = new Set([id]); at !== undefined; at = NODES[at].from) {
		if (seen.has(at)) throw new Error(`MilkGraph: ${id} is made from itself`);
		seen.add(at);
	}
}

/**
 * A product's `examples`, drawn as leaves under it, every one of them by
 * name. An example is not made from its product, so its line has no step written on it and no arrowhead, and it
 * takes its product's family. (`aka` is the same product under other
 * names, and is not drawn.)
 */
// What is known of an example, or a cheese on the map, by its name.
const factsOf = (label: string) => ({
		image: EXAMPLE_IMAGES[label] && pictured(exampleFile(label), EXAMPLE_IMAGES[label]),
		about: about.examples[label] ?? (CHEESE[label] && cheeseAbout(CHEESE[label])),
		regions: regions[label] ?? (CHEESE[label]?.countries.length ? CHEESE[label].countries.slice(0, 4) : undefined),
		aka: EXAMPLE_AKA[label],
		note: EXAMPLE_NOTES[label],
		beasts: beastsOf(label) ?? (CHEESE[label] && CHEESE[label].milk.join() !== 'cow' && CHEESE[label].milk.length ? CHEESE[label].milk.map((m) => BEASTS[m as keyof typeof BEASTS]).filter(Boolean) : undefined),
		axes: EXAMPLE_AXES[label] ?? (CHEESE[label]?.firm && CHEESE[label].days ? { firm: CHEESE[label].firm!, days: CHEESE[label].days! } : undefined),
		protected: CHEESE[label]?.protected,
		unsure: UNSURE.has(label) ? UNSURE_SAID : undefined,
		step: steps[label]?.label,
		// A cheese's sources once: with its paragraph where that is its own, else with how it is made.
		how: steps[label] ?? (CHEESE[label] && { ...cheeseHow(CHEESE[label]), ...(about.examples[label] && { sources: CHEESE[label].sources }) }),
});
const drawn = Object.entries(NODES).filter(([, { mapped }]) => !mapped);
for (const [id, { from }] of drawn) if (from && NODES[from].mapped) throw new Error(`MilkGraph: ${id} hangs from ${from}, which is only on the map`);
// The family a cheese on the map is of, by its name, where one names it.
const familyOf = new Map(Object.values(NODES).flatMap(({ label, mapped, examples: names = [] }) => (mapped ? names.map((x) => [x, label] as const) : [])));
const examples = drawn.flatMap(([kind, { examples: names = [] }]) =>
	names.map((label, i) => ({
		id: `${kind}:${i}`,
		label,
		kind,
		example: true,
		rank: i,
		group: groupOf.get(kind) ?? -1,
		niche: 2,
		...factsOf(label),
	})),
);
/* The map's cheeses (see WORLD): each where it is made, the first of its
   countries; one with none known is left off. No step on its line, which
   is not drawn: the map is under cheese, as the panels are under
   their families. */
const atlas = WORLD.map((label) => ({ label, ...factsOf(label) }))
	.filter((x) => x.regions?.length)
	.map((x, i) => ({
		...x,
		id: `atlas:${i}`,
		kind: 'cheese',
		example: true,
		onMap: true,
		place: x.regions![0],
		area: CHEESE[x.label]?.region ?? undefined,
		spot: CHEESE[x.label]?.x != null ? ([CHEESE[x.label].x!, CHEESE[x.label].y!] as [number, number]) : undefined,
		guessed: CHEESE[x.label]?.located === 'guess',
		family: (familyOf.get(x.label) ?? (CHEESE[x.label] && NODES[CHEESE[x.label].family]?.label))?.replace('\n', ' '),
		rank: i, group: groupOf.get('cheese') ?? -1, niche: 2, step: undefined }));

export const graph = {
	light: LIGHT,
	groups: GROUPS.map(({ name, hub }) => ({ name, hub: hub ?? null })),
	splits: SPLITS,
	kinds: KINDS,
	nodes: drawn.map(([id, { label, step, scale, at, panel, map, below, link, note, aka = [], examples: named = [] }]) => ({
		id,
		label,
		// Not drawn, but found by the search: its other names; a map's, the names of the families on it.
		aka: map ? [...aka, ...Object.values(NODES).flatMap((n) => (n.mapped ? [n.label.replace('\n', ' '), ...(n.aka ?? [])] : []))] : aka,
		image: IMAGES[link ?? id] && pictured(link ?? id, IMAGES[link ?? id]),
		about: about.products[link ?? id],
		regions: regions[link ?? id],
		how: steps[id],
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
		beasts: beastsOf(link ?? id),
		group: groupOf.get(id) ?? -1,
		// 0 a staple, 1 well known, 2 niche.
		niche: STAPLE.has(id) ? 0 : KNOWN.has(id) ? 1 : 2,
		// How much of the world's milk goes its way, in Mt a year and in percent, and how that was worked out (see SHARES).
		shareMt: SHARES[id]?.mt,
		share: SHARES[id] && (SHARES[id].mt / WORLD_MILK) * 100,
		shareSources: SHARES[id]?.sources,
	}))
		.concat(examples.map(({ kind, ...example }) => example) as any)
		.concat(atlas.map(({ kind, ...cheese }) => cheese) as any),
	links: drawn
		.filter(([, { from }]) => from !== undefined)
		.map(([target, { from }]) => ({ source: from!, target, weight: TREATED.has(target) ? LIGHT : 1 }))
		.concat(examples.map(({ id, kind }) => ({ source: kind, target: id, weight: 1 })))
		.concat(atlas.map(({ id, kind }) => ({ source: kind, target: id, weight: 1 }))),
	// The world's outline, for the map under cheese (see map.json).
	map: MAP,
};
