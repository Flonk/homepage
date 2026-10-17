// @ts-check
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeNowrapInlineCode from "./src/plugins/rehype-nowrap-inline-code.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  // Posts that moved: a re-dated post changes its slug, and the old link
  // should still land on it.
  redirects: {
    "/blog/2026-04-16-parser-combinators": "/blog/2026-10-17-parser-combinators",
  },
  markdown: {
    shikiConfig: {
      theme: "one-dark-pro",
    },
    // Astro 7 defaults to its own markdown processor; opt back into the
    // unified/remark pipeline so remark-math and rehype-katex still run.
    // MDX inherits this, so it no longer needs its own rehypePlugins.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeNowrapInlineCode],
    }),
  },
  integrations: [
    mdx(),
    // Hidden posts carry a noindex of their own; this keeps them from being
    // announced in the first place. See `hidden` in content.config.ts.
    sitemap({ filter: (page) => !page.includes("/designsystem") && !page.includes("/qr") }),
  ],
});
