import { getSessionUser, json } from "../_lib/auth.js";

const COLS = "id, product_id, version, description, file_name, file_size, url";
const COLS_PLAIN = "id, product_id, version, description, file_name, file_size";

async function ensureUrlColumn(env) {
  try { await env.DB.prepare("ALTER TABLE firmwares ADD COLUMN url TEXT").run(); } catch (e) { /* 已存在 */ }
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");
  if (!productId) return json({ firmwares: [] });

  const id = parseInt(productId, 10);
  try {
    let rows;
    try {
      rows = await env.DB.prepare(`SELECT ${COLS} FROM firmwares WHERE product_id = ? ORDER BY id DESC`).bind(id).all();
    } catch (e) {
      await ensureUrlColumn(env);
      try {
        rows = await env.DB.prepare(`SELECT ${COLS} FROM firmwares WHERE product_id = ? ORDER BY id DESC`).bind(id).all();
      } catch (e2) {
        rows = await env.DB.prepare(`SELECT ${COLS_PLAIN} FROM firmwares WHERE product_id = ? ORDER BY id DESC`).bind(id).all();
      }
    }
    return json({ firmwares: rows.results }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return json({ firmwares: [] });
  }
}

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const { product_id, version, description, file_name, file_size, url } =
    await request.json().catch(() => ({}));
  if (!product_id || !version || !file_name) {
    return json({ error: "缺少必要字段" }, { status: 400 });
  }

  const sql = "INSERT INTO firmwares (product_id, version, description, file_name, file_size, url) VALUES (?, ?, ?, ?, ?, ?)";
  const run = () => env.DB.prepare(sql)
    .bind(parseInt(product_id, 10), version.trim(), description || "", file_name.trim(), file_size || 0, url || "")
    .run();

  let result;
  try {
    result = await run();
  } catch (e) {
    if (!/no such column/i.test(String((e && e.message) || e))) throw e;
    await ensureUrlColumn(env);
    result = await run();
  }

  return json({ success: true, id: result.meta.last_row_id });
}
