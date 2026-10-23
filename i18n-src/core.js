/*
 * Givera 站点多语言运行时（源码文件，构建后写入 public/i18n.js）
 * 构建：node i18n-src/build.mjs
 */
(function () {
  "use strict";

  var STORE_KEY = "givera_lang";
  var DEFAULT_LANG = "zh";

  var LANGS = [
    { code: "zh", label: "中文", htmlLang: "zh-CN" },
    { code: "zh-Hant", label: "繁體中文", htmlLang: "zh-Hant" },
    { code: "en", label: "English", htmlLang: "en" },
    { code: "ja", label: "日本語", htmlLang: "ja" },
    { code: "ko", label: "한국어", htmlLang: "ko" },
    { code: "ru", label: "Русский", htmlLang: "ru" },
    { code: "de", label: "Deutsch", htmlLang: "de" },
    { code: "fr", label: "Français", htmlLang: "fr" },
    { code: "es", label: "Español", htmlLang: "es" }
  ];

  // 原文 → { 语言: 译文 }，由 i18n-src/build.mjs 注入
  var DICT = /*__DICT__*/;

  // 带变量的动态文案：规则与规则模板分开，模板里的 {1}{2} 对应正则分组
  var RULE_IDS = [
    "cooldown", "uploadProgress", "imageFailed", "uploadedSaved", "uploaded",
    "coverFailed", "loadFailed", "network", "httpStatus", "fileSelected",
    "dbDeletedGhFailed", "ghUploadFailed", "brandSuffix"
  ];
  var RULE_REGEX = [
    /^(\d+)\s*秒后重发$/,
    /^上传中\s*(\d+)\/(\d+)…$/,
    /^第\s*(\d+)\s*张失败：([\s\S]+)$/,
    /^✓ 已上传\s*(\d+)\s*张，保存后生效（部署约需 1 分钟）$/,
    /^✓ 已上传\s*(\d+)\s*张$/,
    /^封面上传失败：([\s\S]+)$/,
    /^加载失败：([\s\S]+)$/,
    /^网络错误：([\s\S]+)$/,
    /^服务器返回异常（HTTP\s*(\d+)）$/,
    /^已选择：([\s\S]+)（([\s\S]+)）$/,
    /^数据库记录已删除，但 GitHub 文件删除失败：([\s\S]+)$/,
    /^GitHub 上传失败（HTTP\s*(\d+)）$/,
    /^(.+) · Givera 嘉雅科技$/
  ];
  var RULE_TPL = /*__RULE_TPL__*/;

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, PRE: 1, TEXTAREA: 1, SVG: 1 };
  var ATTRS = ["placeholder", "title", "alt", "aria-label"];

  var current = DEFAULT_LANG;
  var selectEl = null;
  var listeners = [];
  var state = new WeakMap();
  var titleState = { src: null, applied: null };

  function langMeta(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return LANGS[0];
  }
  function isLang(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return true;
    return false;
  }
  function normalize(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  }
  function fill(tpl, m) {
    return tpl.replace(/\{(\d+)\}/g, function (_, i) { return m[Number(i)] || ""; });
  }

  function translate(text, lang) {
    if (!text || lang === "zh") return text;
    var hit = DICT[text];
    if (hit && hit[lang]) return hit[lang];
    for (var i = 0; i < RULE_REGEX.length; i++) {
      var m = text.match(RULE_REGEX[i]);
      if (m) {
        var tpl = RULE_TPL[RULE_IDS[i]];
        if (tpl && tpl[lang]) return fill(tpl[lang], m);
      }
    }
    return text;
  }

  function applyTextNode(node, lang) {
    var raw = node.nodeValue;
    var key = normalize(raw);
    if (!key) return;

    var st = state.get(node);
    if (!st) { st = { src: key, applied: raw }; state.set(node, st); }
    else if (raw !== st.applied) { st.src = key; }

    var lead = raw.match(/^\s*/)[0];
    var trail = raw.match(/\s*$/)[0];
    var next = translate(st.src, lang);
    var out = next === st.src ? lead + st.src + trail : lead + next + trail;

    if (node.nodeValue !== out) node.nodeValue = out;
    st.applied = out;
  }

  function applyAttr(el, name, lang) {
    var raw = el.getAttribute(name);
    if (raw == null) return;
    var key = raw.indexOf("\n") >= 0 ? raw : normalize(raw);
    var st = state.get(el);
    if (!st) { st = {}; state.set(el, st); }
    var s = st["@" + name];
    if (!s) { s = { src: key, applied: raw }; st["@" + name] = s; }
    else if (raw !== s.applied) { s.src = key; }

    var next = translate(s.src, lang);
    if (raw !== next) el.setAttribute(name, next);
    s.applied = next;
  }

  function walk(node, lang) {
    if (!node) return;
    if (node.nodeType === 3) { applyTextNode(node, lang); return; }
    if (node.nodeType !== 1) return;
    if (SKIP_TAGS[node.tagName]) return;
    if (node === selectEl) return;

    for (var i = 0; i < ATTRS.length; i++) applyAttr(node, ATTRS[i], lang);
    if (node.tagName === "INPUT") {
      var t = (node.getAttribute("type") || "").toLowerCase();
      if (t === "submit" || t === "button" || t === "reset") applyAttr(node, "value", lang);
    }

    var kids = node.childNodes;
    for (var k = 0; k < kids.length; k++) walk(kids[k], lang);
  }

  function applyTitle(lang) {
    var raw = document.title || "";
    var key = normalize(raw);
    if (!key) return;
    if (titleState.applied == null || raw !== titleState.applied) titleState.src = key;
    var next = translate(titleState.src, lang);
    if (document.title !== next) document.title = next;
    titleState.applied = next;
  }

  function applyMeta(lang) {
    var meta = document.querySelector('meta[name="description"]');
    if (!meta) return;
    var raw = meta.getAttribute("content");
    if (raw == null) return;
    var key = normalize(raw);
    var st = state.get(meta);
    if (!st) { st = { src: key, applied: raw }; state.set(meta, st); }
    else if (raw !== st.applied) { st.src = key; }
    var next = translate(st.src, lang);
    if (raw !== next) meta.setAttribute("content", next);
    st.applied = next;
  }

  function applyAll() {
    walk(document.body, current);
    applyTitle(current);
    applyMeta(current);
  }

  // 取一条记录在当前语言下的内容，缺翻译就回落到中文原文
  function localize(item) {
    var out = {
      name: (item && item.name) || "",
      description: (item && item.description) || "",
      content: (item && item.content) || ""
    };
    if (!item || current === "zh" || !item.i18n) return out;

    var map = item.i18n;
    if (typeof map === "string") {
      try { map = JSON.parse(map || "{}"); } catch (e) { map = null; }
    }
    var t = (map && map[current]) || {};
    if (t.name) out.name = t.name;
    if (t.description) out.description = t.description;
    if (t.content) out.content = t.content;
    return out;
  }

  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](current); } catch (e) {}
    }
    try {
      document.dispatchEvent(new CustomEvent("givera:lang", { detail: { lang: current } }));
    } catch (e) {}
  }

  function setLang(code) {
    if (!isLang(code)) code = DEFAULT_LANG;
    current = code;
    try { localStorage.setItem(STORE_KEY, code); } catch (e) {}

    if (document.documentElement) document.documentElement.lang = langMeta(code).htmlLang;
    applyAll();
    if (selectEl) selectEl.value = code;
    emit();
  }

  var WIDGET_CSS = [
    "#givera-lang{font-family:inherit;font-size:13px;line-height:1;display:inline-flex;align-items:center;gap:6px;",
    "padding:8px 12px;border-radius:30px;color:#cfe6ff;background:rgba(20,32,56,0.75);",
    "border:1px solid rgba(80,160,255,0.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
    "white-space:nowrap;user-select:none}",
    "#givera-lang .gl-icon{font-size:13px;opacity:.9}",
    "#givera-lang select{background:transparent;color:inherit;border:0;outline:none;font:inherit;cursor:pointer;padding:0}",
    "#givera-lang select option{color:#0a0e1a;background:#fff}",
    "#givera-lang.gl-fixed{position:fixed;top:20px;right:22px;z-index:9999;min-width:104px;justify-content:center}",
    "#givera-lang.gl-inline{flex:0 0 auto}"
  ].join("");

  function injectCss() {
    if (document.getElementById("givera-lang-style")) return;
    var style = document.createElement("style");
    style.id = "givera-lang-style";
    style.textContent = WIDGET_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function buildWidget() {
    var box = document.createElement("div");
    box.id = "givera-lang";

    var icon = document.createElement("span");
    icon.className = "gl-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "🌐";

    var sel = document.createElement("select");
    sel.setAttribute("aria-label", "Language");
    for (var i = 0; i < LANGS.length; i++) {
      var opt = document.createElement("option");
      opt.value = LANGS[i].code;
      opt.textContent = LANGS[i].label;
      sel.appendChild(opt);
    }
    sel.value = current;
    sel.addEventListener("change", function () { setLang(sel.value); });

    box.appendChild(icon);
    box.appendChild(sel);
    selectEl = sel;
    return box;
  }

  function mountWidget() {
    injectCss();
    var box = buildWidget();

    var toolbar = document.querySelector(".toolbar");
    var header = document.querySelector("header");
    var top = document.querySelector(".top");

    if (toolbar) { box.className = "gl-inline"; toolbar.appendChild(box); return; }
    if (header) { box.className = "gl-inline"; header.appendChild(box); return; }
    if (top) { box.className = "gl-inline"; top.appendChild(box); return; }

    box.className = "gl-fixed";
    document.body.appendChild(box);

    try {
      var entry = document.querySelector('a[href="/login"]');
      if (entry && window.getComputedStyle(entry).position === "fixed") {
        entry.style.right = "144px";
      }
    } catch (e) {}
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () { pending = false; applyAll(); }, 30);
  }

  function observe() {
    if (typeof MutationObserver === "undefined" || !document.body) return;
    var mo = new MutationObserver(schedule);
    mo.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS.concat(["value"])
    });
  }

  function patchDialogs() {
    var rawAlert = window.alert;
    var rawConfirm = window.confirm;
    var rawPrompt = window.prompt;
    window.alert = function (msg) { return rawAlert.call(window, translate(normalize(msg), current)); };
    window.confirm = function (msg) { return rawConfirm.call(window, translate(normalize(msg), current)); };
    window.prompt = function (msg, def) { return rawPrompt.call(window, translate(normalize(msg), current), def); };
  }

  function readStored() {
    try {
      var v = localStorage.getItem(STORE_KEY);
      if (v && isLang(v)) return v;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  function boot() {
    current = readStored();
    patchDialogs();
    mountWidget();
    document.documentElement.lang = langMeta(current).htmlLang;
    applyAll();
    observe();
    emit();
  }

  window.I18N = {
    langs: LANGS,
    get lang() { return current; },
    setLang: function (code) { setLang(code); },
    t: function (text) { return translate(normalize(text), current); },
    localize: localize,
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    _translate: translate,
    _raw: { dict: DICT, rules: RULE_TPL }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
