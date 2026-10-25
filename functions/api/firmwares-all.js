import { getSessionUser, json } from "../_lib/auth.js";

const COLS = "id, product_id, version, description, file_name, file_size, url";
const COLS_PLAIN = "id, product_id, version, description, file_name, file_size";

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  let rows;
  try {
    rows = await env.DB.prepare(`SELECT ${COLS} FROM firmwares ORDER BY id DESC`).all();
  } catch (e) {
    try { await env.DB.prepare("ALTER TABLE firmwares ADD COLUMN url TEXT").run(); } catch (err) { /* 已存在 */ }
    try {
      rows = await env.DB.prepare(`SELECT ${COLS} FROM firmwares ORDER BY id DESC`).all();
    } catch (e2) {
      rows = await env.DB.prepare(`SELECT ${COLS_PLAIN} FROM firmwares ORDER BY id DESC`).all();
    }
  }

  return json({ firmwares: rows.results }, {
    headers: { "Cache-Control": "no-store" }
  });
}
