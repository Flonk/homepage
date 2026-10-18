import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { loadSite } from '../site';

export async function GET(context) {
	// Hidden posts are working material; the feed is for writing.
	const pages = (await loadSite()).pages.filter((p) => !p.data.hidden);
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
