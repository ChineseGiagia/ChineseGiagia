 
import { getSessionUser, json } from "../../_lib/auth.js";

export async function onRequestDelete({ request, env, params }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!id) return json({ error: "无效 ID" }, { status: 400 });

  const fw = await env.DB.prepare(
    "SELECT file_name FROM firmwares WHERE id = ?"
  ).bind(id).first();

  if (!fw) return json({ error: "未找到" }, { status: 404 });

  // 从 GitHub 删除
  const path = `public/firmwares/${fw.file_name}`;
  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${path}?ref=main`,
      {
        headers: {
          "Authorization": `Bearer ${env.GH_TOKEN}`,
          "Accept": "application/vnd.github+json",
          "User-Agent": "givera-uploader"
        }
      }
    );

    if (getRes.ok) {
      const info = await getRes.json();
      await fetch(
        `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${path}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${env.GH_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "User-Agent": "givera-uploader",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: `删除固件 ${fw.file_name}`,
            sha: info.sha,
            branch: "main"
          })
        }
      );
    }
  } catch (e) {
    console.error("GitHub 删除失败:", e);
  }

  // 不管 GitHub 删成功没，都删数据库
  await env.DB.prepare("DELETE FROM firmwares WHERE id = ?").bind(id).run();
  return json({ success: true });
}