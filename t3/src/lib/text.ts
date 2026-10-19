/**
 * Puts words into an element that a picture rewrites every frame, a reading
 * in its corner say, at the least cost to the page.
 *
 * `textContent =` throws the element's text away and puts a new one in, even
 * when the words are the same, and a node arriving is something every
 * `:has()` above it has to look at again: on a deck that is the deck and the
 * page itself, sixty times a second, and the line laid out again after. So
 * nothing happens when the words have not changed, and when they have, the
 * text already there is told its new words rather than replaced.
 */
export function setText(el: Element, text: string): void {
	const only = el.firstChild;
	if (only && only === el.lastChild && only.nodeType === Node.TEXT_NODE) {
		const node = only as Text;
		if (node.data !== text) node.data = text;
	} else if (el.textContent !== text) {
		el.textContent = text;
	}
}
