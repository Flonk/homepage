/**
 * Every link the blog has handed out still lands on the page it meant.
 *
 * fixtures/live-urls-2026-10-18.json is every /blog address the site served
 * on the day posts and series moved to their own folders (taken from a build
 * of the site as it was). Each must still be a page, or be sent on to one by
 * a 301, which is what Netlify serves from _redirects; a 301 keeps the #card
 * a deck link carries. Astro's meta-refresh page at the old address, for
 * `astro preview`, must agree.
 *
 * Runs against a fresh build (or the one in $DIST, if set).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import live from './fixtures/live-urls-2026-10-18.json';
import moved from '../src/redirects.json';

let dist: string;
let netlify: Map<string, { to: string; status: string }>;

beforeAll(() => {
	dist = process.env.DIST ?? mkdtempSync(path.join(tmpdir(), 'blog-dist-'));
	if (!process.env.DIST)
		execFileSync('npx', ['astro', 'build', '--outDir', dist], { stdio: 'ignore', cwd: path.join(__dirname, '..') });
	netlify = new Map(
		readFileSync(path.join(dist, '_redirects'), 'utf8')
			.trim()
			.split('\n')
			.map((line) => line.trim().split(/\s+/))
			.map(([from, to, status]) => [from, { to, status }]),
	);
}, 300_000);

// Every page carries the whole post tree, so the same few addresses are asked
// after thousands of times: each read once.
const read = new Map<string, string | null>();
const html = (url: string) => {
	if (!read.has(url)) {
		const file = path.join(dist, url, 'index.html');
		read.set(url, existsSync(file) ? readFileSync(file, 'utf8') : null);
	}
	return read.get(url)!;
};
const refreshTo = (doc: string) => doc.match(/http-equiv="refresh" content="\d+;url=([^"]+)"/)?.[1];
/** A page of its own at the address, not a redirect. */
const isPage = (url: string) => {
	const doc = html(url);
	return doc !== null && refreshTo(doc) === undefined;
};

describe('every address live on 2026-10-18', () => {
	it.each(live)('%s', (url) => {
		if (isPage(url)) return;
		const to = (moved as Record<string, string>)[url];
		expect(to, 'neither a page nor in src/redirects.json').toBeDefined();
		expect(isPage(to), `${to} is not a page`).toBe(true);
		// Netlify: a forced 301, with and without the trailing slash.
		for (const from of [url, url.replace(/\/$/, '')])
			expect(netlify.get(from), `_redirects for ${from}`).toEqual({ to, status: '301!' });
		// astro preview: the meta-refresh page left at the old address.
		expect(refreshTo(html(url) ?? '')).toBe(to);
	});
});

describe('src/redirects.json', () => {
	it.each(Object.entries(moved))('%s → %s lands on a page in one hop', (from, to) => {
		expect(isPage(to)).toBe(true);
		expect(isPage(from), `${from} is a page as well as a redirect`).toBe(false);
	});
});

describe('links between pages', () => {
	const files = (dir: string): string[] =>
		readdirSync(dir).flatMap((f) => {
			const p = path.join(dir, f);
			return statSync(p).isDirectory() ? files(p) : p.endsWith('.html') ? [p] : [];
		});

	it('every /blog link in the built site goes straight to a page', () => {
		const broken = new Set<string>();
		for (const file of files(dist)) {
			const doc = readFileSync(file, 'utf8');
			if (refreshTo(doc)) continue;
			for (const [, href] of doc.matchAll(/href="(\/blog\/[^"#?]*)/g)) {
				const url = href.endsWith('/') ? href : `${href}/`;
				// A series without an index sends its reader on, which is fine.
				const on = refreshTo(html(url) ?? '');
				const lands = isPage(url) || (on !== undefined && isPage(on));
				if (!lands || url in moved) broken.add(`${path.relative(dist, file)} → ${href}`);
			}
		}
		expect([...broken]).toEqual([]);
	});
});
