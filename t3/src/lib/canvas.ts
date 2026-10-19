/**
 * How many canvas pixels a picture draws to each CSS pixel.
 *
 * As many as the screen has, up to two, which is as sharp as anyone can see
 * at a desk. A phone has more than that in less room, and every pixel is
 * drawn again on every frame of a picture that never stops moving: at 2.55,
 * a phone's own, a canvas half its screen is three million of them, sixty
 * times a second, and the phone runs warm and starts dropping frames. At
 * arm's length one and a half is hard to tell from more, and is a third of
 * the pixels of two. A phone is told by its finger, not its size.
 */
export function pixelRatio(): number {
	const most = matchMedia('(pointer: coarse)').matches ? 1.5 : 2;
	return Math.min(window.devicePixelRatio || 1, most);
}
