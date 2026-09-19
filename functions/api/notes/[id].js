import { getSessionUser, json } from "../../_lib/auth.js";

export async function onRequestGet({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  const row = await env.DB.prepare(
    "SELECT id, name, description, image_url, gallery FROM notes WHERE id = ?"
  ).bind(id).first();
  if (!row) return json({ error: "未找到" }, { status: 404 });
  return json(row);
}

export async function onRequestPut({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  const { name, description, image_url, gallery } = await request.json().catch(() => ({}));
  if (!name || !name.trim()) return json({ error: "名称不能为空" }, { status: 400 });

  const galleryStr = Array.isArray(gallery) ? JSON.stringify(gallery) : (gallery || "");

  await env.DB.prepare(
    "UPDATE notes SET name = ?, description = ?, image_url = ?, gallery = ?, updated_at = unixepoch() WHERE id = ?"
  ).bind(name.trim(), description || "", image_url || "", galleryStr, id).run();

  return json({ success: true });
}

export async function onRequestDelete({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  await env.DB.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
  return json({ success: true });
}