import { type Node, PANEL_PADDING } from '../client/base';
import { CAPTION_FONT } from './pillPainter';
import { type Pen, shownAt } from '../render/canvas';
import type { Drawing, PanelPainter } from './types';

// A family's panel under its pill: a ripening grid.
export const makePanelPainter = (G: Drawing): PanelPainter => {
	const { layout, pillPainter } = G;
	const colours = G.appearance.colours;

	/* A panel, on the ground itself, edged down its sides and along its
	   bottom as the pill is, open at the top where the pill is. A grid: a
	   faint line down from each time on its family's scale; each row's
	   firmness right-aligned under the photograph; and behind each cheese a
	   line from the least of its ripening to the most. */
	// How far in from the band's edge the rows' names end.
	const ROW_NAME_INSET = 8;
	const drawPanel = (g: Pen, family: Node, s: number) => {
		const panel = layout.panels.get(family)!;
		const top = family.y + family.h / 2;
		const left = family.x - family.w / 2;
		const r = layout.pillCornerRadius(family);
		// A grid's rows' names on the land's grey, a band as wide as the photograph over it, rounded at the bottom as the panel is.
		const band = layout.photoSize(family);
		g.beginPath();
		g.moveTo(left, top);
		g.lineTo(left, top + panel.h - r);
		g.arcTo(left, top + panel.h, left + r, top + panel.h, r);
		g.lineTo(left + band, top + panel.h);
		g.lineTo(left + band, top);
		g.closePath();
		g.fillStyle = colours.land;
		g.fill();
		g.beginPath();
		g.moveTo(left, top);
		g.lineTo(left, top + panel.h - r);
		g.arcTo(left, top + panel.h, left + r, top + panel.h, r);
		g.lineTo(left + panel.w - r, top + panel.h);
		g.arcTo(left + panel.w, top + panel.h, left + panel.w, top + panel.h - r, r);
		g.lineTo(left + panel.w, top);
		g.lineWidth = 1.2;
		g.strokeStyle = colours.tableEdge;
		g.stroke();
		for (const [days] of panel.times) pillPainter.drawLine(g, left + panel.xOf(days), top, left + panel.xOf(days), top + panel.h, 0.75, colours.grid);
		// A line across between each row and the next, from the band of names to the far edge, half way through the gap between them.
		for (const { y, h } of panel.rows.slice(0, -1)) pillPainter.drawLine(g, left + band, top + y + h + PANEL_PADDING / 2, left + panel.w, top + y + h + PANEL_PADDING / 2, 0.75, colours.grid);
		if (shownAt(CAPTION_FONT, s)) {
			g.textBaseline = 'middle';
			g.textAlign = 'right';
			for (const { firm, y, h } of panel.rows) pillPainter.drawCaption(g, firm, left + band - ROW_NAME_INSET, top + y + h / 2);
		}
		g.lineCap = 'round';
		// A cheese with no time known has no span to show; nor has one in a column.
		for (const [k] of panel.at)
			if (!k.axes!.timeless && !panel.columns) pillPainter.drawLine(g, left + panel.xOf(k.axes!.days[0]), k.y, left + panel.xOf(k.axes!.days[1]), k.y, 3, colours.line);
		g.lineCap = 'butt';
		return true;
	};

	return { drawPanel };
};
