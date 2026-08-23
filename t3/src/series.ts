/**
 * The running order of a series: oldest first, so it reads from part one
 * downwards, with the slug breaking ties.
 *
 * Sorted outright rather than by reversing a newest-first page order — parts
 * published the same day tie on date, and a reversal would then hand back
 * whatever order the collection happened to be in, which is backwards. Slugs
 * carry the part number, so they settle it.
 */
export function sortSeries<T extends { id: string; data: { pubDate: Date } }>(
	posts: T[],
): T[] {
	return [...posts].sort(
		(a, b) =>
			a.data.pubDate.valueOf() - b.data.pubDate.valueOf() || a.id.localeCompare(b.id),
	);
}

/**
 * Blurbs for post series, keyed by the `series` value in a post's frontmatter.
 * A series without an entry here still groups, it just renders without a tagline.
 */
export const SERIES_BLURBS: Record<string, string> = {
	'Type Systems':
		'In this series we work our way up from programming languages without types, to the most sophisticated type systems out there!',
	'Free objects':
		'Take an algebraic structure, add nothing beyond what its laws demand, and see which ' +
		'data structure falls out the other end — multisets, lists, finger trees.',
	Colour:
		'Everything I know about colour.'
};
