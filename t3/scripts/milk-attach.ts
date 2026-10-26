/*
 * After the write fleet (see research/prompts/write.md): each new example
 * that is no cheese added to its product's examples, in the order the
 * units give them; countries the map does not know taken out of every new
 * node; and what the fleet did not write, said. Run again, it changes
 * nothing more.
 *
 *   npm run milk:attach
 */
import fs from 'node:fs';
import path from 'node:path';

const GRAPH = path.resolve('src/content/series/milk/data');
const WRITE = path.join(GRAPH, 'research', 'write');
// Parents the triage named by a work-list id that became something else by hand.
const MOVED: Record<string, string> = { cafeAuLait: 'milkCoffee' };

type Example = { item: string; id: string; parent?: string; family?: string };
const units: { kind: string; items: Example[] }[] = JSON.parse(fs.readFileSync(path.join(WRITE, 'units.json'), 'utf8'));
const countries = new Set<string>(JSON.parse(fs.readFileSync(path.join(WRITE, 'countries.json'), 'utf8')));
const file = (id: string) => path.join(GRAPH, 'nodes', `${id}.json`);
const read = (id: string) => JSON.parse(fs.readFileSync(file(id), 'utf8'));
const write = (id: string, node: object) => fs.writeFileSync(file(id), JSON.stringify(node, null, '\t') + '\n');

const missing: string[] = [];
const attached = new Map<string, string[]>();
let dropped = 0;
for (const { item, id, parent } of units.filter((u) => u.kind === 'example').flatMap((u) => u.items)) {
	if (!fs.existsSync(file(id))) {
		missing.push(`${item} ${id}`);
		continue;
	}
	const node = read(id);
	if (node.regions) {
		const kept = node.regions.filter((c: string) => countries.has(c));
		dropped += node.regions.length - kept.length;
		if (kept.length) node.regions = kept;
		else delete node.regions;
		write(id, node);
	}
	if (parent) {
		const to = MOVED[parent] ?? parent;
		attached.set(to, [...(attached.get(to) ?? []), id]);
	}
}
/* A parent that is itself an example (the triage named one) cannot hold
   examples: they go to the product it is an example of. */
const products = fs.readdirSync(path.join(GRAPH, 'nodes')).map((f) => f.replace(/\.json$/, ''));
// Nor does one drawn again (a link): they go to the product it is.
const productOf = (id: string): string | undefined => {
	const node = read(id);
	if (node.link) return productOf(node.link);
	// Hung under a ruler at its value, it has no room for examples: they go to the ruler's product, what it is made from.
	if (node.at !== undefined) {
		const way = fs.readdirSync(path.join(GRAPH, 'processes')).find((f) => f.endsWith(`--${id}.json`));
		return way && productOf(JSON.parse(fs.readFileSync(path.join(GRAPH, 'processes', way), 'utf8')).from[0]);
	}
	return node.example ? products.find((p) => !read(p).example && read(p).examples?.includes(id)) : id;
};
for (const [named, ids] of attached) {
	const parent = productOf(named);
	if (!parent) {
		console.log(`no product holds ${named}, which ${ids.join(', ')} were to be under`);
		continue;
	}
	const node = read(parent);
	const had = new Set<string>(node.examples ?? []);
	const added = ids.filter((id) => !had.has(id));
	if (!added.length) continue;
	node.examples = [...(node.examples ?? []), ...added];
	write(parent, node);
}
console.log(`${[...attached.values()].flat().length} examples under ${attached.size} products; ${dropped} countries not on the map dropped`);
if (missing.length) console.log(`not written (${missing.length}): ${missing.join(', ')}`);
