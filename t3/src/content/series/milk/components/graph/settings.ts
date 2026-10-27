/*
 * The knobs on how big things are drawn, in one place to turn them.
 */

/* A product is drawn the bigger the more is made from it, all the way
   down: as one more than that, to this power. At 0.55 a product with
   nothing under it is 1×, three under it about 2.1×, fifteen 4.6×. Higher
   and the great branch points stand out the more; towards 0, all alike.
   The picture is meant to be zoomed into: the great branch points read
   from afar, the ends of the branches close up. */
export const SIZE_EXPONENT = 0.50;
// Milk, the circle at the root, this many times what that makes it.
export const MILK = 2;

/* The world's most made and best known cheeses (see famous-cheeses.json)
   this many times bigger; the top ten and the top fifty more so again. */
export const FAME = 1.8;
export const FAME_TOP_10 = 2;
export const FAME_TOP_50 = 1.5;
/* On a type's table: its most significant cheeses a little bigger, its
   outliers a little smaller (see build/tables.ts); the famous as FAME. */
export const STANDING = { famous: FAME, pick: 1.35, outlier: 0.85 };

// How big the cards of processing steps on the arrows are drawn, 1 the size they were first made at.
export const CARD_SIZE = 1.5;

/* How thick any arrow is at the least, in the picture's units, so every
   small arrow is the same, cards on it or not (see leastWeight in
   layout/sizes.ts). */
export const ARROW_LEAST = 2.7;

/* At what zoom things show (see shownAt in render/canvas.ts): once they
   are this many pixels on the screen. Words once their letters are this
   tall; a photograph once it is this wide; a flag once it is this wide
   across its circle. */
export const SHOWN = { text: 2.5, photo: 6, flag: 4 };
