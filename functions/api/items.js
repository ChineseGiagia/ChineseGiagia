import { getSessionUser, json } from "../_lib/auth.js";

export async function onRequestGet({ env }) {
  const rows = await env.DB.prepare(
    "SELECT id, name, description, image_url FROM items ORDER BY id DESC"
  ).all();
  return json({ items: rows.results }, {
    headers: { "Cache-Control": "no-store" }
  });
}

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const { name, description, content, image_url } = await request.json().catch(() => ({}));
  if (!name || !name.trim()) return json({ error: "名称不能为空" }, { status: 400 });

  const result = await env.DB.prepare(
    "INSERT INTO items (name, description, content, image_url) VALUES (?, ?, ?, ?)"
  ).bind(name.trim(), description || "", content || "", image_url || "").run();

  return json({ success: true, id: result.meta.last_row_id });
}