// The animals whose milk it is, as pointing at their marks says them.
export const said = (beasts: { milk: string }[]) => `From ${beasts.map((b) => b.milk).join(' and ')} milk`;
