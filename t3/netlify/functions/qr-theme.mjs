import { getStore } from "@netlify/blobs";

const THEMES = ["works", "martina"];
const HASH = "9d560b0133d32146d9dabf7ab7e7680fc28e8a5122161912dffc44bc0e600b24";

const hashed = async (text) =>
  Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(text ?? "")))).toString("hex");

export default async (req) => {
  const store = getStore({ name: "qr", consistency: "strong" });
  if (req.method === "GET") return Response.json({ theme: (await store.get("theme")) || "martina", themes: THEMES });
  if (req.method !== "POST") return new Response(null, { status: 405 });
  const { password, theme } = await req.json().catch(() => ({}));
  if ((await hashed(password)) !== HASH) return Response.json({ error: "wrong password" }, { status: 401 });
  if (theme === undefined) return Response.json({ ok: true });
  if (!THEMES.includes(theme)) return Response.json({ error: "no such theme" }, { status: 400 });
  await store.set("theme", theme);
  return Response.json({ ok: true, theme });
};

export const config = { path: "/api/qr-theme" };
