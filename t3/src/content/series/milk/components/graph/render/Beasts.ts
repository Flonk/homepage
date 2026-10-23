import type { Beast } from '../schema';

/*
 * An animal milked, in the forms it is shown in: its mark, on a pill's
 * corner and on the filter's button; the word for its milk, a mare's and
 * not a horse's; and what pointing at a product's marks says.
 */
export const MARK: Record<Beast, string> = {
	cow: '🐄',
	sheep: '🐑',
	goat: '🐐',
	horse: '🐎',
	donkey: '🫏',
	buffalo: '🐃',
	camel: '🐪',
	yak: '🦬',
	reindeer: '🦌',
};
export const MILK: Record<Beast, string> = {
	cow: 'cow',
	sheep: 'sheep',
	goat: 'goat',
	horse: 'mare',
	donkey: 'donkey',
	buffalo: 'buffalo',
	camel: 'camel',
	yak: 'yak',
	reindeer: 'reindeer',
};
export const said = (beasts: Beast[]) => `From ${beasts.map((b) => MILK[b]).join(' and ')} milk`;
// Its filter button's title, "Mare milk".
export const titled = (b: Beast) => `${MILK[b][0].toUpperCase()}${MILK[b].slice(1)} milk`;
