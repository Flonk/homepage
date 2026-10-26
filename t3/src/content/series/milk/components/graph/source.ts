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
export const FOLDERS = ['nodes', 'processes', 'rankings'] as const;

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

export const json = (x: unknown) => JSON.stringify(x, null, '\t') + '\n';
export const write = (folder: (typeof FOLDERS)[number], id: string, x: unknown) => {
	fs.mkdirSync(path.join(DIR, folder), { recursive: true });
	fs.writeFileSync(path.join(DIR, folder, `${id}.json`), json(x));
};
