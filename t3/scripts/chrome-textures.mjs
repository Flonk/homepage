/**
 * The chrome's grain, drawn: the two tiles global.css lays over the chrome
 * (see Grain there). Run from the project root with `npm run textures`; it
 * writes public/assets/chrome-dots.png and public/assets/chrome-noise.png,
 * the same files every time.
 *
 * Plain Node and nothing else, PNG writer included, so that the tiles can be
 * drawn again on any machine that can build the site.
 */
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

/* Both tiles are drawn four times over, four pixels to the CSS pixel, and
   laid at their CSS size, so they are sharp on any screen there is. */
const S = 4;

/* ---- the dots ------------------------------------------------------------
   A grid of dots turned a little off square, as the chrome's grain always
   was. A turned grid repeats only at a slope of whole numbers, and three in
   ten (16.7°) is the nearest to the 17° it was drawn at by hand: the grid
   through (10, 3) and (-3, 10), which comes round on itself every 26px
   across and down, with 109 dots in the square. Its pitch, 26/√109, is
   2.49px, against the 2.5px it had. */
const TILE = 26;
const DOTS = 109;

/* Each dot as the hand-drawn one: white at 0.55 out to 0.4px from its
   middle, fading to nothing at 0.7px. */
const dotAlpha = (r) => (r <= 0.4 ? 0.55 : r >= 0.7 ? 0 : (0.55 * (0.7 - r)) / 0.3);

function drawDots() {
	const size = TILE * S;
	const points = [];
	for (let i = 0; i < DOTS; i++) {
		points.push([(TILE / DOTS) * ((10 * i) % DOTS), (TILE / DOTS) * ((3 * i) % DOTS)]);
	}
	const pixels = Buffer.alloc(size * size * 4);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			// The middle of the pixel, in CSS pixels, against the nearest dot,
			// counting the ones over the edge in the next tile round.
			const px = (x + 0.5) / S;
			const py = (y + 0.5) / S;
			let nearest = Infinity;
			for (const [dx, dy] of points) {
				const ax = Math.abs(px - dx);
				const ay = Math.abs(py - dy);
				nearest = Math.min(nearest, Math.hypot(Math.min(ax, TILE - ax), Math.min(ay, TILE - ay)));
			}
			const at = (y * size + x) * 4;
			pixels[at] = pixels[at + 1] = pixels[at + 2] = 255;
			pixels[at + 3] = Math.round(dotAlpha(nearest) * 255);
		}
	}
	return png(size, size, 6, pixels);
}

/* ---- the noise -----------------------------------------------------------
   A 128px tile of grey, every CSS pixel its own value and all of them as
   likely, laid on at 0.4: a block of S by S for each, so it stays a block on
   a dense screen rather than being smoothed into a blur. The same values
   every time, from a fixed seed. */
const NOISE = 128;

function drawNoise() {
	const random = mulberry32(0x7e3);
	const values = Array.from({ length: NOISE * NOISE }, () => Math.floor(random() * 256));
	const size = NOISE * S;
	const pixels = Buffer.alloc(size * size * 2);
	const alpha = Math.round(0.4 * 255);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const at = (y * size + x) * 2;
			pixels[at] = values[Math.floor(y / S) * NOISE + Math.floor(x / S)];
			pixels[at + 1] = alpha;
		}
	}
	return png(size, size, 4, pixels);
}

/* A small seeded generator, so the noise is the same on every run. */
function mulberry32(seed) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/* ---- PNG -----------------------------------------------------------------
   Eight bits a channel, grey and alpha (4) or colour and alpha (6), every row
   unfiltered and the whole of it deflated. */
function png(width, height, colourType, pixels) {
	const channels = colourType === 6 ? 4 : 2;
	const stride = width * channels;
	const rows = Buffer.alloc(height * (stride + 1));
	for (let y = 0; y < height; y++) pixels.copy(rows, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width, 0);
	header.writeUInt32BE(height, 4);
	header[8] = 8;
	header[9] = colourType;
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', header),
		chunk('IDAT', deflateSync(rows, { level: 9 })),
		chunk('IEND', Buffer.alloc(0)),
	]);
}

function chunk(type, data) {
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length);
	const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(body));
	return Buffer.concat([length, body, crc]);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});

function crc32(bytes) {
	let c = 0xffffffff;
	for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

writeFileSync('public/assets/chrome-dots.png', drawDots());
writeFileSync('public/assets/chrome-noise.png', drawNoise());
console.log('wrote public/assets/chrome-dots.png and public/assets/chrome-noise.png');
