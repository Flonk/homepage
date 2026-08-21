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
		'Where colour comes from, how a screen fakes it with three lights, and why ' +
		'every obvious way of arranging it turns out to be wrong.',
	'Classes are Coalgebras':
		'Everything is a function, and so are classes. Those turn out to be a special kind of function called F-coalgebras.'
};
