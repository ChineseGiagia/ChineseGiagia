import { getSessionUser, json } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const productId = parseInt(formData.get("product_id"), 10);
  const version = (formData.get("version") || "").trim();
  const description = (formData.get("description") || "").trim();

  if (!file || !productId || !version) {
    return json({ error: "缺少参数" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".zip")) {
    return json({ error: "只允许上传 .zip 文件" }, { status: 400 });
  }

  // 生成唯一文件名，避免覆盖
  const safeVersion = version.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const fileName = `gc${productId}-${safeVersion}-${timestamp}.zip`;
  const path = `public/firmwares/${fileName}`;

  // 读文件转 base64
  const buffer = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);

  // 上传到 GitHub
  const ghRes = await fetch(
    `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${env.GH_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "givera-uploader",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `上传固件 ${version}`,
        content: base64,
        branch: "main"
      })
    }
  );

  if (!ghRes.ok) {
    const err = await ghRes.text();
    console.error("GitHub error:", err);
    return json({ error: "GitHub 上传失败（HTTP " + ghRes.status + "）" }, { status: 500 });
  }

  // 记数据库
  await env.DB.prepare(
    "INSERT INTO firmwares (product_id, version, description, file_name, file_size) VALUES (?, ?, ?, ?, ?)"
  ).bind(productId, version, description, fileName, file.size).run();

  return json({ success: true, file_name: fileName });
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunk = 0x8000;
  for (let i = 0; i < len; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}