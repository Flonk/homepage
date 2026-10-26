// Each of them as it should be, or the first that is not said, and the build stopped.
export const mustAll = (keys: Iterable<string>, ok: (key: string) => boolean, said: string) => {
	for (const key of keys) if (!ok(key)) throw new Error(`MilkGraph: ${said} ${key}`);
};

// Each product, of exactly one of the lists: by its place in them.
export const placed = (lists: { ids: string[] }[], what: string, isProduct: (id: string) => boolean) => {
	const at = new Map<string, number>();
	lists.forEach(({ ids }, i) => {
		mustAll(ids, isProduct, `${what} names unknown`);
		mustAll(ids, (id) => !at.has(id), `in two of a ${what}:`);
		for (const id of ids) at.set(id, i);
	});
	return at;
};
