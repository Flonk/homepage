import { z } from 'astro/zod';
import { Sourcing, Own } from './sourcing';
import { Setting, Seconds, Celsius, Percent, PH, Bar, Millimetres } from './terms';

/* ---- Each arrow ---- */

/* A living thing at work in a ferment, by its name today, with the names
   it is still found under; or, where no species is named, the group it is
   of ("thermophilic lactic acid bacteria"). An animal is one too: the mites
   and the larvae some cheeses are ripened by. */
export const Microbe = z.strictObject({
	name: z.string(),
	formerly: z.array(z.string()).optional(),
	kind: z.enum(['bacterium', 'yeast', 'mould', 'animal']),
	// What it is there for, where that is said: the acid, the aroma (diacetyl), the gas (eyes, fizz), the slime of a ropy milk, the alcohol, a rind, a claim of health.
	does: z.array(z.enum(['acid', 'aroma', 'gas', 'slime', 'alcohol', 'rind', 'ripening', 'probiotic'])).min(1).optional(),
	// At what temperatures it grows best, where the source groups it so rather than naming a species.
	grows: z.enum(['mesophilic', 'thermophilic']).optional(),
	// Found rather than added: its share of the isolates in a survey of the traditional product, in percent.
	isolates: z.number().min(0).max(100).optional(),
	...Own,
});

/* What comes in at the start of a stretch, and how: a starter of known
   cultures; a little of the last batch (back-slopping); kefir grains; the
   milk's own flora, left to itself; the vessel it sours in (a gourd, a
   smoked pot, a bamboo tube, a bag kept from last year); or the place it
   ripens in, its cave's air or its dairy's shelves and brushes. A ferment
   may take them two ways at once, a back-slopped gourd; and how, where it
   is not said, is left out rather than guessed. */
export const Inoculum = z.strictObject({
	microbes: z.array(Microbe),
	by: z.array(z.enum(['starter', 'backslop', 'grains', 'wild', 'vessel', 'place'])).min(1).optional(),
	// How much is put in, as a share of the milk, in percent.
	dose: Percent.optional(),
	// What it sours in, where that matters: the gourd, the pot, how it is smoked.
	vessel: z.string().optional(),
});

/* What a step of processing is held at: so warm, so long, so damp.
   Temperatures in °C, times in seconds, humidity in percent. And one
   sentence on it, drawn under it, for what these do not say: why, or how. */
const Sentence = z
	.string()
	.min(1)
	.refine((s) => !/[.!?]\s+[A-Z][a-z]+\s/.test(s.trim()), 'one sentence');
const Held = {
	temperature: Celsius.optional(),
	seconds: Seconds.optional(),
	humidity: Percent.optional(),
	note: Sentence.optional(),
	...Own,
};
/* Held hot or cold to change it: heated (72 °C for 15 s, pasteurising),
   a curd cooked (52–54 °C), cooled or chilled. */
export const HeatTreatment = z.strictObject({
	type: z.literal('heat'),
	does: z.enum(['heat', 'cook', 'cool']),
	...Held,
});
/* Held for microbes to work: soured (incubated), ripened, its rind
   smeared, pierced to let the air in; what is added at its start, and
   where it stops, or must have reached by law: pH, acidity as percent
   lactic acid, alcohol in percent. Its kinds, where said: lactic is the
   souring of lactose into lactic acid, by bacteria alone (yoghurt, quark)
   or with yeasts too, making alcohol and fizz (kefir, kumis); mould and
   smear ripen a cheese from its surface or from within, propionic
   bacteria make its eyes, animals (mites, larvae) eat their way through. */
export const Ferment = z.strictObject({
	type: z.literal('ferment'),
	does: z.enum(['incubate', 'ripen', 'smear', 'pierce']),
	kinds: z.array(z.enum(['lactic', 'yeast', 'mould', 'smear', 'propionic', 'animal'])).min(1).optional(),
	adds: Inoculum.optional(),
	...Held,
	pH: PH.optional(),
	acidity: Percent.optional(),
	alcohol: Percent.optional(),
});
// Held to dry: in the sun, in the air, in a spray drier.
export const Drying = z.strictObject({
	type: z.literal('dry'),
	...Held,
});
/* The steps done to milk above all others, each its own. Pasteurised:
   heated just enough to kill what could make one ill, 72 °C for 15 s or
   63 °C for 30 min. Homogenised: forced through a narrow gap, at so many
   bar, so its fat breaks into globules too small to rise. Coagulated:
   its casein set into a curd, by rennet, by acid, by acid and heat, by a
   plant's enzymes (thistle, fig), by heat alone, until it is so sour.
   Churned: cream or soured milk beaten until its fat clumps into butter. */
/* Explained, on the arrows into pasteurised and homogenised milk: how it
   is done told in full, and what it is for. Everywhere else they are said
   by name alone, being done as there. */
const Explain = { explain: z.literal(true).optional() };
export const Pasteurise = z.strictObject({ type: z.literal('pasteurise'), ...Explain, ...Held });
export const Homogenise = z.strictObject({ type: z.literal('homogenise'), bar: Bar.optional(), ...Explain, ...Held });
export const Coagulate = z.strictObject({
	type: z.literal('coagulate'),
	by: Setting.optional(),
	pH: PH.optional(),
	...Held,
});
export const Churn = z.strictObject({ type: z.literal('churn'), ...Held });
/* The steps a curd and much else is put through, each its own. Salted:
   dry, rubbed or sprinkled on; in a brine, so strong; or into the milk or
   the curd. Drained: of its whey, hung in a cloth, in a cloth, in its
   moulds, through a sieve. Cut: into grains so many mm across, or milled,
   ground, crumbled, shredded. Pressed. Moulded: put into its moulds, shaped.
   Separated: its cream off, risen and skimmed or spun off, so much fat left.
   Evaporated: boiled down, in the open or under vacuum, to so much solids.
   Filtered: through a cloth (and through membranes, see Microfilter). Something added to it, so much of it. */
export const Salt = z.strictObject({ type: z.literal('salt'), how: z.enum(['dry', 'brine', 'milk']).optional(), strength: Percent.optional(), ...Held });
export const Drain = z.strictObject({ type: z.literal('drain'), by: z.enum(['hang', 'cloth', 'mould', 'sieve']).optional(), ...Held });
export const Cut = z.strictObject({ type: z.literal('cut'), how: z.enum(['cut', 'mill', 'grind', 'crumble', 'shred']).optional(), size: Millimetres.optional(), ...Held });
export const Press = z.strictObject({ type: z.literal('press'), ...Held });
export const Mould = z.strictObject({ type: z.literal('mould'), ...Held });
/* Separated: what comes off, the cream off milk, a curd that floats, the
   skin that forms, whey spun out of a curd, solids or crystals, spores; or
   the fat drawn apart from the rest; by gravity or a centrifuge, so much
   fat left. */
export const Separate = z.strictObject({
	type: z.literal('separate'),
	off: z.enum(['cream', 'fat', 'curd', 'skin', 'whey', 'solids', 'spores']).optional(),
	by: z.enum(['gravity', 'centrifuge']).optional(),
	fat: Percent.optional(),
	...Held,
});
export const Evaporate = z.strictObject({ type: z.literal('evaporate'), under: z.enum(['open', 'vacuum']).optional(), solids: Percent.optional(), ...Held });
export const Filter = z.strictObject({ type: z.literal('filter'), by: z.literal('cloth').optional(), ...Held });
// Filtered through a membrane: finer and finer, micro, ultra, nano; or washed through one, dia.
export const Microfilter = z.strictObject({ type: z.literal('microfilter'), ...Held });
export const Ultrafilter = z.strictObject({ type: z.literal('ultrafilter'), ...Held });
export const Nanofilter = z.strictObject({ type: z.literal('nanofilter'), ...Held });
export const Diafilter = z.strictObject({ type: z.literal('diafilter'), ...Held });
// Standardised: its fat brought to so much, cream and skim mixed back.
export const Standardise = z.strictObject({ type: z.literal('standardise'), fat: Percent.optional(), ...Held });
/* A curd washed: so much of its whey drawn off and replaced by water,
   so it is milder and more elastic (Gouda, cottage cheese). Anything else
   washed: what (a rind, butter, a cheese) and in what. */
export const WashCurd = z.strictObject({ type: z.literal('washCurd'), share: Percent.optional(), ...Held });
export const Wash = z.strictObject({ type: z.literal('wash'), what: z.string().min(1).optional(), in: z.string().min(1).optional(), ...Held });
// Acidified: soured by an acid put in, not by microbes (see Ferment), with what, to so low a pH.
export const Acidify = z.strictObject({ type: z.literal('acidify'), with: z.string().min(1).optional(), pH: PH.optional(), ...Held });
export const Add = z.strictObject({ type: z.literal('add'), what: z.string().min(1).optional(), share: Percent.optional(), ...Held });
/* Any other step a thing is held at or put through, named in a word or
   two: stretched, smoked, frozen, washed; so warm and so long where that
   is said. */
export const CustomStep = z.strictObject({
	type: z.literal('custom'),
	name: z.string().min(1).max(20),
	...Held,
});
/* How a thing is made from its parent, step by step, in order: heated,
   soured, its curd cooked, ripened. Kefir is two ferments (soured at
   23 °C, then ripened cool), a washed rind cheese three (soured with a
   starter; smeared with B. linens; ripened damp), yoghurt a heat
   treatment, a ferment and two coolings. In words what its steps do not
   hold, such as a second way it is made; and where all of it is from. */
export const Processing = z.strictObject({
	steps: z.array(z.discriminatedUnion('type', [Pasteurise, Homogenise, Coagulate, Churn, Salt, Drain, Cut, Press, Mould, Separate, Evaporate, Filter, Microfilter, Ultrafilter, Nanofilter, Diafilter, Acidify, WashCurd, Wash, Standardise, Add, HeatTreatment, Ferment, Drying, CustomStep])).min(1),
	text: z.string().optional(),
	sources: Sourcing,
});

// How a thing is made: its processing, a paragraph on it, and their sources (see Process).
export const How = z.object({
	label: z.string().optional(),
	text: z.string().optional(),
	sources: Sourcing,
	// How it is processed, heated, fermented, dried, step by step.
	processing: Processing.optional(),
});
export type How = z.infer<typeof How>;
export type Ferment = z.infer<typeof Ferment>;
export type Processing = z.infer<typeof Processing>;
export type ProcessingStep = Processing['steps'][number];
export type HeatTreatment = z.infer<typeof HeatTreatment>;
export type Coagulate = z.infer<typeof Coagulate>;
export type Drying = z.infer<typeof Drying>;
export type Separate = z.infer<typeof Separate>;
