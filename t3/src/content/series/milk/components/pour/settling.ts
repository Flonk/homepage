import { b2BodyType, b2EdgeShape, b2World } from '@box2d/core';
import { b2ParticleFlag, b2ParticleSystemDef, type b2ParticleSystem } from '@box2d/particles';
import { HEIGHT, halfWidth, SIDE, FLOOR, FOOT, RADIUS, DRAWN, LANES, FINE_LANES, SPOUT_Y, SPOUT_SPEED, GENTLE_SPEED, SLANT } from './shape';
import type { Pour } from './state';

/* ---- pouring and settling -------------------------------------------
   A part at a time, poured from a spout a few particles wide, a row at
   a time, each once the last has fallen clear: the water fast, the
   rest gently, slow enough to be seen going in. Once it is all in and
   has come to rest it is still: no longer particles but a layer, a
   level in the glass, and the floor the next part is poured onto. So
   only what is being poured is ever moving.
   The glass poured after `before`, if it is given, once that has
   settled; its layers drawn again, by drawLayers, as they change. */
export function settling(state: Pour, before: HTMLElement | undefined, drawLayers: () => void) {
	const { root, parts, liquids } = state;

	/* ---- the world ----------------------------------------------------- */
	const world = b2World.Create({ x: 0, y: -10 });
	const body = world.CreateBody({ type: b2BodyType.b2_staticBody });
	const wall = (a: [number, number], b: [number, number]) =>
		body.CreateFixture({ shape: new b2EdgeShape().SetTwoSided({ x: a[0], y: a[1] }, { x: b[0], y: b[1] }) });
	wall([-FLOOR, 0], [FLOOR, 0]);
	for (let k = 1; k < SIDE.length; k++)
		for (const side of [-1, 1]) wall([side * SIDE[k - 1][0], SIDE[k - 1][1]], [side * SIDE[k][0], SIDE[k][1]]);

	let sincePour = 0;
	const lanes = (i: number) => (i === 0 ? LANES : FINE_LANES);
	const speed = (i: number) => (i === 0 ? SPOUT_SPEED : GENTLE_SPEED);
	// How long a part rests before it is still, at most, however it stirs.
	const SETTLE = 3;
	// How fast a part is calmed once it is all in, its drops slowed by this much a second.
	const CALM = 4;
	// How long a part's level must keep, near enough, for where it settles to be clear.
	const STEADY = 0.3;
	// And how much longer the water is given, for its being so much more and so stirred.
	const WATER_LONGER = 0.5;
	// How long a part takes to turn from drops into a layer, in seconds.
	const TURN = 0.8;
	const begin = () => {
		const part = parts.findIndex((p, i) => state.wanted.has(p.id) && !state.layers.some((l) => l.part === i));
		if (part < 0) return;
		const def = new b2ParticleSystemDef();
		def.radius = liquids[part].radius;
		def.dampingStrength = 0.2;
		// Stiff enough that the liquid hardly squeezes down under its own weight.
		def.pressureStrength = 0.4;
		if (parts[part].id === 'fat') def.viscousStrength = 0.4;
		state.pouring = { part, system: world.CreateParticleSystem(def), poured: 0, since: 0, level: -Infinity, steady: 0 };
	};
	const pour = () => {
		const pouring = state.pouring;
		if (!pouring) return;
		const { part, system } = pouring;
		const { radius, quota } = liquids[part];
		for (let lane = 0; lane < Math.min(lanes(part), quota - pouring.poured); lane++, pouring.poured++)
			system.CreateParticle({
				flags: parts[part].id === 'fat' ? b2ParticleFlag.b2_viscousParticle : b2ParticleFlag.b2_waterParticle,
				position: { x: SLANT.x + (lane - (lanes(part) - 1) / 2) * radius * 2, y: SPOUT_Y },
				velocity: { x: part === 0 ? SLANT.water : SLANT.rest, y: -speed(part) },
			});
	};
	/* Its level once at rest: the middle of the tops of it, strip by strip
	   across the glass at its surface, each as far up as it is drawn, so
	   that the layer stands where the liquid did; and a drop still bobbing
	   does not lift it. Only across the glass as wide as it is there: where
	   the bowl is wider under it, the top of a strip is down in the bowl. */
	const levelOf = (system: b2ParticleSystem, radius: number) => {
		const STRIP = radius * 4;
		const pos = system.GetPositionBuffer();
		let highest = -Infinity;
		for (let k = 0; k < system.GetParticleCount(); k++) highest = Math.max(highest, pos[k].y);
		const reach = halfWidth(highest) - radius;
		const top = new Map<number, number>();
		for (let k = 0; k < system.GetParticleCount(); k++) {
			if (Math.abs(pos[k].x) > reach) continue;
			const s = Math.round(pos[k].x / STRIP);
			top.set(s, Math.max(top.get(s) ?? -Infinity, pos[k].y + radius * DRAWN));
		}
		const tops = [...top.values()].sort((a, b) => a - b);
		return tops.length ? tops[tops.length >> 1] : null;
	};
	const freeze = () => {
		if (!state.pouring) return;
		const { part, system } = state.pouring;
		const level = levelOf(system, liquids[part].radius);
		const pos = system.GetPositionBuffer();
		const drops = Array.from({ length: system.GetParticleCount() }, (_, k) => ({ x: pos[k].x, y: pos[k].y }));
		world.DestroyParticleSystem(system);
		state.pouring = null;
		if (level === null) return;
		// Across the glass at that height, into its walls, that nothing slips by.
		const reach = halfWidth(level) + RADIUS;
		const floor = body.CreateFixture({ shape: new b2EdgeShape().SetTwoSided({ x: -reach, y: level }, { x: reach, y: level }) });
		state.layers.push({ part, level, floor, drops, shown: 0 });
		drawLayers();
	};
	// When what is in the glass changes, it is emptied and poured again.
	const empty = () => {
		delete root.dataset.settled;
		if (state.pouring) world.DestroyParticleSystem(state.pouring.system);
		state.pouring = null;
		for (const l of state.layers) body.DestroyFixture(l.floor);
		state.layers = [];
		drawLayers();
	};

	/* Whether this one has settled, every part in and turned to a layer,
	   for the one after it to see. */
	const tick = (dt: number) => {
		if (before && before.dataset.settled !== 'true') return;
		for (const l of state.layers)
			if (l.shown < 1) {
				l.shown = Math.min(1, l.shown + dt / TURN);
				state.turned = true;
			}
		if (!state.pouring) begin();
		const pouring = state.pouring;
		if (!pouring) {
			if (state.layers.every((l) => l.shown >= 1)) root.dataset.settled = 'true';
			return;
		}
		const { part, system } = pouring;
		sincePour += dt;
		if (pouring.poured < liquids[part].quota && sincePour >= (2 * liquids[part].radius) / speed(part)) {
			sincePour = 0;
			pour();
		}
		world.Step(dt, { velocityIterations: 6, positionIterations: 2, particleIterations: 3 });
		// What escaped over the rim goes, rather than piling up below or clinging to the glass outside.
		const pos = system.GetPositionBuffer();
		for (let k = system.GetParticleCount() - 1; k >= 0; k--) {
			const { x, y } = pos[k];
			if (y < -FOOT - 0.3 || (y < HEIGHT && Math.abs(x) > halfWidth(y) + 2 * liquids[part].radius)) system.DestroyParticle(k);
		}
		if (pouring.poured < liquids[part].quota) return;
		/* All in, it is calmed, every drop slowed, so that it comes to rest
		   quickly and at the level it will keep: still sloshing, it stands
		   higher than at rest. Still once it is clear where it settles, its
		   level kept for a moment, though its drops still stir: turning into
		   a layer hides the rest, and the next part need not wait for it.
		   Or once it has had long enough. */
		pouring.since += dt;
		system.SetDamping(1);
		const calm = Math.exp(-CALM * dt);
		const vel = system.GetVelocityBuffer();
		for (let k = 0; k < system.GetParticleCount(); k++) {
			vel[k].x *= calm;
			vel[k].y *= calm;
		}
		const level = levelOf(system, liquids[part].radius) ?? -Infinity;
		if (Math.abs(level - pouring.level) < liquids[part].radius * 0.5) pouring.steady += dt;
		else {
			pouring.level = level;
			pouring.steady = 0;
		}
		const longer = part === 0 ? WATER_LONGER : 0;
		if (pouring.steady > STEADY + longer || pouring.since > SETTLE + longer) freeze();
	};

	return { tick, empty };
}
