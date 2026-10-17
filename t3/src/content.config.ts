import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) => z.object({
		title: z.string(),
		// Empty when a post leaves it out, as most do: required, a post without
		// one failed the schema and was left out of the site without a word.
		description: z.string().default(''),
		// Posts sharing a `series` are grouped into one collapsible section on the index.
		series: z.string().optional(),
		// Which layout renders the post. "deck" is the split-screen format: a
		// visualization up top, swipeable cards below. See layouts/DeckPost.astro.
		// NB: not called `layout` — that is reserved by Astro markdown for a
		// layout component path, and MDX tries to import whatever it holds.
		format: z.enum(['prose', 'deck']).default('prose'),
		// Deck only: which ground the visualization half — and the masthead that
		// shares it — is painted on. A post about light wants the dark one; a
		// post about ink or screens wants the light one.
		ground: z.enum(['light', 'dark']).default('light'),
		// The post's own accent, any CSS colour: the chrome, the highlights and
		// --ink-accent are all worked out from it (see --accent in global.css), so
		// one colour retints the whole page while the post is open.
		accent: z.string().optional(),
		// How far round the hue the chrome turns from the accent, in degrees (see
		// --chrome-shift in global.css): 24 unless set, more for a louder sweep.
		chromeShift: z.number().optional(),
		// Kept off the index, out of the feed and out of the sitemap, and given a
		// noindex. For a post that is working material rather than writing.
		hidden: z.boolean().default(false),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
	}),
});

export const collections = { blog };
