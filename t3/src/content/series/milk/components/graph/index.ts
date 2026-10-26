import built from '../../data/built/graph.json';
import type * as S from './schema';

/*
 * The graph as the build step made it (see build.ts): written to
 * built/graph.json by `npm run milk:graph -- build`, run before the site is
 * served or built, and again on every change by `npm run milk:graph -- watch`.
 */
export const graph = built.graph as unknown as S.Payload;
export const herd = built.herd as S.Beast[];
