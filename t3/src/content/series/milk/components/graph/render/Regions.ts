// A product's countries by name, from their codes, as pointing at its flags says them.
const regionName = new Intl.DisplayNames(['en'], { type: 'region' });
export const nameOf = (code: string) => regionName.of(code) ?? code;
export const said = (codes: string[]) => codes.map(nameOf).join(', ');
