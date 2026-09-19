import { getSessionUser, json } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const { data } = await request.json().catch(() => ({}));
  if (!data) return json({ error: "缺少图片数据" }, { status: 400 });

  // 解析 dataURL: "data:image/png;base64,xxxx"
  const m = data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) return json({ error: "图片格式错误" }, { status: 400 });

  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const base64 = m[2];

  // 检查大小（base64 每 4 字符代表 3 字节，实际大小 ≈ base64.length * 0.75）
  const approxBytes = Math.floor(base64.length * 0.75);
  if (approxBytes > 1024 * 1024) {
    return json({ error: "图片过大（压缩后仍超过 1MB），请换小图" }, { status: 413 });
  }

  const filename = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `public/uploads/${filename}`;

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
      body: JSON.stringify({
        message: `Upload ${filename}`,
        content: base64,
        branch: "main"
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("GitHub upload error:", err);
    return json({ error: "上传失败，请检查配置" }, { status: 500 });
  }

  return json({ success: true, url: `/uploads/${filename}` });
}