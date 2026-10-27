import { type CollectionEntry, getCollection } from 'astro:content';

/**
 * Where everything lives, worked out once from the content collections (see
 * content.config.ts), so that the routes, the tree, the feed and the home
 * page all agree on it:
 *
 *   /blog/<post>/                a post
 *   /blog/<series>/<chapter>/    a chapter of a series, from NN-<chapter>.md(x)
 *   /blog/<series>/              the series' index.md(x) if it has one, which
 *                                is how a single deck is a series of one;
 *                                otherwise a redirect to its first chapter
 *
 * Anything that would put two things at one address, or that this cannot
 * place, stops the build rather than going missing from the site.
 */

export type Post = CollectionEntry<'posts'>;
export type Chapter = CollectionEntry<'chapters'>;

/** A page of writing: a post, or a chapter of a series. */
export type Page = {
	href: string;
	entry: Post | Chapter;
	data: Post['data'];
	/** For a chapter: its series. */
	series?: Series;
	/**
	 * For a numbered chapter: which part it is, as the series names it. Its
	 * place in the running order, from one, unless its frontmatter says
	 * otherwise (`part`). A series' index has none.
	 */
	part?: string;
	/**
	 * The title to show where the page stands alone, in a browser tab or the
	 * feed: a numbered chapter's with its series and number before it,
	 * "Colour #1: The RGB Cube". On the page itself the series and number are
	 * said once, over the title.
	 */
	fullTitle: string;
};

export type Series = {
	slug: string;
	href: string;
	data: CollectionEntry<'series'>['data'];
	/** In running order: the index first, then by number. */
	chapters: Page[];
	/** Whether a chapter sits at the series' own address. */
	hasIndex: boolean;
};

export type Site = {
	posts: Page[];
	series: Series[];
	/** Every post and chapter. */
	pages: Page[];
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "type-systems/01-utlc" → its series, its place in it, and its slug. */
export function placeChapter(id: string): { series: string; order: number; slug: string | null } {
	const [series, file] = id.split('/');
	if (file === 'index') return { series, order: 0, slug: null };
	const m = file?.match(/^(\d+)-(.+)$/);
	if (!m || !SLUG.test(m[2]))
		throw new Error(`series/${id}: a chapter is index.md(x) or NN-<slug>.md(x)`);
	return { series, order: Number(m[1]), slug: m[2] };
}

export async function loadSite(): Promise<Site> {
	const [postEntries, chapterEntries, seriesEntries] = await Promise.all([
		getCollection('posts'),
		getCollection('chapters'),
		getCollection('series'),
	]);

	const posts: Page[] = postEntries.map((entry) => {
		if (!SLUG.test(entry.id)) throw new Error(`posts/${entry.id}: not a slug`);
		return { href: `/blog/${entry.id}/`, entry, data: entry.data, fullTitle: entry.data.title };
	});

	const placed = chapterEntries.map((entry) => ({ entry, ...placeChapter(entry.id) }));
	const series: Series[] = seriesEntries.map(({ id: slug, data }) => {
		const own = placed
			.filter((c) => c.series === slug)
			.sort((a, b) => a.order - b.order);
		if (!own.length) throw new Error(`series/${slug}: no chapters`);
		const seen = new Set<number>();
		for (const c of own) {
			if (seen.has(c.order)) throw new Error(`series/${slug}: two chapters numbered ${c.order}`);
			seen.add(c.order);
		}
		const s: Series = { slug, href: `/blog/${slug}/`, data, chapters: [], hasIndex: own[0].slug === null };
		s.chapters = own.map((c, i) => {
			const { title, part: named } = c.entry.data;
			// A hidden series' every chapter hidden with it.
			const chapterData = data.hidden ? { ...c.entry.data, hidden: true } : c.entry.data;
			if (c.slug === null)
				return { href: s.href, entry: c.entry, data: chapterData, series: s, fullTitle: title };
			const part = named ?? String(i + 1);
			return {
				href: `/blog/${slug}/${c.slug}/`,
				entry: c.entry,
				data: chapterData,
				series: s,
				part,
				fullTitle: `${data.title} #${part}${title ? `: ${title}` : ''}`,
			};
		});
		return s;
	});

	for (const c of placed)
		if (!series.some((s) => s.slug === c.series))
			throw new Error(`series/${c.series}: chapters but no series.json`);

	const pages = [...posts, ...series.flatMap((s) => s.chapters)];
	// Every address once: a post's, a series' own (its index's, if it has
	// one), and every other chapter's.
	const taken = new Map<string, string>();
	const claim = (href: string, what: string) => {
		const was = taken.get(href);
		if (was) throw new Error(`${href}: both ${was} and ${what}`);
		taken.set(href, what);
	};
	for (const p of posts) claim(p.href, `posts/${p.entry.id}`);
	for (const s of series) {
		claim(s.href, `series/${s.slug}`);
		for (const c of s.chapters) if (c.href !== s.href) claim(c.href, `series/${c.entry.id}`);
	}

	return { posts, series, pages };
}

/** Newest first, by date. */
export const newestFirst = (a: Page, b: Page) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
