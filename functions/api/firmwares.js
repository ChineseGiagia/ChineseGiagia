import { getSessionUser, json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");
  if (!productId) return json({ firmwares: [] });
  try {
    const rows = await env.DB.prepare(
      "SELECT id, version, description, file_name, file_size FROM firmwares WHERE product_id = ? ORDER BY id DESC"
    ).bind(parseInt(productId, 10)).all();
    return json({ firmwares: rows.results }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return json({ firmwares: [] });
  }
}

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const { product_id, version, description, file_name, file_size } = await request.json().catch(() => ({}));
  if (!product_id || !version || !file_name) {
    return json({ error: "缺少必要字段" }, { status: 400 });
  }
  const result = await env.DB.prepare(
    "INSERT INTO firmwares (product_id, version, description, file_name, file_size) VALUES (?, ?, ?, ?, ?)"
  ).bind(parseInt(product_id, 10), version.trim(), description || "", file_name.trim(), file_size || 0).run();
  return json({ success: true, id: result.meta.last_row_id });
}