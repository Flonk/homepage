import type { Node } from '../client/base';
import type { Box } from './types';

// Each value added to the list under its key.
export const group = <K, V>(into: Map<K, V[]>, key: K, value: V) => {
	const list = into.get(key);
	if (list) list.push(value);
	else into.set(key, [value]);
};

// A pill's box where it is across, its middle at 0 down.
export const pillBox = (n: Node): Box => ({ x0: n.x - n.w / 2, x1: n.x + n.w / 2, y0: -n.h / 2, y1: n.h / 2, margin: n.h / 2 });
export const moved = (b: Box, dy: number): Box => ({ ...b, y0: b.y0 + dy, y1: b.y1 + dy });
/* Room between two: at least so much, and at least the bigger of their
   margins, so a great pill or a fat arrow is not crowded by small things. */
export const gap = (a: Box, b: Box, least: number) => Math.max(least, a.margin ?? 0, b.margin ?? 0);
