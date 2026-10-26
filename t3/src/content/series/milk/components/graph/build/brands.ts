import type { load } from '../source';

/* A brand of no place in a food culture is not drawn, nor the variant arrow
   to it: its names go to what it is an example of, so the search still
   finds that, and it is taken out of the examples there. Why each is drawn
   or not is in its file. */
export const withoutMinorBrands = ({ nodes, processes, rankings }: ReturnType<typeof load>) => {
	const kept = { ...nodes };
	const ways = { ...processes };
	const ranked = { ...rankings };
	for (const [id, n] of Object.entries(nodes)) {
		if (n.branded?.significant !== false) continue;
		if (!n.example) throw new Error(`MilkGraph: ${id} is a brand not drawn, but no example: it would leave a hole`);
		const of = Object.keys(nodes).find((p) => !nodes[p].example && nodes[p].examples?.includes(id)) ?? n.family;
		if (!of) throw new Error(`MilkGraph: ${id} is an example of nothing`);
		const owner = kept[of];
		const names = [n.label.replace(/\n/g, ' '), ...(n.aka ?? [])].filter((x) => x !== owner.label && !owner.aka?.includes(x));
		kept[of] = { ...owner, aka: [...(owner.aka ?? []), ...names], examples: owner.examples?.filter((x) => x !== id) };
		delete kept[id];
		delete ranked[id];
		for (const [w, p] of Object.entries(processes)) if (p.to.includes(id)) delete ways[w];
	}
	return { nodes: kept, processes: ways, rankings: ranked };
};
