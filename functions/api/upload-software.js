import { getSessionUser, json } from "../_lib/auth.js";

// 安装包上传：按大小自动分流
//   ≤ 20MB  → 提交进仓库 public/downloads/（走 Pages 部署）
//   > 20MB  → 自动上传到 GitHub Releases 的 software-assets 版本（不占 Pages、不进仓库）
// Functions 单请求内存有限，经中转的上限设为 60MB；更大的文件请手动上传 Release 后粘贴链接
const REPO_MAX = 20 * 1024 * 1024;
const RELEASE_MAX = 60 * 1024 * 1024;
const RELEASE_TAG = "software-assets";
const ALLOWED = ["exe", "msi", "zip", "7z", "rar", "dmg", "pkg", "apk", "deb", "appimage", "bin", "tar", "gz", "iso"];

const API = "https://api.github.com";
const UPLOADS = "https://uploads.github.com";

function ghHeaders(env, extra) {
  return Object.assign({
    "Authorization": `Bearer ${env.GH_TOKEN}`,
    "User-Agent": "givera-website",
    "Accept": "application/vnd.github+json"
  }, extra || {});
}

function repoUrl(env, path) {
  return `${API}/repos/${env.GH_OWNER}/${env.GH_REPO}${path}`;
}

function tooBigMsg() {
  return `文件超过 ${Math.round(RELEASE_MAX / 1048576)}MB，请手动上传到 GitHub Releases 后粘贴链接`;
}

// 找到（或创建）用于放安装包的 Release
async function ensureRelease(env) {
  const found = await fetch(repoUrl(env, `/releases/tags/${RELEASE_TAG}`), { headers: ghHeaders(env) });
  if (found.ok) {
    const data = await found.json();
    return data.id;
  }
  if (found.status !== 404) throw new Error("读取 Releases 失败（HTTP " + found.status + "）");

  const created = await fetch(repoUrl(env, "/releases"), {
    method: "POST",
    headers: ghHeaders(env, { "Content-Type": "application/json" }),
    body: JSON.stringify({
      tag_name: RELEASE_TAG,
      name: "软件安装包",
      body: "由网站后台自动上传的软件安装包。",
      prerelease: true
    })
  });
  if (!created.ok) {
    const text = await created.text();
    console.error("create release error:", text);
    throw new Error("创建 Releases 失败（HTTP " + created.status + "）");
  }
  return (await created.json()).id;
}

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const url = new URL(request.url);
  const original = url.searchParams.get("name") || "";
  if (!original) return json({ error: "缺少文件名" }, { status: 400 });

  const declared = parseInt(request.headers.get("content-length") || "0", 10);
  if (declared > RELEASE_MAX) return json({ error: tooBigMsg() }, { status: 413 });

  const m = String(original).match(/\.([a-z0-9]{1,10})$/i);
  const ext = m ? m[1].toLowerCase() : "";
  if (!ALLOWED.includes(ext)) return json({ error: "不支持的文件类型：" + (ext || "无扩展名") }, { status: 400 });

  const buf = await request.arrayBuffer();
  const size = buf.byteLength;
  if (!size) return json({ error: "文件为空" }, { status: 400 });
  if (size > RELEASE_MAX) return json({ error: tooBigMsg() }, { status: 413 });

  const base = String(original)
    .replace(/\.[^.]*$/, "")
    .replace(/[^\w.-]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "software";
  const fileName = `${base}-${Date.now()}.${ext}`;

  /* ---------- 小文件：进仓库 ---------- */
  if (size <= REPO_MAX) {
    const path = `public/downloads/${fileName}`;
    const res = await fetch(repoUrl(env, `/contents/${path}`), {
      method: "PUT",
      headers: ghHeaders(env, { "Content-Type": "application/json" }),
      body: JSON.stringify({
        message: `Upload software ${fileName}`,
        content: toBase64(buf),
        branch: "main"
      })
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("repo upload error:", err);
      return json({ error: "上传失败，请检查配置" }, { status: 500 });
    }
    return json({
      success: true,
      storage: "repo",
      url: `/downloads/${fileName}`,
      file_name: fileName,
      file_size: size,
      original_name: original
    });
  }

  /* ---------- 大文件：进 Releases ---------- */
  let releaseId;
  try {
    releaseId = await ensureRelease(env);
  } catch (e) {
    console.error("ensureRelease error:", e);
    return json({ error: e.message || "创建 Releases 失败" }, { status: 500 });
  }

  const up = await fetch(
    `${UPLOADS}/repos/${env.GH_OWNER}/${env.GH_REPO}/releases/${releaseId}/assets?name=${encodeURIComponent(fileName)}`,
    {
      method: "POST",
      headers: ghHeaders(env, { "Content-Type": "application/octet-stream" }),
      body: buf
    }
  );

  if (!up.ok) {
    const err = await up.text();
    console.error("release upload error:", err);
    return json({ error: "上传到 Releases 失败（HTTP " + up.status + "）" }, { status: 500 });
  }

  const asset = await up.json();
  return json({
    success: true,
    storage: "release",
    url: asset.browser_download_url,
    file_name: asset.name || fileName,
    file_size: asset.size || size,
    original_name: original
  });
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
