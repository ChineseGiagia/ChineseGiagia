import { getSessionUser } from "./_lib/auth.js";

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const p = url.pathname;

  if (p === "/admin" || p.startsWith("/admin/")) {
    const user = await getSessionUser(request, env);
    if (!user || user.role !== "admin") {
      return Response.redirect(new URL("/login", request.url).toString(), 302);
    }
  }

  if (p === "/user" || p.startsWith("/user/")) {
    const user = await getSessionUser(request, env);
    if (!user) {
      return Response.redirect(new URL("/login", request.url).toString(), 302);
    }
  }

  return next();
}