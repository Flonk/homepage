import type * as S from '../schema';

/* The world's cheeses, each with the product it is of: the one naming it,
   else its family. A cheese no product names is drawn under its family;
   but where the family names some and has too many more to draw, only
   those named are drawn, and the rest only found by the search. */
const CROWDED = 8;

export const cheesesOf = (nodes: Record<string, S.Node>, ofProduct: Map<string, string>, cheesy: (id: string) => boolean) => {
	const all = Object.entries(nodes);
	const world = all.filter(([id, n]) => n.example && (n.family !== undefined || cheesy(ofProduct.get(id) ?? '')));
	const ownerOf = (id: string) => ofProduct.get(id) ?? nodes[id].family!;
	const unnamed = world.filter(([id]) => !ofProduct.has(id)).map(([id]) => id);
	const crowded = (owner: string) => !!nodes[owner].examples?.length && unnamed.filter((id) => ownerOf(id) === owner).length >= CROWDED;
	const uncrowded = unnamed.filter((id) => !crowded(ownerOf(id)));
	const unlisted = (owner: string) => (crowded(owner) ? unnamed.filter((id) => ownerOf(id) === owner) : []);
	return { world, ownerOf, uncrowded, unlisted };
};
