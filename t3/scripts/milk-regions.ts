/*
 * The regions to look for dairy products in, written to the milk graph's
 * research/regions.json: every country in ISO 3166-1, and every part of one
 * in ISO 3166-2, each part under the one it lies in. From the iso-codes
 * package's JSON (Debian's, as nixpkgs has it):
 *
 *   npx tsx scripts/milk-regions.ts "$(nix-build '<nixpkgs>' -A iso-codes --no-out-link)/share/iso-codes/json"
 */
import fs from 'node:fs';
import path from 'node:path';
import { Regions, type Region } from '../src/content/series/milk/components/graph/schema';

const dir = process.argv[2];
if (!dir) throw new Error('the iso-codes JSON folder, please');
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
const countries: { alpha_2: string; name: string; common_name?: string }[] = read('iso_3166-1.json')['3166-1'];
const parts: { code: string; name: string; type: string; parent?: string }[] = read('iso_3166-2.json')['3166-2'];
const version = path.basename(path.resolve(dir, '../../..')).replace(/^[a-z0-9]{32}-/, '');

// Each country, then its parts, each followed by the parts in it, by name.
const under = new Map<string, typeof parts>();
for (const p of parts) {
	const up = p.parent ?? p.code.slice(0, 2);
	under.set(up, [...(under.get(up) ?? []), p]);
}
const regions: Region[] = [];
const down = (id: string) => {
	for (const p of (under.get(id) ?? []).sort((a, b) => a.name.localeCompare(b.name))) {
		regions.push({ id: p.code, name: p.name, kind: p.type, parent: id });
		down(p.code);
	}
};
for (const c of [...countries].sort((a, b) => (a.common_name ?? a.name).localeCompare(b.common_name ?? b.name))) {
	regions.push({ id: c.alpha_2, name: c.common_name ?? c.name });
	down(c.alpha_2);
}

const out = Regions.parse({ source: `ISO 3166-1 and ISO 3166-2, from the iso-codes package (${version})`, regions });
const file = path.join(import.meta.dirname, '../src/content/series/milk/data/research/regions.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(out, null, '\t') + '\n');
console.log(`${regions.length} regions: ${countries.length} countries and ${parts.length} parts of them`);
