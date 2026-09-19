import { getSessionUser, json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const rows = await env.DB.prepare(
    "SELECT id, product_id, version, description, file_name, file_size FROM firmwares ORDER BY id DESC"
  ).all();
  return json({ firmwares: rows.results }, {
    headers: { "Cache-Control": "no-store" }
  });
}