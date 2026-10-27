import type { Node } from '../client/base';
import type { ProductTree, RulerAndPanelContents } from './types';
import { group } from './util';
import { BUS_LEAST, ripening } from './bus';

/* Takes out of the tree's children what is laid out apart from its
   branches, once it has counted towards the sizes: the products hung
   under a ruler at their values, a family's cheeses in its panel, and a
   parent's many tables set out in a row off a bus (see bus.ts).
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
	// A panel's cheeses: its examples. Its products stay.
	const panelContents = new Map<Node, Node[]>();
	for (const [p, kids] of children)
		if (p.panel) {
			const inPanel = (k: Node) => !!k.example;
			panelContents.set(p, kids.filter(inPanel));
			children.set(p, kids.filter((k) => !inPanel(k)));
			if (!children.get(p)!.length) children.delete(p);
		}
	// Many tables under one parent: out of its branches, into a row, the quickest ripened first.
	const busUnder = new Map<Node, Node[]>();
	for (const [p, kids] of [...children]) {
		const tables = kids.filter((k) => panelContents.has(k));
		if (tables.length < BUS_LEAST) continue;
		busUnder.set(p, tables.sort((a, b) => ripening(panelContents.get(a)!) - ripening(panelContents.get(b)!)));
		const rest = kids.filter((k) => !tables.includes(k));
		if (rest.length) children.set(p, rest);
		else children.delete(p);
	}
	return {
		hungUnderRuler,
		panelContents,
		busUnder,
		busAbove: (n) => {
			const p = parent.get(n);
			return p && busUnder.get(p)?.includes(n) ? p : null;
		},
		panelContaining: (n) => {
			const p = parent.get(n);
			// A product made from it is not in its panel, only its cheeses are.
			return p && panelContents.get(p)?.includes(n) ? p : null;
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
