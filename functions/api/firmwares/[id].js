 
import { getSessionUser, json } from "../../_lib/auth.js";

export async function onRequestDelete({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  await env.DB.prepare("DELETE FROM firmwares WHERE id = ?").bind(id).run();
  return json({ success: true });
}