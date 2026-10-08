import { getStore } from "@netlify/blobs";

const THEMES = ["t3", "works", "martina", "rickroll"];
const HASH = "9d560b0133d32146d9dabf7ab7e7680fc28e8a5122161912dffc44bc0e600b24";

const hashed = async (text) =>
  Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(text ?? "")))).toString("hex");

const linkUrl = (text) => {
  try {
    const url = new URL(String(text ?? "").trim());
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

export default async (req) => {
  const store = getStore({ name: "qr", consistency: "strong" });
  const links = (await store.get("links", { type: "json" })) || [];
  const state = async () => ({ theme: (await store.get("theme")) || "t3", themes: THEMES, links });
  if (req.method === "GET") return Response.json(await state());
  if (req.method !== "POST") return new Response(null, { status: 405 });
  const { password, theme, add, remove } = await req.json().catch(() => ({}));
  if ((await hashed(password)) !== HASH) return Response.json({ error: "wrong password" }, { status: 401 });

  if (add) {
    const url = linkUrl(add.url);
    const name = String(add.name ?? "").trim().slice(0, 60);
    if (!url || !name) return Response.json({ error: "need a name and an http(s) url" }, { status: 400 });
    links.push({ id: crypto.randomUUID().slice(0, 8), name, url });
    await store.setJSON("links", links);
    return Response.json({ ok: true, ...(await state()) });
  }

  if (remove) {
    const kept = links.filter((l) => l.id !== remove);
    await store.setJSON("links", kept);
    if ((await store.get("theme")) === `link:${remove}`) await store.set("theme", "t3");
    links.splice(0, links.length, ...kept);
    return Response.json({ ok: true, ...(await state()) });
  }

  if (theme === undefined) return Response.json({ ok: true });
  const known = THEMES.includes(theme) || links.some((l) => `link:${l.id}` === theme);
  if (!known) return Response.json({ error: "no such theme" }, { status: 400 });
  await store.set("theme", theme);
  return Response.json({ ok: true, theme });
};

export const config = { path: "/api/qr-theme" };
