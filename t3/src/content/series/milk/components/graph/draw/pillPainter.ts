import { type Pen, legible, font, roundRect, pillBody } from '../render/canvas';
import { type Node, PICTURE_GAP, FONT, MONO, LINK_ROOM, LINE, LINK_MARK, PAD_X } from '../client/base';
import { drawStrip } from '../render/Processing';
import { mapPillsReadable } from '../layout/worldMap';
import type { Drawing, PillPainter } from './types';

// Painting a product's pill, milk's circle, and the step label and card chain on each arrow.
export const makePillPainter = (G: Drawing): PillPainter => {
	const { layout, highlight } = G;
	const colours = G.appearance.colours;
	// Whether it is drawn picked out, unless drawing plain.
	const isInked = (n: Node) => !highlight.drawingPlain && n === highlight.inkedStep;
	const isSelected = (n: Node) => !highlight.drawingPlain && n === highlight.selected;

	// In the ink while hovered or selected.
	const drawStepLabel = (g: Pen, n: Node, s: number) => {
		if (!legible(layout.stepLabelFont(n), s)) return true;
		g.font = font(layout.stepLabelFont(n), 'italic 400');
		g.textAlign = 'center';
		g.textBaseline = 'alphabetic';
		g.fillStyle = isInked(n) ? (layout.hasCardChain(n) ? colours.lit : colours.accent) : colours.dim;
		for (const { said, y } of layout.stepLabelLines(n)) g.fillText(said, layout.stepLabelX(n), y);
		return true;
	};

	// The step's processing, card by card (see render/Processing).
	const drawCardChain = (g: Pen, n: Node, s: number) => {
		const chain = layout.cardChainOf(n);
		if (!legible(chain.font, s)) return true;
		if (chain.strip) drawStrip(g, chain.strip, chain.left, chain.top, chain.font, { ink: colours, s, px: s * G.viewport.pixelRatio, on: isInked(n) });
		return true;
	};

	// Whiter than the pills, edged as they are, in the chrome's texture, its label across it.
	const drawMilk = (g: Pen, milk: Node, s: number) => {
		const r = layout.milkRadius;
		g.beginPath();
		g.arc(milk.x, milk.y, r, 0, Math.PI * 2);
		g.fillStyle = colours.milk;
		g.fill();
		g.save();
		g.clip();
		for (const texture of G.appearance.milkTextures) {
			const pattern = G.appearance.texturePattern(texture);
			if (!pattern) continue;
			// Its tiles their own size on the screen, at this zoom.
			pattern.setTransform(new DOMMatrix().scale(1 / s));
			g.globalCompositeOperation = texture === 'dots' ? 'overlay' : 'soft-light';
			g.fillStyle = pattern;
			g.fillRect(milk.x - r, milk.y - r, 2 * r, 2 * r);
		}
		g.restore();
		g.beginPath();
		g.arc(milk.x, milk.y, r, 0, Math.PI * 2);
		g.lineWidth = 2;
		g.strokeStyle = colours.rim;
		g.stroke();
		g.font = font(layout.milkLabelFont, '700');
		g.fillStyle = '#000';
		g.textAlign = 'center';
		g.textBaseline = 'middle';
		g.fillText(layout.milkLabel, milk.x, milk.y);
	};

	const drawLine = (g: Pen, x0: number, y0: number, x1: number, y1: number, width: number, colour: string) => {
		g.beginPath();
		g.moveTo(x0, y0);
		g.lineTo(x1, y1);
		g.lineWidth = width;
		g.strokeStyle = colour;
		g.stroke();
	};
	// Between the lines of a caption.
	const CAPTION_LINE = 13;
	const drawCaption = (g: Pen, text: string, x: number, y: number) => {
		const spaced = g.letterSpacing;
		g.letterSpacing = '0.14em';
		g.font = font(11, '600');
		g.fillStyle = colours.text;
		g.fillText(text.toUpperCase(), x, y);
		g.letterSpacing = spaced;
	};
	/* A scale along a pill's bottom edge, a ruler's or a panel's of time:
	   a tick at each mark, deeper and darker for a major one, with its
	   value over it. */
	const drawTick = (g: Pen, x: number, edge: number, major: boolean) =>
		drawLine(g, x, edge - (major ? 8 : 4), x, edge, major ? 1.5 : 1, major ? colours.text : colours.dim);
	const drawTickLabel = (g: Pen, text: string, x: number, edge: number) => {
		g.font = font(10);
		g.fillStyle = colours.dim;
		g.fillText(text, x, edge - 12);
	};

	// Its shadow, its white, its photograph, its label, its edge, and a ruler's or a panel's scale.
	const drawPill = (g: Pen, d: Node, s: number) => {
		// A map's cheese only once it can be read; a pin for its country till then.
		if (d.onMap && !mapPillsReadable(s)) return true;
		let whole = true;
		const x = d.x - d.w / 2;
		const y = d.y - d.h / 2;
		const r = layout.pillCornerRadius(d);
		const scale = layout.scaleOf(d);
		/* Its shadow is blurred, as it is drawn only once, into its sprite. A
		   canvas blurs in the screen's pixels whatever it is scaled by, so the
		   shadow is sized for the zoom it is drawn at. */
		const px = s * G.viewport.pixelRatio;
		// Square along the bottom where a panel hangs from it.
		const corners = d.panel || d.map ? [r, r, 0, 0] : r;
		pillBody(g, x, y, d.w, d.h, corners, colours, px);
		// The photograph filling its left end, edge to edge, its outer corners rounded as the pill's are.
		let photoRoom = 0;
		if (d.image) {
			const side = layout.photoSize(d);
			photoRoom = side + PICTURE_GAP * scale;
			// Fetched once it is a few pixels across on the screen.
			const im = side * s >= 6 ? G.appearance.imageOf(d.image.src) : null;
			if (im) {
				const crop = Math.min(im.naturalWidth, im.naturalHeight);
				g.save();
				roundRect(g, x, y, side, side, [r, 0, 0, r]);
				g.clip();
				g.drawImage(im, (im.naturalWidth - crop) / 2, (im.naturalHeight - crop) / 2, crop, crop, x, y, side, side);
				g.restore();
			} else if (side * s >= 6) whole = false;
		}
		g.textAlign = 'center';
		g.textBaseline = 'middle';
		const big = scale * layout.thickness(d);
		if (legible(FONT * big, s)) {
			g.font = `400 ${FONT * big}px ${MONO()}`;
			g.fillStyle = d.example && d.standing !== 'pick' && d.standing !== 'famous' ? colours.dim : colours.text;
			const lines = d.label.split('\n');
			const linkRoom = d.link ? LINK_ROOM * scale : 0;
			lines.forEach((l, i) => g.fillText(l, d.x + (photoRoom - linkRoom) / 2, d.y + (i - (lines.length - 1) / 2) * LINE * big));
			// A link's mark: two links of a chain, slanted, before its right end.
			if (d.link) {
				const u = LINK_MARK * scale;
				g.save();
				g.translate(x + d.w - PAD_X * scale - u / 2, d.y);
				g.rotate(-Math.PI / 4);
				g.lineWidth = 0.15 * u;
				g.strokeStyle = colours.dim;
				for (const at of [-0.62 * u, -0.08 * u]) {
					roundRect(g, at, -0.22 * u, 0.7 * u, 0.44 * u, 0.22 * u);
					g.stroke();
				}
				g.restore();
			}
		}
		roundRect(g, x, y, d.w, d.h, corners);
		g.lineWidth = (isSelected(d) ? 2 : 1.2) * layout.pillRimWidth(d);
		g.strokeStyle = isSelected(d) ? colours.lit : d.panel ? colours.tableEdge : colours.rim;
		g.stroke();
		const edge = d.y + d.h / 2;
		g.lineCap = 'round';
		g.textBaseline = 'alphabetic';
		g.textAlign = 'center';
		// A ripening grid's scale of time: a tick at each time, the time over it.
		const panel = layout.panels.get(d);
		if (d.panel && panel && legible(10, s)) {
			for (const [days, label] of panel.times) {
				const tx = d.x - d.w / 2 + panel.xOf(days);
				drawTick(g, tx, edge, true);
				drawTickLabel(g, label, tx, edge);
			}
			// What is set out across, just past the photograph, before its first mark, near the edge, as it has no tick under it.
			if (panel.named) {
				g.textAlign = 'left';
				drawCaption(g, panel.named, d.x - d.w / 2 + layout.photoSize(d) + 8, edge - 6);
				g.textAlign = 'center';
			}
		}
		// A ruler: a tick every unit, deeper every step, the value over each.
		if (d.scale && legible(10, s)) {
			const { to, every, unit, name: measures } = d.scale;
			const tickX = (v: number) => layout.rulerTickX(d, v);
			for (let v = 0; v <= to; v++) {
				const major = v % every === 0;
				drawTick(g, tickX(v), edge, major);
				if (major && v) drawTickLabel(g, `${v} ${unit}`, tickX(v), edge);
			}
			// What it measures, before its nought, ending over the tick; a line break in it stacks its lines upwards.
			g.textAlign = 'right';
			drawTickLabel(g, ' 0', tickX(0) + 3, edge);
			const right = tickX(0) + 3 - g.measureText(' 0').width;
			measures.split('\n').reverse().forEach((line, i) => drawCaption(g, line, right, edge - 12 - i * CAPTION_LINE));
		}
		g.lineCap = 'butt';
		return whole;
	};

	return { drawPill, drawMilk, drawStepLabel, drawCardChain, drawLine, drawCaption };
};
