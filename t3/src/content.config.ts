import { glob } from 'astro/loaders';
import { defineCollection, type SchemaContext, z } from 'astro:content';

/*
 * Two kinds of thing, both under /blog (see src/site.ts for the addresses):
 *
 *   posts/<slug>.md(x)                       a post, on its own
 *   series/<series>/series.json              a series: its name, blurb, cover
 *   series/<series>/<NN>-<chapter>.md(x)     its chapters, in the order NN
 *   series/<series>/index.md(x)              or the one chapter at its root
 *
 * Posts and chapters are written the same way, prose or a deck; the
 * frontmatter below is theirs.
 */
const page = ({ image }: SchemaContext) =>
	z.object({
		// A chapter's own title, without its series or number, which are
		// added where it is shown alone ("Colour #1: The RGB Cube", see
		// src/site.ts). Empty for a chapter that is only its number.
		title: z.string(),
		// A chapter's number as the series names it, where that is not its place
		// in the running order: "1.6" for an aside to part 1 written later.
		part: z.string().optional(),
		// Empty when a post leaves it out, as most do: required, a post without
		// one failed the schema and was left out of the site without a word.
		description: z.string().default(''),
		// Which layout renders the post. "deck" is the split-screen format: a
		// visualization up top, swipeable cards below. See layouts/DeckPost.astro.
		// NB: not called `layout` — that is reserved by Astro markdown for a
		// layout component path, and MDX tries to import whatever it holds.
		format: z.enum(['prose', 'deck']).default('prose'),
		// Deck only: which ground the visualization half — and the masthead that
		// shares it — is painted on. A post about light wants the dark one; a
		// post about ink or screens wants the light one.
		ground: z.enum(['light', 'dark']).default('light'),
		// Deck only: how much of the deck's height the visualization takes on a
		// wide screen, in percent, the text the rest, until the reader drags the
		// line between them. Half unless set; less for a deck that is mostly
		// reading.
		deckSplit: z.number().min(20).max(80).default(50),
		// Deck only: how the two halves sit on a wide screen. "stacked", the
		// picture over the text; or "sidebar", the text down a narrow column on
		// the left and the picture taking all the rest, for a picture that is a
		// place to look around in. A phone stacks them either way.
		deckLayout: z.enum(['stacked', 'sidebar']).default('stacked'),
		// The post's own accent, any CSS colour: the chrome, the highlights and
		// --ink-accent are all worked out from it (see --accent in global.css), so
		// one colour retints the whole page while the post is open.
		accent: z.string().optional(),
		// How far round the hue the chrome turns from the accent, in degrees (see
		// --chrome-shift in global.css): 24 unless set, more for a louder sweep.
		chromeShift: z.number().optional(),
		// How strong the noise in the chrome is, as how many times its tile is
		// blended in (see Grain in global.css): 1 unless set, 0 for none. A pale
		// accent wants more, since soft light barely shows on near white.
		chromeGrain: z.number().int().min(0).max(3).optional(),
		// Kept off the index, out of the feed and out of the sitemap, and given a
		// noindex. For a post that is working material rather than writing.
		hidden: z.boolean().default(false),
		// Where the post is being talked about, its Hacker News thread: a
		// comment button at the right of the post's controls on a phone.
		hn: z.string().url().optional(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
	});

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '*.{md,mdx}' }),
	schema: page,
});

// Keyed <series>/<file>, the file's name as it is: "type-systems/01-utlc",
// "milk/index". Where that puts it, and in what order, is src/site.ts's.
const chapters = defineCollection({
	loader: glob({
		base: './src/content/series',
		pattern: '*/*.{md,mdx}',
		generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
	}),
	schema: page,
});

// Keyed by its folder's name, which is its slug.
const series = defineCollection({
	loader: glob({
		base: './src/content/series',
		pattern: '*/series.json',
		generateId: ({ entry }) => entry.split('/')[0],
	}),
	schema: z.object({
		title: z.string(),
		// Under its name on its card in the post tree.
		blurb: z.string().optional(),
		// The picture on its card: an image, or a line of TeX set by KaTeX.
		// See SeriesCover in src/series.ts.
		cover: z
			.union([
				z.object({
					src: z.string(),
					position: z.string().optional(),
					ink: z.boolean().optional(),
					// Any CSS background, or a name from BACKDROPS in src/series.ts.
					backdrop: z.string().optional(),
					// Where the picture is from, for the record.
					credit: z.string().optional(),
				}),
				z.object({ tex: z.string(), size: z.string().optional() }),
			])
			.optional(),
		// Still being written: marked so on its card.
		wip: z.boolean().default(false),
	}),
});

export const collections = { posts, chapters, series };
