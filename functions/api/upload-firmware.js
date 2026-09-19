import { getSessionUser, json } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const { name, data } = await request.json().catch(() => ({}));
  if (!name || !data) return json({ error: "缺少文件" }, { status: 400 });

  // data 是 base64（不带 dataURL 前缀）
  const approxBytes = Math.floor(data.length * 0.75);
  if (approxBytes > 20 * 1024 * 1024) {
    return json({ error: "文件过大（超过 20MB）" }, { status: 413 });
  }

  // 清洗文件名
  const safeName = name.replace(/[^\w.\-]/g, "_");
  const path = `public/firmwares/${safeName}`;

  // 先查文件是否已存在（拿 SHA）
  let sha = null;
  const check = await fetch(
    `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${path}`,
    { headers: {
      "Authorization": `Bearer ${env.GH_TOKEN}`,
      "User-Agent": "givera-website",
      "Accept": "application/vnd.github+json"
    }}
  );
  if (check.ok) {
    const j = await check.json();
    sha = j.sha;
  }

  const body = { message: `Upload firmware ${safeName}`, content: data, branch: "main" };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${env.GH_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "givera-website",
        "Accept": "application/vnd.github+json"
      },
      body: JSON.stringify(body)
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("GitHub upload error:", err);
    return json({ error: "上传失败：" + res.status }, { status: 500 });
  }

  return json({ success: true, file_name: safeName, file_size: approxBytes });
}