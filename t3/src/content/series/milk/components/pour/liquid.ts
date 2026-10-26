import { DRAWN } from './shape';
import type { Layer, Pour } from './state';

/* The liquid: the layers that are still on their canvas, layersCtx, and
   what is being poured each part on its own (see Liquid), named over the
   spout by pouringCaption; the bowl traced as the glass is, by traceGlass. */
export function liquidDrawing(
	state: Pour,
	layersCtx: CanvasRenderingContext2D,
	pouringCaption: HTMLElement,
	traceGlass: (ctx: CanvasRenderingContext2D, fresh?: boolean) => void,
) {
	const { parts, liquids, sx, sy } = state;

	/* The layers that are still, as the glass filled to each one's level,
	   the highest first and each lower one over it, so each shows as the
	   band between its level and the one under it. The liquid darkens
	   towards the glass, round as it is. */
	const drawLayers = () => {
		const { w, h, dpr, scale, layers, colour } = state;
		const c = layersCtx;
		c.setTransform(dpr, 0, 0, dpr, 0, 0);
		c.clearRect(0, 0, w, h);
		if (!layers.length) return;
		c.save();
		traceGlass(c);
		c.clip();
		const at = (l: Layer) => {
			/* Turning, it first comes up from under the drops to its level,
			   rather than showing at once where their surface dips below that;
			   only then do the drops fade (see draw). */
			const rise = 1 - (1 - Math.min(1, 2 * l.shown)) ** 2;
			return l.level - (1 - rise) * 3 * DRAWN * liquids[l.part].radius;
		};
		const below = (y: number) => {
			c.beginPath();
			c.rect(0, sy(y), w, h);
		};
		/* Each only between its level and the one under it, so that what is
		   seen through, the water, shows the glass behind it and not the
		   layers above. */
		const ordered = [...layers].reverse();
		ordered.forEach((l, k) => {
			const under = ordered[k + 1];
			c.fillStyle = colour[l.part];
			c.beginPath();
			c.rect(0, sy(at(l)), w, under ? sy(at(under)) - sy(at(l)) : h);
			c.fill();
		});
		// Darker towards the glass, in widening strokes along its inside.
		below(at(ordered[0]));
		c.clip();
		c.strokeStyle = 'rgb(0 0 0 / 0.025)';
		for (let i = 1; i <= 8; i++) {
			c.lineWidth = i * 0.03 * scale;
			traceGlass(c);
			c.stroke();
		}
		c.restore();
	};
	/* What is being poured, its particles drawn as one liquid; and a part
	   turning into a layer, its last drops fading over the layer already
	   under them, the whole canvas faded, as the threshold would eat into
	   drops drawn fainter. */
	let named = -1;
	const draw = () => {
		if (state.turned) drawLayers();
		state.turned = false;
		const { w, h, dpr, scale, pouring, layers, colour, rgba } = state;
		// What is being poured, named over the spout while it pours.
		const now = pouring && pouring.poured < liquids[pouring.part].quota ? pouring.part : -1;
		if (now !== named) {
			named = now;
			if (now >= 0) pouringCaption.textContent = parts[now].label;
			pouringCaption.classList.toggle('is-on', now >= 0);
		}
		liquids.forEach((l, i) => {
			const { ctx } = l;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);
			let drops: { x: number; y: number }[] = [];
			let shown = 0;
			if (pouring?.part === i) {
				const pos = pouring.system.GetPositionBuffer();
				drops = Array.from({ length: pouring.system.GetParticleCount() }, (_, k) => pos[k]);
			} else {
				const layer = layers.find((y) => y.part === i && y.shown < 1);
				if (!layer) return;
				({ drops, shown } = layer);
			}
			/* Drawn solid, as the threshold would make it so, and as clear as
			   its colour is by the canvas's opacity, which a layer turning
			   fades further. */
			const [red, green, blue, a] = rgba(colour[i]);
			l.canvas.style.opacity = String(a * Math.min(1, 2 - 2 * shown));
			const r = l.radius * scale * DRAWN;
			ctx.fillStyle = `rgb(${red * 255} ${green * 255} ${blue * 255})`;
			ctx.beginPath();
			for (const { x, y } of drops) {
				ctx.moveTo(sx(x) + r, sy(y));
				ctx.arc(sx(x), sy(y), r, 0, Math.PI * 2);
			}
			ctx.fill();
		});
	};

	return { drawLayers, draw };
}
