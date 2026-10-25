import { getSessionUser, json } from "../../_lib/auth.js";

// 幂等建字段：后台打开时会自动调一次，已有字段则直接跳过
export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const added = {};
  const errors = [];

  for (const [col, sql] of [
    ["i18n", "ALTER TABLE items ADD COLUMN i18n TEXT"],
    ["downloads", "ALTER TABLE items ADD COLUMN downloads TEXT"]
  ]) {
    try {
      await env.DB.prepare(sql).run();
      added[col] = true;
    } catch (e) {
      const msg = String((e && e.message) || e);
      added[col] = false;
      if (!/duplicate column|already exists/i.test(msg)) errors.push(`${col}: ${msg}`);
    }
  }

  return json({ success: !errors.length, added, error: errors.length ? errors.join("; ") : null });
}
