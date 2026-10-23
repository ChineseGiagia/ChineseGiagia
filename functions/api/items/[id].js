import { getSessionUser, json } from "../../_lib/auth.js";
import { translateFields } from "../../_lib/translate.js";

const SQL_ONE = "SELECT id, name, description, content, image_url, gallery, i18n FROM items WHERE id = ?";
const SQL_ONE_PLAIN = "SELECT id, name, description, content, image_url, gallery FROM items WHERE id = ?";

function parseI18n(value) {
  if (!value) return {};
  let obj = value;
  if (typeof value === "string") {
    try { obj = JSON.parse(value); } catch (e) { return {}; }
  }
  return obj && typeof obj === "object" ? obj : {};
}

export async function onRequestGet({ env, params }) {
  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  let row;
  try {
    row = await env.DB.prepare(SQL_ONE).bind(id).first();
  } catch (e) {
    row = await env.DB.prepare(SQL_ONE_PLAIN).bind(id).first();
  }
  if (!row) return json({ error: "产品不存在" }, { status: 404 });
  return json(row, { headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPut({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  const { name, description, content, image_url, gallery, i18n, autoTranslate } =
    await request.json().catch(() => ({}));
  if (!name || !name.trim()) return json({ error: "名称不能为空" }, { status: 400 });

  const galleryStr = Array.isArray(gallery) ? JSON.stringify(gallery) : (gallery || "");

  let i18nObj = parseI18n(i18n);
  let translated = false;
  if (autoTranslate || !Object.keys(i18nObj).length) {
    const tr = await translateFields(env, { name, description, content });
    if (Object.keys(tr).length) {
      i18nObj = Object.assign({}, tr, i18nObj);
      translated = true;
    }
  }
  const i18nStr = JSON.stringify(i18nObj);

  const sql = "UPDATE items SET name = ?, description = ?, content = ?, image_url = ?, gallery = ?, i18n = ?, updated_at = unixepoch() WHERE id = ?";
  const run = () => env.DB.prepare(sql)
    .bind(name.trim(), description || "", content || "", image_url || "", galleryStr, i18nStr, id)
    .run();

  try {
    await run();
  } catch (e) {
    if (!/no such column/i.test(String((e && e.message) || e))) throw e;
    try { await env.DB.prepare("ALTER TABLE items ADD COLUMN i18n TEXT").run(); } catch (err) {}
    await run();
  }

  return json({ success: true, translated, i18n: i18nStr });
}

export async function onRequestDelete({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  await env.DB.prepare("DELETE FROM items WHERE id = ?").bind(id).run();
  return json({ success: true });
}
