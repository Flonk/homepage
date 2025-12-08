// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  markdown: {
    shikiConfig: {
      theme: "one-dark-pro",
    },
    remarkPlugins: [remarkMath],
  },
  integrations: [
    mdx({
      rehypePlugins: [rehypeKatex],
    }),
    sitemap(),
    react(),
  ],
});
