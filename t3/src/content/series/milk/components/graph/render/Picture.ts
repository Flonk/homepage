import type { Picture } from '../schema';
import { el, out } from './dom';

/*
 * A photograph, in each of the forms it is drawn in: as the page is given
 * it, where it is and its credit; and its credit on a card.
 */
export const page = (file: string, { file: what, author, license, sources }: Picture) => ({
	src: `/assets/milk/${file}.webp`,
	credit: `${what} · ${author} · ${license}`,
	author,
	license,
	source: 'links' in sources ? sources.links[0].url : '',
});
export type Page = ReturnType<typeof page>;
export const credit = (image: Page) => {
	const said = el('p', 'milk-about-credit', 'Photo: ');
	said.append(out(image.author, image.source), `, ${image.license}`);
	return said;
};
