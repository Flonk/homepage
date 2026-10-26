/*
 * The research turned into one work list for the conversion (see
 * research/prompts): every product named in the notes under
 * research/found/, the same product under several names made one (see
 * research/same.json), each with where it was found, the entries that tell
 * of it, and the graph's nodes it may already be, by any of its names
 * (candidates only: a local name can be another product's). Written to
 * research/canon.json.
 *
 *   npm run milk:canon
 */
import fs from 'node:fs';
import path from 'node:path';

const GRAPH = path.resolve('src/content/series/milk/data');
const RESEARCH = path.join(GRAPH, 'research');

type Entry = { file: string; heading: string; place: string; kind: 'dairy' | 'cheese'; what: string };
type Item = { id: string; name: string; names: string[]; kinds: string[]; places: string[]; entries: Entry[]; matches: string[]; kindOf?: string };

// Lower case, no accents, words only: how names are matched.
const norm = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();

// Every entry in the notes: its main name, its other names as the heading gives them, and what it says it is.
const files: string[] = [];
const walk = (d: string) => {
	for (const f of fs.readdirSync(d)) {
		const p = path.join(d, f);
		if (fs.statSync(p).isDirectory()) walk(p);
		else if (f.endsWith('.md')) files.push(p);
	}
};
walk(path.join(RESEARCH, 'found'));
const entries: (Entry & { main: string; others: string[] })[] = [];
for (const f of files) {
	const rel = path.relative(path.join(RESEARCH, 'found'), f).replace(/\.md$/, '');
	const [kind, ...rest] = rel.split('/');
	const body = fs.readFileSync(f, 'utf8').split(/^## Unconfirmed leads/m)[0];
	for (const block of body.split(/^## /m).slice(1)) {
		const heading = block.split('\n')[0].trim();
		// The main name before any brackets; the other names inside them.
		const open = heading.indexOf('(');
		const m = [heading, (open < 0 ? heading : heading.slice(0, open)).trim(), open < 0 ? '' : heading.slice(open + 1, heading.lastIndexOf(')') > open ? heading.lastIndexOf(')') : undefined)];
		if (!m[1]) continue;
		const others = (m[2] ?? '')
			.split(/[;,]/)
			.map((s) => s.replace(/^[^:]{1,25}:\s*/, '').replace(/["«»“”]/g, '').trim())
			.filter((s) => s && s.split(' ').length <= 3 && !/\d/.test(s));
		const what = (block.match(/^- What it is: (.*)$/m)?.[1] ?? '').slice(0, 240);
		entries.push({ file: `found/${rel}.md`, heading, place: rest.join('/'), kind: kind as Entry['kind'], what, main: m[1].trim(), others });
	}
}

// Names judged the same product, each to one group.
const same: { same: { name: string; names: string[] }[]; kindOf: { product: string; kind: string }[] } = JSON.parse(
	fs.readFileSync(path.join(RESEARCH, 'same.json'), 'utf8'),
);
const groupOf = new Map<string, string>();
for (const g of same.same) for (const n of [g.name, ...g.names]) groupOf.set(norm(n), norm(g.name));
const keyOf = (name: string) => groupOf.get(norm(name)) ?? norm(name);

// The graph's nodes by every name they go by.
const byName = new Map<string, Set<string>>();
for (const f of fs.readdirSync(path.join(GRAPH, 'nodes'))) {
	const n = JSON.parse(fs.readFileSync(path.join(GRAPH, 'nodes', f), 'utf8'));
	const id = f.replace(/\.json$/, '');
	for (const name of [n.label.replace(/\n/g, ' '), ...(n.aka ?? [])]) {
		const k = keyOf(name);
		if (!byName.has(k)) byName.set(k, new Set());
		byName.get(k)!.add(id);
	}
}

const items = new Map<string, Item>();
for (const e of entries) {
	const k = keyOf(e.main);
	if (!k) continue;
	let item = items.get(k);
	if (!item) {
		const group = same.same.find((g) => norm(g.name) === k);
		item = { id: '', name: group?.name ?? e.main, names: [], kinds: [], places: [], entries: [], matches: [] };
		items.set(k, item);
	}
	for (const n of [e.main, ...e.others]) if (!item.names.includes(n) && norm(n) !== norm(item.name)) item.names.push(n);
	if (!item.kinds.includes(e.kind)) item.kinds.push(e.kind);
	if (!item.places.includes(e.place)) item.places.push(e.place);
	item.entries.push({ file: e.file, heading: e.heading, place: e.place, kind: e.kind, what: e.what });
}
for (const [k, item] of items) {
	const ids = new Set(byName.get(k) ?? []);
	// By an other name only where that name is not itself a product of its own in the notes.
	for (const n of item.names) if (!items.has(keyOf(n)) || keyOf(n) === k) for (const id of byName.get(keyOf(n)) ?? []) ids.add(id);
	item.matches = [...ids].sort();
}
for (const { product, kind } of same.kindOf) {
	const item = items.get(keyOf(product));
	if (item) item.kindOf = kind;
}

const list = [...items.values()].sort((a, b) => b.places.length - a.places.length || a.name.localeCompare(b.name));
list.forEach((item, i) => (item.id = `c${String(i + 1).padStart(4, '0')}`));
fs.writeFileSync(path.join(RESEARCH, 'canon.json'), JSON.stringify(list, null, '\t') + '\n');

const inGraph = list.filter((i) => i.matches.length);
console.log(`${entries.length} entries -> ${list.length} products: ${inGraph.length} already in the graph (${inGraph.filter((i) => i.matches.length > 1).length} matching several nodes), ${list.length - inGraph.length} new`);
console.log(`kinds: ${list.filter((i) => i.kinds.length === 1 && i.kinds[0] === 'cheese').length} cheese, ${list.filter((i) => i.kinds.length === 1 && i.kinds[0] === 'dairy').length} dairy, ${list.filter((i) => i.kinds.length > 1).length} both`);
console.log(`in one place only: ${list.filter((i) => i.places.length === 1).length}; kind of another: ${list.filter((i) => i.kindOf).length}`);
