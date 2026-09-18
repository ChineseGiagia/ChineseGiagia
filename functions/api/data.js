import { getSessionUser, json } from "../_lib/auth.js";

export async function onRequestGet({ env }) {
  const rows = await env.DB.prepare("SELECT key, value FROM site_data").all();
  const obj = {};
  rows.results.forEach(r => { obj[r.key] = r.value; });
  return json(obj, {
    headers: { "Cache-Control": "no-store" }
  });
}

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: "未登录" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const entries = Object.entries(body);
  if (!entries.length) return json({ error: "无数据" }, { status: 400 });

  const stmts = entries.map(([k, v]) =>
    env.DB.prepare(
      "INSERT INTO site_data (key, value, updated_at) VALUES (?, ?, unixepoch()) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()"
    ).bind(k, String(v))
  );
  await env.DB.batch(stmts);
  return json({ success: true });
}