/**
 * Keep inline `code` snippets on one line where they fit.
 *
 * A snippet like `(λy. add 2 y) 3` is one unit, but the browser happily breaks
 * it at its spaces, splitting the bordered box across two lines. There is no
 * CSS for "don't break unless you have to" on inline content — `white-space:
 * nowrap` forbids breaking outright and overflows instead. The no-break space
 * is the mechanism designed for this, so swap the spaces for U+00A0 and let
 * `overflow-wrap: break-word` still rescue a snippet too long for any line.
 *
 * Only short snippets: one too long to sit comfortably on a line would be
 * shoved onto its own line and then split mid-word anyway, so it keeps its
 * real spaces and wraps like prose.
 *
 * Only inline code: `pre > code` keeps real spaces so code blocks stay
 * copy-pasteable.
 */
const MAX_UNBROKEN = 24;

const textOf = (node) =>
	node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join('');

const NBSP = ' ';

const replaceSpacesInText = (node) => {
	if (node.type === 'text' && typeof node.value === 'string') {
		node.value = node.value.replace(/ /g, NBSP);
	}
	for (const child of node.children ?? []) replaceSpacesInText(child);
};

const walk = (node, parent) => {
	if (node.type === 'element' && node.tagName === 'code') {
		const insidePre = parent?.type === 'element' && parent.tagName === 'pre';
		if (!insidePre) {
			if (textOf(node).length <= MAX_UNBROKEN) replaceSpacesInText(node);
			return; // don't descend again
		}
		return; // code block — leave its whitespace alone
	}
	for (const child of node.children ?? []) walk(child, node);
};

export default function rehypeNowrapInlineCode() {
	return (tree) => walk(tree, null);
}
