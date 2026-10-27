import type { Graph, Node } from '../client/base';
import type { Box, NodeSizes, RulerAndPanelContents, CheesePanels, Panel } from './types';
import { layRipeningGrid } from './ripeningGrid';

// Each family's cheese panel laid out: a ripening grid.
export const layCheesePanels = (data: Graph, { photoSize }: NodeSizes, { panelContents }: RulerAndPanelContents): CheesePanels => {
	const panels = new Map<Node, Panel>();
	for (const [family, cheeses] of panelContents)
		panels.set(family, layRipeningGrid(family, cheeses, data.firms, photoSize(family)));
	const panelBoxRelative = (family: Node): Box => ({
		x0: family.x - family.w / 2,
		x1: family.x + family.w / 2,
		y0: family.h / 2,
		y1: family.h / 2 + panels.get(family)!.h,
	});
	return {
		panels,
		panelBoxRelative,
		panelBox: (family) => {
			const b = panelBoxRelative(family);
			return { ...b, y0: b.y0 + family.y, y1: b.y1 + family.y };
		},
	};
};
