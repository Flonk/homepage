import type { Range } from '../schema';

/* A Range as it is said: "~18°C", "2–4°C", "≥85%", "6 h–4 days"; each end
   in the unit that suits it, the unit said once where both share it. */
export const said = ({ min, max, about }: Range, unitOf: (x: number) => [number, string]) => {
	const say = (x: number) => {
		const [v, unit] = unitOf(x);
		return [`${+v.toPrecision(2)}`.replace('-', '−'), unit];
	};
	if (min === undefined || max === undefined) {
		const [v, unit] = say((min ?? max)!);
		return `${min === undefined ? '≤' : '≥'}${v}${unit}`;
	}
	const [a, ua] = say(min);
	const [b, ub] = say(max);
	return `${about ? '~' : ''}${min === max ? `${a}${ua}` : ua === ub ? `${a}–${b}${ua}` : `${a}${ua}–${b}${ub}`}`;
};
export const inUnit = (unit: string) => (x: number): [number, string] => [x, unit];
// Seconds in the unit that reads best, as a recipe would say it, in words where there is room.
export const inTime = (s: number): [number, string] => {
	const [v, unit] = s < 120 ? [s, 's'] : s < 7200 ? [s / 60, 'min'] : s < 172800 ? [s / 3600, 'h'] : s < 7776000 ? [s / 86400, 'day'] : s < 63072000 ? [s / 2592000, 'month'] : [s / 31536000, 'year'];
	return [v, ` ${unit}${['day', 'month', 'year'].includes(unit) && +v.toPrecision(2) !== 1 ? 's' : ''}`];
};
