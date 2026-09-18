export async function sendVerificationEmail(env, to, code, purpose) {
  const subject = purpose === "register" ? "注册验证码" : "重置密码验证码";
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0e1a;color:#e8eef7;border-radius:16px;">
      <h2 style="color:#4fc3f7;font-weight:normal;letter-spacing:3px;">Givera 嘉雅科技</h2>
      <p style="font-size:15px;color:#b8c6dc;">你的${purpose === "register" ? "注册" : "密码重置"}验证码是：</p>
      <div style="font-size:36px;font-weight:bold;color:#7c9cff;letter-spacing:8px;text-align:center;padding:24px;background:rgba(20,32,56,0.8);border-radius:12px;margin:20px 0;">
        ${code}
      </div>
      <p style="font-size:13px;color:#7a8ba8;">验证码 10 分钟内有效，请勿泄露给他人。</p>
      <p style="font-size:12px;color:#4a5878;margin-top:30px;">© 2026 Givera 嘉雅科技</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: "Givera <noreply@givera.qzz.io>",
      to: [to],
      subject: subject,
      html: html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return false;
  }
  return true;
}