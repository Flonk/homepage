import type { Composition } from '../schema';
import { said as span, inUnit } from './Range';
import { el } from './dom';

/* A Composition on a card: what a thing is as it comes out, one line,
   "Fat ≥3.5% · Protein 3.4% · pH 4.6". */
const NAMES: [keyof Omit<Composition, 'sources' | 'pH'>, string][] = [
	['fat', 'Fat'],
	['fatInDryMatter', 'Fat in dry matter'],
	['moisture', 'Water'],
	['protein', 'Protein'],
	['lactose', 'Lactose'],
	['sugar', 'Sugar'],
	['solids', 'Solids'],
	['alcohol', 'Alcohol'],
];
export const said = (c: Composition) =>
	[...NAMES.flatMap(([k, name]) => (c[k] ? [`${name} ${span(c[k]!, inUnit('%'))}`] : [])), ...(c.pH ? [`pH ${span(c.pH, inUnit(''))}`] : [])].join(' · ');
export const html = (c: Composition) => el('p', 'milk-about-composition', said(c));
