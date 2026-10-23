import { getSessionUser, json } from "../_lib/auth.js";
import { translateFields } from "../_lib/translate.js";

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "admin") return json({ error: "无权限" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = body.name || "";
  const description = body.description || "";
  const content = body.content || "";

  if (!String(name).trim() && !String(description).trim() && !String(content).trim()) {
    return json({ error: "没有可翻译的内容" }, { status: 400 });
  }

  const translations = await translateFields(env, { name, description, content }, body.langs);
  return json({
    success: true,
    engine: env.AI ? "workers-ai" : "mymemory",
    translations
  });
}
