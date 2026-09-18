import { hashPassword, json } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const { email, password, code } = await request.json().catch(() => ({}));

  if (!email || !password || password.length < 6) {
    return json({ error: "邮箱或密码不合法（密码至少 6 位）" }, { status: 400 });
  }
  if (!code) return json({ error: "请输入验证码" }, { status: 400 });

  const record = await env.DB.prepare(
    "SELECT code, expires_at FROM verification_codes WHERE email = ? AND purpose = 'register'"
  ).bind(email).first();

  if (!record) return json({ error: "请先获取验证码" }, { status: 400 });
  if (Math.floor(Date.now() / 1000) > record.expires_at) {
    return json({ error: "验证码已过期，请重新获取" }, { status: 400 });
  }
  if (record.code !== code.trim()) return json({ error: "验证码错误" }, { status: 400 });

  await env.DB.prepare("DELETE FROM verification_codes WHERE email = ?").bind(email).run();

  const hash = await hashPassword(password);
  try {
    await env.DB.prepare(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)"
    ).bind(email, hash).run();
    return json({ success: true });
  } catch {
    return json({ error: "该邮箱已注册" }, { status: 409 });
  }
}