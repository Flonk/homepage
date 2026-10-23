import { ROOT, NODE_H, PAD_X, FONT, ROOT_WORD, GAP_X, STEP_FONT, STEP_PAD, RADIUS, PACKING, PICTURE_GAP, LINK_ROOM, APART, ROW_GAP, sizeOf, MILK, STRAND, headWidth, headLength, CORNER, MAP_PILL, RULE_PX, RULER_END, DROP, TIER_GAP, SIDE_GAP, MONO, measure, type Node, type Edge, type Graph, type Chip } from './base';

// A map's pin: a country's, or closer in a region's, where its cheeses are and how many.
/* A map's pin: a region's cheeses, or those of a country whose region is
   not known, where they are and how many; zoomed out, the pins of a
   country near each other made one (see pinsAt). */
export type Pin = { iso: string; areas: (string | undefined)[]; name: string; x: number; y: number; r: number; n: number };
export type Panel = {
	kind: 'grid' | 'map';
	pins?: Pin[];
	w: number;
	h: number;
	rows: { firm: string; y: number; h: number }[];
	times: [number, string][];
	xOf: (days: number) => number;
	at: Map<Node, { x: number; y: number }>;
};
/* Down: each branch packed as close to the one before as their outlines
   let them, not their bands: a branch is the boxes its pills, its lines
   and its steps' words take up, and the next one comes down only as far
   as it must to clear them, wherever they are side by side. So a small
   product by the trunk tucks in just above a great branch whose far end
   reaches up past it, as kefir does over soured milk. A parent sits
   level with the middle of its first and last child. Worked out within
   each branch, then milk's branches stacked down and centred on it. */
// `own`: the box is a sibling's own pill or arrow, not something further down its branch.
export type Box = { x0: number; x1: number; y0: number; y1: number; own?: boolean };
/* An arrow drawn as one shape, filled: both edges of a line as wide as
   the product it leads to is big, round its corners, and, for a product
   made, in to a point at the product's edge. Not a stroked line with a
   head put on its end, which shows a hairline seam between the two. */
export type Pt = [number, number];

/* The graph laid out: from the data, how big each is and where, and the
   shape of every arrow, before anything is drawn (see MilkGraph.astro). The
   same for a filtered copy of the data as for the whole. */
export function layout(data: Graph) {
	const { light, groups, links } = data;
	// Each value added to the list under its key.
	const group = <K, V>(into: Map<K, V[]>, key: K, value: V) => {
		const list = into.get(key);
		if (list) list.push(value);
		else into.set(key, [value]);
	};
	const products = data.nodes;
	const byId = new Map(products.map((n) => [n.id, n]));

	/* How far each is from milk, by the shortest way there with each step
	   counted at its weight. The other milks nothing is made from,
	   colostrum and the other animals', count as a light step out from
	   milk; a product neither reaches sits out past the rest. */
	const roots = products.filter((n) => n.id !== ROOT && !links.some((l) => l.target === n.id));
	const dist = new Map<string, number>([[ROOT, 0], ...roots.map((n) => [n.id, light] as [string, number])]);
	for (let changed = true; changed; ) {
		changed = false;
		for (const { source, target, weight } of links) {
			const via = (dist.get(source) ?? Infinity) + weight;
			if (via < (dist.get(target) ?? Infinity)) {
				dist.set(target, via);
				changed = true;
			}
		}
	}
	const deepest = Math.max(...dist.values());
	for (const n of products) n.dist = dist.get(n.id) ?? deepest + 1;

	const root = byId.get(ROOT)!;

	/* The tree that is drawn is the data's: each product hangs from the one
	   it is made from, the others milks from milk. Where a product has two
	   or more children of one family that is not its own, and that family
	   has a hub, the hub goes in between, a kind rather than a product:
	   fresh milk, then cooked-down milk, then the five made by boiling it
	   down. So a family comes off its parent as one branch, and every node
	   still has the one line in. */
	const treeParent = new Map<Node, Node>();
	for (const { source, target } of links) treeParent.set(byId.get(target)!, byId.get(source)!);
	for (const n of products) if (n !== root && !treeParent.has(n)) treeParent.set(n, root);
	const hubs: Node[] = [];
	/* A branch point between a parent and some of its children: not a
	   product, a point where one arrow splits, its words on that arrow; a
	   little further out than its parent, nearer than any of its own. */
	const branchPoint = (p: Node, kids: Node[], id: string, step: string, how?: Node['how']) => {
		const h: Node = { id, label: '', step, how, group: kids[0].group, niche: 0, hub: true, dist: p.dist + 0.3, x: 0, y: 0, w: 0, h: 0 };
		hubs.push(h);
		treeParent.set(h, p);
		for (const k of kids) treeParent.set(k, h);
	};
	const under = new Map<Node, Node[]>();
	for (const [n, p] of treeParent) group(under, p, n);
	// Those made together by one step count as one, being one branch already (see SPLITS).
	const splitOf = new Map(data.splits.flatMap(({ from, ids }) => ids.map((id) => [id, `${from}:${ids}`])));
	for (const [p, kids] of under) {
		groups.forEach(({ hub }, g) => {
			const family = kids.filter((k) => k.group === g);
			if (!hub || p.group === g || new Set(family.map((k) => splitOf.get(k.id) ?? k.id)).size < 2) return;
			branchPoint(p, family, `hub:${p.id}:${g}`, hub);
		});
	}
	/* And under each parent, or hub, those of one kind as a branch of
	   their own, if there are two or more of it there (see KINDS). */
	data.kinds.forEach(({ step, ids, how }, i) => {
		const by = new Map<Node, Node[]>();
		for (const id of ids) group(by, treeParent.get(byId.get(id)!)!, byId.get(id)!);
		for (const [p, kind] of by) if (kind.length >= 2) branchPoint(p, kind, `kind:${p.id}:${i}`, step, how);
	});
	/* And a step making several at once, as separating milk does (see
	   SPLITS): from the hub they would be under, if their family has one
	   there, so it keeps them as one branch with the rest of it. */
	for (const { from, step, ids } of data.splits) {
		const made = ids.map((id) => byId.get(id)!);
		branchPoint(treeParent.get(made[0])!, made, `split:${from}:${ids.join(':')}`, step);
	}
	const nodes = [...products, ...hubs];

	/* Who hangs from whom: the families in the order they are listed,
	   and within a family the more everyday first, then the nearer milk. */
	const children = new Map<Node, Node[]>();
	for (const [n, p] of treeParent) group(children, p, n);
	// What hangs from a product in the tree, looked up each time, as some are taken out of it below; and of those, the products.
	const kidsOf = (n: Node) => children.get(n) ?? [];
	const productsOf = (n: Node) => kidsOf(n).filter((k) => !k.example);
	// Whether it is a product, or a branch point leading to it, as the split that makes raw cream does.
	const leads = (n: Node, id: string): boolean => n.id === id || (!!n.hub && kidsOf(n).some((k) => leads(k, id)));
	for (const kids of children.values())
		kids.sort(
			(a, b) =>
				Number(!!a.example) - Number(!!b.example) ||
				(a.example && b.example ? a.rank! - b.rank! : 0) ||
				a.group - b.group ||
				a.niche - b.niche ||
				a.dist - b.dist ||
				a.label.localeCompare(b.label),
		);

	/* How much is made from each, all the way down, counting products
	   and not the hubs among them, and a map's cheeses; on a log scale,
	   so the great branch points stand out without swamping the rest. */
	const made = new Map<Node, number>();
	const tally = (n: Node): number => {
		const v = kidsOf(n).reduce((s, k) => s + (k.hub ? 0 : 1) + tally(k), 0);
		made.set(n, v);
		return v;
	};
	tally(root);

	// Each drawing of it again counts as one more thing made from it.
	const drawnAgain = new Map<Node, number>();
	for (const n of nodes) if (n.link) drawnAgain.set(byId.get(n.link)!, (drawnAgain.get(byId.get(n.link)!) ?? 0) + 1);
	/* One drawn again is as big as the product it is, but no bigger than
	   the biggest beside it, so it does not swamp what it is drawn with. */
	const beside = (n: Node) => productsOf(treeParent.get(n)!).filter((k) => k !== n && !k.link);
	const linked = (n: Node, of: (n: Node) => number) => Math.min(of(byId.get(n.link!)!), Math.max(...beside(n).map(of), 0) || Infinity);
	const grown = (n: Node): number =>
		n.link ? linked(n, grown) : sizeOf(made.get(n)! + (drawnAgain.get(n) ?? 0)) * (n === root ? MILK : 1);
	// A cheese on the map small on it; any other as big as what is made from it.
	const size = (n: Node): number => (n.onMap ? MAP_PILL : grown(n));
	/* How much a line into each carries: itself, and all made from it
	   (a branch point is no product, so only what it splits into). */
	const carried = new Map<Node, number>();
	const carry = (n: Node): number => {
		// One drawn again carries as much as it is big (see grown).
		if (n.link) {
			const v = linked(n, carry);
			carried.set(n, v);
			return v;
		}
		const v = (n.hub ? 0 : 1) + kidsOf(n).reduce((sum, k) => sum + carry(k), 0);
		carried.set(n, v);
		return v;
	};
	carry(root);
	/* Where how much of the world's milk goes is known for every one of a
	   product's children (see SHARES), they are as big, and their lines
	   as thick, as that share of all milk carries, and all they make
	   with them, each as big against the others as it was: milk's own
	   by how much goes each way, not by how much is made of it. A step
	   that splits, or a branch point, has the shares of what it leads to. */
	const shareOf = (n: Node): number | undefined => {
		if (!n.hub) return n.share;
		const shares = productsOf(n).map(shareOf);
		return shares.every((v) => v !== undefined) ? shares.reduce((t, v) => t! + v!, 0) : undefined;
	};
	const scaleBy = (n: Node, f: number) => {
		carried.set(n, carried.get(n)! * f);
		made.set(n, made.get(n)! * f);
		for (const k of kidsOf(n)) scaleBy(k, f);
	};
	const allMilk = carried.get(root)!;
	const apportion = (p: Node) => {
		const kids = productsOf(p);
		if (kids.length && kids.every((k) => shareOf(k) !== undefined)) {
			const shareTo = (k: Node) => {
				if (!k.hub) return scaleBy(k, ((k.share! / 100) * allMilk) / carried.get(k)!);
				const theirs = productsOf(k);
				theirs.forEach(shareTo);
				carried.set(k, theirs.reduce((t, g) => t + carried.get(g)!, 0));
			};
			kids.forEach(shareTo);
		}
		for (const k of kids) apportion(k);
	};
	apportion(root);
	/* Siblings by size, as they are drawn: the biggest branch at the top and
	   the small ones gathered at the bottom, milk's own as any product's.
	   Branches as big as each other keep the order above; examples stay
	   together after the products. */
	for (const kids of children.values()) {
		const products = kids.filter((k) => !k.example);
		const examples = kids.filter((k) => k.example);
		// By how much their lines carry: a branch point's what all it splits into does.
		kids.splice(0, kids.length, ...[...products].sort((a, b) => carried.get(b)! - carried.get(a)!), ...examples);
		// One drawn below a sibling moved there, after that sibling's branch, a split's included.
		for (const k of [...kids].filter((k) => k.below)) {
			const kin = kids.find((n) => n !== k && leads(n, k.below!));
			if (!kin) continue;
			kids.splice(kids.indexOf(k), 1);
			kids.splice(kids.indexOf(kin) + 1, 0, k);
		}
	}
	/* What hangs under a ruler, by its value on it, is laid out there, not
	   out to the right as a branch is: taken out of the tree's layout once
	   it has counted towards the sizes and lines above. Anything else made
	   from it branches off as from any product. */
	const hanging = new Map<Node, Node[]>();
	for (const [p, kids] of [...children])
		if (p.scale) {
			hanging.set(p, kids.filter((k) => k.at != null));
			const rest = kids.filter((k) => k.at == null);
			if (rest.length) children.set(p, rest);
			else children.delete(p);
		}
	// A panel's cheeses are laid out in it, not as leaves of the tree (see Product); its products stay.
	const paneled = new Map<Node, Node[]>();
	for (const [p, kids] of children)
		if (p.panel || p.map) {
			const mine = (k: Node) => (p.map ? !!k.onMap : k.example);
			paneled.set(p, kids.filter(mine));
			children.set(p, kids.filter((k) => !mine(k)));
			if (!children.get(p)!.length) children.delete(p);
		}
	const panelOf = (n: Node) => {
		const p = treeParent.get(n);
		return p && paneled.has(p) ? p : null;
	};
	// What hangs under a ruler, by value: those at one value are one list.
	const listsOf = (r: Node) => {
		const at = new Map<number, Node[]>();
		for (const k of hanging.get(r)!) group(at, k.at!, k);
		return at;
	};
	const hangsFrom = (n: Node) => {
		const p = treeParent.get(n);
		return p && n.at != null && hanging.has(p) ? p : null;
	};
	// The line into a product, and how long its arrowhead is.
	const line = (n: Node) => STRAND * carried.get(n)!;
	const arrow = (n: Node) => headLength(line(n));
	// Milk is a circle half as wide again as a pill of its size is tall.
	const rootR = 1.5 * (NODE_H / 2) * size(root);

	// A photograph is square, as tall as its pill.
	const picture = (d: Node) => NODE_H * size(d);
	// The room it takes at the pill's left, and its gap: what the words and a ruler are centred beside.
	const pictureRoom = (d: Node) => (d.image ? picture(d) + PICTURE_GAP * size(d) : 0);
	const radius = (d: Node) => RADIUS * size(d);

	/* Each pill measured round its own words, with room at its left for
	   its photograph; milk a circle. A kind's pill is its ruler: as wide
	   as the ruler and a margin either end. */
	const shown = nodes.filter((n) => !n.hub);
	for (const d of shown) {
		if (d === root) {
			d.w = d.h = rootR * 2;
			continue;
		}
		d.w = measure(d.label, FONT * size(d), '400', MONO()) + 2 * PAD_X * size(d);
		d.h = NODE_H * size(d);
		d.w += pictureRoom(d);
		if (d.link) d.w += LINK_ROOM * size(d);
		// A ruler clear of the photograph, under the rest of the pill.
		if (d.scale) d.w = Math.max(d.w, pictureRoom(d) + d.scale.to * RULE_PX + RULER_END);
	}
	// A list under a ruler as wide as the widest in it.
	for (const r of hanging.keys())
		for (const ks of listsOf(r).values()) {
			const wide = Math.max(...ks.map((k) => k.w));
			for (const k of ks) k.w = wide;
		}
	const countryName = new Intl.DisplayNames(['en'], { type: 'region' });

	/* Laid out as a tree on a grid, as a diagram on paper is: milk at the
	   left and its branches off to the right of it; each step of making a
	   column further out from what it is made from; each product at the
	   end of a branch a row of its own, and every parent level with the
	   middle of what hangs from it. Nothing can overlap, and no line has
	   to cross a pill. */

	/* The steps, written on the last stretch of each arrow, just before
	   the product it makes; measured here, so each parent leaves room
	   enough for its children's. A hub's own arrow is a kind, not a
	   step, and has none. */
	// At the same scale as the product the arrow makes, as its own words are.
	/* Larger on an arrow whose step is told of in full, a title, whether or
	   not it has a table under it, so siblings read alike. */
	const stepFont = (n: Node) => STEP_FONT * size(n) * (n.how?.facts?.length || n.how?.table?.length || n.how?.holds?.length ? 1.6 : 1);
	const stepped = nodes.filter((n) => n.step && n !== root && !panelOf(n));
	/* A step in as many lines as it is written in, the last just over its
	   arrow and the rest stacked up from there; inside an arrow, all of
	   them centred on it. */
	const lines = (n: Node) => n.step!.split('\n');
	const LEADING = 1.15;
	// How much taller than one line its words are.
	const extra = (n: Node) => (n.step ? (lines(n).length - 1) * LEADING * stepFont(n) : 0);
	const stepWidth = new Map<Node, number>();
	for (const n of stepped) stepWidth.set(n, measure(n.step!, stepFont(n), 'italic 400'));
	/* A step's table, under the step's name and laid over its arrow: a row a
	   fact, what it is on the left and its value on the right, a value in
	   as many lines as it is written in; small, a footnote to the name. */
	const ROW = 1.3;
	/* None under a ruler, where the arrows in are its own and have no step
	   written on them. An example's arrow may have no words and still its
	   table, of what it is fermented with, say. */
	const rows = (n: Node) => (hangsFrom(n) || panelOf(n) ? [] : (n.how?.table ?? []));
	// An example's a little bigger, its pill and arrow being small, so it reads zoomed out as far as a product's.
	const tableFont = (n: Node) => STEP_FONT * size(n) * (n.example ? 0.5 : 0.35);
	/* Its words broken onto lines no wider than so many of its letters
	   high, a key narrower than a value, so a long list of cultures reads
	   down the table and not off across the graph. Kept, as measuring is
	   not free and the size does not change what breaks where. */
	const KEY_WIDE = 9;
	const VALUE_WIDE = 18;
	const broken = new Map<string, string[]>();
	const wrap = (said: string, wide: number, face: string) => {
		const kept = broken.get(`${face}${wide}${said}`);
		if (kept) return kept;
		const out: string[] = [];
		for (const given of said.split('\n')) {
			let at = '';
			for (const word of given.split(' ')) {
				const tried = at ? `${at} ${word}` : word;
				if (at && measure(tried, 100, face) / 100 > wide) {
					out.push(at);
					at = word;
				} else at = tried;
			}
			out.push(at);
		}
		broken.set(`${face}${wide}${said}`, out);
		return out;
	};
	const keyLines = (k: string) => wrap(k, KEY_WIDE, '600');
	const rowLines = (v: string) => wrap(v, VALUE_WIDE, '400');
	/* Its holds, a chip each (see Chip), along a line of their own over its
	   rows, broken onto more where too many for one, an arrow between each
	   two on a line; under them the microbes each brings, a line of names
	   wrapped as wide as the chips run. Laid out in its table's letters,
	   from its top left. */
	const holds = (n: Node) => (hangsFrom(n) || panelOf(n) ? [] : (n.how?.holds ?? []));
	/* Each a card: what it is, small, over what it says; under that, the
	   microbes it adds in letters so small they run about as wide as what it
	   says, there being zoom enough to read them; under those its sentence.
	   In its table's letters: each line's size, the room round them, the bar
	   for how warm it is held, the room for the arrow between two cards. */
	const CARD = { title: 0.55, said: 1, tiny: 0.36, note: 0.5, pad: 0.5, bar: 0.16, gap: 1.4, least: 5 };
	const CARDS_WIDE = 44;
	type Said = { said: string; y: number; size: number; face: string; mono: boolean; dim: boolean };
	type Card = { x: number; y: number; w: number; h: number; warmth?: number; lines: Said[] };
	type Strip = { w: number; h: number; cards: Card[]; joins: { x: number; y: number }[] };
	const strips = new Map<Node, Strip>();
	const cardOf = (c: Chip, f: number): Card => {
		const inset = CARD.pad + (c.warmth === undefined ? 0 : CARD.bar + CARD.pad * 0.6);
		const wide = Math.max(CARD.least * f, measure(c.title, CARD.title * f, '700', MONO()), c.said ? measure(c.said, CARD.said * f, '400', MONO()) : 0);
		const lines: Said[] = [];
		let y = CARD.pad * f;
		const put = (said: string, size: number, face: string, mono: boolean, dim: boolean, leading = 1.25) => {
			y += size * f * leading;
			lines.push({ said, y: y - size * f * (leading - 1) - size * f * 0.18, size: size * f, face, mono, dim });
		};
		put(c.title, CARD.title, '700', true, true, 1.35);
		if (c.said) put(c.said, CARD.said, '400', true, false, 1.3);
		if (c.microbes) {
			y += 0.15 * f;
			for (const said of wrap(c.microbes, wide / (CARD.tiny * f), '400')) put(said, CARD.tiny, '400', false, true, 1.25);
		}
		if (c.note) {
			y += 0.2 * f;
			for (const said of wrap(c.note, Math.max(wide, 12 * f) / (CARD.note * f), '400')) put(said, CARD.note, '400', false, false, 1.3);
		}
		const w = Math.max(wide, ...lines.map((l) => measure(l.said, l.size, l.face, l.mono ? MONO() : undefined)));
		return { x: 0, y: 0, w: w + (inset + CARD.pad) * f, h: y + CARD.pad * f, warmth: c.warmth, lines };
	};
	// Laid along in rows, broken where too wide for one, an arrow between two in a row; a row as tall as its tallest card.
	const stripOf = (n: Node): Strip => {
		const kept = strips.get(n);
		if (kept) return kept;
		const f = tableFont(n);
		const strip: Strip = { w: 0, h: 0, cards: [], joins: [] };
		let x = 0;
		let top = 0;
		let tall = 0;
		holds(n).forEach((c, i) => {
			const card = cardOf(c, f);
			if (i && x + CARD.gap * f + card.w > CARDS_WIDE * f) {
				x = 0;
				top += tall + 0.6 * f;
				tall = 0;
			} else if (i) {
				strip.joins.push({ x: x + (CARD.gap * f) / 2, y: top + (CARD.pad + CARD.title * 1.35 + CARD.said * 0.65) * f });
				x += CARD.gap * f;
			}
			card.x = x;
			card.y = top;
			strip.cards.push(card);
			x += card.w;
			tall = Math.max(tall, card.h);
			strip.w = Math.max(strip.w, x);
		});
		strip.h = top + tall;
		strips.set(n, strip);
		return strip;
	};
	const tabled = nodes.filter((n) => rows(n).length > 0 || holds(n).length > 0);
	const columns = new Map<Node, { key: number; value: number }>();
	for (const n of tabled.filter((n) => rows(n).length)) {
		const widest = (said: string[], face: string) => Math.max(...said.map((t) => measure(t, tableFont(n), face)));
		columns.set(n, { key: widest(rows(n).flatMap(({ k }) => keyLines(k)), '600'), value: widest(rows(n).flatMap(({ v }) => rowLines(v)), '400') });
	}
	// The room in a cell round its words.
	const pad = (n: Node) => tableFont(n) * 0.6;
	const tableWidth = (n: Node) => {
		const c = columns.get(n);
		return Math.max(c ? c.key + c.value + 4 * pad(n) : 0, holds(n).length ? stripOf(n).w : 0);
	};
	// A row as tall as its key's lines or its value's, and its padding.
	const rowHeight = (n: Node, { k, v }: { k: string; v: string }) =>
		Math.max(keyLines(k).length, rowLines(v).length) * ROW * tableFont(n) + pad(n);
	// Its rows, and its holds over them with a little air between; how tall it is, with a little air under it.
	const rowsHeight = (n: Node) => rows(n).reduce((sum, row) => sum + rowHeight(n, row), 0);
	const stripHeight = (n: Node) => (holds(n).length ? stripOf(n).h + (rows(n).length ? tableFont(n) * 0.5 : 0) : 0);
	const tableHeight = (n: Node) => {
		const tall = stripHeight(n) + rowsHeight(n);
		return tall ? tall + tableFont(n) * 0.6 : 0;
	};
	// Inside its arrow, centred on it, where the arrow is that thick.
	const tableInside = (n: Node) => line(n) >= tableHeight(n) + tableFont(n);
	/* Where it begins, from the middle of its arrow: in the arrow, or just
	   under the step's words, laid over it. */
	const tableTop = (n: Node) =>
		tableInside(n) ? -(tableHeight(n) - tableFont(n) * 0.6) / 2 : -line(n) / 2 - stepFont(n) * 0.45 + stepFont(n) * 0.3;
	// How far under the middle of its arrow it reaches, laid over the arrow.
	const tableBottom = (n: Node) => (tableHeight(n) ? tableTop(n) + tableHeight(n) : 0);

	/* Across: each product just past the edge of what it is made from,
	   by a gap as wide as that parent wants, the bigger the wider; not in
	   columns shared with the rest of the tree, where one great pill would
	   push every small one's children far off. A branch keeps its own
	   rows, so nothing it shares a column with can be in its way. */
	/* From a parent's edge out to its trunk, then from the trunk on to each
	   child: a distance that goes by the parent and the child's size, so
	   that its children drawn the same size line up, as far out as the
	   longest step written into any of them needs, so every step still
	   fits; and a small child is not pushed out by a great sibling's
	   words, nor by any other parent's. Siblings are in rows of their own,
	   so they cannot meet. */
	// A branch point turns at once: it has no pill to clear.
	// Milk keeps a margin of half its own size, its radius, all round it.
	const reach = (n: Node) => (GAP_X / 2) * Math.sqrt(size(n));
	/* Out of a product, a straight run at least so much of its own height
	   before its line bends, so a great pill's line leaves it plainly
	   before it turns. */
	const CLEAR = 0.3;
	const toTrunk = (n: Node) => (n === root ? rootR : n.hub ? GAP_X / 4 : Math.max(reach(n), CLEAR * n.h));
	/* Half as wide as the trunk out of a product, the line into the
	   biggest of its children: kept clear of on both sides, so neither the
	   parent nor a step's words beside it are under it. */
	const halfTrunk = (n: Node) => kidsOf(n).reduce((sum, k) => sum + line(k), 0) / 2;
	const needs = (k: Node) =>
		Math.max(
			reach(k),
			Math.max(stepWidth.get(k) ?? 0, tableWidth(k)) + 2 * STEP_PAD * size(k) + arrow(k),
		);
	const key = (k: Node) => `${treeParent.get(k)!.id} ${size(k)}`;
	const out = new Map<string, number>();
	for (const k of nodes) if (k !== root) out.set(key(k), Math.max(out.get(key(k)) ?? 0, needs(k)));
	const fromTrunk = (k: Node) => out.get(key(k))!;
	// How far a product reaches out to the right.
	const outer = (n: Node) => n.x + n.w / 2;
	/* A ruler: the arrows off it leave from its pill's bottom edge, this
	   far under its middle, each where its value is along the ruler, which
	   is centred in the pill. */
	const axisY = (r: Node) => r.h / 2;
	const tickX = (r: Node, v: number) => r.x + pictureRoom(r) / 2 + (v - r.scale!.to / 2) * RULE_PX;
	/* Each product centred straight under its value, its arrow straight
	   down into its middle; those at one value as one list, stacked one on
	   another as wide as each other, the arrow into the top of it. In rows, no two values' lists meeting in one: of every way to put them
	   in rows, the one with the fewest arrows passing under a pill in a row
	   above, then the fewest rows, then the most in the upper ones. An arrow
	   may pass under a pill here, and only here, as the arrows are drawn
	   under the pills; but one that splits under another product reads as
	   made from it, so that is the last thing chosen. How far under its
	   kind each comes. */
	const hangY = new Map<Node, number>();
	// And how far under it the top of each one's list is, where its arrow comes in.
	const listTop = new Map<Node, number>();
	const hang = (r: Node) => {
		const values = [...listsOf(r)].sort(([a], [b]) => a - b).map(([v, ks]) => {
			const tick = tickX(r, v);
			for (const k of ks) k.x = tick;
			const wide = ks[0].w;
			return { ks, tick, x0: tick - wide / 2, x1: tick + wide / 2, tall: ks.reduce((sum, k) => sum + k.h, 0) };
		});
		const meet = (a: (typeof values)[number], b: (typeof values)[number]) => a.x1 + SIDE_GAP > b.x0 && b.x1 + SIDE_GAP > a.x0;
		// Under a pill: the arrow down to b passes behind a, in a row above it.
		const under = (a: (typeof values)[number], b: (typeof values)[number]) => b.tick > a.x0 - 2 && b.tick < a.x1 + 2;
		const most = Math.min(values.length, 5);
		const row: number[] = [];
		let best: number[] = values.map((_, i) => i);
		let bestCost = Infinity;
		/* Built up a value at a time, its cost so far carried along, and
		   given up as soon as that is no better than the best found, which
		   only grows as more are placed; so it is quick, rows tried from the
		   top. */
		const fit = (i: number, hidden: number, deepest: number, sum: number) => {
			const cost = hidden * 1e4 + deepest * 100 + sum;
			if (cost >= bestCost) return;
			if (i === values.length) {
				[bestCost, best] = [cost, [...row]];
				return;
			}
			for (let t = 0; t < most; t++) {
				let meets = false;
				let more = 0;
				for (let j = 0; j < i && !meets; j++) {
					if (row[j] === t) meets = meet(values[j], values[i]);
					else if (row[j] < t ? under(values[j], values[i]) : under(values[i], values[j])) more++;
				}
				if (meets) continue;
				row[i] = t;
				fit(i + 1, hidden + more, Math.max(deepest, t), sum + t);
			}
		};
		fit(0, 0, 0, 0);
		// Each row as tall as its tallest list, and the rows down from the ruler.
		const rows = Math.max(0, ...best) + 1;
		const tallest = Array.from({ length: rows }, (_, t) => Math.max(0, ...values.filter((_, i) => best[i] === t).map((v) => v.tall)));
		const rowTop = tallest.map((_, t) => axisY(r) + DROP + tallest.slice(0, t).reduce((sum, h) => sum + h + TIER_GAP, 0));
		values.forEach(({ ks }, i) => {
			let y = rowTop[best[i]];
			for (const k of ks) {
				listTop.set(k, rowTop[best[i]]);
				hangY.set(k, y + k.h / 2);
				y += k.h;
			}
		});
	};
	/* A panel: ripening across, on a log scale, as a week and a month are
	   as far apart as a month and four; firmness down, a row for each
	   class from the softest to the firmest of its cheeses. Each cheese at
	   the middle of its ripening, a line behind it from the least to the
	   most; those in one row that would meet stacked one under another, so
	   each stays at its own time, as a pill is far wider than it is tall.
	   Hung straight under its family, its pill as wide as the panel: the
	   pill's bottom edge is the panel's ruler of time, as a kind's is of
	   fat, and the column under its photograph holds the rows' names. */
	const FIRM_ORDER: string[] = data.firms;
	const PANEL_DECADE = 10 * NODE_H;
	const PANEL_PAD = 18;
	const TIMES: [number, string][] = [
		[1, '1 day'], [7, '1 wk'], [14, '2 wk'], [30, '1 mo'], [60, '2 mo'], [90, '3 mo'], [180, '6 mo'], [365, '1 yr'], [730, '2 yr'], [1095, '3 yr'], [1825, '5 yr'],
	];
	const panels = new Map<Node, Panel>();
	const ripe = (k: Node) => Math.sqrt(Math.max(1, k.axes!.days[0]) * Math.max(1, k.axes!.days[1]));
	const lay = (p: Node) => {
		const ks = paneled.get(p)!;
		const least = Math.min(...ks.map((k) => Math.max(1, k.axes!.days[0])));
		const most = Math.max(...ks.map((k) => k.axes!.days[1]));
		const from = [...TIMES].reverse().find(([d]) => d <= least) ?? TIMES[0];
		const to = TIMES.find(([d]) => d >= most) ?? TIMES.at(-1)!;
		const times = TIMES.filter(([d]) => d >= from[0] && d <= to[0]);
		// Room at the left for the widest cheese to sit at the very start.
		const lead = picture(p) + PANEL_PAD + Math.max(...ks.map((k) => k.w)) / 2;
		const xOf = (days: number) => lead + (Math.log10(Math.max(1, days)) - Math.log10(from[0])) * PANEL_DECADE;
		/* A cheese whose time is a guess is not stacked on the one point its
		   family's usual time is, but spread evenly with the others like it
		   across that span, from its usual least to its usual most: somewhere
		   in there, as its question mark says. */
		const sure = ks.filter((k) => !k.unsure);
		const logs = (i: 0 | 1) => (sure.length ? sure : ks).map((k) => Math.log10(Math.max(1, k.axes!.days[i]))).sort((a, b) => a - b);
		const mid = (xs: number[]) => xs[Math.floor(xs.length / 2)];
		const [lo, hi] = [mid(logs(0)), mid(logs(1))];
		const guessed = ks.filter((k) => k.unsure);
		const at0 = (k: Node) => {
			if (!k.unsure) return ripe(k);
			const i = guessed.indexOf(k);
			return 10 ** (lo + ((hi - lo) * (i + 0.5)) / guessed.length);
		};
		const firms = ks.map((k) => FIRM_ORDER.indexOf(k.axes!.firm));
		const at = new Map<Node, { x: number; y: number }>();
		const rows: Panel['rows'] = [];
		let y = PANEL_PAD;
		for (let c = Math.min(...firms); c <= Math.max(...firms); c++) {
			const mine = ks.filter((k) => FIRM_ORDER.indexOf(k.axes!.firm) === c).sort((a, b) => at0(a) - at0(b));
			const tall = Math.max(...ks.map((k) => k.h)) + ROW_GAP;
			const lanes: number[] = [];
			for (const k of mine) {
				const x = xOf(at0(k));
				let lane = lanes.findIndex((right) => right + SIDE_GAP <= x - k.w / 2);
				if (lane < 0) lane = lanes.push(-Infinity) - 1;
				lanes[lane] = x + k.w / 2;
				at.set(k, { x, y: y + ROW_GAP / 2 + lane * tall + k.h / 2 });
			}
			const h = Math.max(1, lanes.length) * tall;
			rows.push({ firm: FIRM_ORDER[c], y, h });
			y += h + PANEL_PAD;
		}
		const w = Math.max(xOf(to[0]), ...[...at].map(([k, { x }]) => x + k.w / 2)) + PANEL_PAD;
		p.w = Math.max(p.w, w);
		panels.set(p, { kind: 'grid', w: p.w, h: y, rows, times, xOf, at });
	};
	/* The map: the world on Mercator's projection, as wide as MAP_W, its
	   cheeses small on it (see MAP_PILL), each in its country, as near
	   its middle as there is room: the nearest free place inside the
	   country, or once there is none the nearest free place at all. The countries with most first, so each keeps its own
	   ground. Zoomed into, a country's cheeses read one by one. */
	const MAP_W = 9000;
	/* A pin's head, round, the count in it, its point on the country's
	   middle: bigger the more cheeses it has. Shown zoomed out, until the
	   cheeses themselves can be read. */
	const PIN = 6;
	const PIN_GROWS = 1.2;
	// The screen's pixels to one of the picture's with the map about framed.
	const PIN_FRAMED = 700 / MAP_W;
	/* Pills or pins, never both: decided at the zoom to a doubling the
	   map's tiles are drawn at (see drawTiles), not the zoom itself. */
	const pillsShown = (s: number) => FONT * MAP_PILL * 2 ** Math.round(Math.log2(s)) >= 5;
	// A rim as fine as the pill it is on, for the small ones on the map.
	const rim = (d: Node) => Math.min(1, size(d));
	const insideOf = (rings: number[][], x: number, y: number) => {
		let inside = false;
		for (const r of rings)
			for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2)
				if (r[i + 1] > y !== r[j + 1] > y && x < ((r[j] - r[i]) * (y - r[i + 1])) / (r[j + 1] - r[i + 1]) + r[i]) inside = !inside;
		return inside;
	};
	const layMap = (p: Node) => {
		const ks = paneled.get(p)!;
		const at = new Map<Node, { x: number; y: number }>();
		const top = PANEL_PAD;
		const h = data.map.height * MAP_W + 2 * PANEL_PAD;
		// What is placed already, in cells, so a place is checked against what is near it only.
		const CELL = 40;
		const cells = new Map<string, Box[]>();
		const cellsOf = (b: Box) => {
			const keys: string[] = [];
			for (let i = Math.floor(b.x0 / CELL); i <= Math.floor(b.x1 / CELL); i++)
				for (let j = Math.floor(b.y0 / CELL); j <= Math.floor(b.y1 / CELL); j++) keys.push(`${i},${j}`);
			return keys;
		};
		const GAP = 0.6;
		const free = (b: Box) =>
			cellsOf(b).every((key) => (cells.get(key) ?? []).every((o) => b.x1 + GAP <= o.x0 || o.x1 + GAP <= b.x0 || b.y1 + GAP <= o.y0 || o.y1 + GAP <= b.y0));
		const take = (b: Box) => cellsOf(b).forEach((key) => group(cells, key, b));
		const widths = ks.map((k) => k.w).sort((a, b) => a - b);
		const dx = widths[Math.floor(widths.length / 2)] / 2;
		const dy = ks[0]?.h * 1.15;
		// Steps out from a country's middle, nearest first, as far as any country needs.
		const NEAR: [number, number][] = [];
		for (let i = -120; i <= 120; i++) for (let j = -120; j <= 120; j++) NEAR.push([i, j]);
		NEAR.sort(([a, b], [c, d]) => Math.hypot(a * dx, b * dy) - Math.hypot(c * dx, d * dy));
		const byPlace = new Map<string, Node[]>();
		const spotOf = (k: Node, lx: number, ly: number) => (k.spot ? [k.spot[0] * MAP_W, top + k.spot[1] * MAP_W] : [lx, ly]);
		for (const k of ks) group(byPlace, k.place!, k);
		const order = [...byPlace].sort((a, b) => b[1].length - a[1].length);
		for (const [iso, list] of order) {
			const country = data.map.countries[iso];
			if (!country) continue;
			const [lx, ly] = [country.label[0] * MAP_W, top + country.label[1] * MAP_W];
			const rings = country.rings.map((r) => r.map((v, i) => (i % 2 ? top + v * MAP_W : v * MAP_W)));
			// Those whose place is known first, nearest it; the protected first of those; the rest about the country's middle.
			list.sort((a, b) => Number(!!b.spot) - Number(!!a.spot) || Number(!!b.protected) - Number(!!a.protected) || a.label.localeCompare(b.label));
			for (const k of list) {
				const [sx, sy] = spotOf(k, lx, ly);
				// The nearest free place inside the country, else the nearest free place at all.
				const place = (inside: boolean) => {
					for (const [i, j] of NEAR) {
						const x = sx + i * dx;
						const y = sy + j * dy;
						const b = { x0: x - k.w / 2, x1: x + k.w / 2, y0: y - k.h / 2, y1: y + k.h / 2 };
						if ((!inside || insideOf(rings, x, y)) && free(b)) {
							take(b);
							return { x, y };
						}
					}
					return null;
				};
				at.set(k, (rings.length ? place(true) : null) ?? place(false) ?? { x: sx, y: sy });
			}
		}
		p.w = Math.max(p.w, MAP_W);
		/* A pin for each country, zoomed far out; closer in, one for each
		   region, at the middle of its cheeses' places, and one at the
		   country's middle for those of it whose region is not known. */
		const pins: Pin[] = [];
		for (const [iso, list] of order) {
			const country = data.map.countries[iso];
			if (!country) continue;
			const [lx, ly] = [country.label[0] * MAP_W, top + country.label[1] * MAP_W];
			const pin = (area: string | undefined, ks: Node[], x: number, y: number) =>
				pins.push({ iso, areas: [area], name: area ? `${area}, ${country.name}` : country.name, x, y, r: PIN + PIN_GROWS * Math.sqrt(ks.length), n: ks.length });
			const areas = new Map<string | undefined, Node[]>();
			for (const k of list) group(areas, k.area, k);
			for (const [area, ks] of areas) {
				const at = ks.map((k) => spotOf(k, lx, ly));
				const placed = area ? at : [[lx, ly]];
				pin(area, ks, placed.reduce((s, [x]) => s + x, 0) / placed.length, placed.reduce((s, [, y]) => s + y, 0) / placed.length);
			}
		}
		panels.set(p, { kind: 'map', w: p.w, h, rows: [], times: [], xOf: () => 0, at, pins });
	};
	for (const p of paneled.keys()) (p.map ? layMap : lay)(p);
	// Its box, its family at 0, under its family's pill.
	const panelBox = (p: Node): Box => {
		const P = panels.get(p)!;
		return { x0: p.x - p.w / 2, x1: p.x + p.w / 2, y0: p.h / 2, y1: p.h / 2 + P.h };
	};
	// And where it is.
	const panelArea = (p: Node): Box => {
		const b = panelBox(p);
		return { ...b, y0: b.y0 + p.y, y1: b.y1 + p.y };
	};
	root.x = 0;
	const across = (n: Node) => {
		if (hanging.has(n)) hang(n);
		for (const k of paneled.get(n) ?? []) k.x = n.x - n.w / 2 + panels.get(n)!.at.get(k)!.x;
		for (const k of kidsOf(n)) {
			k.x = outer(n) + toTrunk(n) + 2 * halfTrunk(n) + fromTrunk(k) + k.w / 2;
			across(k);
		}
	};
	across(root);
	// The middle of the trunk out of a product.
	const trunkAt = (p: Node) => outer(p) + toTrunk(p) + halfTrunk(p);
	// For packing, milk's lines are taken from its middle.
	const trunkX = (p: Node) => (p === root ? 0 : trunkAt(p));
	const pillBox = (n: Node): Box => ({ x0: n.x - n.w / 2, x1: n.x + n.w / 2, y0: -n.h / 2, y1: n.h / 2 });
	/* The line into a product, from the trunk, taken as a band as tall as
	   the product it leads to (or its step's words, if taller), so that
	   nothing tucks in right along an arrow, only past its branch's pills. */
	const inBox = (n: Node): Box => {
		const p = treeParent.get(n)!;
		const t = trunkX(p);
		const edge = n.x - n.w / 2;
		// Over the arrow, which is as thick as it carries.
		const words = n.step ? stepFont(n) * 1.7 + extra(n) + line(n) / 2 : 0;
		/* The arrow itself, both halves of it: into a branch point, which has
		   no pill to be as tall as, it may be far thicker than anything at its end. */
		const half = line(n) / 2;
		return { x0: Math.min(t, edge), x1: Math.max(t, edge), y0: -Math.max(words, n.h / 2, half), y1: Math.max(n.h / 2, half, tableBottom(n)) };
	};
	const moved = (b: Box, dy: number): Box => ({ ...b, y0: b.y0 + dy, y1: b.y1 + dy });
	// All that hangs under a ruler, with the arrows down to it, its kind at 0.
	const hangBoxes = (r: Node): Box[] => [
		...hanging.get(r)!.flatMap((k) => {
			const y = hangY.get(k)!;
			const t = tickX(r, k.at!);
			return [
				{ x0: k.x - k.w / 2, x1: k.x + k.w / 2, y0: y - k.h / 2, y1: y + k.h / 2 },
				{ x0: t - 3, x1: t + 3, y0: axisY(r), y1: listTop.get(k)! },
			];
		}),
	];
	/* How far down `next` must go to clear everything in `above`: tucked in
	   as close as their outlines allow for an example, and for anything
	   else only PACKING of the way there from below the whole of `above`,
	   so the products keep a little air between their branches. */
	const clear = (above: Box[], next: Box[], snug: boolean) => {
		let dy = -Infinity;
		for (const b of next)
			for (const a of above)
				// Side by side counts as in the way unless as far apart as rows are.
				if (b.x0 < a.x1 + APART / 2 && a.x0 < b.x1 + APART / 2)
					// Siblings close together; anything else, cousins and trunks, further apart.
					dy = Math.max(dy, a.y1 + (a.own && b.own ? ROW_GAP : APART) - b.y0);
		if (snug) return dy;
		const below = Math.max(...above.map((a) => a.y1)) + ROW_GAP - Math.min(...next.map((b) => b.y0));
		return dy + (1 - PACKING) * (below - dy);
	};
	// Each node's place below its parent, and the boxes of the whole branch,
	// with the branch's own root at 0.
	const rel = new Map<Node, number>();
	const shape = (n: Node): Box[] => {
		const own = [pillBox(n), ...(n === root || !treeParent.has(n) ? [] : [inBox(n)])].map((b) => ({
			...b,
			own: true,
		}));
		const kids = kidsOf(n);
		// What hangs under its ruler, below it; what is made from it besides branches off as from any product.
		if (hanging.has(n)) own.push(...hangBoxes(n).map((b) => ({ ...b, own: false })));
		// A panel under its family, as much the family's own as its pill.
		if (paneled.has(n)) own.push({ ...panelBox(n), own: true });
		if (!kids.length) return own;
		const { at, packed, mid } = stack(kids);
		for (const k of kids) rel.set(k, at.get(k)! - mid);
		const t = trunkX(n);
		// As wide as the line out is: its strands turn down anywhere across it.
		const trunk: Box = { x0: t - halfTrunk(n) - 1, x1: t + halfTrunk(n) + 1, y0: at.get(kids[0])! - mid, y1: at.get(kids.at(-1)!)! - mid };
		// Its own pill and arrow stay its own, for packing it against its
		// siblings; all that hangs from it is no sibling of theirs.
		return [...own, { ...trunk, own: false }, ...packed.map((b) => ({ ...moved(b, -mid), own: false }))];
	};
	/* Branches stacked down, each as close under the one before as clears
	   it, an example's closest, and never above the one before, so the
	   order reads down; their middle the first's and the last's. */
	const stack = (kids: Node[]) => {
		let packed: Box[] = [];
		const at = new Map<Node, number>();
		let last = 0;
		for (const k of kids) {
			const branch = shape(k);
			const dy = packed.length ? Math.max(clear(packed, branch, !!k.example), last) : 0;
			last = dy;
			at.set(k, dy);
			packed = packed.concat(branch.map((b) => moved(b, dy)));
		}
		const mid = kids.length ? (at.get(kids[0])! + at.get(kids.at(-1)!)!) / 2 : 0;
		return { at, packed, mid };
	};
	const place = (n: Node, y: number) => {
		n.y = y;
		for (const k of kidsOf(n)) place(k, y + rel.get(k)!);
		for (const k of hanging.get(n) ?? []) k.y = y + hangY.get(k)!;
		const P = panels.get(n);
		for (const k of paneled.get(n) ?? []) k.y = y + n.h / 2 + P!.at.get(k)!.y;
	};
	// Milk's branches stacked as any product's are, centred on milk.
	{
		const tops = kidsOf(root);
		const { at, mid } = stack(tops);
		for (const k of tops) place(k, at.get(k)! - mid);
	}

	/* A jog too short for a strand to turn down and back with two corners
	   and a clear stretch between, rather than a kink; and one so short
	   it is less than the strand is thick, which is no jog at all. */
	const cramped = (k: Node, by: number) => Math.abs(by) < line(k) + 4 * CORNER;
	const level = (k: Node, by: number) => Math.abs(by) < line(k);
	/* Where each child's strand is in the line out of its parent: the line
	   as thick as all of theirs together, on the parent's middle, and
	   theirs side by side in it in the order they go down. */
	const byY = (p: Node) => [...kidsOf(p)].sort((a, b) => a.y - b.y);
	const slots = (p: Node) => {
		let edge = p.y - halfTrunk(p);
		return new Map(
			byY(p)
				.map((k) => {
					edge += line(k);
					return [k, edge - line(k) / 2] as const;
				}),
		);
	};
	/* What a product takes up where it is: its pill, the line into it with
	   its step's words over it, and the line out of it to its trunk and
	   down the trunk; or the line down into it from a ruler. */
	const family = (n: Node): Node[] => [n, ...[...kidsOf(n), ...(hanging.get(n) ?? []), ...(paneled.get(n) ?? [])].flatMap(family)];
	const room = (n: Node, own = true): Box[] => {
		const boxes: Box[] = [moved(pillBox(n), n.y)];
		// In a panel, only its pill; the panel is its family's.
		if (panelOf(n)) return boxes;
		if (paneled.has(n)) boxes.push(moved(panelBox(n), n.y));
		const p = treeParent.get(n);
		// Under a ruler: the arrow straight down into it.
		const r = hangsFrom(n);
		if (r) {
			const t = tickX(r, n.at!);
			boxes.push({ x0: t - 3, x1: t + 3, y0: r.y + axisY(r), y1: r.y + listTop.get(n)! });
		} else if (p) {
			const words = n.step ? stepFont(n) * 1.3 + extra(n) : 0;
			const reach = Math.max(n.h / 2, line(n) / 2);
			boxes.push({ x0: trunkAt(p) - halfTrunk(p), x1: n.x - n.w / 2, y0: n.y - reach - words, y1: n.y + Math.max(reach, tableBottom(n)) });
		}
		const kids = kidsOf(n);
		if (kids.length && own) {
			const ys = kids.map((k) => k.y);
			const t = trunkAt(n);
			boxes.push({ x0: outer(n), x1: t + halfTrunk(n), y0: n.y - halfTrunk(n), y1: n.y + halfTrunk(n) });
			boxes.push({ x0: t - halfTrunk(n), x1: t + halfTrunk(n), y0: Math.min(...ys), y1: Math.max(...ys) });
		}
		return boxes;
	};
	const clash = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 + ROW_GAP && b.y0 < a.y1 + ROW_GAP;
	/* Products moved up or down by `by`, if that brings them near nothing
	   they were not near already and keeps them between the siblings
	   either side; or left where they are. A child is moved with all
	   made from it. */
	const move = (mine: Node[], by: number) => {
		const p = treeParent.get(mine[0]);
		// Not the lines into what they make, which they are meant to meet.
		const rest = nodes
			.filter((n) => !mine.includes(n))
			.flatMap((n) => room(n, n !== p).filter((_, i) => !(i === 1 && mine.includes(treeParent.get(n)!))));
		const order = () => byY(p!).join();
		const was = order();
		const before = mine.flatMap((n) => room(n));
		for (const n of mine) n.y += by;
		const after = mine.flatMap((n) => room(n));
		// And never a pill onto another, however near they were before.
		const pills = mine.map((n) => moved(pillBox(n), n.y));
		const others = nodes.filter((n) => !mine.includes(n)).map((n) => moved(pillBox(n), n.y));
		const onto = pills.some((a) => others.some((b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1));
		if (order() === was && !onto && !after.some((a, i) => rest.some((b) => clash(a, b) && !clash(before[i], b)))) return true;
		for (const n of mine) n.y -= by;
		return false;
	};
	const shift = (k: Node, by: number) => move(family(k), by);
	/* A child its strand runs into nearly level would be met by a jog too
	   short to draw well: its parent moved up or down instead, so the
	   strand meets it square on; of several, the thickest. Only a parent
	   that is not itself met that way, so as not to undo it. Any others
	   met short are moved level with their strands themselves, with all
	   made from them, where there is room; a branch point, with no pill,
	   at least by itself. Down from milk. */
	root.y = 0;
	const squared = new Set<Node>();
	const square = (p: Node) => {
		if (!squared.has(p)) {
			const near = [...slots(p)]
				.map(([k, at]) => ({ k, by: k.y - at }))
				.filter(({ k, by }) => cramped(k, by))
				.sort((a, b) => line(b.k) - line(a.k) || Math.abs(a.by) - Math.abs(b.by))[0];
			// Itself alone, where that brings it near nothing either.
			if (near && move([p], near.by)) squared.add(near.k);
		}
		for (const [k, at] of slots(p)) {
			if (squared.has(k) || !cramped(k, k.y - at)) continue;
			if (shift(k, at - k.y)) squared.add(k);
			else if (k.hub && level(k, k.y - at)) {
				k.y = at;
				squared.add(k);
			}
		}
		for (const k of kidsOf(p)) square(k);
	};
	square(root);
	/* Milk's word as big as fits across it; and the chrome's grain over
	   it, as the page round it has: its dots blended over it, and its noise
	   over that as many times as the post asks. */
	const rootWord = root.label.toUpperCase();
	const rootFont = (FONT * size(root) * ROOT_WORD * 2 * rootR) / measure(rootWord, FONT * size(root), '700');
	const grains = ['dots', ...Array.from({ length: Number(document.documentElement.dataset.grain ?? 1) }, () => 'noise')];

	/* The tree's edges, with an arrowhead into every product; the arrow
	   into a branch point has none, its head is on the arrows it splits into. */
	const edges: Edge[] = [...treeParent].filter(([n]) => !panelOf(n)).map(([n, p]) => ({
		source: p,
		target: n,
		made: !n.hub && (!n.example || !!n.step),
	}));

	/* Every line runs straight across or straight up and down, never
	   slantwise: out of the parent's side that faces the child, halfway
	   across the gap to its children, round a corner, up or down to the
	   child's row, and round again into it. The trunk is the same for
	   every child, so a family reads as one bracket off what it is made
	   from. */
	/* Where each child's strand runs in the line out of its parent: the
	   line out is as thick as all its children's together, and holds them
	   side by side in the order they go down, each at its own height in
	   it. They turn off it one by one into the gap before the children:
	   those that go up, the topmost first, and those that go down, the
	   lowest first, so a strand turns only once all on its far side have,
	   and none crosses another. Each bends round the one that turned
	   before it, on the same middle, so the two meet all the way round
	   the corner; the first round as tight a bend as any line has. */
	const strands = new Map<Node, { at: number; turn: number; bends: number[] }>();
	const split = (p: Node) => {
		const at = slots(p);
		const kids = [...at.keys()];
		// The gap's near edge, where the first strand turns.
		const start = trunkAt(p) - halfTrunk(p);
		const up = kids.filter((k) => k.y < at.get(k)!);
		const down = kids.filter((k) => k.y >= at.get(k)!).reverse();
		for (const group of [up, down]) {
			let past = 0;
			// The bend of the one before, as it was drawn, and how thick it is.
			let inner = CORNER;
			let before = 0;
			for (const k of group) {
				strands.set(k, { at: at.get(k)!, turn: start + past + line(k) / 2, bends: [] });
				past += line(k);
				const q = elbowPoints(p, k);
				if (q.length < 4) continue;
				const w = line(k) / 2;
				const out = q[1][0] - q[0][0];
				const jog = Math.abs(q[2][1] - q[1][1]);
				const into = q[3][0] - q[2][0];
				// Round the one before, on its middle; then into the product.
				let first = inner + (before + line(k)) / 2;
				let last = CORNER + w;
				/* Too short a jog for both: still round the one before, and into the
				   product the tighter; and only with no room even for that, two
				   tight corners, an S. */
				if (first + last > jog) last = Math.max(w, jog - first);
				if (first + last > jog) first = last = Math.min(CORNER + w, jog / 2);
				// No further round than the stretches either side reach, leaving the head its own.
				first = Math.min(first, out);
				last = Math.min(last, Math.max(into - (k.hub ? 0 : arrow(k)), into / 2), jog - first);
				strands.get(k)!.bends = [0, first, last];
				inner = first;
				before = line(k);
			}
		}
	};
	const elbowPoints = (s: Node, t: Node): [number, number][] => {
		// Out of the parent's edge; out of milk, from where its round edge is as high as the line.
		const x1 = s === root ? s.x + Math.sqrt(Math.max(0, rootR ** 2 - halfTrunk(s) ** 2)) - 1 : s.x + (s.w - 2) / 2;
		/* Into a product, to its edge; into a branch point, just past it,
		   where the strands out of it begin. */
		const x2 = t.hub ? t.x + 1 : t.x - t.w / 2;
		const { at, turn } = strands.get(t)!;
		// Its strand level with it already: straight on in its place in the line.
		if (level(t, t.y - at))
			return [
				[x1, at],
				[x2, at],
			];
		return [
			[x1, at],
			[turn, at],
			[turn, t.y],
			[x2, t.y],
		];
	};
	// Off a ruler, straight down from the product's value into its top.
	const pointsOf = (s: Node, t: Node): [number, number][] => {
		if (t.at == null || !hanging.has(s)) return elbowPoints(s, t);
		// Into the top of its list, which one at a value alone is.
		const x = tickX(s, t.at!);
		return [
			[x, s.y + axisY(s)],
			[x, s.y + listTop.get(t)!],
		];
	};
	const elbow = (s: Node, t: Node) => rounded(pointsOf(s, t), strands.get(t)?.bends);
	const arrowShape = (s: Node, t: Node, made: boolean) => {
		const p = pointsOf(s, t);
		const w = line(t) / 2;
		const n = p.length - 1;
		const dir = (i: number): Pt => {
			const [ax, ay] = p[i];
			const [bx, by] = p[i + 1];
			const len = Math.hypot(bx - ax, by - ay) || 1;
			return [(bx - ax) / len, (by - ay) / len];
		};
		const len = (i: number) => Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
		// Round its corners as its strand was given room for (see split).
		const bends = strands.get(t)?.bends ?? [];
		const radius = (i: number) => Math.min(bends[i] ?? CORNER, len(i - 1), len(i));
		/* One edge, `way` 1 the left and -1 the right: each point, and the
		   control point of the curve into it if it is one. */
		const edgeOf = (way: number) => {
			const at = (q: Pt, d: Pt, by: number): Pt => [q[0] - d[1] * by, q[1] + d[0] * by];
			const out: { p: Pt; c?: Pt }[] = [{ p: at(p[0], dir(0), way * w) }];
			for (let i = 1; i < n; i++) {
				const din = dir(i - 1);
				const dout = dir(i);
				const r = radius(i);
				// The corner of the edge, and how far from it each way its curve begins.
				const corner = at(at(p[i], din, way * w), dout, way * w);
				const offIn = [-dout[1] * way * w, dout[0] * way * w];
				const offOut = [-din[1] * way * w, din[0] * way * w];
				const before = r + offIn[0] * din[0] + offIn[1] * din[1];
				const after = r - (offOut[0] * dout[0] + offOut[1] * dout[1]);
				if (before <= 0 || after <= 0) out.push({ p: corner });
				else {
					out.push({ p: [corner[0] - din[0] * before, corner[1] - din[1] * before] });
					out.push({ p: [corner[0] + dout[0] * after, corner[1] + dout[1] * after], c: corner });
				}
			}
			const d = dir(n - 1);
			if (made) {
				// The head: from as far back as it is long, out to its width, in to the point.
				const back = Math.max(0, Math.min(headLength(2 * w), len(n - 1) - (n > 1 ? radius(n - 1) : 0)));
				const base: Pt = [p[n][0] - d[0] * back, p[n][1] - d[1] * back];
				out.push({ p: at(base, d, way * w) });
				out.push({ p: at(base, d, (way * headWidth(2 * w)) / 2) });
			} else out.push({ p: at(p[n], d, way * w) });
			return out;
		};
		const left = edgeOf(1);
		const right = edgeOf(-1);
		const to = ({ p: [x, y], c }: { p: Pt; c?: Pt }) => (c ? `Q${c[0]},${c[1]} ${x},${y}` : `L${x},${y}`);
		let d = `M${left[0].p[0]},${left[0].p[1]}` + left.slice(1).map(to).join('');
		if (made) d += `L${p[n][0]},${p[n][1]}`;
		// Back along the other edge, each curve now from its other end.
		for (let i = right.length - 1; i >= 0; i--) d += i === right.length - 1 ? `L${right[i].p[0]},${right[i].p[1]}` : to({ p: right[i].p, c: right[i + 1].c });
		return d + 'Z';
	};
	/* A run of straight segments with its corners rounded off, each by
	   as much as both segments meeting there have room for. */
	const rounded = (p: [number, number][], bends: number[] = []) => {
		let d = `M${p[0][0]},${p[0][1]}`;
		for (let i = 1; i < p.length - 1; i++) {
			const [px, py] = p[i - 1];
			const [cx, cy] = p[i];
			const [nx, ny] = p[i + 1];
			const inLen = Math.hypot(cx - px, cy - py);
			const outLen = Math.hypot(nx - cx, ny - cy);
			const r = Math.min(bends[i] ?? CORNER, inLen, outLen);
			if (r < 0.5) {
				d += `L${cx},${cy}`;
				continue;
			}
			const ax = cx - ((cx - px) / inLen) * r;
			const ay = cy - ((cy - py) / inLen) * r;
			const bx = cx + ((nx - cx) / outLen) * r;
			const by = cy + ((ny - cy) / outLen) * r;
			d += `L${ax},${ay}Q${cx},${cy} ${bx},${by}`;
		}
		const [lx, ly] = p[p.length - 1];
		return d + `L${lx},${ly}`;
	};
	/* Each step in the middle of its arrow's last stretch: just above it,
	   or, on an arrow fat enough to hold its words, inside it. */
	const leg = (n: Node) => {
		const strand = strands.get(n);
		return strand && level(n, n.y - strand.at) ? strand.at : n.y;
	};
	// Not with a table to go under it.
	const inside = (n: Node) => !tableHeight(n) && line(n) >= stepFont(n) * 1.3 + extra(n);
	const stepY = (n: Node) =>
		inside(n) ? leg(n) + stepFont(n) * 0.35 : leg(n) - line(n) / 2 - stepFont(n) * 0.45;
	const stepX = (n: Node) => {
		const p = treeParent.get(n)!;
		// From the trunk's far side.
		const trunk = trunkAt(p) + halfTrunk(p);
		const edge = n.x - n.w / 2;
		return (trunk + edge - arrow(n)) / 2;
	};
	/* Every arrow with something to tell, how its step is done, to be
	   pointed at and clicked; the rest are only drawn. */
	const told = (n: Node) => !!(n.how?.facts?.length || n.how?.text);
	const hittable = edges.filter((e) => told(e.target));

	/* Where every arrow goes, worked out once: down from milk, so a line in
	   is placed before the lines out of it. Each arrow kept as a shape to
	   fill, and the line along it to point at. */
	strands.clear();
	const down = (p: Node) => {
		split(p);
		for (const k of kidsOf(p)) down(k);
	};
	down(root);
	const edgeShape = new Map(edges.map((e) => [e, new Path2D(arrowShape(e.source, e.target, e.made))]));
	const edgeLine = new Map(edges.map((e) => [e, new Path2D(elbow(e.source, e.target))]));
	const boxOf = (p: [number, number][], pad: number): Box => ({
		x0: Math.min(...p.map(([x]) => x)) - pad,
		x1: Math.max(...p.map(([x]) => x)) + pad,
		y0: Math.min(...p.map(([, y]) => y)) - pad,
		y1: Math.max(...p.map(([, y]) => y)) + pad,
	});
	const edgeBox = new Map(edges.map((e) => [e, boxOf(pointsOf(e.source, e.target), line(e.target) + headWidth(line(e.target)))]));
	// A step's words: where each line of them sits, and the box round them.
	const stepLines = (n: Node) => {
		const font = stepFont(n);
		const first = -(lines(n).length - 1) * LEADING * (inside(n) ? 0.5 : 1);
		return lines(n).map((said, i) => ({ said, y: stepY(n) + font * (first + i * LEADING) }));
	};
	const stepBox = (n: Node): Box => {
		const at = stepLines(n);
		const w = stepWidth.get(n)! / 2;
		return { x0: stepX(n) - w, x1: stepX(n) + w, y0: at[0].y - stepFont(n), y1: at.at(-1)!.y + stepFont(n) * 0.3 };
	};
	// A step's table: where it is, its holds and its rows, and the area round it and the step's name, to point at.
	const tableOf = (n: Node) => {
		const key = columns.get(n)?.key ?? 0;
		const font = tableFont(n);
		const left = stepX(n) - tableWidth(n) / 2;
		const top = leg(n) + tableTop(n);
		const wide = Math.max(stepWidth.get(n) ?? 0, tableWidth(n)) + 2 * font;
		// Up to the top of its step's words, if it has any.
		const named = n.step ? stepY(n) - stepFont(n) * (0.9 + (lines(n).length - 1) * LEADING) : top;
		return {
			font,
			left,
			top,
			split: left + key + 2 * pad(n),
			height: tableHeight(n) - font * 0.6,
			strip: holds(n).length ? stripOf(n) : null,
			rowsTop: top + stripHeight(n),
			rowsHeight: rowsHeight(n),
			area: { x0: stepX(n) - wide / 2, x1: stepX(n) + wide / 2, y0: named, y1: top + tableHeight(n) + (n.how?.fermented ? font : 0) } as Box,
		};
	};
	// A pill and its shadow, which reaches a quarter of its height round it.
	const pillBoxOf = (d: Node): Box => {
		const s = d.h * 0.25;
		return { x0: d.x - d.w / 2 - s, x1: d.x + d.w / 2 + s, y0: d.y - d.h / 2 - s, y1: d.y + d.h / 2 + s };
	};

	/* Framed whole: the great branch points read from there, and the rest
	   is a zoom away. All it covers, with a margin round it as wide on the
	   screen as the frame's gutter is, however big the pane. */
	const all: Box[] = [
		...shown.map(pillBoxOf),
		...edgeBox.values(),
		...stepped.map(stepBox),
		...tabled.map((n) => tableOf(n).area),
		...[...panels.keys()].map(panelArea),
	];
	const bounds = {
		x: Math.min(...all.map((b) => b.x0)),
		y: Math.min(...all.map((b) => b.y0)),
		width: Math.max(...all.map((b) => b.x1)) - Math.min(...all.map((b) => b.x0)),
		height: Math.max(...all.map((b) => b.y1)) - Math.min(...all.map((b) => b.y0)),
	};
	return { root, treeParent, nodes, children, size, paneled, panelOf, rootR, picture, radius, shown, countryName, stepFont, stepped, ROW, rows, keyLines, rowLines, tabled, pad, tableWidth, rowHeight, PANEL_PAD, panels, MAP_W, PIN, PIN_GROWS, PIN_FRAMED, pillsShown, rim, panelArea, rootWord, rootFont, grains, edges, inside, stepX, told, hittable, edgeShape, edgeLine, edgeBox, stepLines, stepBox, tableOf, pillBoxOf, bounds, tickX, CARD };
}
