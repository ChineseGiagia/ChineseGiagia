import { getSessionUser, json } from "../../_lib/auth.js";

export async function onRequestDelete({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  let row;
  try {
    row = await env.DB.prepare("SELECT file_name, url FROM firmwares WHERE id = ?").bind(id).first();
  } catch (e) {
    row = await env.DB.prepare("SELECT file_name FROM firmwares WHERE id = ?").bind(id).first();
  }
  if (!row) return json({ error: "记录不存在" }, { status: 404 });

  let ghDeleted = false;
  let ghError = "";

  // url 形如 /downloads/xxx.exe 的文件在仓库里，可以一并删掉；
  // https://github.com/.../releases/... 的附件需要到 Releases 里手动删
  const target = row.url || (row.file_name ? "/firmwares/" + row.file_name : "");

  if (target.startsWith("/")) {
    const path = ("public/" + target.replace(/^\/+/, "")).replace(/\/{2,}/g, "/");
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${path}`,
        {
          headers: {
            "Authorization": `Bearer ${env.GH_TOKEN}`,
            "User-Agent": "givera-website",
            "Accept": "application/vnd.github+json"
          }
        }
      );

      if (getRes.ok) {
        const info = await getRes.json();
        const delRes = await fetch(
          `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${path}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${env.GH_TOKEN}`,
              "Content-Type": "application/json",
              "User-Agent": "givera-website",
              "Accept": "application/vnd.github+json"
            },
            body: JSON.stringify({
              message: `Delete resource ${path}`,
              sha: info.sha,
              branch: "main"
            })
          }
        );
        ghDeleted = delRes.ok;
        if (!delRes.ok) ghError = "GitHub 删除失败（HTTP " + delRes.status + "）";
      } else if (getRes.status === 404) {
        ghDeleted = true; // 文件已经不在了，视为成功
      } else {
        ghError = "读取文件信息失败（HTTP " + getRes.status + "）";
      }
    } catch (e) {
      ghError = "网络错误：" + e.message;
    }
  } else if (target) {
    ghError = "该文件托管在 GitHub Releases，站点不会自动删除，需要到 Releases 里手动删";
  }

  await env.DB.prepare("DELETE FROM firmwares WHERE id = ?").bind(id).run();

  return json({
    success: true,
    gh_deleted: ghDeleted,
    gh_error: ghError || null
  });
}
