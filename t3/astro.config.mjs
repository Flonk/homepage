// @ts-check
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeNowrapInlineCode from "./src/plugins/rehype-nowrap-inline-code.mjs";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
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
  integrations: [mdx(), sitemap(), react()],
});
