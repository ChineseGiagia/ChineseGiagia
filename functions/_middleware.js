import { getSessionUser } from "./_lib/auth.js";

// 归一化路径：解码、统一分隔符、消掉 . 与 .. 段，防止 /ad%6din/、//admin、/./admin 之类的写法绕过
function normalizePath(pathname) {
  let p = pathname || "/";
  try { p = decodeURIComponent(p); } catch {}
  p = p.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
  if (!p.startsWith("/")) p = "/" + p;
  try { p = new URL(p, "https://placeholder.invalid").pathname; } catch {}
  return p.toLowerCase();
}

function redirectToLogin(request) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL("/login", request.url).toString(),
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const path = normalizePath(new URL(request.url).pathname);

  const needsAdmin = path === "/admin" || path.startsWith("/admin/");
  const needsLogin = path === "/user" || path.startsWith("/user/");
  if (!needsAdmin && !needsLogin) return next();

  const user = await getSessionUser(request, env);
  if (!user) return redirectToLogin(request);
  if (needsAdmin && user.role !== "admin") return redirectToLogin(request);

  return next();
}
