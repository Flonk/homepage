import type { Node } from '../client/base';
import type { ProductTree, RulerAndPanelContents } from './types';
import { group } from './util';

/* Takes out of the tree's children what is laid out apart from its
   branches, once it has counted towards the sizes: the products hung
   under a ruler at their values, and a family's cheeses in its panel.
   Anything else made from them branches off as from any product. */
export const takeOutRulerAndPanelContents = ({ parent, children }: ProductTree): RulerAndPanelContents => {
	const hungUnderRuler = new Map<Node, Node[]>();
	for (const [p, kids] of [...children])
		if (p.scale) {
			hungUnderRuler.set(p, kids.filter((k) => k.at != null));
			const rest = kids.filter((k) => k.at == null);
			if (rest.length) children.set(p, rest);
			else children.delete(p);
		}
	// A panel's cheeses: a grid's, its examples; the map's, those on it. Its products stay.
	const panelContents = new Map<Node, Node[]>();
	for (const [p, kids] of children)
		if (p.panel || p.map) {
			const inPanel = (k: Node) => (p.map ? !!k.onMap : k.example);
			panelContents.set(p, kids.filter(inPanel));
			children.set(p, kids.filter((k) => !inPanel(k)));
			if (!children.get(p)!.length) children.delete(p);
		}
	return {
		hungUnderRuler,
		panelContents,
		panelContaining: (n) => {
			const p = parent.get(n);
			return p && panelContents.has(p) ? p : null;
		},
		rulerAbove: (n) => {
			const p = parent.get(n);
			return p && n.at != null && hungUnderRuler.has(p) ? p : null;
		},
		listsByValue: (ruler) => {
			const lists = new Map<number, Node[]>();
			for (const k of hungUnderRuler.get(ruler)!) group(lists, k.at!, k);
			return lists;
		},
	};
};
