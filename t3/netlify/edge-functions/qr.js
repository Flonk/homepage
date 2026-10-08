import { getStore } from "@netlify/blobs";

export default async (req) => {
  try {
    const store = getStore({ name: "qr", consistency: "strong" });
    const theme = (await store.get("theme")) || "t3";
    if (theme.startsWith("link:")) {
      const links = (await store.get("links", { type: "json" })) || [];
      const link = links.find((l) => `link:${l.id}` === theme);
      if (link) return Response.redirect(link.url, 302);
      return;
    }
    if (theme !== "martina") return new URL(`/qr/${theme}/`, req.url);
  } catch {}
};

export const config = { path: ["/qr", "/qr/"] };
