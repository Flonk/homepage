import { NODE_H, PAD_X, FONT, LINK_ROOM, RULE_PX, RULER_END, MONO, ROOT_WORD, measure, rulerLead } from '../client/base';
import type { ProductTree, NodeSizes, RulerAndPanelContents, PillMeasures } from './types';

/* Each pill's width and height: round its label, with room at its left
   for its photograph and at its right for a link's mark; milk a circle.
   A ruler's pill is as wide as the ruler and a margin either end. */
export const measurePills = (
	{ root, nodes }: ProductTree,
	{ scaleOf, milkRadius, photoRoom }: NodeSizes,
	{ hungUnderRuler, listsByValue }: RulerAndPanelContents,
): PillMeasures => {
	const nodesWithPills = nodes.filter((n) => !n.hub);
	for (const d of nodesWithPills) {
		if (d === root) {
			d.w = d.h = milkRadius * 2;
			continue;
		}
		d.w = measure(d.label, FONT * scaleOf(d), '400', MONO()) + 2 * PAD_X * scaleOf(d);
		d.h = NODE_H * scaleOf(d);
		d.w += photoRoom(d);
		if (d.link) d.w += LINK_ROOM * scaleOf(d);
		// A ruler clear of the photograph, under the rest of the pill.
		if (d.scale) d.w = Math.max(d.w, photoRoom(d) + d.scale.to * RULE_PX + RULER_END, photoRoom(d) + rulerLead(d.scale) + d.scale.to * RULE_PX + RULER_END / 2);
	}
	// A list under a ruler as wide as the widest in it.
	for (const ruler of hungUnderRuler.keys())
		for (const list of listsByValue(ruler).values()) {
			const widest = Math.max(...list.map((k) => k.w));
			for (const k of list) k.w = widest;
		}
	// Milk's label as big as fits across its circle.
	const milkLabel = root.label.toUpperCase();
	const milkLabelFont = (FONT * scaleOf(root) * ROOT_WORD * 2 * milkRadius) / measure(milkLabel, FONT * scaleOf(root), '700');
	return { nodesWithPills, milkLabel, milkLabelFont };
};
