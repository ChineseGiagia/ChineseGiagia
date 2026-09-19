import { json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");
  if (!productId) return json({ firmwares: [] });

  try {
    const rows = await env.DB.prepare(
      "SELECT id, version, description, file_name, file_size FROM firmwares WHERE product_id = ? ORDER BY id DESC"
    ).bind(parseInt(productId, 10)).all();
    return json({ firmwares: rows.results }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (e) {
    return json({ firmwares: [] });
  }
}