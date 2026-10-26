import { type Node, PANEL_PADDING } from '../client/base';
import { type Pen, legible, font } from '../render/canvas';
import type { Pin, Box } from '../layout';
import { MAP_WIDTH, PIN_RADIUS, PIN_GROWTH, PIN_FRAMED_SCALE, mapPillsReadable } from '../layout/worldMap';
import type { Drawing, PanelPainter } from './types';

// A family's panel under its pill: a ripening grid, or the world map and its pins.
export const makePanelPainter = (G: Drawing): PanelPainter => {
	const { layout, pillPainter } = G;
	const colours = G.appearance.colours;

	// Each country's outline as a path, made once where the map is.
	const countryPaths = new Map<Node, Path2D[]>();
	const drawMapLand = (g: Pen, family: Node, left: number, top: number) => {
		if (!countryPaths.has(family))
			countryPaths.set(
				family,
				Object.values(G.data.map.countries).map(({ rings }) => {
					const path = new Path2D();
					for (const r of rings) {
						path.moveTo(left + r[0] * MAP_WIDTH, top + PANEL_PADDING + r[1] * MAP_WIDTH);
						for (let i = 2; i < r.length; i += 2) path.lineTo(left + r[i] * MAP_WIDTH, top + PANEL_PADDING + r[i + 1] * MAP_WIDTH);
						path.closePath();
					}
					return path;
				}),
			);
		g.fillStyle = colours.land;
		g.strokeStyle = colours.grid;
		g.lineWidth = 0.6;
		g.lineJoin = 'round';
		for (const path of countryPaths.get(family)!) {
			g.fill(path);
			g.stroke(path);
		}
	};

	// Its pins, where they are in the picture.
	const placedPins = (family: Node) => {
		const left = family.x - family.w / 2;
		const top = family.y + family.h / 2;
		return (layout.panels.get(family)?.pins ?? []).map((pin) => ({ ...pin, x: left + pin.x, y: top + pin.y }));
	};
	/* The pins shown at a zoom, to a doubling: the biggest first, each that
	   would overlap one already there merged into it if of the same country,
	   its count added and the pin moved to the middle of them all, else left
	   out, the bigger one standing for the place. One that has taken in all
	   its country's is named for the country. */
	const clustered = new Map<string, Pin[]>();
	const pinsAtZoom = (family: Node, s: number) => {
		const level = 2 ** Math.round(Math.log2(s));
		const key = `${family.id}@${level}`;
		if (clustered.has(key)) return clustered.get(key)!;
		const all = placedPins(family);
		const perCountry = new Map<string, number>();
		for (const pin of all) perCountry.set(pin.iso, (perCountry.get(pin.iso) ?? 0) + 1);
		const overlap = (a: Pin, b: Pin) => Math.hypot(a.x - b.x, a.y - b.y) * level < (a.r + b.r) * (level / PIN_FRAMED_SCALE) ** 0.25 * 1.1;
		const shown: (Pin & { from: Pin[] })[] = [];
		for (const pin of [...all].sort((a, b) => b.n - a.n)) {
			const under = shown.find((o) => overlap(o, pin));
			if (!under) {
				shown.push({ ...pin, from: [pin] });
				continue;
			}
			if (under.iso !== pin.iso) continue;
			under.from.push(pin);
			under.n += pin.n;
			under.x = under.from.reduce((t, q) => t + q.x * q.n, 0) / under.n;
			under.y = under.from.reduce((t, q) => t + q.y * q.n, 0) / under.n;
			under.r = PIN_RADIUS + PIN_GROWTH * Math.sqrt(under.n);
			under.areas = under.from.flatMap((q) => q.areas);
			const country = G.data.map.countries[under.iso].name;
			const [first] = under.from;
			under.name = under.from.length === perCountry.get(under.iso) ? country : `${first.name} and ${under.from.length - 1} more`;
		}
		clustered.set(key, shown);
		return shown;
	};
	/* A pin's size at a zoom: `r` pixels on the screen with the map framed,
	   and from there it grows only a little, by the fourth root of the
	   zoom; zoomed out past the map framed, as small as the map gets. */
	const pinHead = (pin: Pin, s: number) => {
		const r = (pin.r / s) * Math.min(1, s / PIN_FRAMED_SCALE) * Math.max(1, s / PIN_FRAMED_SCALE) ** 0.25;
		return { r, headY: pin.y - r * 1.6 };
	};
	// Room for it as big as it gets in the picture, zoomed out as far as can be.
	const pinBox = (pin: Pin): Box => {
		const { r, headY } = pinHead(pin, G.viewport.fitScale * 0.5);
		return { x0: pin.x - r * 1.2, x1: pin.x + r * 1.5, y0: headY - r * 1.5, y1: pin.y + r * 0.2 };
	};
	const drawPin = (g: Pen, pin: Pin, s: number) => {
		if (mapPillsReadable(s)) return true;
		const { x, y, n } = pin;
		const { r, headY } = pinHead(pin, s);
		/* A teardrop: the head's circle, drawn down to its point; over a
		   shadow of itself a little lower, unblurred, as pins are drawn
		   afresh at every frame, too big to keep, and a blur takes long. */
		const reach = Math.asin(r / (y - headY));
		const teardrop = (dy: number) => {
			g.beginPath();
			g.moveTo(x, y + dy);
			g.arc(x, headY + dy, r, Math.PI / 2 + reach, Math.PI / 2 - reach + Math.PI * 2);
			g.closePath();
		};
		teardrop(r * 0.12);
		g.fillStyle = 'rgb(0 0 0 / 0.18)';
		g.fill();
		teardrop(0);
		g.fillStyle = colours.text;
		g.fill();
		// Its country's flag in its head, on white, as the flags on the pills are.
		let whole = true;
		const flag = r * 0.8;
		g.beginPath();
		g.arc(x, headY, flag, 0, Math.PI * 2);
		g.fillStyle = '#fff';
		g.fill();
		const im = flag * s >= 2 ? G.appearance.imageOf(`/assets/flags/${pin.iso.toLowerCase()}.webp`) : null;
		if (im) g.drawImage(im, x - flag, headY - flag, 2 * flag, 2 * flag);
		else if (flag * s >= 2) whole = false;
		// How many, in a little badge on its shoulder.
		const badge = r * 0.5;
		const bx = x + r * 0.78;
		const by = headY - r * 0.78;
		g.beginPath();
		g.arc(bx, by, badge, 0, Math.PI * 2);
		g.fillStyle = colours.text;
		g.fill();
		g.lineWidth = r * 0.08;
		g.strokeStyle = colours.ground;
		g.stroke();
		if (legible(badge * 0.9, s)) {
			g.font = font(badge * (n > 99 ? 0.85 : 1.05), '600');
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillStyle = colours.ground;
			g.fillText(String(n), bx, by + badge * 0.05);
		}
		return whole;
	};

	/* A panel, on the ground itself, edged down its sides and along its
	   bottom as the pill is, open at the top where the pill is. A grid: a
	   faint line down from each time on its family's scale; each row's
	   firmness right-aligned under the photograph; and behind each cheese a
	   line from the least of its ripening to the most. */
	const drawPanel = (g: Pen, family: Node, s: number) => {
		const panel = layout.panels.get(family)!;
		const top = family.y + family.h / 2;
		const left = family.x - family.w / 2;
		const r = layout.pillCornerRadius(family);
		g.beginPath();
		g.moveTo(left, top);
		g.lineTo(left, top + panel.h - r);
		g.arcTo(left, top + panel.h, left + r, top + panel.h, r);
		g.lineTo(left + panel.w - r, top + panel.h);
		g.arcTo(left + panel.w, top + panel.h, left + panel.w, top + panel.h - r, r);
		g.lineTo(left + panel.w, top);
		g.lineWidth = 1.2;
		g.strokeStyle = colours.rim;
		g.stroke();
		// A map's land and cheeses are drawn in tiles of their own (see drawMapTiles).
		if (panel.kind === 'map') return true;
		for (const [days] of panel.times) pillPainter.drawLine(g, left + panel.xOf(days), top, left + panel.xOf(days), top + panel.h, 0.75, colours.grid);
		if (legible(11, s)) {
			g.textBaseline = 'middle';
			g.textAlign = 'right';
			for (const { firm, y, h } of panel.rows) pillPainter.drawCaption(g, firm, left + layout.photoSize(family), top + y + h / 2);
		}
		g.lineCap = 'round';
		// A guess has no span to show.
		for (const [k] of panel.at)
			if (!k.unsure) pillPainter.drawLine(g, left + panel.xOf(k.axes!.days[0]), k.y, left + panel.xOf(k.axes!.days[1]), k.y, 3, colours.line);
		g.lineCap = 'butt';
		return true;
	};

	return { drawPanel, drawMapLand, pinsAtZoom, pinHead, pinBox, drawPin };
};
