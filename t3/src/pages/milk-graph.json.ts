import { graph } from '../content/series/milk/components/graph';

/* The milk graph (see MilkGraph.astro), as a file of its own: the same for
   every page that draws it, so fetched once and kept by the browser rather
   than written into each of them. */
export const GET = () => new Response(JSON.stringify(graph), { headers: { 'Content-Type': 'application/json' } });
