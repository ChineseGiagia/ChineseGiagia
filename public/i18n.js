/*
 * Givera 站点多语言运行时
 * ---------------------------------------------------------------
 * 用法：页面 </body> 前引入 <script src="/i18n.js"></script>
 *  1) 自动翻译页面内所有可见文字与 placeholder/title/alt/aria-label；
 *  2) 自动在右上角挂载语言选择器；
 *  3) 选择结果存 localStorage，下次打开沿用；
 *  4) 首次访问默认中文。
 *
 * 新增语言：在 LANGS 里加一项，再给 DICT 每条补一个同名字段即可，
 *           RULES 里的函数同理。无需改动页面 HTML。
 */
(function () {
  "use strict";

  var STORE_KEY = "givera_lang";
  var DEFAULT_LANG = "zh";

  var LANGS = [
    { code: "zh", label: "中文", htmlLang: "zh-CN" },
    { code: "en", label: "English", htmlLang: "en" },
    { code: "ja", label: "日本語", htmlLang: "ja" }
  ];

  // 原文（中文，空白已归一）→ 各语言译文
  var DICT = {
    /* ===== 通用 ===== */
    "加载中…": { en: "Loading…", ja: "読み込み中…" },
    "加载失败": { en: "Failed to load", ja: "読み込みに失敗しました" },
    "加载失败，请刷新重试": { en: "Failed to load. Please refresh and try again.", ja: "読み込みに失敗しました。再読み込みしてください。" },
    "取消": { en: "Cancel", ja: "キャンセル" },
    "保存": { en: "Save", ja: "保存" },
    "保存中…": { en: "Saving…", ja: "保存中…" },
    "保存失败": { en: "Save failed", ja: "保存に失敗しました" },
    "✓ 已保存": { en: "✓ Saved", ja: "✓ 保存しました" },
    "名称不能为空": { en: "Name is required", ja: "名前は必須です" },
    "编辑": { en: "Edit", ja: "編集" },
    "删除": { en: "Delete", ja: "削除" },
    "删除失败": { en: "Delete failed", ja: "削除に失敗しました" },
    "图片": { en: "Image", ja: "画像" },
    "名称": { en: "Name", ja: "名前" },
    "描述": { en: "Description", ja: "説明" },
    "操作": { en: "Actions", ja: "操作" },
    "退出": { en: "Sign out", ja: "ログアウト" },
    "退出登录": { en: "Sign out", ja: "ログアウト" },
    "私人数据": { en: "Private data", ja: "プライベートデータ" },
    "固件管理": { en: "Firmware", ja: "ファームウェア管理" },
    "图片读取失败": { en: "Failed to read the image", ja: "画像の読み込みに失敗しました" },
    "文件读取失败": { en: "Failed to read the file", ja: "ファイルの読み込みに失敗しました" },
    "上传失败": { en: "Upload failed", ja: "アップロードに失敗しました" },
    "上传中…": { en: "Uploading…", ja: "アップロード中…" },
    "发送中…": { en: "Sending…", ja: "送信中…" },
    "发送失败": { en: "Failed to send", ja: "送信に失敗しました" },
    "请先输入邮箱": { en: "Please enter your email first", ja: "先にメールアドレスを入力してください" },
    "验证码已发送，请查收邮箱": { en: "Code sent. Please check your inbox.", ja: "認証コードを送信しました。メールをご確認ください。" },
    "获取验证码": { en: "Get code", ja: "コードを取得" },
    "两次密码不一致": { en: "Passwords do not match", ja: "パスワードが一致しません" },
    "密码至少 6 位": { en: "Password must be at least 6 characters", ja: "パスワードは 6 文字以上必要です" },
    "验证码": { en: "Verification code", ja: "認証コード" },
    "邮箱": { en: "Email", ja: "メールアドレス" },
    "返回首页": { en: "Back to home", ja: "ホームに戻る" },

    /* ===== 后端错误信息（会显示在页面上） ===== */
    "未登录": { en: "Not signed in", ja: "ログインしていません" },
    "无权限": { en: "Permission denied", ja: "権限がありません" },
    "无数据": { en: "No data", ja: "データがありません" },
    "缺少参数": { en: "Missing parameters", ja: "パラメータが不足しています" },
    "缺少必要字段": { en: "Missing required fields", ja: "必須項目が不足しています" },
    "缺少文件": { en: "Missing file", ja: "ファイルがありません" },
    "缺少图片数据": { en: "Missing image data", ja: "画像データがありません" },
    "文件过大（超过 20MB）": { en: "File too large (over 20MB)", ja: "ファイルが大きすぎます（20MB 超）" },
    "图片格式错误": { en: "Unsupported image format", ja: "画像形式が正しくありません" },
    "图片过大（压缩后仍超过 1MB），请换小图": { en: "Image too large (still over 1MB after compression). Please use a smaller one.", ja: "画像が大きすぎます（圧縮後も 1MB 超）。小さい画像をお使いください。" },
    "上传失败，请检查配置": { en: "Upload failed. Please check the configuration.", ja: "アップロードに失敗しました。設定を確認してください。" },
    "账号或密码错误": { en: "Incorrect account or password", ja: "アカウントまたはパスワードが違います" },
    "验证码错误": { en: "Incorrect verification code", ja: "認証コードが正しくありません" },
    "验证码已过期，请重新获取": { en: "The code has expired. Please request a new one.", ja: "認証コードの有効期限が切れました。再取得してください。" },
    "请先获取验证码": { en: "Please request a verification code first", ja: "先に認証コードを取得してください" },
    "该邮箱已注册": { en: "This email is already registered", ja: "このメールアドレスは既に登録されています" },
    "该邮箱未注册": { en: "This email is not registered", ja: "このメールアドレスは登録されていません" },
    "邮箱或密码不合法（密码至少 6 位）": { en: "Invalid email or password (min. 6 characters)", ja: "メールアドレスまたはパスワードが不正です（6 文字以上）" },
    "验证码发送失败，请稍后再试": { en: "Failed to send the code. Please try again later.", ja: "認証コードの送信に失敗しました。後でもう一度お試しください。" },
    "只允许上传 .zip 文件": { en: "Only .zip files are allowed", ja: ".zip ファイルのみアップロードできます" },
    "记录不存在": { en: "Record not found", ja: "レコードが見つかりません" },
    "无效 ID": { en: "Invalid ID", ja: "無効な ID" },
    "产品不存在": { en: "Product not found", ja: "製品が見つかりません" },
    "缺少产品 ID": { en: "Missing product ID", ja: "製品 ID がありません" },

    /* ===== 首页 ===== */
    "Givera嘉雅科技 - 官方网站 | 智能时钟 GC-2026": { en: "Givera Jiaya Tech — Official Site | Smart Clock GC-2026", ja: "Givera ジャヤテック - 公式サイト | スマートクロック GC-2026" },
    "Givera嘉雅科技官方网站，专注于嵌入式智能硬件研发。我们提供智能时钟GC-2026等产品，拥有自主研发团队。了解嘉雅科技的最新动态、产品参数与联系方式。": {
      en: "Official site of Givera Jiaya Tech — embedded smart hardware R&D. We build the GC-2026 smart clock and more with our own engineering team. Product specs, news and contact details.",
      ja: "Givera ジャヤテック公式サイト。組み込みスマートハードウェアの開発に特化し、スマートクロック GC-2026 などを自社チームで開発しています。製品仕様、最新情報、お問い合わせ先をご案内します。"
    },
    "管理": { en: "Admin", ja: "管理" },
    "Givera 嘉雅科技": { en: "Givera Jiaya Tech", ja: "Givera ジャヤテック" },
    "专注于智能硬件 · 让生活更简单": { en: "Smart hardware · A simpler life", ja: "スマートハードウェア · 暮らしをもっとシンプルに" },
    "关于我们": { en: "About us", ja: "私たちについて" },
    "Givera 嘉雅科技是一支专注于嵌入式智能硬件研发的团队。我们致力于将微控制器、传感器、无线通信等技术与日常生活场景结合， 打造简洁、实用、有温度的智能设备。从电路设计、固件开发到外观交互，我们坚持自主完成每一个环节， 用技术解决身边的小问题。": {
      en: "Givera Jiaya Tech is a small team focused on embedded smart hardware. We bring microcontrollers, sensors and wireless connectivity into everyday life, building simple, practical and human-friendly devices. From circuit design and firmware to the look and feel, we do every step ourselves — using technology to solve the small problems around us.",
      ja: "Givera ジャヤテックは、組み込みスマートハードウェアの開発に特化したチームです。マイコン、センサー、無線通信を日常のシーンに結びつけ、シンプルで実用的、そして温かみのあるデバイスを作っています。回路設計からファームウェア、外観・操作感まで、すべての工程を自社で手がけ、身近な課題を技術で解決します。"
    },
    "成立年份": { en: "Founded", ja: "設立" },
    "在售产品": { en: "Products", ja: "販売中の製品" },
    "自主研发": { en: "In-house R&D", ja: "自社開発" },
    "当前版本": { en: "Current version", ja: "現行バージョン" },
    "查看产品 →": { en: "View products →", ja: "製品を見る →" },
    "© 2026 Givera 嘉雅科技 · 保留所有权利": { en: "© 2026 Givera Jiaya Tech · All rights reserved", ja: "© 2026 Givera ジャヤテック · All rights reserved" },
    "Givera 嘉雅科技 Logo": { en: "Givera Jiaya Tech logo", ja: "Givera ジャヤテック ロゴ" },

    /* ===== 产品列表 ===== */
    "产品列表 · Givera 嘉雅科技": { en: "Products · Givera Jiaya Tech", ja: "製品一覧 · Givera ジャヤテック" },
    "产品中心": { en: "Products", ja: "製品一覧" },
    "← 返回首页": { en: "← Back to home", ja: "← ホームに戻る" },
    "暂无产品": { en: "No products yet", ja: "製品はまだありません" },
    "查看详情 →": { en: "View details →", ja: "詳細を見る →" },

    /* ===== 产品详情 ===== */
    "产品详情 · Givera 嘉雅科技": { en: "Product · Givera Jiaya Tech", ja: "製品詳細 · Givera ジャヤテック" },
    "← 返回产品列表": { en: "← Back to products", ja: "← 製品一覧に戻る" },
    "暂无详细说明": { en: "No details yet", ja: "詳細はまだありません" },
    "暂无图片": { en: "No images yet", ja: "画像はまだありません" },
    "下载固件": { en: "Download firmware", ja: "ファームウェアをダウンロード" },
    "暂无固件发布": { en: "No firmware released yet", ja: "公開中のファームウェアはありません" },
    "产品详情": { en: "Product details", ja: "製品詳細" },
    "产品图片": { en: "Product images", ja: "製品画像" },
    "固件下载": { en: "Firmware downloads", ja: "ファームウェアのダウンロード" },

    /* ===== 登录 ===== */
    "登录 · Givera 嘉雅科技": { en: "Sign in · Givera Jiaya Tech", ja: "ログイン · Givera ジャヤテック" },
    "登 录": { en: "Sign in", ja: "ログイン" },
    "账号": { en: "Account", ja: "アカウント" },
    "密码": { en: "Password", ja: "パスワード" },
    "注册": { en: "Sign up", ja: "新規登録" },
    "忘记密码": { en: "Forgot password", ja: "パスワードをお忘れですか" },
    "显示密码": { en: "Show password", ja: "パスワードを表示" },
    "显示/隐藏密码": { en: "Show/hide password", ja: "パスワードの表示/非表示" },
    "登录失败": { en: "Sign-in failed", ja: "ログインに失敗しました" },

    /* ===== 注册 ===== */
    "注册 · Givera 嘉雅科技": { en: "Sign up · Givera Jiaya Tech", ja: "新規登録 · Givera ジャヤテック" },
    "注册新账号": { en: "Create an account", ja: "アカウントを作成" },
    "密码（至少 6 位）": { en: "Password (min. 6 characters)", ja: "パスワード（6 文字以上）" },
    "确认密码": { en: "Confirm password", ja: "パスワード（確認）" },
    "注 册": { en: "Sign up", ja: "登録" },
    "已有账号？去登录": { en: "Already have an account? Sign in", ja: "アカウントをお持ちの方はログイン" },
    "6 位数字": { en: "6-digit code", ja: "6 桁の数字" },
    "注册成功！正在跳转...": { en: "Registered! Redirecting…", ja: "登録が完了しました。移動中…" },
    "注册失败": { en: "Registration failed", ja: "登録に失敗しました" },

    /* ===== 重置密码 ===== */
    "重置密码 · Givera 嘉雅科技": { en: "Reset password · Givera Jiaya Tech", ja: "パスワード再設定 · Givera ジャヤテック" },
    "重置密码": { en: "Reset password", ja: "パスワード再設定" },
    "注册邮箱": { en: "Registered email", ja: "登録済みメールアドレス" },
    "新密码（至少 6 位）": { en: "New password (min. 6 characters)", ja: "新しいパスワード（6 文字以上）" },
    "确认新密码": { en: "Confirm new password", ja: "新しいパスワード（確認）" },
    "返回登录": { en: "Back to sign-in", ja: "ログインに戻る" },
    "重置成功！正在跳转登录...": { en: "Password reset! Redirecting to sign-in…", ja: "再設定が完了しました。ログイン画面へ移動中…" },
    "重置失败": { en: "Reset failed", ja: "再設定に失敗しました" },

    /* ===== 后台：产品管理 ===== */
    "数据管理 · Givera": { en: "Data management · Givera", ja: "データ管理 · Givera" },
    "数据管理面板": { en: "Data management", ja: "データ管理" },
    "+ 添加项目": { en: "+ Add item", ja: "＋ 項目を追加" },
    "添加项目": { en: "Add item", ja: "項目を追加" },
    "编辑项目": { en: "Edit item", ja: "項目を編集" },
    "描述（列表页显示）": { en: "Description (shown in the list)", ja: "説明（一覧に表示）" },
    "详细内容（产品详情页显示）": { en: "Details (shown on the product page)", ja: "詳細（製品ページに表示）" },
    "封面图（列表页 + 详情页顶部）": { en: "Cover image (list + product page)", ja: "カバー画像（一覧＋製品ページ上部）" },
    "📷 上传封面图": { en: "📷 Upload cover", ja: "📷 カバー画像をアップロード" },
    "✕ 移除封面": { en: "✕ Remove cover", ja: "✕ カバーを削除" },
    "相册（详情页图片展示，可多张）": { en: "Gallery (multiple images on the product page)", ja: "ギャラリー（製品ページに複数枚表示）" },
    "🖼️ 上传多张照片": { en: "🖼️ Upload photos", ja: "🖼️ 写真をアップロード" },
    "搜索名称或描述…": { en: "Search name or description…", ja: "名前または説明で検索…" },
    "项目名称": { en: "Item name", ja: "項目名" },
    "一句话简介": { en: "One-line summary", ja: "一行の概要" },
    "## 硬件参数\n主控芯片：ESP32-S3\n\n## 功能特性\n- 时间显示：...": {
      en: "## Hardware\nMCU: ESP32-S3\n\n## Features\n- Clock: ...",
      ja: "## ハードウェア\nMCU：ESP32-S3\n\n## 機能\n- 時計表示：..."
    },
    "还没有数据，点击右上角「添加项目」": { en: "No data yet. Click “+ Add item” at the top right.", ja: "データはまだありません。右上の「＋ 項目を追加」から作成できます。" },
    "没有匹配的结果": { en: "No matching results", ja: "一致する結果はありません" },
    "压缩上传中…": { en: "Compressing & uploading…", ja: "圧縮してアップロード中…" },
    "✓ 封面上传成功，保存后生效（部署约需 1 分钟）": { en: "✓ Cover uploaded. Save to apply (deployment takes about 1 minute).", ja: "✓ カバー画像をアップロードしました。保存後に反映されます（反映まで約 1 分）。" },
    "确定要删除这条记录吗？": { en: "Delete this item?", ja: "この項目を削除しますか？" },

    /* ===== 后台：私人数据 ===== */
    "私人数据 · Givera": { en: "Private data · Givera", ja: "プライベートデータ · Givera" },
    "← 产品管理": { en: "← Products", ja: "← 製品管理" },
    "+ 添加记录": { en: "+ Add record", ja: "＋ 記録を追加" },
    "添加记录": { en: "Add record", ja: "記録を追加" },
    "编辑记录": { en: "Edit record", ja: "記録を編集" },
    "详细描述": { en: "Description", ja: "詳細" },
    "图片（可多张）": { en: "Images (multiple)", ja: "画像（複数可）" },
    "🖼️ 上传照片": { en: "🖼️ Upload photos", ja: "🖼️ 写真をアップロード" },
    "记录名称": { en: "Record name", ja: "記録名" },
    "记录内容": { en: "Record content", ja: "記録内容" },
    "还没有数据，点击右上角「添加记录」": { en: "No data yet. Click “+ Add record” at the top right.", ja: "データはまだありません。右上の「＋ 記録を追加」から作成できます。" },

    /* ===== 后台：固件管理 ===== */
    "固件管理 · Givera": { en: "Firmware · Givera", ja: "ファームウェア管理 · Givera" },
    "+ 添加固件": { en: "+ Add firmware", ja: "＋ ファームウェアを追加" },
    "添加固件": { en: "Add firmware", ja: "ファームウェアを追加" },
    "所属产品": { en: "Product", ja: "対象製品" },
    "版本": { en: "Version", ja: "バージョン" },
    "说明": { en: "Notes", ja: "説明" },
    "文件名": { en: "File", ja: "ファイル名" },
    "大小": { en: "Size", ja: "サイズ" },
    "版本号（如 v1.0.0）": { en: "Version (e.g. v1.0.0)", ja: "バージョン（例：v1.0.0）" },
    "固件文件（.zip，不超过 20MB）": { en: "Firmware file (.zip, up to 20MB)", ja: "ファームウェアファイル（.zip、20MB まで）" },
    "📦 选择 zip 文件": { en: "📦 Choose .zip file", ja: "📦 .zip ファイルを選択" },
    "上传并保存": { en: "Upload & save", ja: "アップロードして保存" },
    "本次更新内容": { en: "What's new in this release", ja: "今回の更新内容" },
    "还没有固件，点右上角「添加固件」": { en: "No firmware yet. Click “+ Add firmware” at the top right.", ja: "ファームウェアはまだありません。右上の「＋ ファームウェアを追加」から登録できます。" },
    "（请先添加产品）": { en: "(add a product first)", ja: "（先に製品を追加してください）" },
    "确定删除这条固件吗？会同时删除 GitHub 上的文件。": { en: "Delete this firmware? The file on GitHub will also be deleted.", ja: "このファームウェアを削除しますか？GitHub 上のファイルも同時に削除されます。" },
    "请选择产品": { en: "Please select a product", ja: "製品を選択してください" },
    "请填写版本号": { en: "Please enter a version", ja: "バージョンを入力してください" },
    "请选择固件文件": { en: "Please choose a firmware file", ja: "ファームウェアファイルを選択してください" },
    "上传文件到 GitHub…": { en: "Uploading file to GitHub…", ja: "GitHub にアップロード中…" },
    "文件上传失败": { en: "File upload failed", ja: "ファイルのアップロードに失敗しました" },
    "写入数据库…": { en: "Writing to the database…", ja: "データベースに書き込み中…" },
    "✓ 上传成功！约 1-2 分钟后可在产品页下载": { en: "✓ Uploaded! It will be available on the product page in about 1–2 minutes.", ja: "✓ アップロードしました。1〜2 分後に製品ページからダウンロードできます。" },

    /* ===== 用户中心 ===== */
    "用户中心 · Givera": { en: "My account · Givera", ja: "マイページ · Givera" },
    "用户中心": { en: "My account", ja: "マイページ" },
    "欢迎回来 👋": { en: "Welcome back 👋", ja: "おかえりなさい 👋" },
    "你已成功登录。这里是普通用户中心页面。": { en: "You are signed in. This is your account page.", ja: "ログインしています。ここはマイページです。" }
  };

  // 需要保持数字/变量部分不变的动态文案
  var RULES = [
    { re: /^(\d+)\s*秒后重发$/, en: function (m) { return m[1] + "s"; }, ja: function (m) { return m[1] + "秒後"; } },
    { re: /^上传中\s*(\d+)\/(\d+)…$/, en: function (m) { return "Uploading " + m[1] + "/" + m[2] + "…"; }, ja: function (m) { return "アップロード中 " + m[1] + "/" + m[2] + "…"; } },
    { re: /^第\s*(\d+)\s*张失败：([\s\S]+)$/, en: function (m) { return "Image " + m[1] + " failed: " + m[2]; }, ja: function (m) { return m[1] + " 枚目で失敗：" + m[2]; } },
    { re: /^✓ 已上传\s*(\d+)\s*张，保存后生效（部署约需 1 分钟）$/, en: function (m) { return "✓ " + m[1] + " image(s) uploaded. Save to apply (deployment takes about 1 minute)."; }, ja: function (m) { return "✓ " + m[1] + " 枚アップロードしました。保存後に反映されます（反映まで約 1 分）。"; } },
    { re: /^✓ 已上传\s*(\d+)\s*张$/, en: function (m) { return "✓ " + m[1] + " image(s) uploaded"; }, ja: function (m) { return "✓ " + m[1] + " 枚アップロードしました"; } },
    { re: /^封面上传失败：([\s\S]+)$/, en: function (m) { return "Cover upload failed: " + m[1]; }, ja: function (m) { return "カバー画像のアップロードに失敗しました：" + m[1]; } },
    { re: /^加载失败：([\s\S]+)$/, en: function (m) { return "Failed to load: " + m[1]; }, ja: function (m) { return "読み込みに失敗しました：" + m[1]; } },
    { re: /^网络错误：([\s\S]+)$/, en: function (m) { return "Network error: " + m[1]; }, ja: function (m) { return "ネットワークエラー：" + m[1]; } },
    { re: /^服务器返回异常（HTTP\s*(\d+)）$/, en: function (m) { return "Unexpected server response (HTTP " + m[1] + ")"; }, ja: function (m) { return "サーバー応答が異常です（HTTP " + m[1] + "）"; } },
    { re: /^已选择：([\s\S]+)（([\s\S]+)）$/, en: function (m) { return "Selected: " + m[1] + " (" + m[2] + ")"; }, ja: function (m) { return "選択中：" + m[1] + "（" + m[2] + "）"; } },
    { re: /^数据库记录已删除，但 GitHub 文件删除失败：([\s\S]+)$/, en: function (m) { return "Database record deleted, but removing the GitHub file failed: " + m[1]; }, ja: function (m) { return "データベースの記録は削除しましたが、GitHub 上のファイル削除に失敗しました：" + m[1]; } },
    { re: /^GitHub 上传失败（HTTP\s*(\d+)）$/, en: function (m) { return "GitHub upload failed (HTTP " + m[1] + ")"; }, ja: function (m) { return "GitHub へのアップロードに失敗しました（HTTP " + m[1] + "）"; } },
    { re: /^(.+) · Givera 嘉雅科技$/, en: function (m) { return m[1] + " · Givera Jiaya Tech"; }, ja: function (m) { return m[1] + " · Givera ジャヤテック"; } }
  ];

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, PRE: 1, TEXTAREA: 1, SVG: 1 };
  var ATTRS = ["placeholder", "title", "alt", "aria-label"];

  var current = DEFAULT_LANG;
  var selectEl = null;
  var listeners = [];
  var state = new WeakMap();   // 文本节点 / 元素 属性 → { src, applied }
  var titleState = { src: null, applied: null };

  function langMeta(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return LANGS[0];
  }

  function normalize(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  }

  // 核心：把一段中文原文翻译成目标语言；译不了就原样返回
  function translate(text, lang) {
    if (!text || lang === "zh") return text;
    var hit = DICT[text];
    if (hit && hit[lang]) return hit[lang];
    for (var i = 0; i < RULES.length; i++) {
      var m = text.match(RULES[i].re);
      if (m) {
        var fn = RULES[i][lang];
        if (typeof fn === "function") return fn(m);
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
    var mapKey = name;
    var st = state.get(el);
    if (!st) { st = {}; state.set(el, st); }
    var s = st["@" + mapKey];
    if (!s) { s = { src: key, applied: raw }; st["@" + mapKey] = s; }
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

  // ---------- 语言切换 ----------
  function setLang(code) {
    if (!langMeta(code)) code = DEFAULT_LANG;
    current = code;
    try { localStorage.setItem(STORE_KEY, code); } catch (e) {}

    var meta = langMeta(code);
    if (document.documentElement) document.documentElement.lang = meta.htmlLang;

    applyAll();
    if (selectEl) selectEl.value = code;

    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](code); } catch (e) {}
    }
    try {
      document.dispatchEvent(new CustomEvent("givera:lang", { detail: { lang: code } }));
    } catch (e) {}
  }

  // ---------- 语言选择控件 ----------
  var WIDGET_CSS = [
    "#givera-lang{font-family:inherit;font-size:13px;line-height:1;display:inline-flex;align-items:center;gap:6px;",
    "padding:8px 12px;border-radius:30px;color:#cfe6ff;background:rgba(20,32,56,0.75);",
    "border:1px solid rgba(80,160,255,0.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
    "white-space:nowrap;user-select:none}",
    "#givera-lang .gl-icon{font-size:13px;opacity:.9}",
    "#givera-lang select{background:transparent;color:inherit;border:0;outline:none;font:inherit;cursor:pointer;padding:0}",
    "#givera-lang select option{color:#0a0e1a;background:#fff}",
    "#givera-lang.gl-fixed{position:fixed;top:20px;right:22px;z-index:9999;min-width:96px;justify-content:center}",
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

    // 首页右上角已有固定「管理」按钮，左移让位，避免重叠
    try {
      var entry = document.querySelector('a[href="/login"]');
      if (entry && window.getComputedStyle(entry).position === "fixed") {
        entry.style.right = "136px";
      }
    } catch (e) {}
  }

  // ---------- 动态内容：页面 JS 渲染后自动补译 ----------
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      applyAll();
    }, 30);
  }

  function observe() {
    if (typeof MutationObserver === "undefined" || !document.body) return;
    var mo = new MutationObserver(schedule);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS.concat(["value"])
    });
  }

  // 让原生弹窗也说目标语言
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
      if (v && langMeta(v).code === v) return v;
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
  }

  // 对外暴露，方便后续页面自定义文案
  window.I18N = {
    langs: LANGS,
    get lang() { return current; },
    setLang: function (code) { setLang(code); },
    t: function (text) { return translate(normalize(text), current); },
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    _translate: translate   // 供测试使用
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
