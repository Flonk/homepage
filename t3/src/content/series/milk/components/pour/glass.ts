import { HEIGHT, CURVE, FLOOR, FOOT, FOOT_WIDTH, WALL, FILLET, walls, OUTER, FOOT_YS, FOOT_WIDTHS } from './shape';
import type { Pour } from './state';

/* ---- drawing -------------------------------------------------------
   From the side, flat as the liquid is, the glass made round only by
   how it is lit and the liquid by how it darkens towards the glass.
   The glass on its own canvas, gctx; the liquid see liquid.ts. */
export function glassDrawing(state: Pour, gctx: CanvasRenderingContext2D) {
	const { root, sx, sy } = state;

	// The inside of the bowl, its corner rounded (see FILLET).
	const traceGlass = (ctx: CanvasRenderingContext2D, fresh = true) => {
		if (fresh) ctx.beginPath();
		const [x0, y0] = walls[walls.length - 1];
		ctx.moveTo(sx(-x0), sy(y0));
		for (let k = walls.length - 1; k >= 0; k--) ctx.lineTo(sx(-walls[k][0]), sy(walls[k][1]));
		const inset = walls[0][0] - FLOOR + FILLET;
		ctx.quadraticCurveTo(sx(-FLOOR), sy(0), sx(-FLOOR + inset), sy(0));
		ctx.lineTo(sx(FLOOR - inset), sy(0));
		ctx.quadraticCurveTo(sx(FLOOR), sy(0), sx(walls[0][0]), sy(walls[0][1]));
		for (const [x, y] of walls) ctx.lineTo(sx(x), sy(y));
	};
	/* The outside of the whole glass: from the lip, rounded over the wall,
	   down the curve, across the foot's bottom, back up the other side and
	   over the other lip. */
	const traceOutside = (ctx: CanvasRenderingContext2D) => {
		const { scale } = state;
		const mouth = CURVE[CURVE.length - 1][0];
		const lip = (WALL / 2) * scale;
		ctx.beginPath();
		ctx.moveTo(sx(-mouth), sy(HEIGHT));
		ctx.arc(sx(-mouth - WALL / 2), sy(HEIGHT), lip, 0, Math.PI, true);
		for (const [x, y] of OUTER) ctx.lineTo(sx(-x), sy(y));
		for (let k = OUTER.length - 1; k >= 0; k--) ctx.lineTo(sx(OUTER[k][0]), sy(OUTER[k][1]));
		ctx.arc(sx(mouth + WALL / 2), sy(HEIGHT), lip, 0, Math.PI, true);
	};
	const drawGlass = () => {
		const { w, h, dpr, scale, ox, rgba } = state;
		const css = getComputedStyle(root);
		const edge = css.getPropertyValue('--glass');
		const tint = css.getPropertyValue('--glass-tint');
		const shine = css.getPropertyValue('--glass-shine');
		const g = gctx;
		g.setTransform(dpr, 0, 0, dpr, 0, 0);
		g.clearRect(0, 0, w, h);
		g.lineJoin = 'round';
		g.lineCap = 'round';
		const line = Math.max(1, 0.012 * scale);
		const mouth = CURVE[CURVE.length - 1][0];

		// Its shadow on what it stands on.
		const shadow = g.createRadialGradient(sx(0), sy(-FOOT), 0, sx(0), sy(-FOOT), FOOT_WIDTH * 1.3 * scale);
		shadow.addColorStop(0, 'rgb(0 0 0 / 0.18)');
		shadow.addColorStop(1, 'rgb(0 0 0 / 0)');
		g.save();
		g.translate(0, sy(-FOOT));
		g.scale(1, 0.12);
		g.translate(0, -sy(-FOOT));
		g.fillStyle = shadow;
		g.fillRect(0, sy(-FOOT) - FOOT_WIDTH * 1.3 * scale, w, FOOT_WIDTH * 2.6 * scale);
		g.restore();

		// The glass itself, faintly, over all it holds, and its thickness more so.
		traceOutside(g);
		g.fillStyle = tint;
		g.fill();
		g.save();
		traceOutside(g);
		g.closePath();
		traceGlass(g, false);
		g.closePath();
		g.fill('evenodd');
		g.restore();
		/* The solid bottom, stem and foot, thick glass and round: lit as a
		   cylinder is, from the left, a bright stripe a fifth of the way in
		   and its edges darker. In strips running down it, each at its share
		   of the way across, so that the light follows the shape however it
		   curves; opaque, worked out over the ground behind, so that where
		   two meet no seam shows. */
		// The ground: the nearest painted, a frame's card (its ::before, see DeckViz) before the frame.
		const groundColour = (() => {
			for (let el: Element | null = root; el; el = el.parentElement)
				for (const pseudo of ['::before', null]) {
					const c = rgba(getComputedStyle(el, pseudo).backgroundColor);
					if (c[3] > 0.99) return c;
				}
			return [1, 1, 1, 1];
		})();
		const over = (under: number[], c: number[]) => under.map((v, k) => (k < 3 ? v * (1 - c[3]) + c[k] * c[3] : 1));
		const shineRGBA = rgba(shine);
		const STOPS: [number, number[]][] = [
			[0, [0, 0, 0, 0.16]],
			[0.1, [0, 0, 0, 0.03]],
			[0.2, shineRGBA],
			[0.3, [1, 1, 1, 0.12]],
			[0.6, [1, 1, 1, 0]],
			[0.85, [0, 0, 0, 0.07]],
			[1, [0, 0, 0, 0.2]],
		];
		const lightAt = (u: number) => {
			const i = Math.max(1, STOPS.findIndex(([at]) => at >= u));
			const [u0, c0] = STOPS[i - 1];
			const [u1, c1] = STOPS[i];
			const t = (u - u0) / (u1 - u0 || 1);
			return c0.map((v, k) => v + (c1[k] - v) * t);
		};
		const glassOn = over(groundColour, rgba(tint));
		const STRIPS = 60;
		g.save();
		traceOutside(g);
		g.clip();
		for (let i = 0; i < STRIPS; i++) {
			const u0 = i / STRIPS;
			const u1 = (i + 1.6) / STRIPS;
			const [r, gr, b] = over(glassOn, lightAt((i + 0.5) / STRIPS));
			g.fillStyle = `rgb(${r * 255} ${gr * 255} ${b * 255})`;
			g.beginPath();
			for (let k = 0; k < FOOT_YS.length; k++) g.lineTo(ox + (2 * u0 - 1) * FOOT_WIDTHS[k] * scale, sy(FOOT_YS[k]));
			for (let k = FOOT_YS.length - 1; k >= 0; k--) g.lineTo(ox + (2 * Math.min(1, u1) - 1) * FOOT_WIDTHS[k] * scale, sy(FOOT_YS[k]));
			g.fill();
		}
		// Under the bowl darker, seen through the glass above it.
		const under = g.createLinearGradient(0, sy(0.02), 0, sy(-0.24));
		under.addColorStop(0, 'rgb(0 0 0 / 0.32)');
		under.addColorStop(1, 'rgb(0 0 0 / 0)');
		g.fillStyle = under;
		g.fillRect(0, sy(0.02), w, 0.26 * scale);
		g.restore();
		// The light along the top of the foot, just inside its curve where it flares out.
		g.strokeStyle = shine;
		g.lineWidth = Math.max(1, 0.01 * scale);
		const flare = OUTER.filter(([x, y]) => y < -0.25 && x < FOOT_WIDTH - 0.04 && y > -FOOT + 0.03);
		for (const side of [-1, 1]) {
			g.beginPath();
			for (const [x, y] of flare) g.lineTo(sx(side * (x - 0.01)), sy(y - 0.012));
			g.globalAlpha = side < 0 ? 0.9 : 0.4;
			g.stroke();
		}
		g.globalAlpha = 1;

		// Its edges: the outside firm, the inside fainter.
		g.strokeStyle = edge;
		g.lineWidth = line;
		traceOutside(g);
		g.stroke();
		g.globalAlpha = 0.45;
		traceGlass(g);
		g.stroke();
		g.globalAlpha = 1;

		/* The light caught down the bowl: a long streak in its left wall,
		   following it, brightest at the bowl's widest, and a thin one right. */
		const streak = (side: number, inset: number, width: number, from: number, to: number) => {
			const along = g.createLinearGradient(0, sy(to), 0, sy(from));
			along.addColorStop(0, 'rgb(255 255 255 / 0)');
			along.addColorStop(0.45, shine);
			along.addColorStop(1, 'rgb(255 255 255 / 0)');
			g.strokeStyle = along;
			g.lineWidth = width * scale;
			g.beginPath();
			for (const [x, y] of CURVE) if (y >= from && y <= to) g.lineTo(sx(side * (x - inset)), sy(y));
			g.stroke();
		};
		streak(-1, 0.07, 0.045, 0.25, 1.95);
		streak(-1, 0.16, 0.012, 0.45, 1.5);
		streak(1, 0.05, 0.014, 0.4, 1.4);
	};

	return { traceGlass, drawGlass };
}
