import type { SharePage } from '../schema';
import { html as sourcesHtml } from './Sourcing';
import { el } from './dom';

/* A Share on a card: how much of it is made a year, and how much of the
   world's milk that is, an estimate, and where the figures are from. */
export const said = (mt: number, percent: number) => {
	const pct = percent >= 1 ? `${Math.round(percent)}%` : percent >= 0.1 ? `${percent.toFixed(1)}%` : 'under 0.1%';
	const mass = mt >= 1 ? `${Math.round(mt)} Mt` : `${+(mt * 1000).toPrecision(2)} thousand t`;
	return `About ${mass} a year, ${pct} of the world’s milk by weight: an estimate.`;
};
export const html = ({ mt, percent, sources }: SharePage) => [el('p', 'milk-about-aka', `${said(mt, percent)} ${sources.text}`), sourcesHtml(sources)];
