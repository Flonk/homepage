import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './schema';

/*
 * The graph's data as it is on disk, each folder a file per record by its
 * id, read and checked against its schema: the nodes, the processes (the
 * arrows between them) and the rankings of the ways into a node. For the
 * build step and the command line, in Node (see scripts/milk-graph.ts).
 */

// The data, apart from the code that reads it: series/milk/data.
export const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data');
// The graph's code, rebuilt with when it changes (see watch in scripts/milk-graph.ts).
export const CODE = path.dirname(fileURLToPath(import.meta.url));
export const FOLDERS = ['nodes', 'processes', 'rankings', 'reconciled'] as const;

const read = (folder: string) => {
	const dir = path.join(DIR, folder);
	if (!fs.existsSync(dir)) return {};
	return Object.fromEntries(
		fs
			.readdirSync(dir)
			.filter((f) => f.endsWith('.json'))
			.map((f) => {
				try {
					return [f.slice(0, -'.json'.length), JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))];
				} catch (e) {
					throw new Error(`MilkGraph: ${folder}/${f} is no JSON: ${(e as Error).message}`);
				}
			}),
	);
};

// Checked against its schema, a mistake said with the file it is in.
const parsed = <T,>(folder: string, schema: { safeParse: (x: unknown) => { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } } }) => {
	const r = schema.safeParse(read(folder));
	if (r.success) return r.data;
	const said = r.error.issues.map(({ path: [file, ...at], message }) => `  ${folder}/${String(file)}.json${at.length ? ` at ${at.join('.')}` : ''}: ${message}`);
	throw new Error(`MilkGraph: ${said.length} mistake${said.length > 1 ? 's' : ''} in ${folder}/\n${said.join('\n')}`);
};

export const load = () => ({
	nodes: parsed('nodes', S.Nodes) as Record<string, S.Node>,
	processes: parsed('processes', S.Processes) as Record<string, S.Process>,
	rankings: parsed('rankings', S.Rankings) as Record<string, S.Ranking>,
});
// Which drawn arrows have been reconciled, and as what (see schemas/reconciled.ts).
export const loadReconciled = () => parsed('reconciled', S.Reconciliations) as Record<string, S.Reconciled>;

/* The herd (see schemas/animal.ts): each animal checked on its own, one
   that is wrong left out and said, not the whole stopped, as the herd is
   written a record at a time. */
export const loadAnimals = () => {
	const all = read('animals') as Record<string, unknown>;
	const animals: Record<string, S.Animal> = {};
	for (const [id, raw] of Object.entries(all)) {
		const r = S.Animal.safeParse(raw);
		if (r.success) animals[id] = r.data;
		else console.warn(`MilkGraph: animals/${id}.json left out: ${r.error.issues.map((x) => `${x.path.join('.') || 'top'}: ${x.message}`).join('; ')}`);
	}
	return animals;
};

export const json = (x: unknown) => JSON.stringify(x, null, '\t') + '\n';
export const write = (folder: (typeof FOLDERS)[number], id: string, x: unknown) => {
	fs.mkdirSync(path.join(DIR, folder), { recursive: true });
	fs.writeFileSync(path.join(DIR, folder, `${id}.json`), json(x));
};
