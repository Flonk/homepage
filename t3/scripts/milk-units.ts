/*
 * The triage turned into work for the write fleet (see research/prompts/
 * write.md): every new node given its id, and the work cut into units no
 * two of which touch the same file. New examples, by the product or cheese
 * family they are of; enrichments, by the node they add to, every addition
 * to one node in one unit. New products are not in it: there are few,
 * and they are written by hand. Written to research/write/units.json, with
 * the ids of the new nodes in research/write/ids.json and the map's
 * countries in research/write/countries.json.
 *
 *   npm run milk:units
 */
import fs from 'node:fs';
import path from 'node:path';

const GRAPH = path.resolve('src/content/series/milk/data');
const RESEARCH = path.join(GRAPH, 'research');
const OUT = path.join(RESEARCH, 'write');
// The most items a unit holds.
const UNIT = 30;

type Item = { id: string; name: string; names: string[]; places: string[]; entries: { file: string; heading: string }[] };
type Decision = {
	id: string;
	decision: 'enrich' | 'example' | 'product' | 'skip';
	node?: string;
	parent?: string;
	family?: string;
	branded: boolean;
	confidence: 'high' | 'low';
	why: string;
};

const canon: Item[] = JSON.parse(fs.readFileSync(path.join(RESEARCH, 'canon.json'), 'utf8'));
const triage: Decision[] = JSON.parse(fs.readFileSync(path.join(RESEARCH, 'triage.json'), 'utf8'));
const item = new Map(canon.map((i) => [i.id, i]));
const taken = new Set(fs.readdirSync(path.join(GRAPH, 'nodes')).map((f) => f.replace(/\.json$/, '')));

// An id from a name: its words in camel case, no accents, letters and digits only, starting with a letter.
const idOf = (name: string) => {
	const words = name
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/[^A-Za-z0-9]+/g, ' ')
		.trim()
		.split(' ')
		.filter(Boolean);
	const id = words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join('');
	return /^[a-z]/.test(id) ? id : `x${id}`;
};
// The first country a product was found in, to tell two of one name apart.
const countryOf = (i: Item) => (i.places[0] ?? '').split('/')[0];

// Every new node its id: from its name, else with its country, else numbered.
const ids = new Map<string, string>();
for (const d of triage) {
	if (d.decision !== 'example' && d.decision !== 'product') continue;
	const i = item.get(d.id)!;
	// From the first of its names in the Latin script, else from its place in the work list.
	const latin = [i.name, ...i.names].find((n) => /^[\p{Script=Latin}\p{N}\s'’.,()&\/-]+$/u.test(n.normalize('NFC')) && /[A-Za-z]/.test(n.normalize('NFD')));
	const base = latin ? idOf(latin) : `product${d.id.slice(1)}`;
	let id = base;
	if (taken.has(id)) id = `${base}${countryOf(i)}`;
	for (let n = 2; taken.has(id); n++) id = `${base}${n}`;
	taken.add(id);
	ids.set(d.id, id);
}
// What points at a new node by its work-list id, pointed at its new id.
const resolve = (ref?: string) => (ref?.startsWith('new:') ? ids.get(ref.slice(4)) : ref);

const units: { kind: 'example' | 'enrich'; by: string; items: object[] }[] = [];
const chunk = (kind: 'example' | 'enrich', by: string, list: object[]) => {
	for (let i = 0; i < list.length; i += UNIT) units.push({ kind, by, items: list.slice(i, i + UNIT) });
};

// New examples, by the product or family they are of.
const examples = new Map<string, object[]>();
for (const d of triage) {
	if (d.decision !== 'example') continue;
	const by = d.family ?? resolve(d.parent)!;
	const list = examples.get(by) ?? [];
	list.push({ item: d.id, id: ids.get(d.id), ...(d.family ? { family: d.family } : { parent: resolve(d.parent) }), branded: d.branded, estimated: d.confidence === 'low', why: d.why });
	examples.set(by, list);
}
// New files every one, so a unit may hold several products' and families': related ones together.
const allExamples = [...examples].sort(([a], [b]) => a.localeCompare(b)).flatMap(([, list]) => list);
chunk('example', '', allExamples);

// Enrichments, every one of a node in the same unit, as many nodes to a unit as fit.
const enrich = new Map<string, object[]>();
for (const d of triage) {
	if (d.decision !== 'enrich') continue;
	const node = resolve(d.node)!;
	enrich.set(node, [...(enrich.get(node) ?? []), { item: d.id, node, why: d.why }]);
}
let unit: object[] = [];
for (const [, list] of [...enrich].sort(([a], [b]) => a.localeCompare(b))) {
	if (unit.length && unit.length + list.length > UNIT) {
		units.push({ kind: 'enrich', by: '', items: unit });
		unit = [];
	}
	unit.push(...list);
}
if (unit.length) units.push({ kind: 'enrich', by: '', items: unit });

const map = JSON.parse(fs.readFileSync(path.join(GRAPH, 'map.json'), 'utf8'));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'units.json'), JSON.stringify(units, null, '\t') + '\n');
fs.writeFileSync(path.join(OUT, 'ids.json'), JSON.stringify(Object.fromEntries(ids), null, '\t') + '\n');
fs.writeFileSync(path.join(OUT, 'countries.json'), JSON.stringify(Object.keys(map.countries).sort()) + '\n');
console.log(
	`${units.length} units: ${units.filter((u) => u.kind === 'example').length} of new examples (${[...examples.values()].flat().length}), ${units.filter((u) => u.kind === 'enrich').length} of enrichments (${[...enrich.values()].flat().length} items, ${enrich.size} nodes)`,
);
console.log(`new products, by hand: ${triage.filter((d) => d.decision === 'product').map((d) => `${ids.get(d.id)} under ${d.parent}`).join(', ')}`);
