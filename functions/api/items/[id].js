import { getSessionUser, json } from "../../_lib/auth.js";
import { translateFields } from "../../_lib/translate.js";

const COLS = "id, name, description, content, image_url, gallery, i18n, downloads";
const SQL_ONE = `SELECT ${COLS} FROM items WHERE id = ?`;
const SQL_ONE_PLAIN = "SELECT id, name, description, content, image_url, gallery FROM items WHERE id = ?";

async function ensureColumns(env) {
  for (const sql of [
    "ALTER TABLE items ADD COLUMN i18n TEXT",
    "ALTER TABLE items ADD COLUMN downloads TEXT"
  ]) {
    try { await env.DB.prepare(sql).run(); } catch (e) { /* 已存在 */ }
  }
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  let obj = value;
  if (typeof value === "string") {
    try { obj = JSON.parse(value); } catch (e) { return fallback; }
  }
  return obj == null ? fallback : obj;
}

function jsonArg(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value == null ? [] : value);
}

export async function onRequestGet({ env, params }) {
  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  let row;
  try {
    row = await env.DB.prepare(SQL_ONE).bind(id).first();
  } catch (e) {
    if (!/no such column/i.test(String((e && e.message) || e))) throw e;
    await ensureColumns(env);
    try {
      row = await env.DB.prepare(SQL_ONE).bind(id).first();
    } catch (e2) {
      row = await env.DB.prepare(SQL_ONE_PLAIN).bind(id).first();
    }
  }
  if (!row) return json({ error: "产品不存在" }, { status: 404 });
  return json(row, { headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPut({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  const { name, description, content, image_url, gallery, i18n, downloads, autoTranslate } =
    await request.json().catch(() => ({}));
  if (!name || !name.trim()) return json({ error: "名称不能为空" }, { status: 400 });

  const galleryStr = Array.isArray(gallery) ? JSON.stringify(gallery) : (gallery || "");
  const downloadsStr = jsonArg(parseJson(downloads, []));

  let i18nObj = parseJson(i18n, {});
  if (!i18nObj || typeof i18nObj !== "object") i18nObj = {};
  let translated = false;
  if (autoTranslate || !Object.keys(i18nObj).length) {
    const tr = await translateFields(env, { name, description, content });
    if (Object.keys(tr).length) {
      i18nObj = Object.assign({}, tr, i18nObj);
      translated = true;
    }
  }
  const i18nStr = JSON.stringify(i18nObj);

  const sql = "UPDATE items SET name = ?, description = ?, content = ?, image_url = ?, gallery = ?, i18n = ?, downloads = ?, updated_at = unixepoch() WHERE id = ?";
  const run = () => env.DB.prepare(sql)
    .bind(name.trim(), description || "", content || "", image_url || "", galleryStr, i18nStr, downloadsStr, id)
    .run();

  try {
    await run();
  } catch (e) {
    if (!/no such column/i.test(String((e && e.message) || e))) throw e;
    await ensureColumns(env);
    await run();
  }

  return json({ success: true, translated, i18n: i18nStr, downloads: downloadsStr });
}

export async function onRequestDelete({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  await env.DB.prepare("DELETE FROM items WHERE id = ?").bind(id).run();
  return json({ success: true });
}
