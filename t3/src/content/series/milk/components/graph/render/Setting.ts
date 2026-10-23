import type { Setting } from '../schema';

// What sets a milk into a curd, in words: on a coagulating step's card, "by rennet", and in a cheese's table.
export const SAID: Record<Setting | 'none', string> = {
	rennet: 'rennet',
	'rennet-acid': 'acid and a little rennet',
	acid: 'acid',
	'acid-heat': 'acid and heat',
	plant: 'plant enzymes',
	heat: 'heat alone',
	none: 'nothing, only melted',
};
