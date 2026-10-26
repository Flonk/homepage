import type * as S from '../schema';
import type { Told } from '../render/How';

// What a way, or a leg of one, says its sources are: its own, its processing's, and inside it a step's and a microbe's.
export const sourcingOf = (w: Told) =>
	[w.sources, w.processing?.sources, ...(w.processing?.steps ?? []).flatMap((x) => [x.sources, ...(x.type === 'ferment' ? (x.adds?.microbes ?? []).map((m) => m.sources) : [])])].filter(
		(x) => x !== undefined,
	);

// How much of what is said has no source yet, told once; and how many nodes have none at all.
export const tellUnsourced = (nodes: Record<string, S.Node>, processes: Record<string, S.Process>, rankings: Record<string, S.Ranking>, map: { sources: S.Sourcing }) => {
	const all = Object.entries(nodes);
	const products = all.filter(([, n]) => !n.example);
	const said: S.Sourcing[] = all
		.flatMap(([, n]) => [
			n.sources,
			n.about?.sources,
			n.picture?.sources,
			n.share?.sources,
			// Sources of their own, inside it: a row's.
			...(n.facts ?? []).map((r) => r.sources),
			n.composition?.sources,
		])
		.concat(
			// A process's, its legs', and inside their processing a step's and a microbe's.
			Object.values(processes)
				.flatMap((p): Told[] => [p, ...Object.values(p.legs ?? {})])
				.flatMap(sourcingOf),
			// A share's, in a ranking.
			Object.values(rankings).flatMap((r) => r.ways.flatMap((w) => w.sources ?? [])),
			map.sources,
		)
		.filter((x) => x !== undefined);
	const unsourced = said.filter((x) => 'unsourced' in x).length;
	if (unsourced) console.warn(`MilkGraph: ${unsourced} of ${said.length} things said have no source yet (see Unsourced in milk/graph/schema.ts)`);
	const bare = products.filter(([, n]) => !n.sources).length;
	if (bare) console.warn(`MilkGraph: ${bare} of ${products.length} products have no sources for what they are made from and called`);
};
