import { getSessionUser, json } from "../../_lib/auth.js";

export async function onRequestDelete({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  // 先查文件信息
  const row = await env.DB.prepare(
    "SELECT file_name FROM firmwares WHERE id = ?"
  ).bind(id).first();

  if (!row) return json({ error: "记录不存在" }, { status: 404 });

  let ghDeleted = false;
  let ghError = "";

  // 尝试删 GitHub 上的文件
  if (row.file_name) {
    const safeName = row.file_name.replace(/[^\w.\-]/g, "_");
    const path = `public/firmwares/${safeName}`;

    try {
      // 先获取文件 SHA
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
        const fileInfo = await getRes.json();
        // 删除文件
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
              message: `Delete firmware ${safeName}`,
              sha: fileInfo.sha,
              branch: "main"
            })
          }
        );
        ghDeleted = delRes.ok;
        if (!delRes.ok) ghError = "GitHub 删除失败（HTTP " + delRes.status + "）";
      } else if (getRes.status === 404) {
        // 文件已经不存在，当作删除成功
        ghDeleted = true;
      } else {
        ghError = "读取文件信息失败（HTTP " + getRes.status + "）";
      }
    } catch (e) {
      ghError = "网络错误：" + e.message;
    }
  }

  // 无论 GitHub 是否删除成功，都删数据库记录
  await env.DB.prepare("DELETE FROM firmwares WHERE id = ?").bind(id).run();

  return json({
    success: true,
    gh_deleted: ghDeleted,
    gh_error: ghError || null
  });
}