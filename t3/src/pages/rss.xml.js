import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { loadSite, newestFirst } from '../site';

export async function GET(context) {
	// Hidden posts are working material; the feed is for writing. Newest first,
	// as a reader expects a feed to be.
	const pages = (await loadSite()).pages.filter((p) => !p.data.hidden).sort(newestFirst);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: pages.map((page) => ({
			...page.data,
			title: page.fullTitle,
			link: page.href,
		})),
	});
}
