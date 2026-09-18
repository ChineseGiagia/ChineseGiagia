import { json } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const cookie = request.headers.get("Cookie") || "";
  const m = cookie.match(/session=([^;]+)/);
  if (m) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(m[1]).run();
  }
  return json({ success: true }, {
    headers: { "Set-Cookie": "session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0" }
  });
}