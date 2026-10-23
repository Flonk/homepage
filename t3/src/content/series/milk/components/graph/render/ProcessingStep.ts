import type { ProcessingStep as Step, HeatTreatment, Ferment, Drying, Chip } from '../schema';
import type * as S from '../schema';
import { MONO, SANS, measure } from '../client/base';
import { said as span, inUnit, inTime } from './Range';
import { font, legible, pillBody, wrap, type Paint, type Pen } from './canvas';
import { el } from './dom';
import { SAID as SET } from './Setting';

/*
 * A step of processing, in each of the forms it is drawn in: as the page
 * is given it, a Chip of words; as a card on the canvas, laid out and
 * drawn; and as a chip on a card.
 */

/* ---- As the page is given it ---- */

// As a Chip (see the schema): what it is, what it says, what is done, the microbes it adds, its sentence.

const TITLE: Record<HeatTreatment['does'] | Ferment['does'] | 'dry', [string, string]> = {
	heat: ['🔥 HEAT', 'heated'],
	cook: ['🔥 COOK', 'cooked'],
	cool: ['❄️ COOL', 'cooled'],
	incubate: ['🦠 FERMENT', 'soured'],
	ripen: ['🦠 RIPEN', 'ripened'],
	smear: ['🦠 SMEAR', 'smeared'],
	pierce: ['🦠 PIERCE', 'pierced'],
	dry: ['☀️ DRY', 'dried'],
};
// The steps of their own, each titled for itself; any other by its own name.
type Own = Exclude<Step['type'], 'custom' | 'heat' | 'ferment' | 'dry'>;
const OWN: Record<Own, [string, string]> = {
	pasteurise: ['🔥 PASTEURISE', 'pasteurised'],
	homogenise: ['🌀 HOMOGENISE', 'homogenised'],
	coagulate: ['🧀 COAGULATE', 'set'],
	churn: ['🧈 CHURN', 'churned'],
	salt: ['🧂 SALT', 'salted'],
	drain: ['💧 DRAIN', 'drained'],
	cut: ['🔪 CUT', 'cut'],
	press: ['🗜️ PRESS', 'pressed'],
	mould: ['🫙 MOULD', 'moulded'],
	separate: ['🫗 SEPARATE', 'separated'],
	evaporate: ['♨️ EVAPORATE', 'boiled down'],
	filter: ['🧪 FILTER', 'filtered'],
	add: ['➕ ADD', 'added to'],
	acidify: ['🍋 ACIDIFY', 'acidified'],
};
// What a step of its own says before how long and how warm: in a brine so strong, by hanging, to grains so big, what is added.
const HOW: Partial<Record<string, string>> = { dry: 'dry', brine: 'in brine', milk: 'into the milk', hang: 'hung', cloth: 'in cloth', mould: 'in moulds', sieve: 'through a sieve', mill: 'milled', grind: 'ground', crumble: 'crumbled', shred: 'shredded', gravity: 'risen and skimmed', centrifuge: 'spun off', open: 'in the open', vacuum: 'under vacuum', micro: 'micro', ultra: 'ultra', nano: 'nano', dia: 'washed through' };
const ownSaid = (h: Step): (string | undefined)[] => {
	const pc = (r?: S.Range) => r && span(r, inUnit('%'));
	switch (h.type) {
		case 'salt':
			return [h.how && HOW[h.how], pc(h.strength)];
		case 'drain':
			return [h.by && HOW[h.by]];
		case 'cut':
			return [h.how && h.how !== 'cut' ? HOW[h.how] : undefined, h.size && span(h.size, inUnit(' mm'))];
		case 'separate':
			return [h.by && HOW[h.by], h.fat && `${pc(h.fat)} fat left`];
		case 'evaporate':
			return [h.under && HOW[h.under], h.solids && `to ${pc(h.solids)} solids`];
		case 'filter':
			return [h.by && HOW[h.by]];
		case 'acidify':
			return [h.with && `with ${h.with}`, h.pH && `to pH ${span(h.pH, inUnit(''))}`];
		case 'add':
			return [h.what, pc(h.share)];
		default:
			return [];
	}
};
const titleOf = (h: Step): [string, string] => {
	if (h.type === 'custom') return [`⚙️ ${h.name.toUpperCase()}`, h.name];
	if (h.type in OWN) return OWN[h.type as keyof typeof OWN];
	const plain = h as HeatTreatment | Ferment | Drying;
	return TITLE[plain.type === 'dry' ? 'dry' : plain.does];
};

export const chip = (h: Step): Chip => {
	const held = [h.type === 'homogenise' && h.bar && span(h.bar, inUnit(' bar')), h.seconds && span(h.seconds, inTime), h.temperature && span(h.temperature, inUnit('°C'))]
		.filter(Boolean)
		.join(' @ ');
	const [title, done] = titleOf(h);
	return {
		title,
		said: [h.type === 'coagulate' && h.by && `by ${SET[h.by]}`, ...ownSaid(h), held, h.humidity && `${span(h.humidity, inUnit('%'))} RH`].filter(Boolean).join(', '),
		done,
		...(h.type === 'ferment' && h.adds?.microbes.length && { microbes: h.adds.microbes.map((m) => m.name).join(', ') }),
		...(h.note && { note: h.note }),
	};
};

/* ---- On the canvas ---- */

/* A card no wider than so many of its letters: what it is, small, over what
   it says, broken where too long; under that, the microbes it adds in
   letters so small they run about as wide as what it says, there being
   zoom enough to read them; under those its sentence. As wide as its widest
   words, no wider than the most. In its table's letters: each line's size,
   the room round them, the room for the arrow between two cards, the least
   and the most a card's words run. */
export const CARD = { title: 0.55, said: 1, tiny: 0.36, note: 0.5, pad: 0.5, gap: 1.4, least: 5, most: 12 };
type Line = { said: string; y: number; size: number; face: string; mono: boolean; dim: boolean };
export type Card = { x: number; y: number; w: number; h: number; lines: Line[] };

// Laid out at its table's letter size, from its own top left.
export const card = (c: Chip, f: number): Card => {
	const most = CARD.most * f;
	const saidLines = c.said ? wrap(c.said, most, CARD.said * f, '400', MONO()) : [];
	const natural = Math.max(
		CARD.least * f,
		measure(c.title, CARD.title * f, '700', MONO()),
		...saidLines.map((l) => measure(l, CARD.said * f, '400', MONO())),
		c.note ? measure(c.note, CARD.note * f, '400') : 0,
	);
	const wide = Math.min(most, natural);
	const lines: Line[] = [];
	let y = CARD.pad * f;
	const put = (said: string, size: number, face: string, mono: boolean, dim: boolean, leading = 1.25) => {
		y += size * f * leading;
		lines.push({ said, y: y - size * f * (leading - 1) - size * f * 0.18, size: size * f, face, mono, dim });
	};
	put(c.title, CARD.title, '700', true, true, 1.35);
	for (const said of saidLines) put(said, CARD.said, '400', true, false, 1.3);
	if (c.microbes) {
		y += 0.15 * f;
		for (const said of wrap(c.microbes, wide, CARD.tiny * f, '400')) put(said, CARD.tiny, '400', false, true, 1.25);
	}
	if (c.note) {
		y += 0.2 * f;
		for (const said of wrap(c.note, wide, CARD.note * f, '400')) put(said, CARD.note, '400', false, false, 1.3);
	}
	return { x: 0, y: 0, w: wide + 2 * CARD.pad * f, h: y + CARD.pad * f, lines };
};

/* Drawn as a product's pill is (see pillBody); its words each drawn once
   big enough to read, the microbes' only zoomed well in. */
export const drawCard = (g: Pen, c: Card, x: number, y: number, f: number, { ink, s, px, on }: Paint) => {
	pillBody(g, x, y, c.w, c.h, f * 0.25, ink, px);
	g.textAlign = 'left';
	g.textBaseline = 'alphabetic';
	for (const l of c.lines) {
		if (!legible(l.size, s)) continue;
		g.font = font(l.size, l.face, l.mono ? MONO() : SANS());
		g.fillStyle = on ? ink.lit : l.dim ? ink.dim : ink.text;
		g.fillText(l.said, x + CARD.pad * f, y + l.y);
	}
};

/* ---- On a card ---- */

// A chip: what it says, framed, in the pills' type.
export const html = (c: Chip) => el('span', 'milk-about-hold', c.said);
