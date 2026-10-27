import type { ProcessingStep as Step, HeatTreatment, Ferment, Drying, Chip } from '../schema';
import type * as S from '../schema';
import type { z } from 'astro/zod';
import { MONO, SANS, measure } from '../client/base';
import { said as span, inUnit, inTime } from './Range';
import { font, shownAt, pillBody, wrap, type Paint, type Pen } from './canvas';
import { el } from './dom';

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
	churn: ['🧈 CHURN BUTTER', 'churned'],
	stretch: ['🧵 STRETCH', 'stretched'],
	smoke: ['💨 SMOKE', 'smoked'],
	salt: ['🧂 SALT', 'salted'],
	drain: ['💧 DRAIN', 'drained'],
	cut: ['🔪 CUT', 'cut'],
	press: ['🗜️ PRESS', 'pressed'],
	mould: ['🫙 MOULD', 'moulded'],
	separate: ['🫗 SEPARATE', 'separated'],
	evaporate: ['♨️ BOIL DOWN', 'boiled down'],
	filter: ['🧪 FILTER', 'filtered'],
	microfilter: ['🧪 MICROFILTER', 'microfiltered'],
	ultrafilter: ['🧪 ULTRAFILTER', 'ultrafiltered'],
	nanofilter: ['🧪 NANOFILTER', 'nanofiltered'],
	diafilter: ['🧪 DIAFILTER', 'diafiltered'],
	add: ['➕ ADD', 'added to'],
	acidify: ['🍋 ACIDIFY', 'acidified'],
	washCurd: ['🚿 WASH CURD', 'washed'],
	standardise: ['⚖️ SET THE FAT', 'standardised'],
	wash: ['🚿 WASH', 'washed'],
};
// What a step of its own says before how long and how warm: in a brine so strong, by hanging, to grains so big, what is added.
const HOW: Partial<Record<string, string>> = { hang: 'hung', cloth: 'in cloth', mould: 'in moulds', sieve: 'through a sieve', gravity: 'by gravity', centrifuge: 'by centrifuge', open: 'in the open', vacuum: 'under vacuum' };
/* Salted or cut some way, named for that way, so the name is a thing done:
   "BRINE", not "SALT · in brine"; "GRIND", not "CUT · ground". */
const SALTED: Record<NonNullable<z.infer<typeof S.Salt>['how']>, [string, string]> = {
	dry: ['🧂 SALT', 'salted'],
	brine: ['🧂 BRINE', 'brined'],
	milk: ['🧂 SALT THE MILK', 'salted'],
};
/* Curdled, the same everywhere: by what kind of thing, said after its name
   ("CURDLE with rennet"), and the one sentence each kind has, of what is
   curdled (milk, where not said). */
const CURDLED: Record<S.Setting, [string, (of: string) => string]> = {
	rennet: ['with rennet', (of) => `The ${of} is curdled with rennet, an enzyme that makes its protein clump into a soft gel.`],
	acid: ['with acid', (of) => `The ${of} is curdled with acid, which makes its protein clump.`],
	'acid-heat': ['with acid', (of) => `The ${of} is curdled with acid, which makes its protein clump.`],
	'rennet-acid': ['by souring', (of) => `The ${of} is soured slowly with a little rennet, so it curdles into a soft, acid gel.`],
	plant: ['with a plant', (of) => `The ${of} is curdled with enzymes from a plant, which work like rennet.`],
	heat: ['by heat', (of) => `The ${of} is curdled by heat alone.`],
};
const CURDLED_ANYHOW = (of: string) => `The ${of} is curdled, its protein clumping into a soft gel.`;
const CUT: Record<NonNullable<z.infer<typeof S.Cut>['how']>, [string, string]> = {
	cut: ['🔪 CUT', 'cut'],
	mill: ['🔪 MILL', 'milled'],
	grind: ['🔪 GRIND', 'ground'],
	crumble: ['🔪 CRUMBLE', 'crumbled'],
	shred: ['🔪 SHRED', 'shredded'],
};
const ownSaid = (h: Step): (string | undefined)[] => {
	const pc = (r?: S.Range) => r && span(r, inUnit('%'));
	switch (h.type) {
		case 'salt':
			return [h.strength && `${pc(h.strength)} salt`];
		case 'drain':
			return [h.by && HOW[h.by]];
		case 'cut':
			return [h.size && span(h.size, inUnit(' mm'))];
		case 'separate':
			// Spun in a centrifuge, it is named for it alone (see titleOf).
			return [h.by && h.by !== 'centrifuge' ? HOW[h.by] : undefined, h.fat && `${pc(h.fat)} fat left`];
		case 'evaporate':
			// How, and how far, said in its sentence instead (see SAID_ALIKE).
			return [];
		case 'filter':
			return [h.by && 'through cloth'];
		case 'acidify':
			return [h.with, h.pH && `pH ${span(h.pH, inUnit(''))}`];
		case 'standardise':
			return [pc(h.fat)];
		case 'washCurd':
			return [h.share && `${span(h.share, inUnit('%'))} of the whey`];
		case 'wash':
			return [h.what, h.in];
		case 'add':
			return [h.what, pc(h.share)];
		default:
			return [];
	}
};
// A separation by what comes off.
const OFF: Record<NonNullable<S.Separate['off']>, [string, string]> = {
	cream: ['🫗 SKIM OFF CREAM', 'skimmed'],
	fat: ['🫗 SKIM OFF FAT', 'skimmed'],
	curd: ['🫗 SKIM OFF CURD', 'skimmed'],
	skin: ['🥄 LIFT OFF SKIN', 'lifted off'],
	whey: ['🫗 SPIN OFF WHEY', 'spun off'],
	solids: ['🫗 SPIN OFF SOLIDS', 'spun off'],
	spores: ['🫗 SPIN OFF SPORES', 'spun off'],
};
const titleOf = (h: Step): [string, string] => {
	if (h.type === 'custom') return [`⚙️ ${h.name.toUpperCase()}`, h.name];
	if (h.type === 'separate' && h.by === 'centrifuge') return [`🌀 SPIN OFF ${h.off ? SPUN_OFF[h.off].toUpperCase() : 'IN A CENTRIFUGE'}`, 'spun'];
	if (h.type === 'separate' && h.off) return OFF[h.off];
	if (h.type === 'coagulate') return [['🧀 CURDLE', h.with ? `with ${h.with}` : h.by && CURDLED[h.by][0]].filter(Boolean).join(' '), 'curdled'];
	if (h.type === 'stretch' && h.into) return [`🧵 STRETCH into ${h.into}`, 'stretched'];
	if (h.type === 'smoke' && h.over) return [`💨 SMOKE over ${h.over}`, 'smoked'];
	if (h.type === 'salt' && h.how) return SALTED[h.how];
	if (h.type === 'cut' && h.how) return CUT[h.how];
	if (h.type in OWN) return OWN[h.type as keyof typeof OWN];
	const plain = h as HeatTreatment | Ferment | Drying;
	return TITLE[plain.type === 'dry' ? 'dry' : plain.does];
};

/* Spun in a centrifuge, by what comes off it; and the steps said the same
   everywhere, each in its one sentence, of what they are done to (milk,
   where not said): homogenised, churned, spun, curdled (see CURDLED). */
const SPUN_OFF: Record<NonNullable<S.Separate['off']>, string> = { cream: 'cream', fat: 'fat', curd: 'curd', skin: 'skin', whey: 'whey', solids: 'solids', spores: 'spores' };
// Risen by itself and taken off the top, by what it is.
const RISES: Partial<Record<NonNullable<S.Separate['off']>, string>> = {
	cream: 'The cream rises by itself and is skimmed off.',
	fat: 'The fat rises in lumps and is lifted off.',
	curd: 'The curd floats up and is skimmed off.',
	skin: 'The skin that forms on top is lifted off.',
};
const SAID_ALIKE: Partial<Record<Step['type'], (h: Step, of: string) => string | undefined>> = {
	homogenise: (_, of) => `The ${of} is forced through a tiny gap, which breaks its fat into drops too small to rise.`,
	churn: (_, of) => `The ${of} is churned until its fat clumps into butter.`,
	separate: (h, of) =>
		h.type !== 'separate'
			? undefined
			: h.by === 'centrifuge'
				? `The ${of} is spun fast, which throws ${h.off ? `its ${SPUN_OFF[h.off]}` : 'it apart'} out from the rest.`
				: h.off === 'fat' && h.by !== 'gravity'
					? undefined
					: h.off && RISES[h.off],
	microfilter: (_, of) => `The ${of} is pressed through a membrane with tiny pores, which holds back bacteria, fat and the largest proteins.`,
	ultrafilter: (_, of) => `The ${of} is pressed through a fine membrane, which holds back its protein and fat and lets water, sugar and salts through.`,
	nanofilter: (_, of) => `The ${of} is pressed through a very tight membrane, which lets only water and some salts through.`,
	diafilter: (_, of) => `Water is added to the ${of} and filtered out again, which washes out more of its sugar and salts.`,
	standardise: (_, of) => `Cream or skimmed milk is added to the ${of} or taken from it, so its fat is just right.`,
	/* Boiled down, in a vacuum, until so much of it is water: its solids
	   said as what is left of its water, "until only 48–50 % of it is water". */
	evaporate: (h, of) => {
		if (h.type !== 'evaporate') return undefined;
		const water = h.solids && span({ ...h.solids, min: h.solids.max === undefined ? undefined : 100 - h.solids.max, max: h.solids.min === undefined ? undefined : 100 - h.solids.min }, inUnit(' %'));
		const how = h.under === 'vacuum' ? ' in a vacuum, so it boils at a lower heat,' : '';
		return `The ${of} is boiled down${how} ${water ? `until only ${water} of it is water` : 'until much of its water is gone'}.`;
	},
	washCurd: () => 'The curd is washed in water, which takes out some of its sugar and acid.',
	stretch: (h) => `The ${('of' in h && h.of) || 'curd'} is kneaded and stretched in hot water until it turns smooth and stringy.`,
	smoke: (h) => `The ${('of' in h && h.of) || 'cheese'} is smoked, which gives it its colour and flavour.`,
	coagulate: (h, of) => (h.type === 'coagulate' ? (h.by ? CURDLED[h.by][1] : CURDLED_ANYHOW)(of) : undefined),
};
/* Every step said the same way: its name and its parts between middle
   dots, "🔥 HEAT · ~5 min · 90–95°C", the microbes it adds and its
   sentence under them (see card). */
export const chip = (h: Step): Chip => {
	const [title, done] = titleOf(h);
	const parts = [
		h.type === 'homogenise' && h.bar && span(h.bar, inUnit(' bar')),
		...ownSaid(h),
		// Held so long, so warm, so damp: a step done at once, salting, is held at none.
		'seconds' in h && h.seconds && span(h.seconds, inTime),
		'temperature' in h && h.temperature && span(h.temperature, inUnit('°C')),
		'humidity' in h && h.humidity && `${span(h.humidity, inUnit('%'))} humidity`,
	].filter((x): x is string => !!x);
	const microbes = h.type === 'ferment' && h.adds?.microbes.length ? h.adds.microbes.map((m) => m.name).join(', ') : undefined;
	// A step said alike everywhere in its one sentence, whatever its note.
	const note = SAID_ALIKE[h.type]?.(h, ('of' in h && h.of) || 'milk') || h.note;
	return { title, said: parts.join(' · '), done, ...(microbes && { microbes }), ...(note && { note }) };
};

/* ---- On the canvas ---- */

/* A card: its name and what it says on one line, broken where longer than
   so many letters; under that, the microbes it adds in letters so small
   they run about as wide, there being zoom enough to read them; under
   those its sentence. As wide as its widest line. In its table's letters:
   each line's size, the room round them, the room for the arrow between
   two cards, the least a card's words run, and the most letters on a line. */
export const CARD = { title: 0.55, said: 1, tiny: 0.36, note: 0.5, pad: 0.5, gap: 1.4, least: 5, letters: 48 };
type Line = { said: string; y: number; size: number; face: string; mono: boolean; dim: boolean };
export type Card = { x: number; y: number; w: number; h: number; lines: Line[] };

// Laid out at its table's letter size, from its own top left.
export const card = (c: Chip, f: number): Card => {
	const lines: Line[] = [];
	let y = CARD.pad * f;
	const put = (said: string, size: number, face: string, mono: boolean, dim: boolean, leading = 1.25) => {
		y += size * f * leading;
		lines.push({ said, y: y - size * f * (leading - 1) - size * f * 0.18, size: size * f, face, mono, dim });
	};
	const size = CARD.title * f;
	const heads = wrap(c.said ? `${c.title} · ${c.said}` : c.title, measure('0'.repeat(CARD.letters), size, '700', MONO()), size, '700', MONO());
	const wide = Math.max(CARD.least * f, ...heads.map((l) => measure(l, size, '700', MONO())));
	for (const l of heads) put(l, CARD.title, '700', true, true, 1.35);
	if (c.microbes) {
		y += 0.15 * f;
		for (const l of wrap(c.microbes, wide, CARD.tiny * f, '400')) put(l, CARD.tiny, '400', false, true, 1.25);
	}
	if (c.note) {
		y += 0.2 * f;
		for (const l of wrap(c.note, wide, CARD.note * f, '400')) put(l, CARD.note, '400', false, false, 1.3);
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
		if (!shownAt(l.size, s)) continue;
		g.font = font(l.size, l.face, l.mono ? MONO() : SANS());
		g.fillStyle = on ? ink.lit : l.dim ? ink.dim : ink.text;
		g.fillText(l.said, x + CARD.pad * f, y + l.y);
	}
};

/* ---- On a card ---- */

// A chip: what it says, framed, in the pills' type; what it is, where it says nothing more.
export const html = (c: Chip) => el('span', 'milk-about-hold', c.said || c.title);
