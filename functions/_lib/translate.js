// 中文 → 其他语言的机器翻译封装
// 优先用 Cloudflare Workers AI（绑定 AI），没有绑定时退回 MyMemory 免费接口

const TARGETS = ["zh-Hant", "en", "ja", "ko", "ru", "de", "fr", "es"];
const M2M = { en: "en", ja: "ja", ko: "ko", ru: "ru", de: "de", fr: "fr", es: "es" };
const MM = { "zh-Hant": "zh-TW", en: "en", ja: "ja", ko: "ko", ru: "ru", de: "de", fr: "fr", es: "es" };

const MAX_CHUNK = 450;
const MM_CONTENT_LIMIT = 1000; // 免费接口模式下，超长正文不翻，避免耗尽额度

export const TRANSLATE_TARGETS = TARGETS;

function decodeEntities(s) {
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

// 按行切块，尽量保留原有换行/分段结构
function chunkLines(text, max = MAX_CHUNK) {
  const lines = String(text).split(/\r?\n/);
  const out = [];
  let buf = "";
  for (const line of lines) {
    if (buf && (buf.length + 1 + line.length) > max) { out.push(buf); buf = line; }
    else buf = buf ? buf + "\n" + line : line;
  }
  if (buf) out.push(buf);
  return out;
}

async function myMemory(text, to) {
  try {
    const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) +
      "&langpair=" + encodeURIComponent("zh-CN|" + to) +
      "&de=" + encodeURIComponent("noreply@givera.qzz.io");
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    const t = data && data.responseData && data.responseData.translatedText;
    if (!t || /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(t)) return "";
    return decodeEntities(t).trim();
  } catch (e) {
    return "";
  }
}

async function viaAi(env, text, lang) {
  try {
    const res = await env.AI.run("@cf/meta/m2m100-1.2b", {
      text,
      source_lang: "zh",
      target_lang: M2M[lang]
    });
    const t = res && (res.translated_text || res.response);
    return t ? String(t).trim() : "";
  } catch (e) {
    return "";
  }
}

export async function translateText(env, text, lang) {
  const src = String(text == null ? "" : text);
  if (!src.trim() || lang === "zh") return "";

  const chunks = chunkLines(src);
  const out = [];
  for (const chunk of chunks) {
    let t = "";
    // 繁体优先走 MyMemory 的 zh-TW（繁简转换比字表可靠）
    if (lang === "zh-Hant") t = await myMemory(chunk, MM[lang]);
    else {
      if (env && env.AI) t = await viaAi(env, chunk, lang);
      if (!t) t = await myMemory(chunk, MM[lang]);
    }
    out.push(t || chunk);
  }
  return out.join("\n");
}

// 返回 { en: { name, description, content }, ... }，翻不出来或翻完与原意相同的字段会被省略
export async function translateFields(env, fields, only) {
  const list = Array.isArray(only) && only.length
    ? only.filter((l) => TARGETS.includes(l))
    : TARGETS;

  const jobs = list.map(async (lang) => {
    const entry = {};
    for (const key of ["name", "description", "content"]) {
      const src = fields[key];
      if (!src || !String(src).trim()) continue;
      if (key === "content" && !(env && env.AI) && String(src).length > MM_CONTENT_LIMIT) continue;

      const t = await translateText(env, src, lang);
      if (t && t.trim() && t.trim() !== String(src).trim()) entry[key] = t.trim();
    }
    return [lang, entry];
  });

  const pairs = await Promise.all(jobs);
  const out = {};
  for (const [lang, entry] of pairs) {
    if (Object.keys(entry).length) out[lang] = entry;
  }
  return out;
}
