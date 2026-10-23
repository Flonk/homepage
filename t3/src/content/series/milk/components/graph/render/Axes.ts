import type { Axes } from '../schema';
import { el, fact } from './dom';

// A span of days as it is said: days, weeks, months or years.
export const lasting = ([least, most]: [number, number]) => {
	const [per, unit] = most < 14 ? [1, 'days'] : most < 90 ? [7, 'weeks'] : most < 730 ? [30, 'months'] : [365, 'years'];
	const a = Math.round(least / per);
	const b = Math.round(most / per);
	return a === b ? `${a} ${unit}` : `${a}–${b} ${unit}`;
};
// Axes on a card: how firm, and how long ripened, where a panel puts it.
export const html = ({ firm, days }: Pick<Axes, 'firm' | 'days'>) => {
	const placed = el('dl');
	placed.append(fact('Firmness', firm), fact('Ripened', lasting(days)));
	return placed;
};
