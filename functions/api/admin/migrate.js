import { getSessionUser, json } from "../../_lib/auth.js";

// 幂等建字段：后台打开时会自动调一次，已有该字段则直接返回 success
export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  let added = false;
  let error = null;
  try {
    await env.DB.prepare("ALTER TABLE items ADD COLUMN i18n TEXT").run();
    added = true;
  } catch (e) {
    const msg = String((e && e.message) || e);
    if (!/duplicate column|already exists/i.test(msg)) error = msg;
  }

  return json({ success: !error, added, error });
}
