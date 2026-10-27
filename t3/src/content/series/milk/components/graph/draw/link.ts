/* The product open in the picture, kept in the address as `?node=<id>`,
   so a reload, or a link sent, opens on it; kept when its card is
   closed, till another is opened. In the query, not the
   fragment, which the deck keeps its card's number in (see DeckPost);
   replaced, not pushed, so Back leaves the post rather than walking back
   through every product looked at. */
const PARAM = 'node';

export const linked = () => new URLSearchParams(location.search).get(PARAM);
export const keepLinked = (id: string | null) => {
	const url = new URL(location.href);
	if (id) url.searchParams.set(PARAM, id);
	else url.searchParams.delete(PARAM);
	if (url.href !== location.href) history.replaceState(history.state, '', url);
};
