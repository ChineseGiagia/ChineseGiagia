export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password),
    "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    key, 256
  );
  return b64(salt) + ":" + b64(new Uint8Array(bits));
}

export async function verifyPassword(password, stored) {
  const [saltB64, hashB64] = stored.split(":");
  const salt = unb64(saltB64);
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password),
    "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    key, 256
  );
  return b64(new Uint8Array(bits)) === hashB64;
}

function b64(buf) { return btoa(String.fromCharCode(...buf)); }
function unb64(str) { return Uint8Array.from(atob(str), c => c.charCodeAt(0)); }

export function parseCookies(request) {
  const cookie = request.headers.get("Cookie") || "";
  const map = {};
  cookie.split(";").forEach(p => {
    const [k, ...v] = p.trim().split("=");
    if (k) map[k] = v.join("=");
  });
  return map;
}

export async function getSessionUser(request, env) {
  const cookies = parseCookies(request);
  const token = cookies.session;
  if (!token) return null;
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    "SELECT role, email FROM sessions WHERE token = ? AND expires_at > ?"
  ).bind(token, now).first();
  return row || null;
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) }
  });
}