/*
 * The milk graph's command line: `npm run milk:graph -- <command>`.
 *
 *   build                       the tree from the data, into series/milk/data/built/graph.json
 *   watch                       build, and again on every change to the data
 *   in <node>                   the arrows into a node, best ranked first (an id, or a pattern on ids and labels)
 *   out <node>                  the arrows out of it
 *   check <id or file>...       those processes, or nodes (nodes/<id>), alone against the schema, writing nothing
 *   rate <node> <way> <share>   how much of a node is made one way, in percent ("-" unrates);
 *                               the way by its process id or what it is made from
 *     --why <text>                     the reasoning from the sources to the figure (needed)
 *     --source <url> [--name <name>]   a source it rests on, as many as there are, each
 *                                      with its name; none, and it is kept as unsourced
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DIR, CODE, FOLDERS, load, write } from '../src/content/series/milk/components/graph/source';
import { waysOf } from '../src/content/series/milk/components/graph/ways';
import * as S from '../src/content/series/milk/components/graph/schema';

const SELF = fileURLToPath(import.meta.url);
const BUILT = path.join(DIR, 'built', 'graph.json');
const tty = process.stdout.isTTY;
const bold = (s: string) => (tty ? `\x1b[1m${s}\x1b[0m` : s);
const dim = (s: string) => (tty ? `\x1b[2m${s}\x1b[0m` : s);
const red = (s: string) => (tty ? `\x1b[31m${s}\x1b[0m` : s);
const fail = (said: string): never => {
	console.error(red(said));
	process.exit(1);
};

const [command, ...args] = process.argv.slice(2);
const option = (name: string) => {
	const i = args.indexOf(`--${name}`);
	return i < 0 ? undefined : args.splice(i, 2)[1];
};

/* ---- Building ---- */

const build = async () => {
	const { graph, herd } = await import('../src/content/series/milk/components/graph/build');
	fs.mkdirSync(path.dirname(BUILT), { recursive: true });
	fs.writeFileSync(BUILT, JSON.stringify({ graph, herd }));
	console.log(`${dim(new Date().toLocaleTimeString())} built ${graph.nodes.length} nodes, ${graph.links.length} arrows drawn`);
};

// Each build in a process of its own, so a change to the code is built with too.
const watch = () => {
	let running = false;
	let again = false;
	const run = () => {
		if (running) return void (again = true);
		running = true;
		const child = spawn(process.execPath, [...process.execArgv, SELF, 'build'], { stdio: 'inherit' });
		child.on('exit', () => {
			running = false;
			if (again) {
				again = false;
				run();
			}
		});
	};
	let timer: NodeJS.Timeout | undefined;
	const changed = (file: string | null) => {
		if (file && !/\.(json|ts)$/.test(file) && !FOLDERS.includes(file as never)) return;
		clearTimeout(timer);
		timer = setTimeout(run, 150);
	};
	/* Each folder watched, not each file: a file saved by replacing it, as
	   editors and sed -i do, is a new file, which a watch on the old one
	   never hears of. A folder made since (rankings/) watched once it is.
	   The data and the graph's code both, but not what the build writes. */
	const watched = new Set<string>();
	const watchAll = (root: string) => {
		const dirs = [root, ...fs.readdirSync(root, { recursive: true, withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => path.join(d.parentPath, d.name))];
		for (const dir of dirs.filter((d) => !watched.has(d) && !path.relative(DIR, d).startsWith('built'))) {
			watched.add(dir);
			fs.watch(dir, (_, file) => {
				if (dir === root) watchAll(root);
				changed(file);
			});
		}
	};
	for (const root of [DIR, CODE]) watchAll(root);
	console.log(dim(`watching ${path.relative(process.cwd(), DIR)} and ${path.relative(process.cwd(), CODE)}`));
	run();
};

/* ---- Looking ---- */

const data = () => {
	try {
		return load();
	} catch (e) {
		return fail((e as Error).message);
	}
};

// The nodes a query names: the one by that id, else every one whose id or label it matches.
const find = (nodes: Record<string, S.Node>, query: string) => {
	if (!query) fail('which node? an id, or a pattern on ids and labels');
	if (query in nodes) return [query];
	const re = new RegExp(query, 'i');
	const found = Object.keys(nodes).filter((id) => re.test(id) || re.test(nodes[id].label.replace(/\n/g, ' ')));
	return found.length ? found : fail(`no node is ${query}`);
};

const look = (direction: 'in' | 'out') => {
	const { nodes, processes, rankings } = data();
	const ways = waysOf(processes, rankings);
	const name = (id: string) => `${nodes[id]?.label.replace(/\n/g, ' ') ?? '?'} ${dim(`(${id})`)}`;
	for (const id of find(nodes, args[0])) {
		const list = direction === 'in' ? ways.ranked(id) : (ways.outOf.get(id) ?? []);
		console.log(`${bold(name(id))}${nodes[id].example ? dim(' example') : ''}  ${list.length} ${direction === 'in' ? 'in' : 'out'}`);
		list.forEach((w, i) => {
			const p = processes[w];
			const rated = rankings[id]?.ways.find((r) => r.process === w);
			const ends = direction === 'in' ? p.from : p.to;
			const step = p.to.length > 1 && direction === 'in' ? [p.step, p.legs?.[id]?.step].filter(Boolean).join(' → ') : p.step;
			const tags = [p.industrial === true && 'industrial', p.industrial === false && 'not industrial', p.variant && 'variant', p.to.length > 1 && `makes ${p.to.length}`].filter(Boolean);
			const steps = (p.processing?.steps.length ?? 0) + (p.legs?.[id]?.processing?.steps.length ?? 0);
			const mark = direction === 'in' ? (i === 0 ? '★' : ' ') : ' ';
			const share = direction === 'in' && list.length > 1 ? (rated?.share !== undefined ? `${rated.share}%`.padStart(5) : dim('   –%')) : '';
			console.log(`  ${mark} ${share} ${ends.map(name).join(' + ')}  ${step ? `"${step}"` : dim('no step')}  ${dim([`${steps} steps`, ...tags].join(', '))}`);
			console.log(`        ${dim(w)}`);
			// Where its share is from: the reasoning, and its links, or that it has none yet.
			if (rated?.sources) console.log(`        ${dim(`${'unsourced' in rated.sources ? 'unsourced' : rated.sources.links.map((l) => l.name).join(', ')}: ${rated.sources.text}`)}`);
		});
		if (direction === 'in' && ways.unranked(id).length) console.log(dim(`  not in rankings/${id}.json yet: ${ways.unranked(id).join(', ')}`));
	}
};

/* ---- Checking ---- */

/* Only the processes named, each against its schema, named for its ends,
   from and to nodes that are there: for one working on a few while others
   work on the rest, whose files may be half written. */
const check = () => {
	if (!args.length) fail('which processes or nodes? their ids, or their files');
	const nodes = new Set(fs.readdirSync(path.join(DIR, 'nodes')).map((f) => f.slice(0, -'.json'.length)));
	let wrong = 0;
	for (const arg of args) {
		const id = path.basename(arg).replace(/\.json$/, '');
		const before = wrong;
		const said = (why: string) => (wrong++, console.log(red(`${id}: ${why}`)));
		// A node: against its schema, and every node it names there.
		if (/(^|\/)nodes\//.test(arg)) {
			let node: unknown;
			try {
				node = JSON.parse(fs.readFileSync(path.join(DIR, 'nodes', `${id}.json`), 'utf8'));
			} catch (e) {
				said((e as Error).message);
				continue;
			}
			const n = S.Node.safeParse(node);
			if (!n.success) for (const x of n.error.issues) said(`at ${x.path.join('.') || 'top'}: ${x.message}`);
			else for (const x of [n.data.family, n.data.also, n.data.link, n.data.below, ...(n.data.examples ?? [])]) if (x && !nodes.has(x)) said(`names ${x}, which is no node`);
			if (wrong === before) console.log(`${id}: ok`);
			continue;
		}
		let raw: unknown;
		try {
			raw = JSON.parse(fs.readFileSync(path.join(DIR, 'processes', `${id}.json`), 'utf8'));
		} catch (e) {
			said((e as Error).message);
			continue;
		}
		const r = S.Process.safeParse(raw);
		if (!r.success) {
			for (const x of r.error.issues) said(`at ${x.path.join('.') || 'top'}: ${x.message}`);
			continue;
		}
		if (!S.ProcessId.safeParse(id).success || id.split('~')[0] !== `${r.data.from.join('+')}--${r.data.to.join('+')}`) said('not named for its from and to');
		for (const x of [...r.data.from, ...r.data.to]) if (!nodes.has(x)) said(`names ${x}, which is no node`);
		if (wrong === before) console.log(`${id}: ok`);
	}
	if (wrong) process.exit(1);
};

/* ---- Rating ---- */

// Each --source, named by the --name after it, else by its address.
const links = () => {
	const found: S.Sources['links'] = [];
	for (let i = args.indexOf('--source'); i >= 0; i = args.indexOf('--source')) {
		const url = args.splice(i, 2)[1];
		const name = args[i] === '--name' ? args.splice(i, 2)[1] : undefined;
		if (!url || !URL.canParse(url)) fail(`--source needs an address: ${url ?? 'none given'}`);
		found.push({ name: name ?? url, url });
	}
	return found;
};

const rate = () => {
	const found = links();
	const why = option('why');
	const [node, way, said] = args;
	const { nodes, processes, rankings } = data();
	if (!(node in nodes)) fail(`no node is ${node}`);
	const ways = waysOf(processes, rankings);
	const into = ways.ranked(node);
	// The way: its id, or the one into it from what it names.
	const matches = into.filter((w) => w === way || processes[w].from.includes(way));
	if (matches.length !== 1) fail(matches.length ? `${way} names ${matches.length} ways into ${node}: ${matches.join(', ')}` : `no way into ${node} is ${way}; its ways: ${into.join(', ')}`);
	const share = said === '-' ? undefined : Number(said);
	if (share !== undefined && !(share >= 0 && share <= 100)) fail(`a share is a percent, 0 to 100, or "-"`);
	if (share !== undefined && !why) fail('a share needs --why: the reasoning from its sources to the figure');
	// Its sources: the links and the reasoning, or the reasoning alone, unsourced.
	const sources: S.Sourcing | undefined = share === undefined ? undefined : found.length ? { links: found, text: why! } : { unsourced: true, text: why! };
	// Every way in listed, the rated by share, most first, then the rest as they were.
	const listed: S.RankedWay[] = into.map((w) => rankings[node]?.ways.find((r) => r.process === w) ?? { process: w });
	const rated = listed.map((r) => (r.process !== matches[0] ? r : { process: r.process, ...(share !== undefined && { share, sources }) }));
	const order = [...rated.filter((r) => r.share !== undefined).sort((a, b) => b.share! - a.share!), ...rated.filter((r) => r.share === undefined)];
	const r = S.Ranking.safeParse({ ways: order });
	if (!r.success) fail(`rankings/${node}.json would be wrong: ${r.error.issues.map((x) => x.message).join('; ')}`);
	write('rankings', node, r.data!);
	args.splice(0, args.length, node);
	look('in');
};

switch (command) {
	case 'build':
		await build().catch((e: Error) => fail(e.message));
		break;
	case 'watch':
		watch();
		break;
	case 'in':
	case 'out':
		look(command);
		break;
	case 'check':
		check();
		break;
	case 'rate':
		rate();
		break;
	default:
		console.log(fs.readFileSync(SELF, 'utf8').match(/\/\*([\s\S]*?)\*\//)![1].replace(/^ \* ?/gm, '').trim());
		if (command && command !== 'help') process.exit(1);
}
