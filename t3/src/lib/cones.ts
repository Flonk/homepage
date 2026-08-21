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
