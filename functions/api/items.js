import { getSessionUser, json } from "../_lib/auth.js";
import { translateFields } from "../_lib/translate.js";

const COLS = "id, name, description, image_url, gallery, i18n, downloads";
const SQL_LIST = `SELECT ${COLS} FROM items ORDER BY id DESC`;
const SQL_LIST_PLAIN = "SELECT id, name, description, image_url, gallery FROM items ORDER BY id DESC";

export async function ensureItemColumns(env) {
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

export async function onRequestGet({ env }) {
  let rows;
  try {
    rows = await env.DB.prepare(SQL_LIST).all();
  } catch (e) {
    if (!/no such column/i.test(String((e && e.message) || e))) throw e;
    await ensureItemColumns(env);
    try {
      rows = await env.DB.prepare(SQL_LIST).all();
    } catch (e2) {
      // 字段建不起来时退回旧查询，保证前台不报错
      rows = await env.DB.prepare(SQL_LIST_PLAIN).all();
    }
  }
  return json({ items: rows.results }, {
    headers: { "Cache-Control": "no-store" }
  });
}

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

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

  const sql = "INSERT INTO items (name, description, content, image_url, gallery, i18n, downloads) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const run = () => env.DB.prepare(sql)
    .bind(name.trim(), description || "", content || "", image_url || "", galleryStr, i18nStr, downloadsStr)
    .run();

  let result;
  try {
    result = await run();
  } catch (e) {
    if (!/no such column/i.test(String((e && e.message) || e))) throw e;
    await ensureItemColumns(env);
    result = await run();
  }

  return json({
    success: true,
    id: result.meta.last_row_id,
    translated,
    i18n: i18nStr,
    downloads: downloadsStr
  });
}
