import { json } from "../../_lib/auth.js";
import { sendVerificationEmail } from "../../_lib/email.js";

export async function onRequestPost({ request, env }) {
  const { email, purpose } = await request.json().catch(() => ({}));

  if (!email || !purpose) return json({ error: "缺少参数" }, { status: 400 });

  if (purpose === "register") {
    const exists = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();
    if (exists) return json({ error: "该邮箱已注册" }, { status: 409 });
  }

  if (purpose === "reset") {
    const user = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();
    if (!user) return json({ error: "该邮箱未注册" }, { status: 404 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = Math.floor(Date.now() / 1000) + 600;

  await env.DB.prepare(
    "INSERT INTO verification_codes (email, code, purpose, expires_at) VALUES (?, ?, ?, ?) " +
    "ON CONFLICT(email) DO UPDATE SET code = excluded.code, purpose = excluded.purpose, expires_at = excluded.expires_at"
  ).bind(email, code, purpose, expires).run();

  const ok = await sendVerificationEmail(env, email, code, purpose);
  if (!ok) return json({ error: "验证码发送失败，请稍后再试" }, { status: 500 });

  return json({ success: true });
}