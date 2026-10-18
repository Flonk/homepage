// @ts-check
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { readFileSync, writeFileSync } from "node:fs";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeNowrapInlineCode from "./src/plugins/rehype-nowrap-inline-code.mjs";

// Every address the blog has had, to where it is now: old path → new path,
// both with their trailing slash. See src/site.ts for where things live.
const moved = JSON.parse(readFileSync(new URL("./src/redirects.json", import.meta.url), "utf8"));

/*
 * The same redirects for Netlify, as real 301s. Astro's own are pages that
 * send the browser on with a meta refresh, which can lose the fragment on
 * the way, and a deck keeps its card there (/blog/<deck>/#3); a 301 keeps
 * it. Forced (!), since Astro's page is still there at the old path. Each
 * old path both with and without its slash.
 */
const netlifyRedirects = {
  name: "netlify-redirects",
  hooks: {
    "astro:build:done": ({ dir }) => {
      const lines = Object.entries(moved).flatMap(([from, to]) => [
        `${from.replace(/\/$/, "")}  ${to}  301!`,
        `${from}  ${to}  301!`,
      ]);
      writeFileSync(new URL("_redirects", dir), lines.join("\n") + "\n");
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  // Posts that moved, for wherever Netlify's _redirects are not read, such as
  // `astro preview`. The old link should still land on the post.
  redirects: Object.fromEntries(
    Object.entries(moved).map(([from, to]) => [from.replace(/\/$/, ""), to]),
  ),
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
    netlifyRedirects,
    mdx(),
    // Hidden posts carry a noindex of their own; this keeps them from being
    // announced in the first place. See `hidden` in content.config.ts.
    sitemap({ filter: (page) => !page.includes("/designsystem") && !page.includes("/qr") }),
  ],
});
