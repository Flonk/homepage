import { getStore } from "@netlify/blobs";

export default async (req) => {
  try {
    const theme = await getStore({ name: "qr", consistency: "strong" }).get("theme");
    if (theme && theme !== "martina") return new URL(`/qr/${theme}/`, req.url);
  } catch {}
};

export const config = { path: ["/qr", "/qr/"] };
