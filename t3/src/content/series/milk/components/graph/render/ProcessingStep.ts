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
	specialPasteurise: ['🔥 PASTEURISE', 'pasteurised'],
	specialHomogenise: ['🌀 HOMOGENISE', 'homogenised'],
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
	microfilter: ['🧪 MICROFILTER', 'microfiltered'],
	ultrafilter: ['🧪 ULTRAFILTER', 'ultrafiltered'],
	nanofilter: ['🧪 NANOFILTER', 'nanofiltered'],
	diafilter: ['🧪 DIAFILTER', 'diafiltered'],
	add: ['➕ ADD', 'added to'],
	acidify: ['🍋 ACIDIFY', 'acidified'],
};
// What a step of its own says before how long and how warm: in a brine so strong, by hanging, to grains so big, what is added.
const HOW: Partial<Record<string, string>> = { dry: 'dry', brine: 'in brine', milk: 'into the milk', hang: 'hung', cloth: 'in cloth', mould: 'in moulds', sieve: 'through a sieve', mill: 'milled', grind: 'ground', crumble: 'crumbled', shred: 'shredded', gravity: 'risen and skimmed', centrifuge: 'spun off', open: 'in the open', vacuum: 'under vacuum' };
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
			return [h.by && 'through cloth'];
		case 'acidify':
			return [h.with, h.pH && `pH ${span(h.pH, inUnit(''))}`];
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

/* Pasteurised and homogenised are said by name alone, but where they are
   explained (see SpecialPasteurise): done as everywhere, nothing to add. */
const plain = (h: Step) => h.type === 'pasteurise' || h.type === 'homogenise';
export const chip = (h: Step): Chip => {
	if (plain(h)) return { title: titleOf(h)[0], said: '', done: titleOf(h)[1] };
	// Acidifying says what with and to what pH, on one line with its name.
	if (h.type === 'acidify') {
		const [title, done] = titleOf(h);
		return { title, said: ownSaid(h).filter(Boolean).join(' · '), done, inline: true, ...(h.note && { note: h.note }) };
	}
	const held = [h.type === 'specialHomogenise' && h.bar && span(h.bar, inUnit(' bar')), h.seconds && span(h.seconds, inTime), h.temperature && span(h.temperature, inUnit('°C'))]
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
// A line of a card, and what it is said after on it, in bold, where it is a one-liner's.
type Line = { said: string; y: number; size: number; face: string; mono: boolean; dim: boolean; lead?: string };
export type Card = { x: number; y: number; w: number; h: number; lines: Line[] };

// Laid out at its table's letter size, from its own top left.
export const card = (c: Chip, f: number): Card => {
	const most = CARD.most * f;
	// A one-liner: what it is and what it says on one line, at the size it says it.
	if (c.inline && c.said) {
		const lead = `${c.title} · `;
		const w = measure(lead, CARD.said * f, '700', MONO()) + measure(c.said, CARD.said * f, '400', MONO());
		const line = { said: c.said, lead, y: CARD.pad * f + CARD.said * f * 0.82, size: CARD.said * f, face: '400', mono: true, dim: false };
		let h = CARD.pad * f + CARD.said * f * 1.1;
		const lines: Line[] = [line];
		if (c.note) for (const said of wrap(c.note, Math.max(w, CARD.least * f), CARD.note * f, '400')) lines.push({ said, y: (h += CARD.note * f * 1.3) - CARD.note * f * 0.48, size: CARD.note * f, face: '400', mono: false, dim: false });
		return { x: 0, y: 0, w: w + 2 * CARD.pad * f, h: h + CARD.pad * f, lines };
	}
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
		let at = x + CARD.pad * f;
		if (l.lead) {
			g.font = font(l.size, '700', MONO());
			g.fillStyle = on ? ink.lit : ink.dim;
			g.fillText(l.lead, at, y + l.y);
			at += measure(l.lead, l.size, '700', MONO());
		}
		g.font = font(l.size, l.face, l.mono ? MONO() : SANS());
		g.fillStyle = on ? ink.lit : l.dim ? ink.dim : ink.text;
		g.fillText(l.said, at, y + l.y);
	}
};

/* ---- On a card ---- */

// A chip: what it says, framed, in the pills' type; what it is, where it says nothing more.
export const html = (c: Chip) => el('span', 'milk-about-hold', c.said || c.title);
