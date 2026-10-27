import type * as S from './schema';

/*
 * The ways into each node, and of those the one the tree is drawn along:
 * the only one, or where there are several, the first its ranking has
 * (see Ranking in the schema); with no ranking yet, the first by its id.
 * Shared by the build and the command line (scripts/milk-graph.ts).
 */
export const waysOf = (processes: Record<string, S.Process>, rankings: Record<string, S.Ranking>) => {
	const into = new Map<string, string[]>();
	const outOf = new Map<string, string[]>();
	// By id, so which is first does not hang on the order the files are read in.
	for (const [id, p] of Object.entries(processes).sort(([a], [b]) => (a < b ? -1 : 1))) {
		for (const to of p.to) into.set(to, [...(into.get(to) ?? []), id]);
		for (const from of p.from) outOf.set(from, [...(outOf.get(from) ?? []), id]);
	}
	// Its ways in, best first: as ranked, then any its ranking does not have yet.
	const ranked = (node: string) => {
		const ways = into.get(node) ?? [];
		const listed = (rankings[node]?.ways ?? []).map((w) => w.process).filter((w) => ways.includes(w));
		return [...listed, ...ways.filter((w) => !listed.includes(w))];
	};
	const drawn = (node: string): string | undefined => ranked(node)[0];
	// What is wrong with the rankings: a way into another node.
	const problems = (): string[] =>
		Object.entries(rankings).flatMap(([node, r]) =>
			r.ways.filter((w) => !(into.get(node) ?? []).includes(w.process)).map((w) => `rankings/${node}.json ranks ${w.process}, which does not lead to ${node}`),
		);
	const unranked = (node: string) => (rankings[node] ? ranked(node).filter((w) => !rankings[node].ways.some((r) => r.process === w)) : []);
	return { into, outOf, ranked, drawn, problems, unranked };
};
