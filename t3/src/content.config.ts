import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		// Posts sharing a `series` are grouped into one collapsible section on the index.
		series: z.string().optional(),
		// Which layout renders the post. "deck" is the split-screen format: a
		// visualization up top, swipeable cards below. See layouts/DeckPost.astro.
		// NB: not called `layout` — that is reserved by Astro markdown for a
		// layout component path, and MDX tries to import whatever it holds.
		format: z.enum(['prose', 'deck']).default('prose'),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
	}),
});

export const collections = { blog };
