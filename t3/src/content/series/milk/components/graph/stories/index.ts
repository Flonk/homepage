import AmericanCheese from './AmericanCheese.astro';
import ButterCow from './ButterCow.astro';
import CasuMarzu from './CasuMarzu.astro';
import Epoisses from './Epoisses.astro';
import Feta from './Feta.astro';
import GranaPadano from './GranaPadano.astro';
import LangtangYakCheese from './LangtangYakCheese.astro';
import Rasskase from './Rasskase.astro';
import Stilton from './Stilton.astro';

/* The stories told behind the T3 bubble on a pill, each a component, by
   the id of the node it is told of (its file's name in data/nodes/). Each
   is rendered into the page once, in a template, and copied into the
   popover when its bubble is pressed (see draw/story.ts): its markup and
   styles, with no script of its own. A node here has a bubble. */
export const STORIES: Record<string, (props: Record<string, never>) => unknown> = {
	americanCheese: AmericanCheese,
	casuMarzu: CasuMarzu,
	iowaStateFairButterCow: ButterCow,
	epoisses: Epoisses,
	feta: Feta,
	granaPadano: GranaPadano,
	langtangYakCheese: LangtangYakCheese,
	appenzellerRasskase: Rasskase,
	stilton: Stilton,
};
