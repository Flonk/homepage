/*
 * The milk graph's data (see MilkGraph.astro), as schemas: what is kept of
 * each product, of each example and cheese on the map, and of each arrow.
 * Every record is keyed by a product's id, or by its name for an example or
 * a cheese; which ids and names there are, and that each one named is there,
 * MilkGraph checks as it builds.
 *
 * Whatever is said of the world comes with its sources (see Sources): what
 * a product is called and what it is made from, where it is from, which
 * animals give its milk, how it is made, how much of it there is. Only how
 * it is drawn does not: a panel, a ruler's marks, a product drawn again.
 */

export * from './schemas/sourcing';
export * from './schemas/terms';
export * from './schemas/steps';
export * from './schemas/process';
export * from './schemas/node';
export * from './schemas/regions';
export * from './schemas/page';
export * from './schemas/animal';
export * from './schemas/reconciled';
