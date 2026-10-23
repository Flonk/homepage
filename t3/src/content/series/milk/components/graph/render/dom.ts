/*
 * What every schema's telling on the card shares: an element, a link out
 * of the page, things listed with commas, and a row of facts.
 */
export const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => {
	const e = document.createElement(tag);
	if (cls) e.className = cls;
	if (text !== undefined) e.textContent = text;
	return e;
};
// A link out of the page, in a tab of its own.
export const out = (text: string, href: string) => {
	const a = el('a', '', text);
	a.href = href;
	a.target = '_blank';
	a.rel = 'noopener';
	return a;
};
// So many, a comma between each.
export const commas = <T,>(items: T[]) => items.flatMap((x, i) => (i ? [', ', x] : [x]));
// A row of the card's facts: what it is, and what it says, things named in it among them.
export const fact = (term: string, ...parts: (Node | string | (Node | string)[])[]) => {
	const row = el('div', 'milk-about-fact');
	row.append(el('dt', '', term));
	const dd = el('dd');
	for (const part of parts) dd.append(...(Array.isArray(part) ? commas(part) : [part]));
	row.append(dd);
	return row;
};
