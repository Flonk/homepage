// In the figure, or already moved up into a sidebar deck's column of tools (data-deck-tool, see DeckPost), which it works the same from.
export const searchOf = (figure: HTMLElement) =>
	figure.querySelector<HTMLDivElement>('.milk-search') ?? document.querySelector<HTMLDivElement>('[data-deck-tools] .milk-search');
// What a card has asked it to focus on: a product's id, null for the whole, or nothing said.
export const focusOf = (e: Event): string | null | undefined => {
	const p = (e as CustomEvent).detail ?? {};
	return 'focus' in p ? (typeof p.focus === 'string' ? p.focus : null) : undefined;
};
