/**
 * The human cone fundamentals: how much of the light at a given wavelength each
 * of the three kinds of cone in the eye takes in, with each curve scaled so its
 * own peak is 1.
 *
 * These are measurements, not a model. Stockman & Sharpe (2000), the 2-degree
 * fundamentals in energy units, sampled every 5nm from the tables published by
 * the Colour & Vision Research Laboratory at UCL:
 *
 *   http://cvrl.ioo.ucl.ac.uk/database/data/cones/linss2_10e_5.csv
 *
 * On the finer 1nm tables the three peak at 570nm, 543nm and 442nm. At 5nm the
 * samples either side of a peak can fall a little short of 1 — 0.997 for M and
 * 0.991 for S — which is the sampling, not the curve.
 *
 * The range stops at 730nm because past it every one of them is under a
 * thousandth, and at 390nm because that is where the table starts.
 */
export const CONE_FIRST_NM = 390;
export const CONE_LAST_NM = 730;
export const CONE_STEP_NM = 5;

/** One [L, M, S] triple per 5nm, from CONE_FIRST_NM. */
export const CONE_LMS: [number, number, number][] = [
	[0.00042, 0.00037, 0.00955], // 390
	[0.00105, 0.00096, 0.02382], // 395
	[0.00241, 0.00227, 0.05665], // 400
	[0.00483, 0.0047, 0.12245], // 405
	[0.00872, 0.00879, 0.23301], // 410
	[0.01338, 0.01453, 0.38136], // 415
	[0.01845, 0.02166, 0.54362], // 420
	[0.02293, 0.02957, 0.67447], // 425
	[0.02819, 0.03946, 0.80256], // 430
	[0.03411, 0.05182, 0.90357], // 435
	[0.04026, 0.06478, 0.99102], // 440
	[0.04494, 0.07588, 0.99152], // 445
	[0.04986, 0.08705, 0.95539], // 450
	[0.05534, 0.09819, 0.86024], // 455
	[0.06472, 0.11627, 0.7867], // 460
	[0.08069, 0.14454, 0.73827], // 465
	[0.09948, 0.17589, 0.64636], // 470
	[0.1188, 0.2054, 0.51641], // 475
	[0.14014, 0.23575, 0.39033], // 480
	[0.16395, 0.26806, 0.29032], // 485
	[0.19156, 0.30363, 0.21187], // 490
	[0.23293, 0.35706, 0.16053], // 495
	[0.28896, 0.42776, 0.12284], // 500
	[0.35972, 0.51559, 0.0889], // 505
	[0.44368, 0.61552, 0.06082], // 510
	[0.53649, 0.71915, 0.04281], // 515
	[0.62856, 0.81661, 0.0292], // 520
	[0.70472, 0.88555, 0.01939], // 525
	[0.77063, 0.93569, 0.0126], // 530
	[0.82571, 0.96886, 0.00809], // 535
	[0.88101, 0.99522, 0.00509], // 540
	[0.91907, 0.99719, 0.00317], // 545
	[0.9402, 0.97719, 0.00196], // 550
	[0.96573, 0.95658, 0.0012], // 555
	[0.98145, 0.91775, 0.00074], // 560
	[0.99449, 0.87321, 0.00046], // 565
	[0.99999, 0.81351, 0.00028], // 570
	[0.99231, 0.74029, 0.00018], // 575
	[0.96943, 0.65327, 0.00011], // 580
	[0.9556, 0.5726, 0.00007], // 585
	[0.92767, 0.4926, 0.00004], // 590
	[0.88597, 0.41125, 0.00003], // 595
	[0.83398, 0.33443, 0.00002], // 600
	[0.7751, 0.26487, 0.00001], // 605
	[0.70571, 0.20527, 0.00001], // 610
	[0.63077, 0.15624, 0.00001], // 615
	[0.55422, 0.11664, 0.0], // 620
	[0.47994, 0.08559, 0.0], // 625
	[0.40071, 0.06211, 0.0], // 630
	[0.32786, 0.04449, 0.0], // 635
	[0.26578, 0.03143, 0.0], // 640
	[0.21328, 0.0218, 0.0], // 645
	[0.16514, 0.01545, 0.0], // 650
	[0.12475, 0.01071, 0.0], // 655
	[0.09301, 0.0073, 0.0], // 660
	[0.06851, 0.00497, 0.0], // 665
	[0.04987, 0.00344, 0.0], // 670
	[0.03582, 0.00238, 0.0], // 675
	[0.02538, 0.00164, 0.0], // 680
	[0.01772, 0.00112, 0.0], // 685
	[0.01217, 0.00076, 0.0], // 690
	[0.00847, 0.00053, 0.0], // 695
	[0.0059, 0.00037, 0.0], // 700
	[0.00409, 0.00025, 0.0], // 705
	[0.0028, 0.00017, 0.0], // 710
	[0.00192, 0.00012, 0.0], // 715
	[0.00133, 0.00008, 0.0], // 720
	[0.00092, 0.00006, 0.0], // 725
	[0.00064, 0.00004, 0.0], // 730
];

/* Between samples the curves are interpolated with a monotone cubic, which is
   smooth but cannot overshoot: a plain cubic through data that flattens out
   towards zero will dip below it, and a response below zero is not a thing.
   Tangents by Fritsch-Carlson, worked out once. */
const SLOPE: [number, number, number][] = (() => {
	const n = CONE_LMS.length;
	const out: [number, number, number][] = CONE_LMS.map(() => [0, 0, 0]);
	for (let c = 0; c < 3; c++) {
		const d: number[] = [];
		for (let i = 0; i < n - 1; i++) d.push((CONE_LMS[i + 1][c] - CONE_LMS[i][c]) / CONE_STEP_NM);
		for (let i = 0; i < n; i++) {
			let m = i === 0 ? d[0] : i === n - 1 ? d[n - 2] : (d[i - 1] + d[i]) / 2;
			// Flat wherever the data turns, and never steeper than the secants.
			if (i > 0 && i < n - 1 && d[i - 1] * d[i] <= 0) m = 0;
			else {
				if (i > 0 && Math.abs(m) > 3 * Math.abs(d[i - 1])) m = 3 * d[i - 1];
				if (i < n - 1 && Math.abs(m) > 3 * Math.abs(d[i])) m = 3 * d[i];
			}
			out[i][c] = m;
		}
	}
	return out;
})();

/** What each cone makes of light of this wavelength, as a fraction of its peak. */
export function coneResponse(nm: number): [number, number, number] {
	if (nm <= CONE_FIRST_NM || nm >= CONE_LAST_NM) {
		// Nothing is measured out here, and nothing is left of any of them.
		return nm <= CONE_FIRST_NM ? [...CONE_LMS[0]] : [0, 0, 0];
	}
	const x = (nm - CONE_FIRST_NM) / CONE_STEP_NM;
	const i = Math.floor(x);
	const t = x - i;
	const h = CONE_STEP_NM;
	// Hermite basis.
	const h00 = (1 + 2 * t) * (1 - t) * (1 - t);
	const h10 = t * (1 - t) * (1 - t);
	const h01 = t * t * (3 - 2 * t);
	const h11 = t * t * (t - 1);
	const out: [number, number, number] = [0, 0, 0];
	for (let c = 0; c < 3; c++) {
		out[c] = Math.max(
			0,
			h00 * CONE_LMS[i][c] +
				h10 * h * SLOPE[i][c] +
				h01 * CONE_LMS[i + 1][c] +
				h11 * h * SLOPE[i + 1][c],
		);
	}
	return out;
}

/* ---- a different eye ------------------------------------------------------
   The L cone replaced by the S curve reflected about M's peak, so that its
   overlap with M is the mirror image of S's overlap with M. It lands at 645nm
   against the real 570nm, which is the "move L further into the long
   wavelengths" that card five is arguing for, done in the least arbitrary way
   available: not a curve invented to taste, but the one the eye already has,
   turned around. */
const M_PEAK_NM = (() => {
	let best = 0;
	let at = 0;
	for (let nm = CONE_FIRST_NM; nm <= CONE_LAST_NM; nm += 0.25) {
		const v = coneResponse(nm)[1];
		if (v > best) {
			best = v;
			at = nm;
		}
	}
	return at;
})();
export const MIRROR_ABOUT = 2 * M_PEAK_NM;

export type Eye = 'human' | 'mirrored';

/** What each cone of a given eye makes of light of this wavelength. */
export function eyeResponse(nm: number, eye: Eye = 'human'): [number, number, number] {
	const h = coneResponse(nm);
	if (eye === 'human') return h;
	return [coneResponse(MIRROR_ABOUT - nm)[2], h[1], h[2]];
}

/* ---- a fourth channel, bought with filters --------------------------------
   Put a filter passing only short wavelengths over one eye and one passing
   only long wavelengths over the other, and the L cone — which both eyes have
   the same — is looking at two different bands. The brain is then handed four
   readings where it usually gets three: S, M, and the two halves of L.

   Note what this is and is not. It is not a fourth kind of cone: there is no
   new pigment, and each eye on its own is as trichromatic as it ever was. It
   is one cone type split across two eyes, and whether the brain can put the
   two halves together into a colour sense with a genuine fourth dimension — or
   whether the eyes simply fight, which is what usually happens when they are
   shown different things — is not something this curve can settle. What the
   curve shows is the signal being made available; the seeing is another
   question.

   The edges are eased rather than square. A real dielectric filter takes a
   band to go from passing to blocking, and drawing a cliff would be claiming a
   part its steepness the filter does not have. */
export const FILTER_SHORT_NM = 610; // one eye keeps what is below this
export const FILTER_LONG_NM = 625; // the other keeps what is above
const FILTER_EDGE_NM = 12;

const smoothstep = (t: number) => {
	const x = Math.min(1, Math.max(0, t));
	return x * x * (3 - 2 * x);
};

/** How much of this wavelength each of the two filters lets through. */
export function filterPair(nm: number): { short: number; long: number } {
	return {
		short: 1 - smoothstep((nm - (FILTER_SHORT_NM - FILTER_EDGE_NM / 2)) / FILTER_EDGE_NM),
		long: smoothstep((nm - (FILTER_LONG_NM - FILTER_EDGE_NM / 2)) / FILTER_EDGE_NM),
	};
}

/**
 * The two long-wavelength readings such an arrangement produces: the same L
 * cone behind each filter. S and M are left out because both are already
 * silent by 610nm — the filters take nothing from them that the cones had.
 */
export function splitL(nm: number): [number, number] {
	const l = coneResponse(nm)[0];
	const t = filterPair(nm);
	return [l * t.short, l * t.long];
}

/* ---- how much colour an eye has ------------------------------------------
   Only the ratios between the cones carry colour; the overall size is
   brightness. So walk along the band adding up how far that ratio moves, and
   what you have is how much hue the band holds for that eye — how much there
   is to tell apart.

   Weighted by how much signal there is at all. Where every cone is nearly
   silent the ratios between them swing about wildly and mean nothing, and an
   unweighted walk spends most of its length out in that noise. */
const HUE_LO = 400;
const HUE_HI = 700;
const HUE_STEP = 0.5;

const hueWalk = (eye: Eye) => {
	const arc: number[] = [0];
	let total = 0;
	const at = (nm: number) => {
		const v = eyeResponse(nm, eye);
		const sum = v[0] + v[1] + v[2] || 1e-9;
		return [v[0] / sum, v[1] / sum, v[2] / sum, sum];
	};
	for (let nm = HUE_LO; nm < HUE_HI; nm += HUE_STEP) {
		const a = at(nm);
		const b = at(nm + HUE_STEP);
		const weight = Math.min(1, Math.min(a[3], b[3]) / 0.05);
		total += weight * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
		arc.push(total);
	}
	return { arc, total };
};

const HUMAN_HUE = hueWalk('human');
const MIRRORED_HUE = hueWalk('mirrored');

/** How many times our own range of hues fits into this eye's. */
export const MIRRORED_LAPS = MIRRORED_HUE.total / HUMAN_HUE.total;

const arcAt = (arc: number[], nm: number) =>
	arc[Math.min(arc.length - 1, Math.max(0, Math.round((nm - HUE_LO) / HUE_STEP)))];

/** Which wavelength is this far along our own range of hues. */
const humanHueAt = (fraction: number) => {
	const want = fraction * HUMAN_HUE.total;
	let lo = 0;
	let hi = HUMAN_HUE.arc.length - 1;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (HUMAN_HUE.arc[mid] < want) lo = mid + 1;
		else hi = mid;
	}
	return HUE_LO + lo * HUE_STEP;
};

/**
 * A colour to stand in for what the mirrored eye sees at this wavelength.
 *
 * It cannot be the real thing. That eye's cones send combinations no light can
 * make ours send — M lit with L nearly dark, which for us only ever happens
 * with S lit too — so there is nothing on a screen, and nothing in a human
 * head, that is what they see. Clipping those colours into our gamut collapses
 * exactly the differences worth showing, and washing them in flattens
 * everything to pastel; both were tried.
 *
 * So this is a tally rather than a likeness. At the wavelength where their eye
 * is a third of the way through everything it can tell apart, we show the
 * colour a third of the way through everything we can — and when they run past
 * the end of ours, the rainbow turns round and comes back rather than starting
 * over from the far end. Turning round keeps the join continuous: the first
 * lap arrives at red and the second sets off from red, so nothing snaps, and
 * the reader can still see that the same colours are being spent twice.
 * `lap` counts how many times, so the drawing can say so rather than quietly
 * letting the repeat pass for a coincidence.
 */
export function mirroredStandIn(nm: number): { nm: number; lap: number } {
	const along = arcAt(MIRRORED_HUE.arc, nm) / HUMAN_HUE.total;
	const lap = Math.floor(along);
	const into = along - lap;
	return { lap, nm: humanHueAt(lap % 2 === 0 ? into : 1 - into) };
}
