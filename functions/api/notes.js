import { getSessionUser, json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const rows = await env.DB.prepare(
    "SELECT id, name, description, image_url, gallery FROM notes ORDER BY id DESC"
  ).all();
  return json({ notes: rows.results }, {
    headers: { "Cache-Control": "no-store" }
  });
}

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const { name, description, image_url, gallery } = await request.json().catch(() => ({}));
  if (!name || !name.trim()) return json({ error: "名称不能为空" }, { status: 400 });

  const galleryStr = Array.isArray(gallery) ? JSON.stringify(gallery) : (gallery || "");

  const result = await env.DB.prepare(
    "INSERT INTO notes (name, description, image_url, gallery) VALUES (?, ?, ?, ?)"
  ).bind(name.trim(), description || "", image_url || "", galleryStr).run();

  return json({ success: true, id: result.meta.last_row_id });
}