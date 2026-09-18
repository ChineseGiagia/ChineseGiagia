import { hashPassword, json } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const { email, password, code } = await request.json().catch(() => ({}));

  if (!email || !password || password.length < 6) {
    return json({ error: "邮箱或密码不合法（密码至少 6 位）" }, { status: 400 });
  }
  if (!code) return json({ error: "请输入验证码" }, { status: 400 });

  const record = await env.DB.prepare(
    "SELECT code, expires_at FROM verification_codes WHERE email = ? AND purpose = 'reset'"
  ).bind(email).first();

  if (!record) return json({ error: "请先获取验证码" }, { status: 400 });
  if (Math.floor(Date.now() / 1000) > record.expires_at) {
    return json({ error: "验证码已过期，请重新获取" }, { status: 400 });
  }
  if (record.code !== code.trim()) return json({ error: "验证码错误" }, { status: 400 });

  await env.DB.prepare("DELETE FROM verification_codes WHERE email = ?").bind(email).run();

  const user = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  ).bind(email).first();
  if (!user) return json({ error: "该邮箱未注册" }, { status: 404 });

  const hash = await hashPassword(password);
  await env.DB.prepare(
    "UPDATE users SET password_hash = ? WHERE id = ?"
  ).bind(hash, user.id).run();

  return json({ success: true });
}