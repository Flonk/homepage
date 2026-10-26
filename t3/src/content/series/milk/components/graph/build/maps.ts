import type * as S from '../schema';

/* The world's cheeses, each with the product it is of: the one naming it,
   else its family. A product with enough of them where they are made has
   them on a map under it, cut to where they are; one with fewer, as
   examples drawn under it. */
const MAP_LEAST = 8;
// Off for now: a type's cheeses are shown on its table (see build/tables.ts) instead.
const MAPS = false;

export const mapsOf = (nodes: Record<string, S.Node>, ofProduct: Map<string, string>, cheesy: (id: string) => boolean) => {
	const all = Object.entries(nodes);
	const world = all.filter(([id, n]) => n.example && (n.family !== undefined || cheesy(ofProduct.get(id) ?? '')));
	const ownerOf = (id: string) => ofProduct.get(id) ?? nodes[id].family!;
	const located = world.filter(([, n]) => n.regions?.length).map(([id]) => ownerOf(id));
	const maps = new Set(MAPS ? located.filter((owner) => located.filter((o) => o === owner).length >= MAP_LEAST) : []);
	/* On its product's map; or, a cheese no product names and with no map
	   to be on, drawn under its family; but where the family names some
	   and has too many more to draw, only those named are drawn, and the
	   rest only found by the search. */
	const onMap = (id: string) => maps.has(ownerOf(id)) && !!nodes[id].regions?.length;
	const unnamed = world.filter(([id]) => !ofProduct.has(id) && !maps.has(ownerOf(id))).map(([id]) => id);
	const crowded = (owner: string) => !!nodes[owner].examples?.length && unnamed.filter((id) => ownerOf(id) === owner).length >= MAP_LEAST;
	const unmapped = unnamed.filter((id) => !crowded(ownerOf(id)));
	const unlisted = (owner: string) => (crowded(owner) ? unnamed.filter((id) => ownerOf(id) === owner) : []);
	return { world, ownerOf, maps, onMap, unmapped, unlisted };
};
