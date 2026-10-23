// 把 i18n-src/core.js + i18n-src/dicts/*.json 合成 public/i18n.js
// 用法：node i18n-src/build.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const LANGS = ["zh-Hant", "en", "ja", "ko", "ru", "de", "fr", "es"];

const core = await fs.readFile(path.join(HERE, "core.js"), "utf8");

const dict = {};
const rules = {};
const problems = [];

for (const code of LANGS) {
  const file = path.join(HERE, "dicts", `${code}.json`);
  let raw;
  try {
    raw = JSON.parse(await fs.readFile(file, "utf8"));
  } catch (e) {
    problems.push(`${code}: 读取或解析失败 ${e.message}`);
    continue;
  }
  for (const [zh, val] of Object.entries(raw.strings || {})) {
    if (!val || !String(val).trim()) { problems.push(`${code}: 空译文 "${zh}"`); continue; }
    (dict[zh] = dict[zh] || {})[code] = val;
  }
  for (const [id, val] of Object.entries(raw.rules || {})) {
    if (!val || !String(val).trim()) { problems.push(`${code}: 空规则模板 "${id}"`); continue; }
    (rules[id] = rules[id] || {})[code] = val;
  }
}

// 每个语言的条目数必须与基准语言一致
const base = Object.keys(dict);
for (const [zh, byLang] of Object.entries(dict)) {
  for (const code of LANGS) {
    if (!byLang[code]) problems.push(`${code}: 缺少 "${zh}"`);
  }
}
for (const [id, byLang] of Object.entries(rules)) {
  for (const code of LANGS) {
    if (!byLang[code]) problems.push(`${code}: 缺少规则 ${id}`);
  }
}

if (problems.length) {
  console.error(`构建失败，${problems.length} 个问题：`);
  for (const p of problems.slice(0, 60)) console.error("  - " + p);
  if (problems.length > 60) console.error(`  ...还有 ${problems.length - 60} 条`);
  process.exit(1);
}

const out = core
  .replace("/*__DICT__*/", JSON.stringify(dict))
  .replace("/*__RULE_TPL__*/", JSON.stringify(rules));

if (out.includes("/*__DICT__*/") || out.includes("/*__RULE_TPL__*/")) {
  console.error("构建失败：core.js 里找不到注入占位符");
  process.exit(1);
}

const target = path.join(ROOT, "public", "i18n.js");
await fs.writeFile(target, out, "utf8");
console.log(`已生成 ${path.relative(ROOT, target)}：${base.length} 条文案 × ${LANGS.length} 种语言，${Object.keys(rules).length} 条动态规则`);
