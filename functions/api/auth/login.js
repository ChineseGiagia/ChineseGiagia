import { verifyPassword, json } from "../../_lib/auth.js";

const ADMIN_EMAIL = "Givera";
const ADMIN_PASSWORD = "*#231651a";

export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) return json({ error: "缺少参数" }, { status: 400 });

  const token = crypto.randomUUID();
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const cookieStr = `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60*60*24*7}`;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    await env.DB.prepare(
      "INSERT INTO sessions (token, role, email, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(token, "admin", email, expires).run();
    return json({ success: true, redirect: "/admin/", role: "admin" },
      { headers: { "Set-Cookie": cookieStr } });
  }

  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).bind(email).first();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return json({ error: "账号或密码错误" }, { status: 401 });
  }

  await env.DB.prepare(
    "INSERT INTO sessions (token, role, email, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(token, "user", email, expires).run();
  return json({ success: true, redirect: "/user/", role: "user" },
    { headers: { "Set-Cookie": cookieStr } });
}