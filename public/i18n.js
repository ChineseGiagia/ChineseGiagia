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
  var DICT = {"加载中…":{"zh-Hant":"載入中…","en":"Loading…","ja":"読み込み中…","ko":"로딩 중…","ru":"Загрузка…","de":"Laden…","fr":"Chargement…","es":"Cargando…"},"加载失败":{"zh-Hant":"載入失敗","en":"Failed to load","ja":"読み込みに失敗しました","ko":"불러오기 실패","ru":"Не удалось загрузить","de":"Laden fehlgeschlagen","fr":"Échec du chargement","es":"Error al cargar"},"加载失败，请刷新重试":{"zh-Hant":"載入失敗，請重新整理後再試。","en":"Failed to load. Please refresh and try again.","ja":"読み込みに失敗しました。再読み込みしてください。","ko":"불러오기 실패. 새로고침 후 다시 시도하세요.","ru":"Не удалось загрузить. Обновите страницу и повторите попытку.","de":"Laden fehlgeschlagen. Bitte neu laden und erneut versuchen.","fr":"Échec du chargement. Actualisez la page et réessayez.","es":"Error al cargar. Actualiza la página e inténtalo de nuevo."},"取消":{"zh-Hant":"取消","en":"Cancel","ja":"キャンセル","ko":"취소","ru":"Отмена","de":"Abbrechen","fr":"Annuler","es":"Cancelar"},"保存":{"zh-Hant":"儲存","en":"Save","ja":"保存","ko":"저장","ru":"Сохранить","de":"Speichern","fr":"Enregistrer","es":"Guardar"},"保存中…":{"zh-Hant":"儲存中…","en":"Saving…","ja":"保存中…","ko":"저장 중…","ru":"Сохранение…","de":"Wird gespeichert…","fr":"Enregistrement…","es":"Guardando…"},"保存失败":{"zh-Hant":"儲存失敗","en":"Save failed","ja":"保存に失敗しました","ko":"저장 실패","ru":"Не удалось сохранить","de":"Speichern fehlgeschlagen","fr":"Échec de l'enregistrement","es":"Error al guardar"},"✓ 已保存":{"zh-Hant":"✓ 已儲存","en":"✓ Saved","ja":"✓ 保存しました","ko":"✓ 저장됨","ru":"✓ Сохранено","de":"✓ Gespeichert","fr":"✓ Enregistré","es":"✓ Guardado"},"名称不能为空":{"zh-Hant":"名稱不能為空","en":"Name is required","ja":"名前は必須です","ko":"이름은 필수입니다","ru":"Укажите название","de":"Name ist erforderlich","fr":"Le nom est obligatoire","es":"El nombre es obligatorio"},"编辑":{"zh-Hant":"編輯","en":"Edit","ja":"編集","ko":"편집","ru":"Изменить","de":"Bearbeiten","fr":"Modifier","es":"Editar"},"删除":{"zh-Hant":"刪除","en":"Delete","ja":"削除","ko":"삭제","ru":"Удалить","de":"Löschen","fr":"Supprimer","es":"Eliminar"},"删除失败":{"zh-Hant":"刪除失敗","en":"Delete failed","ja":"削除に失敗しました","ko":"삭제 실패","ru":"Не удалось удалить","de":"Löschen fehlgeschlagen","fr":"Échec de la suppression","es":"Error al eliminar"},"图片":{"zh-Hant":"圖片","en":"Image","ja":"画像","ko":"이미지","ru":"Изображение","de":"Bild","fr":"Image","es":"Imagen"},"名称":{"zh-Hant":"名稱","en":"Name","ja":"名前","ko":"이름","ru":"Название","de":"Name","fr":"Nom","es":"Nombre"},"描述":{"zh-Hant":"描述","en":"Description","ja":"説明","ko":"설명","ru":"Описание","de":"Beschreibung","fr":"Description","es":"Descripción"},"操作":{"zh-Hant":"操作","en":"Actions","ja":"操作","ko":"작업","ru":"Действия","de":"Aktionen","fr":"Actions","es":"Acciones"},"退出":{"zh-Hant":"登出","en":"Sign out","ja":"ログアウト","ko":"로그아웃","ru":"Выйти","de":"Abmelden","fr":"Se déconnecter","es":"Salir"},"退出登录":{"zh-Hant":"登出","en":"Sign out","ja":"ログアウト","ko":"로그아웃","ru":"Выйти","de":"Abmelden","fr":"Se déconnecter","es":"Cerrar sesión"},"私人数据":{"zh-Hant":"私人資料","en":"Private data","ja":"プライベートデータ","ko":"비공개 데이터","ru":"Личные данные","de":"Private Daten","fr":"Données privées","es":"Datos privados"},"固件管理":{"zh-Hant":"韌體管理","en":"Firmware","ja":"ファームウェア管理","ko":"펌웨어 관리","ru":"Прошивки","de":"Firmware","fr":"Micrologiciel","es":"Firmware"},"图片读取失败":{"zh-Hant":"圖片讀取失敗","en":"Failed to read the image","ja":"画像の読み込みに失敗しました","ko":"이미지를 읽지 못했습니다","ru":"Не удалось прочитать изображение","de":"Bild konnte nicht gelesen werden","fr":"Impossible de lire l'image","es":"No se pudo leer la imagen"},"文件读取失败":{"zh-Hant":"檔案讀取失敗","en":"Failed to read the file","ja":"ファイルの読み込みに失敗しました","ko":"파일을 읽지 못했습니다","ru":"Не удалось прочитать файл","de":"Datei konnte nicht gelesen werden","fr":"Impossible de lire le fichier","es":"No se pudo leer el archivo"},"上传失败":{"zh-Hant":"上傳失敗","en":"Upload failed","ja":"アップロードに失敗しました","ko":"업로드 실패","ru":"Не удалось загрузить файл","de":"Upload fehlgeschlagen","fr":"Échec du téléversement","es":"Error al subir"},"上传中…":{"zh-Hant":"上傳中…","en":"Uploading…","ja":"アップロード中…","ko":"업로드 중…","ru":"Загрузка…","de":"Wird hochgeladen…","fr":"Téléversement…","es":"Subiendo…"},"发送中…":{"zh-Hant":"傳送中…","en":"Sending…","ja":"送信中…","ko":"전송 중…","ru":"Отправка…","de":"Wird gesendet…","fr":"Envoi…","es":"Enviando…"},"发送失败":{"zh-Hant":"傳送失敗","en":"Failed to send","ja":"送信に失敗しました","ko":"전송 실패","ru":"Не удалось отправить","de":"Senden fehlgeschlagen","fr":"Échec de l'envoi","es":"Error al enviar"},"请先输入邮箱":{"zh-Hant":"請先輸入電子郵件","en":"Please enter your email first","ja":"先にメールアドレスを入力してください","ko":"이메일을 먼저 입력하세요","ru":"Сначала укажите e-mail","de":"Bitte zuerst die E-Mail-Adresse eingeben","fr":"Veuillez d'abord saisir votre e-mail","es":"Introduce primero tu correo"},"验证码已发送，请查收邮箱":{"zh-Hant":"驗證碼已寄出，請至信箱查看。","en":"Code sent. Please check your inbox.","ja":"認証コードを送信しました。メールをご確認ください。","ko":"인증 코드를 보냈습니다. 메일함을 확인하세요.","ru":"Код отправлен. Проверьте почту.","de":"Code gesendet. Bitte den Posteingang prüfen.","fr":"Code envoyé. Vérifiez votre boîte de réception.","es":"Código enviado. Revisa tu bandeja de entrada."},"获取验证码":{"zh-Hant":"取得驗證碼","en":"Get code","ja":"コードを取得","ko":"인증 코드 받기","ru":"Получить код","de":"Code anfordern","fr":"Obtenir le code","es":"Obtener código"},"两次密码不一致":{"zh-Hant":"兩次密碼不一致","en":"Passwords do not match","ja":"パスワードが一致しません","ko":"비밀번호가 일치하지 않습니다","ru":"Пароли не совпадают","de":"Die Passwörter stimmen nicht überein","fr":"Les mots de passe ne correspondent pas","es":"Las contraseñas no coinciden"},"密码至少 6 位":{"zh-Hant":"密碼至少 6 碼","en":"Password must be at least 6 characters","ja":"パスワードは 6 文字以上必要です","ko":"비밀번호는 6자 이상이어야 합니다","ru":"Пароль должен содержать не менее 6 символов","de":"Das Passwort muss mindestens 6 Zeichen haben","fr":"Le mot de passe doit contenir au moins 6 caractères","es":"La contraseña debe tener al menos 6 caracteres"},"验证码":{"zh-Hant":"驗證碼","en":"Verification code","ja":"認証コード","ko":"인증 코드","ru":"Код подтверждения","de":"Bestätigungscode","fr":"Code de vérification","es":"Código de verificación"},"邮箱":{"zh-Hant":"電子郵件","en":"Email","ja":"メールアドレス","ko":"이메일","ru":"E-mail","de":"E-Mail","fr":"E-mail","es":"Correo electrónico"},"返回首页":{"zh-Hant":"返回首頁","en":"Back to home","ja":"ホームに戻る","ko":"홈으로","ru":"На главную","de":"Zur Startseite","fr":"Retour à l'accueil","es":"Volver al inicio"},"未登录":{"zh-Hant":"未登入","en":"Not signed in","ja":"ログインしていません","ko":"로그인되지 않았습니다","ru":"Вы не авторизованы","de":"Nicht angemeldet","fr":"Non connecté","es":"No has iniciado sesión"},"无权限":{"zh-Hant":"沒有權限","en":"Permission denied","ja":"権限がありません","ko":"권한이 없습니다","ru":"Нет прав доступа","de":"Keine Berechtigung","fr":"Accès refusé","es":"Sin permisos"},"无数据":{"zh-Hant":"沒有資料","en":"No data","ja":"データがありません","ko":"데이터가 없습니다","ru":"Нет данных","de":"Keine Daten","fr":"Aucune donnée","es":"Sin datos"},"缺少参数":{"zh-Hant":"缺少參數","en":"Missing parameters","ja":"パラメータが不足しています","ko":"매개변수가 부족합니다","ru":"Не хватает параметров","de":"Fehlende Parameter","fr":"Paramètres manquants","es":"Faltan parámetros"},"缺少必要字段":{"zh-Hant":"缺少必要欄位","en":"Missing required fields","ja":"必須項目が不足しています","ko":"필수 항목이 없습니다","ru":"Не заполнены обязательные поля","de":"Pflichtfelder fehlen","fr":"Champs obligatoires manquants","es":"Faltan campos obligatorios"},"缺少文件":{"zh-Hant":"缺少檔案","en":"Missing file","ja":"ファイルがありません","ko":"파일이 없습니다","ru":"Нет файла","de":"Datei fehlt","fr":"Fichier manquant","es":"Falta el archivo"},"缺少图片数据":{"zh-Hant":"缺少圖片資料","en":"Missing image data","ja":"画像データがありません","ko":"이미지 데이터가 없습니다","ru":"Нет данных изображения","de":"Bilddaten fehlen","fr":"Données d'image manquantes","es":"Faltan datos de la imagen"},"文件过大（超过 20MB）":{"zh-Hant":"檔案過大（超過 20MB）","en":"File too large (over 20MB)","ja":"ファイルが大きすぎます（20MB 超）","ko":"파일이 너무 큽니다(20MB 초과)","ru":"Файл слишком большой (более 20 МБ)","de":"Datei zu groß (über 20 MB)","fr":"Fichier trop volumineux (plus de 20 Mo)","es":"Archivo demasiado grande (más de 20 MB)"},"图片格式错误":{"zh-Hant":"圖片格式錯誤","en":"Unsupported image format","ja":"画像形式が正しくありません","ko":"지원하지 않는 이미지 형식입니다","ru":"Неподдерживаемый формат изображения","de":"Nicht unterstütztes Bildformat","fr":"Format d'image non pris en charge","es":"Formato de imagen no compatible"},"图片过大（压缩后仍超过 1MB），请换小图":{"zh-Hant":"圖片過大（壓縮後仍超過 1MB），請換小圖","en":"Image too large (still over 1MB after compression). Please use a smaller one.","ja":"画像が大きすぎます（圧縮後も 1MB 超）。小さい画像をお使いください。","ko":"이미지가 너무 큽니다(압축 후에도 1MB 초과). 더 작은 이미지를 사용하세요.","ru":"Изображение слишком большое (даже после сжатия более 1 МБ). Используйте файл поменьше.","de":"Bild zu groß (auch nach der Komprimierung über 1 MB). Bitte ein kleineres Bild verwenden.","fr":"Image trop volumineuse (plus d'1 Mo après compression). Utilisez une image plus petite.","es":"Imagen demasiado grande (más de 1 MB tras comprimir). Usa una imagen más pequeña."},"上传失败，请检查配置":{"zh-Hant":"上傳失敗，請檢查設定","en":"Upload failed. Please check the configuration.","ja":"アップロードに失敗しました。設定を確認してください。","ko":"업로드 실패. 설정을 확인하세요.","ru":"Не удалось загрузить. Проверьте настройки.","de":"Upload fehlgeschlagen. Bitte die Konfiguration prüfen.","fr":"Échec du téléversement. Vérifiez la configuration.","es":"Error al subir. Revisa la configuración."},"账号或密码错误":{"zh-Hant":"帳號或密碼錯誤","en":"Incorrect account or password","ja":"アカウントまたはパスワードが違います","ko":"계정 또는 비밀번호가 올바르지 않습니다","ru":"Неверный аккаунт или пароль","de":"Konto oder Passwort falsch","fr":"Compte ou mot de passe incorrect","es":"Cuenta o contraseña incorrectas"},"验证码错误":{"zh-Hant":"驗證碼錯誤","en":"Incorrect verification code","ja":"認証コードが正しくありません","ko":"인증 코드가 올바르지 않습니다","ru":"Неверный код подтверждения","de":"Falscher Bestätigungscode","fr":"Code de vérification incorrect","es":"Código de verificación incorrecto"},"验证码已过期，请重新获取":{"zh-Hant":"驗證碼已過期，請重新取得","en":"The code has expired. Please request a new one.","ja":"認証コードの有効期限が切れました。再取得してください。","ko":"인증 코드가 만료되었습니다. 다시 요청하세요.","ru":"Код истёк. Запросите новый.","de":"Der Code ist abgelaufen. Bitte einen neuen anfordern.","fr":"Le code a expiré. Demandez-en un nouveau.","es":"El código ha caducado. Solicita uno nuevo."},"请先获取验证码":{"zh-Hant":"請先取得驗證碼","en":"Please request a verification code first","ja":"先に認証コードを取得してください","ko":"먼저 인증 코드를 요청하세요","ru":"Сначала запросите код подтверждения","de":"Bitte zuerst einen Bestätigungscode anfordern","fr":"Demandez d'abord un code de vérification","es":"Solicita primero un código de verificación"},"该邮箱已注册":{"zh-Hant":"此電子郵件已註冊","en":"This email is already registered","ja":"このメールアドレスは既に登録されています","ko":"이미 등록된 이메일입니다","ru":"Этот e-mail уже зарегистрирован","de":"Diese E-Mail-Adresse ist bereits registriert","fr":"Cet e-mail est déjà enregistré","es":"Este correo ya está registrado"},"该邮箱未注册":{"zh-Hant":"此電子郵件尚未註冊","en":"This email is not registered","ja":"このメールアドレスは登録されていません","ko":"등록되지 않은 이메일입니다","ru":"Этот e-mail не зарегистрирован","de":"Diese E-Mail-Adresse ist nicht registriert","fr":"Cet e-mail n'est pas enregistré","es":"Este correo no está registrado"},"邮箱或密码不合法（密码至少 6 位）":{"zh-Hant":"電子郵件或密碼不合法（密碼至少 6 碼）","en":"Invalid email or password (min. 6 characters)","ja":"メールアドレスまたはパスワードが不正です（6 文字以上）","ko":"이메일 또는 비밀번호가 올바르지 않습니다(6자 이상)","ru":"Неверный e-mail или пароль (не менее 6 символов)","de":"E-Mail oder Passwort ungültig (mind. 6 Zeichen)","fr":"E-mail ou mot de passe invalide (6 caractères min.)","es":"Correo o contraseña no válidos (mín. 6 caracteres)"},"验证码发送失败，请稍后再试":{"zh-Hant":"驗證碼寄送失敗，請稍後再試","en":"Failed to send the code. Please try again later.","ja":"認証コードの送信に失敗しました。後でもう一度お試しください。","ko":"인증 코드 전송에 실패했습니다. 잠시 후 다시 시도하세요.","ru":"Не удалось отправить код. Повторите попытку позже.","de":"Code konnte nicht gesendet werden. Bitte später erneut versuchen.","fr":"Échec de l'envoi du code. Réessayez plus tard.","es":"No se pudo enviar el código. Inténtalo más tarde."},"只允许上传 .zip 文件":{"zh-Hant":"只允許上傳 .zip 檔案","en":"Only .zip files are allowed","ja":".zip ファイルのみアップロードできます","ko":".zip 파일만 업로드할 수 있습니다","ru":"Можно загружать только файлы .zip","de":"Nur .zip-Dateien sind erlaubt","fr":"Seuls les fichiers .zip sont autorisés","es":"Solo se permiten archivos .zip"},"记录不存在":{"zh-Hant":"資料不存在","en":"Record not found","ja":"レコードが見つかりません","ko":"기록을 찾을 수 없습니다","ru":"Запись не найдена","de":"Eintrag nicht gefunden","fr":"Enregistrement introuvable","es":"Registro no encontrado"},"无效 ID":{"zh-Hant":"無效 ID","en":"Invalid ID","ja":"無効な ID","ko":"잘못된 ID","ru":"Неверный ID","de":"Ungültige ID","fr":"ID invalide","es":"ID no válido"},"产品不存在":{"zh-Hant":"產品不存在","en":"Product not found","ja":"製品が見つかりません","ko":"제품을 찾을 수 없습니다","ru":"Товар не найден","de":"Produkt nicht gefunden","fr":"Produit introuvable","es":"Producto no encontrado"},"缺少产品 ID":{"zh-Hant":"缺少產品 ID","en":"Missing product ID","ja":"製品 ID がありません","ko":"제품 ID가 없습니다","ru":"Не указан ID товара","de":"Produkt-ID fehlt","fr":"ID du produit manquant","es":"Falta el ID del producto"},"Givera嘉雅科技 - 官方网站 | 智能时钟 GC-2026":{"zh-Hant":"Givera 嘉雅科技 - 官方網站 | 智慧時鐘 GC-2026","en":"Givera Jiaya Tech — Official Site | Smart Clock GC-2026","ja":"Givera ジャヤテック - 公式サイト | スマートクロック GC-2026","ko":"Givera 지야테크 - 공식 사이트 | 스마트 시계 GC-2026","ru":"Givera Jiaya Tech — официальный сайт | Умные часы GC-2026","de":"Givera Jiaya Tech — Offizielle Website | Smart Clock GC-2026","fr":"Givera Jiaya Tech — Site officiel | Smart Clock GC-2026","es":"Givera Jiaya Tech — Sitio oficial | Smart Clock GC-2026"},"Givera嘉雅科技官方网站，专注于嵌入式智能硬件研发。我们提供智能时钟GC-2026等产品，拥有自主研发团队。了解嘉雅科技的最新动态、产品参数与联系方式。":{"zh-Hant":"Givera 嘉雅科技官方網站，專注於嵌入式智慧硬體研發。我們提供智慧時鐘 GC-2026 等產品，並擁有自主研發團隊。了解嘉雅科技的最新動態、產品規格與聯絡方式。","en":"Official site of Givera Jiaya Tech — embedded smart hardware R&D. We build the GC-2026 smart clock and more with our own engineering team. Product specs, news and contact details.","ja":"Givera ジャヤテック公式サイト。組み込みスマートハードウェアの開発に特化し、スマートクロック GC-2026 などを自社チームで開発しています。製品仕様、最新情報、お問い合わせ先をご案内します。","ko":"Givera 지야테크 공식 사이트. 임베디드 스마트 하드웨어 개발에 집중하며, 스마트 시계 GC-2026 등 자체 개발 제품을 만들고 있습니다. 제품 사양, 최신 소식, 연락처를 확인하세요.","ru":"Официальный сайт Givera Jiaya Tech — разработка встраиваемой умной электроники. Мы создаём умные часы GC-2026 и другие устройства собственной командой. Характеристики, новости и контакты.","de":"Offizielle Website von Givera Jiaya Tech – Entwicklung eingebetteter Smart-Hardware. Wir bauen die Smart Clock GC-2026 und mehr mit eigenem Entwicklungsteam. Produktdaten, Neuigkeiten und Kontakt.","fr":"Site officiel de Givera Jiaya Tech — R&D en électronique embarquée. Nous concevons la Smart Clock GC-2026 et d'autres produits avec notre propre équipe. Fiches techniques, actualités et contact.","es":"Sitio oficial de Givera Jiaya Tech: I+D de hardware inteligente embebido. Creamos el Smart Clock GC-2026 y más productos con nuestro propio equipo. Especificaciones, novedades y contacto."},"管理":{"zh-Hant":"管理","en":"Admin","ja":"管理","ko":"관리자","ru":"Админ","de":"Admin","fr":"Admin","es":"Admin"},"Givera 嘉雅科技":{"zh-Hant":"Givera 嘉雅科技","en":"Givera Jiaya Tech","ja":"Givera ジャヤテック","ko":"Givera 지야테크","ru":"Givera Jiaya Tech","de":"Givera Jiaya Tech","fr":"Givera Jiaya Tech","es":"Givera Jiaya Tech"},"专注于智能硬件 · 让生活更简单":{"zh-Hant":"專注於智慧硬體 · 讓生活更簡單","en":"Smart hardware · A simpler life","ja":"スマートハードウェア · 暮らしをもっとシンプルに","ko":"스마트 하드웨어 · 더 단순한 삶","ru":"Умные устройства · Жизнь проще","de":"Smart-Hardware · Einfacheres Leben","fr":"Matériel intelligent · Une vie plus simple","es":"Hardware inteligente · Una vida más simple"},"关于我们":{"zh-Hant":"關於我們","en":"About us","ja":"私たちについて","ko":"회사 소개","ru":"О нас","de":"Über uns","fr":"À propos","es":"Sobre nosotros"},"Givera 嘉雅科技是一支专注于嵌入式智能硬件研发的团队。我们致力于将微控制器、传感器、无线通信等技术与日常生活场景结合， 打造简洁、实用、有温度的智能设备。从电路设计、固件开发到外观交互，我们坚持自主完成每一个环节， 用技术解决身边的小问题。":{"zh-Hant":"Givera 嘉雅科技是一支專注於嵌入式智慧硬體研發的團隊。我們致力於將微控制器、感測器、無線通訊等技術與日常生活場景結合，打造簡潔、實用、有溫度的智慧裝置。從電路設計、韌體開發到外觀互動，我們堅持自行完成每一個環節，用技術解決身邊的小問題。","en":"Givera Jiaya Tech is a small team focused on embedded smart hardware. We bring microcontrollers, sensors and wireless connectivity into everyday life, building simple, practical and human-friendly devices. From circuit design and firmware to the look and feel, we do every step ourselves — using technology to solve the small problems around us.","ja":"Givera ジャヤテックは、組み込みスマートハードウェアの開発に特化したチームです。マイコン、センサー、無線通信を日常のシーンに結びつけ、シンプルで実用的、そして温かみのあるデバイスを作っています。回路設計からファームウェア、外観・操作感まで、すべての工程を自社で手がけ、身近な課題を技術で解決します。","ko":"Givera 지야테크는 임베디드 스마트 하드웨어 개발에 집중하는 팀입니다. 마이크로컨트롤러, 센서, 무선 통신 기술을 일상에 접목해 단순하고 실용적이며 따뜻한 느낌의 스마트 기기를 만듭니다. 회로 설계부터 펌웨어 개발, 외형과 조작감까지 모든 과정을 직접 수행하며, 기술로 생활 속 작은 문제를 해결합니다.","ru":"Givera Jiaya Tech — небольшая команда, которая занимается встраиваемой умной электроникой. Мы объединяем микроконтроллеры, датчики и беспроводную связь с повседневной жизнью и создаём простые, практичные и дружелюбные устройства. От схемотехники и прошивок до внешнего вида и интерфейса — всё делаем сами и решаем небольшие задачи вокруг нас с помощью технологий.","de":"Givera Jiaya Tech ist ein kleines Team für eingebettete Smart-Hardware. Wir bringen Mikrocontroller, Sensoren und Funktechnik in den Alltag und bauen einfache, praktische und freundliche Geräte. Von der Schaltungsentwicklung über die Firmware bis zur Bedienung machen wir jeden Schritt selbst – Technik für die kleinen Probleme im Alltag.","fr":"Givera Jiaya Tech est une petite équipe spécialisée dans l'électronique embarquée. Nous intégrons microcontrôleurs, capteurs et liaisons sans fil au quotidien pour créer des appareils simples, pratiques et chaleureux. Du schéma électronique au micrologiciel, jusqu'à l'apparence et l'interface, nous réalisons chaque étape nous-mêmes — la technologie au service des petits problèmes du quotidien.","es":"Givera Jiaya Tech es un equipo centrado en el hardware inteligente embebido. Llevamos microcontroladores, sensores y conectividad inalámbrica a la vida diaria creando dispositivos sencillos, prácticos y cercanos. Desde el diseño del circuito y el firmware hasta la apariencia y la interacción, hacemos cada paso nosotros mismos: tecnología para resolver los pequeños problemas del día a día."},"成立年份":{"zh-Hant":"成立年份","en":"Founded","ja":"設立","ko":"설립 연도","ru":"Год основания","de":"Gründungsjahr","fr":"Année de création","es":"Año de fundación"},"在售产品":{"zh-Hant":"在售產品","en":"Products","ja":"販売中の製品","ko":"판매 중인 제품","ru":"Продукты","de":"Produkte","fr":"Produits","es":"Productos"},"自主研发":{"zh-Hant":"自主研發","en":"In-house R&D","ja":"自社開発","ko":"자체 개발","ru":"Собственная разработка","de":"Eigenentwicklung","fr":"Développement interne","es":"Desarrollo propio"},"当前版本":{"zh-Hant":"目前版本","en":"Current version","ja":"現行バージョン","ko":"현재 버전","ru":"Текущая версия","de":"Aktuelle Version","fr":"Version actuelle","es":"Versión actual"},"查看产品 →":{"zh-Hant":"查看產品 →","en":"View products →","ja":"製品を見る →","ko":"제품 보기 →","ru":"Смотреть продукты →","de":"Produkte ansehen →","fr":"Voir les produits →","es":"Ver productos →"},"© 2026 Givera 嘉雅科技 · 保留所有权利":{"zh-Hant":"© 2026 Givera 嘉雅科技 · 保留所有權利","en":"© 2026 Givera Jiaya Tech · All rights reserved","ja":"© 2026 Givera ジャヤテック · All rights reserved","ko":"© 2026 Givera 지야테크 · 모든 권리 보유","ru":"© 2026 Givera Jiaya Tech · Все права защищены","de":"© 2026 Givera Jiaya Tech · Alle Rechte vorbehalten","fr":"© 2026 Givera Jiaya Tech · Tous droits réservés","es":"© 2026 Givera Jiaya Tech · Todos los derechos reservados"},"Givera 嘉雅科技 Logo":{"zh-Hant":"Givera 嘉雅科技 標誌","en":"Givera Jiaya Tech logo","ja":"Givera ジャヤテック ロゴ","ko":"Givera 지야테크 로고","ru":"Логотип Givera Jiaya Tech","de":"Givera Jiaya Tech Logo","fr":"Logo Givera Jiaya Tech","es":"Logotipo de Givera Jiaya Tech"},"产品列表 · Givera 嘉雅科技":{"zh-Hant":"產品列表 · Givera 嘉雅科技","en":"Products · Givera Jiaya Tech","ja":"製品一覧 · Givera ジャヤテック","ko":"제품 목록 · Givera 지야테크","ru":"Продукты · Givera Jiaya Tech","de":"Produkte · Givera Jiaya Tech","fr":"Produits · Givera Jiaya Tech","es":"Productos · Givera Jiaya Tech"},"产品中心":{"zh-Hant":"產品中心","en":"Products","ja":"製品一覧","ko":"제품 센터","ru":"Продукты","de":"Produkte","fr":"Produits","es":"Productos"},"← 返回首页":{"zh-Hant":"← 返回首頁","en":"← Back to home","ja":"← ホームに戻る","ko":"← 홈으로","ru":"← На главную","de":"← Zur Startseite","fr":"← Retour à l'accueil","es":"← Volver al inicio"},"暂无产品":{"zh-Hant":"尚無產品","en":"No products yet","ja":"製品はまだありません","ko":"아직 제품이 없습니다","ru":"Пока нет продуктов","de":"Noch keine Produkte","fr":"Aucun produit pour l'instant","es":"Aún no hay productos"},"查看详情 →":{"zh-Hant":"查看詳情 →","en":"View details →","ja":"詳細を見る →","ko":"자세히 보기 →","ru":"Подробнее →","de":"Details ansehen →","fr":"Voir les détails →","es":"Ver detalles →"},"产品详情 · Givera 嘉雅科技":{"zh-Hant":"產品詳情 · Givera 嘉雅科技","en":"Product · Givera Jiaya Tech","ja":"製品詳細 · Givera ジャヤテック","ko":"제품 상세 · Givera 지야테크","ru":"Товар · Givera Jiaya Tech","de":"Produkt · Givera Jiaya Tech","fr":"Produit · Givera Jiaya Tech","es":"Producto · Givera Jiaya Tech"},"← 返回产品列表":{"zh-Hant":"← 返回產品列表","en":"← Back to products","ja":"← 製品一覧に戻る","ko":"← 제품 목록으로","ru":"← К списку продуктов","de":"← Zur Produktliste","fr":"← Retour à la liste","es":"← Volver a la lista"},"暂无详细说明":{"zh-Hant":"尚無詳細說明","en":"No details yet","ja":"詳細はまだありません","ko":"상세 설명이 없습니다","ru":"Описание пока отсутствует","de":"Noch keine Beschreibung","fr":"Pas encore de description","es":"Aún sin descripción"},"暂无图片":{"zh-Hant":"尚無圖片","en":"No images yet","ja":"画像はまだありません","ko":"이미지가 없습니다","ru":"Пока нет изображений","de":"Noch keine Bilder","fr":"Pas encore d'images","es":"Aún sin imágenes"},"下载固件":{"zh-Hant":"下載韌體","en":"Download firmware","ja":"ファームウェアをダウンロード","ko":"펌웨어 다운로드","ru":"Скачать прошивку","de":"Firmware herunterladen","fr":"Télécharger le micrologiciel","es":"Descargar firmware"},"暂无固件发布":{"zh-Hant":"尚無韌體發布","en":"No firmware released yet","ja":"公開中のファームウェアはありません","ko":"공개된 펌웨어가 없습니다","ru":"Прошивки пока не опубликованы","de":"Noch keine Firmware veröffentlicht","fr":"Aucun micrologiciel publié","es":"Aún no hay firmware publicado"},"产品详情":{"zh-Hant":"產品詳情","en":"Product details","ja":"製品詳細","ko":"제품 상세","ru":"Характеристики","de":"Produktdetails","fr":"Détails du produit","es":"Detalles del producto"},"产品图片":{"zh-Hant":"產品圖片","en":"Product images","ja":"製品画像","ko":"제품 이미지","ru":"Изображения","de":"Produktbilder","fr":"Images du produit","es":"Imágenes del producto"},"固件下载":{"zh-Hant":"韌體下載","en":"Firmware downloads","ja":"ファームウェアのダウンロード","ko":"펌웨어 다운로드","ru":"Прошивки","de":"Firmware-Downloads","fr":"Téléchargements du micrologiciel","es":"Descargas de firmware"},"登录 · Givera 嘉雅科技":{"zh-Hant":"登入 · Givera 嘉雅科技","en":"Sign in · Givera Jiaya Tech","ja":"ログイン · Givera ジャヤテック","ko":"로그인 · Givera 지야테크","ru":"Вход · Givera Jiaya Tech","de":"Anmelden · Givera Jiaya Tech","fr":"Connexion · Givera Jiaya Tech","es":"Iniciar sesión · Givera Jiaya Tech"},"登 录":{"zh-Hant":"登 入","en":"Sign in","ja":"ログイン","ko":"로 그 인","ru":"В о й т и","de":"A n m e l d e n","fr":"S e   c o n n e c t e r","es":"I n i c i a r   s e s i ó n"},"账号":{"zh-Hant":"帳號","en":"Account","ja":"アカウント","ko":"계정","ru":"Аккаунт","de":"Konto","fr":"Compte","es":"Cuenta"},"密码":{"zh-Hant":"密碼","en":"Password","ja":"パスワード","ko":"비밀번호","ru":"Пароль","de":"Passwort","fr":"Mot de passe","es":"Contraseña"},"注册":{"zh-Hant":"註冊","en":"Sign up","ja":"新規登録","ko":"회원가입","ru":"Регистрация","de":"Registrieren","fr":"S'inscrire","es":"Registrarse"},"忘记密码":{"zh-Hant":"忘記密碼","en":"Forgot password","ja":"パスワードをお忘れですか","ko":"비밀번호 찾기","ru":"Забыли пароль?","de":"Passwort vergessen","fr":"Mot de passe oublié","es":"¿Olvidaste la contraseña?"},"显示密码":{"zh-Hant":"顯示密碼","en":"Show password","ja":"パスワードを表示","ko":"비밀번호 표시","ru":"Показать пароль","de":"Passwort anzeigen","fr":"Afficher le mot de passe","es":"Mostrar contraseña"},"显示/隐藏密码":{"zh-Hant":"顯示/隱藏密碼","en":"Show/hide password","ja":"パスワードの表示/非表示","ko":"비밀번호 표시/숨기기","ru":"Показать/скрыть пароль","de":"Passwort anzeigen/verbergen","fr":"Afficher/masquer le mot de passe","es":"Mostrar/ocultar contraseña"},"登录失败":{"zh-Hant":"登入失敗","en":"Sign-in failed","ja":"ログインに失敗しました","ko":"로그인 실패","ru":"Не удалось войти","de":"Anmeldung fehlgeschlagen","fr":"Échec de la connexion","es":"Error al iniciar sesión"},"注册 · Givera 嘉雅科技":{"zh-Hant":"註冊 · Givera 嘉雅科技","en":"Sign up · Givera Jiaya Tech","ja":"新規登録 · Givera ジャヤテック","ko":"회원가입 · Givera 지야테크","ru":"Регистрация · Givera Jiaya Tech","de":"Registrieren · Givera Jiaya Tech","fr":"Inscription · Givera Jiaya Tech","es":"Registro · Givera Jiaya Tech"},"注册新账号":{"zh-Hant":"註冊新帳號","en":"Create an account","ja":"アカウントを作成","ko":"새 계정 만들기","ru":"Создать аккаунт","de":"Konto erstellen","fr":"Créer un compte","es":"Crear una cuenta"},"密码（至少 6 位）":{"zh-Hant":"密碼（至少 6 碼）","en":"Password (min. 6 characters)","ja":"パスワード（6 文字以上）","ko":"비밀번호(6자 이상)","ru":"Пароль (не менее 6 символов)","de":"Passwort (mind. 6 Zeichen)","fr":"Mot de passe (6 caractères min.)","es":"Contraseña (mín. 6 caracteres)"},"确认密码":{"zh-Hant":"確認密碼","en":"Confirm password","ja":"パスワード（確認）","ko":"비밀번호 확인","ru":"Подтвердите пароль","de":"Passwort bestätigen","fr":"Confirmer le mot de passe","es":"Confirmar contraseña"},"注 册":{"zh-Hant":"註 冊","en":"Sign up","ja":"登録","ko":"가 입","ru":"С о з д а т ь","de":"R e g i s t r i e r e n","fr":"S ' i n s c r i r e","es":"R e g i s t r a r s e"},"已有账号？去登录":{"zh-Hant":"已有帳號？前往登入","en":"Already have an account? Sign in","ja":"アカウントをお持ちの方はログイン","ko":"이미 계정이 있으신가요? 로그인","ru":"Уже есть аккаунт? Войти","de":"Schon ein Konto? Anmelden","fr":"Déjà un compte ? Se connecter","es":"¿Ya tienes cuenta? Inicia sesión"},"6 位数字":{"zh-Hant":"6 位數字","en":"6-digit code","ja":"6 桁の数字","ko":"6자리 숫자","ru":"6 цифр","de":"6-stelliger Code","fr":"Code à 6 chiffres","es":"Código de 6 dígitos"},"注册成功！正在跳转...":{"zh-Hant":"註冊成功！正在跳轉…","en":"Registered! Redirecting…","ja":"登録が完了しました。移動中…","ko":"가입 완료! 이동 중…","ru":"Регистрация завершена! Переход…","de":"Registriert! Weiterleitung…","fr":"Inscription réussie ! Redirection…","es":"¡Registro completado! Redirigiendo…"},"注册失败":{"zh-Hant":"註冊失敗","en":"Registration failed","ja":"登録に失敗しました","ko":"가입 실패","ru":"Не удалось зарегистрироваться","de":"Registrierung fehlgeschlagen","fr":"Échec de l'inscription","es":"Error en el registro"},"重置密码 · Givera 嘉雅科技":{"zh-Hant":"重設密碼 · Givera 嘉雅科技","en":"Reset password · Givera Jiaya Tech","ja":"パスワード再設定 · Givera ジャヤテック","ko":"비밀번호 재설정 · Givera 지야테크","ru":"Сброс пароля · Givera Jiaya Tech","de":"Passwort zurücksetzen · Givera Jiaya Tech","fr":"Réinitialiser le mot de passe · Givera Jiaya Tech","es":"Restablecer contraseña · Givera Jiaya Tech"},"重置密码":{"zh-Hant":"重設密碼","en":"Reset password","ja":"パスワード再設定","ko":"비밀번호 재설정","ru":"Сброс пароля","de":"Passwort zurücksetzen","fr":"Réinitialiser le mot de passe","es":"Restablecer contraseña"},"注册邮箱":{"zh-Hant":"註冊電子郵件","en":"Registered email","ja":"登録済みメールアドレス","ko":"가입한 이메일","ru":"E-mail аккаунта","de":"Registrierte E-Mail","fr":"E-mail du compte","es":"Correo de la cuenta"},"新密码（至少 6 位）":{"zh-Hant":"新密碼（至少 6 碼）","en":"New password (min. 6 characters)","ja":"新しいパスワード（6 文字以上）","ko":"새 비밀번호(6자 이상)","ru":"Новый пароль (не менее 6 символов)","de":"Neues Passwort (mind. 6 Zeichen)","fr":"Nouveau mot de passe (6 caractères min.)","es":"Nueva contraseña (mín. 6 caracteres)"},"确认新密码":{"zh-Hant":"確認新密碼","en":"Confirm new password","ja":"新しいパスワード（確認）","ko":"새 비밀번호 확인","ru":"Подтвердите новый пароль","de":"Neues Passwort bestätigen","fr":"Confirmer le nouveau mot de passe","es":"Confirmar nueva contraseña"},"返回登录":{"zh-Hant":"返回登入","en":"Back to sign-in","ja":"ログインに戻る","ko":"로그인으로 돌아가기","ru":"Вернуться ко входу","de":"Zurück zur Anmeldung","fr":"Retour à la connexion","es":"Volver a iniciar sesión"},"重置成功！正在跳转登录...":{"zh-Hant":"重設成功！正在跳轉至登入…","en":"Password reset! Redirecting to sign-in…","ja":"再設定が完了しました。ログイン画面へ移動中…","ko":"재설정 완료! 로그인 화면으로 이동 중…","ru":"Пароль сброшен! Переход ко входу…","de":"Passwort zurückgesetzt! Weiterleitung zur Anmeldung…","fr":"Mot de passe réinitialisé ! Redirection vers la connexion…","es":"¡Contraseña restablecida! Redirigiendo al inicio de sesión…"},"重置失败":{"zh-Hant":"重設失敗","en":"Reset failed","ja":"再設定に失敗しました","ko":"재설정 실패","ru":"Не удалось сбросить пароль","de":"Zurücksetzen fehlgeschlagen","fr":"Échec de la réinitialisation","es":"Error al restablecer"},"数据管理 · Givera":{"zh-Hant":"資料管理 · Givera","en":"Data management · Givera","ja":"データ管理 · Givera","ko":"데이터 관리 · Givera","ru":"Управление данными · Givera","de":"Datenverwaltung · Givera","fr":"Gestion des données · Givera","es":"Gestión de datos · Givera"},"数据管理面板":{"zh-Hant":"資料管理面板","en":"Data management","ja":"データ管理","ko":"데이터 관리","ru":"Управление данными","de":"Datenverwaltung","fr":"Gestion des données","es":"Gestión de datos"},"+ 添加项目":{"zh-Hant":"+ 新增項目","en":"+ Add item","ja":"＋ 項目を追加","ko":"+ 항목 추가","ru":"+ Добавить товар","de":"+ Produkt hinzufügen","fr":"+ Ajouter un produit","es":"+ Añadir producto"},"添加项目":{"zh-Hant":"新增項目","en":"Add item","ja":"項目を追加","ko":"항목 추가","ru":"Добавить товар","de":"Produkt hinzufügen","fr":"Ajouter un produit","es":"Añadir producto"},"编辑项目":{"zh-Hant":"編輯項目","en":"Edit item","ja":"項目を編集","ko":"항목 편집","ru":"Изменить товар","de":"Produkt bearbeiten","fr":"Modifier le produit","es":"Editar producto"},"描述（列表页显示）":{"zh-Hant":"描述（列表頁顯示）","en":"Description (shown in the list)","ja":"説明（一覧に表示）","ko":"설명(목록에 표시)","ru":"Описание (в списке)","de":"Beschreibung (in der Liste)","fr":"Description (affichée dans la liste)","es":"Descripción (se muestra en la lista)"},"详细内容（产品详情页显示）":{"zh-Hant":"詳細內容（產品詳情頁顯示）","en":"Details (shown on the product page)","ja":"詳細（製品ページに表示）","ko":"상세 내용(제품 페이지에 표시)","ru":"Подробное описание (на странице товара)","de":"Details (auf der Produktseite)","fr":"Détails (affichés sur la page produit)","es":"Detalles (se muestran en la página del producto)"},"封面图（列表页 + 详情页顶部）":{"zh-Hant":"封面圖（列表頁 + 詳情頁頂部）","en":"Cover image (list + product page)","ja":"カバー画像（一覧＋製品ページ上部）","ko":"대표 이미지(목록 + 제품 페이지 상단)","ru":"Обложка (список и страница товара)","de":"Titelbild (Liste + Produktseite)","fr":"Image de couverture (liste + page produit)","es":"Imagen de portada (lista + página del producto)"},"📷 上传封面图":{"zh-Hant":"📷 上傳封面圖","en":"📷 Upload cover","ja":"📷 カバー画像をアップロード","ko":"📷 대표 이미지 업로드","ru":"📷 Загрузить обложку","de":"📷 Titelbild hochladen","fr":"📷 Téléverser la couverture","es":"📷 Subir portada"},"✕ 移除封面":{"zh-Hant":"✕ 移除封面","en":"✕ Remove cover","ja":"✕ カバーを削除","ko":"✕ 대표 이미지 제거","ru":"✕ Удалить обложку","de":"✕ Titelbild entfernen","fr":"✕ Retirer la couverture","es":"✕ Quitar portada"},"相册（详情页图片展示，可多张）":{"zh-Hant":"相簿（詳情頁圖片展示，可多張）","en":"Gallery (multiple images on the product page)","ja":"ギャラリー（製品ページに複数枚表示）","ko":"갤러리(제품 페이지에 여러 장 표시)","ru":"Галерея (несколько изображений на странице товара)","de":"Galerie (mehrere Bilder auf der Produktseite)","fr":"Galerie (plusieurs images sur la page produit)","es":"Galería (varias imágenes en la página del producto)"},"🖼️ 上传多张照片":{"zh-Hant":"🖼️ 上傳多張照片","en":"🖼️ Upload photos","ja":"🖼️ 写真をアップロード","ko":"🖼️ 사진 여러 장 업로드","ru":"🖼️ Загрузить фото","de":"🖼️ Fotos hochladen","fr":"🖼️ Téléverser des photos","es":"🖼️ Subir fotos"},"搜索名称或描述…":{"zh-Hant":"搜尋名稱或描述…","en":"Search name or description…","ja":"名前または説明で検索…","ko":"이름 또는 설명 검색…","ru":"Поиск по названию или описанию…","de":"Name oder Beschreibung suchen…","fr":"Rechercher un nom ou une description…","es":"Buscar nombre o descripción…"},"项目名称":{"zh-Hant":"項目名稱","en":"Item name","ja":"項目名","ko":"항목 이름","ru":"Название товара","de":"Produktname","fr":"Nom du produit","es":"Nombre del producto"},"一句话简介":{"zh-Hant":"一句話簡介","en":"One-line summary","ja":"一行の概要","ko":"한 줄 소개","ru":"Краткое описание","de":"Kurzbeschreibung","fr":"Description courte","es":"Descripción breve"},"## 硬件参数\n主控芯片：ESP32-S3\n\n## 功能特性\n- 时间显示：...":{"zh-Hant":"## 硬體規格\n主控晶片：ESP32-S3\n\n## 功能特色\n- 時間顯示：...","en":"## Hardware\nMCU: ESP32-S3\n\n## Features\n- Clock: ...","ja":"## ハードウェア\nMCU：ESP32-S3\n\n## 機能\n- 時計表示：...","ko":"## 하드웨어 사양\nMCU: ESP32-S3\n\n## 주요 기능\n- 시계 표시: ...","ru":"## Характеристики\nMCU: ESP32-S3\n\n## Возможности\n- Часы: ...","de":"## Hardware\nMCU: ESP32-S3\n\n## Funktionen\n- Uhrzeit: ...","fr":"## Caractéristiques\nMCU : ESP32-S3\n\n## Fonctions\n- Heure : ...","es":"## Especificaciones\nMCU: ESP32-S3\n\n## Funciones\n- Hora: ..."},"还没有数据，点击右上角「添加项目」":{"zh-Hant":"尚無資料，點擊右上角「+ 新增項目」","en":"No data yet. Click “+ Add item” at the top right.","ja":"データはまだありません。右上の「＋ 項目を追加」から作成できます。","ko":"아직 데이터가 없습니다. 오른쪽 위 「+ 항목 추가」를 클릭하세요.","ru":"Пока нет данных. Нажмите «+ Добавить товар» справа вверху.","de":"Noch keine Daten. Oben rechts auf „+ Produkt hinzufügen“ klicken.","fr":"Aucune donnée. Cliquez sur « + Ajouter un produit » en haut à droite.","es":"Aún no hay datos. Pulsa «+ Añadir producto» arriba a la derecha."},"没有匹配的结果":{"zh-Hant":"沒有符合的結果","en":"No matching results","ja":"一致する結果はありません","ko":"일치하는 결과가 없습니다","ru":"Ничего не найдено","de":"Keine Treffer","fr":"Aucun résultat","es":"Sin resultados"},"压缩上传中…":{"zh-Hant":"壓縮上傳中…","en":"Compressing & uploading…","ja":"圧縮してアップロード中…","ko":"압축 후 업로드 중…","ru":"Сжатие и загрузка…","de":"Komprimieren und hochladen…","fr":"Compression et téléversement…","es":"Comprimiendo y subiendo…"},"✓ 封面上传成功，保存后生效（部署约需 1 分钟）":{"zh-Hant":"✓ 封面上傳成功，儲存後生效（部署約需 1 分鐘）","en":"✓ Cover uploaded. Save to apply (deployment takes about 1 minute).","ja":"✓ カバー画像をアップロードしました。保存後に反映されます（反映まで約 1 分）。","ko":"✓ 대표 이미지를 업로드했습니다. 저장하면 반영됩니다(배포까지 약 1분).","ru":"✓ Обложка загружена. Нажмите «Сохранить» (публикация около 1 минуты).","de":"✓ Titelbild hochgeladen. Nach dem Speichern aktiv (Bereitstellung ca. 1 Minute).","fr":"✓ Couverture téléversée. Enregistrez pour appliquer (déploiement ~1 minute).","es":"✓ Portada subida. Guarda para aplicar (despliegue ~1 minuto)."},"确定要删除这条记录吗？":{"zh-Hant":"確定要刪除這筆記錄嗎？","en":"Delete this item?","ja":"この項目を削除しますか？","ko":"이 항목을 삭제할까요?","ru":"Удалить этот товар?","de":"Dieses Produkt löschen?","fr":"Supprimer ce produit ?","es":"¿Eliminar este producto?"},"私人数据 · Givera":{"zh-Hant":"私人資料 · Givera","en":"Private data · Givera","ja":"プライベートデータ · Givera","ko":"비공개 데이터 · Givera","ru":"Личные данные · Givera","de":"Private Daten · Givera","fr":"Données privées · Givera","es":"Datos privados · Givera"},"← 产品管理":{"zh-Hant":"← 產品管理","en":"← Products","ja":"← 製品管理","ko":"← 제품 관리","ru":"← Товары","de":"← Produkte","fr":"← Produits","es":"← Productos"},"+ 添加记录":{"zh-Hant":"+ 新增記錄","en":"+ Add record","ja":"＋ 記録を追加","ko":"+ 기록 추가","ru":"+ Добавить запись","de":"+ Eintrag hinzufügen","fr":"+ Ajouter une entrée","es":"+ Añadir registro"},"添加记录":{"zh-Hant":"新增記錄","en":"Add record","ja":"記録を追加","ko":"기록 추가","ru":"Добавить запись","de":"Eintrag hinzufügen","fr":"Ajouter une entrée","es":"Añadir registro"},"编辑记录":{"zh-Hant":"編輯記錄","en":"Edit record","ja":"記録を編集","ko":"기록 편집","ru":"Изменить запись","de":"Eintrag bearbeiten","fr":"Modifier l'entrée","es":"Editar registro"},"详细描述":{"zh-Hant":"詳細描述","en":"Description","ja":"詳細","ko":"상세 설명","ru":"Подробное описание","de":"Beschreibung","fr":"Description détaillée","es":"Descripción detallada"},"图片（可多张）":{"zh-Hant":"圖片（可多張）","en":"Images (multiple)","ja":"画像（複数可）","ko":"이미지(여러 장 가능)","ru":"Изображения (можно несколько)","de":"Bilder (mehrere möglich)","fr":"Images (plusieurs possibles)","es":"Imágenes (varias posibles)"},"🖼️ 上传照片":{"zh-Hant":"🖼️ 上傳照片","en":"🖼️ Upload photos","ja":"🖼️ 写真をアップロード","ko":"🖼️ 사진 업로드","ru":"🖼️ Загрузить фото","de":"🖼️ Fotos hochladen","fr":"🖼️ Téléverser des photos","es":"🖼️ Subir fotos"},"记录名称":{"zh-Hant":"記錄名稱","en":"Record name","ja":"記録名","ko":"기록 이름","ru":"Название записи","de":"Eintragsname","fr":"Nom de l'entrée","es":"Nombre del registro"},"记录内容":{"zh-Hant":"記錄內容","en":"Record content","ja":"記録内容","ko":"기록 내용","ru":"Содержание записи","de":"Eintragsinhalt","fr":"Contenu de l'entrée","es":"Contenido del registro"},"还没有数据，点击右上角「添加记录」":{"zh-Hant":"尚無資料，點擊右上角「+ 新增記錄」","en":"No data yet. Click “+ Add record” at the top right.","ja":"データはまだありません。右上の「＋ 記録を追加」から作成できます。","ko":"아직 데이터가 없습니다. 오른쪽 위 「+ 기록 추가」를 클릭하세요.","ru":"Пока нет данных. Нажмите «+ Добавить запись» справа вверху.","de":"Noch keine Daten. Oben rechts auf „+ Eintrag hinzufügen“ klicken.","fr":"Aucune donnée. Cliquez sur « + Ajouter une entrée » en haut à droite.","es":"Aún no hay datos. Pulsa «+ Añadir registro» arriba a la derecha."},"固件管理 · Givera":{"zh-Hant":"韌體管理 · Givera","en":"Firmware · Givera","ja":"ファームウェア管理 · Givera","ko":"펌웨어 관리 · Givera","ru":"Прошивки · Givera","de":"Firmware · Givera","fr":"Micrologiciel · Givera","es":"Firmware · Givera"},"+ 添加固件":{"zh-Hant":"+ 新增韌體","en":"+ Add firmware","ja":"＋ ファームウェアを追加","ko":"+ 펌웨어 추가","ru":"+ Добавить прошивку","de":"+ Firmware hinzufügen","fr":"+ Ajouter un micrologiciel","es":"+ Añadir firmware"},"添加固件":{"zh-Hant":"新增韌體","en":"Add firmware","ja":"ファームウェアを追加","ko":"펌웨어 추가","ru":"Добавить прошивку","de":"Firmware hinzufügen","fr":"Ajouter un micrologiciel","es":"Añadir firmware"},"所属产品":{"zh-Hant":"所屬產品","en":"Product","ja":"対象製品","ko":"대상 제품","ru":"Товар","de":"Produkt","fr":"Produit","es":"Producto"},"版本":{"zh-Hant":"版本","en":"Version","ja":"バージョン","ko":"버전","ru":"Версия","de":"Version","fr":"Version","es":"Versión"},"说明":{"zh-Hant":"說明","en":"Notes","ja":"説明","ko":"설명","ru":"Описание","de":"Hinweise","fr":"Notes","es":"Notas"},"文件名":{"zh-Hant":"檔名","en":"File","ja":"ファイル名","ko":"파일명","ru":"Файл","de":"Datei","fr":"Fichier","es":"Archivo"},"大小":{"zh-Hant":"大小","en":"Size","ja":"サイズ","ko":"크기","ru":"Размер","de":"Größe","fr":"Taille","es":"Tamaño"},"版本号（如 v1.0.0）":{"zh-Hant":"版本號（例：v1.0.0）","en":"Version (e.g. v1.0.0)","ja":"バージョン（例：v1.0.0）","ko":"버전(예: v1.0.0)","ru":"Версия (например, v1.0.0)","de":"Version (z. B. v1.0.0)","fr":"Version (ex. v1.0.0)","es":"Versión (p. ej. v1.0.0)"},"固件文件（.zip，不超过 20MB）":{"zh-Hant":"韌體檔案（.zip，不超過 20MB）","en":"Firmware file (.zip, up to 20MB)","ja":"ファームウェアファイル（.zip、20MB まで）","ko":"펌웨어 파일(.zip, 20MB 이하)","ru":"Файл прошивки (.zip, до 20 МБ)","de":"Firmware-Datei (.zip, max. 20 MB)","fr":"Fichier micrologiciel (.zip, 20 Mo max.)","es":"Archivo de firmware (.zip, máx. 20 MB)"},"📦 选择 zip 文件":{"zh-Hant":"📦 選擇 zip 檔案","en":"📦 Choose .zip file","ja":"📦 .zip ファイルを選択","ko":"📦 zip 파일 선택","ru":"📦 Выбрать .zip","de":"📦 .zip-Datei wählen","fr":"📦 Choisir un fichier .zip","es":"📦 Elegir archivo .zip"},"上传并保存":{"zh-Hant":"上傳並儲存","en":"Upload & save","ja":"アップロードして保存","ko":"업로드 후 저장","ru":"Загрузить и сохранить","de":"Hochladen & speichern","fr":"Téléverser et enregistrer","es":"Subir y guardar"},"本次更新内容":{"zh-Hant":"本次更新內容","en":"What's new in this release","ja":"今回の更新内容","ko":"이번 업데이트 내용","ru":"Что нового","de":"Was ist neu","fr":"Nouveautés","es":"Novedades"},"还没有固件，点右上角「添加固件」":{"zh-Hant":"尚無韌體，點右上角「+ 新增韌體」","en":"No firmware yet. Click “+ Add firmware” at the top right.","ja":"ファームウェアはまだありません。右上の「＋ ファームウェアを追加」から登録できます。","ko":"아직 펌웨어가 없습니다. 오른쪽 위 「+ 펌웨어 추가」를 클릭하세요.","ru":"Прошивок пока нет. Нажмите «+ Добавить прошивку» справа вверху.","de":"Noch keine Firmware. Oben rechts auf „+ Firmware hinzufügen“ klicken.","fr":"Aucun micrologiciel. Cliquez sur « + Ajouter un micrologiciel » en haut à droite.","es":"Aún no hay firmware. Pulsa «+ Añadir firmware» arriba a la derecha."},"（请先添加产品）":{"zh-Hant":"（請先新增產品）","en":"(add a product first)","ja":"（先に製品を追加してください）","ko":"(먼저 제품을 추가하세요)","ru":"(сначала добавьте товар)","de":"(zuerst ein Produkt anlegen)","fr":"(ajoutez d'abord un produit)","es":"(añade primero un producto)"},"确定删除这条固件吗？会同时删除 GitHub 上的文件。":{"zh-Hant":"確定刪除這筆韌體嗎？會同時刪除 GitHub 上的檔案。","en":"Delete this firmware? The file on GitHub will also be deleted.","ja":"このファームウェアを削除しますか？GitHub 上のファイルも同時に削除されます。","ko":"이 펌웨어를 삭제할까요? GitHub의 파일도 함께 삭제됩니다.","ru":"Удалить прошивку? Файл на GitHub тоже будет удалён.","de":"Firmware löschen? Die Datei auf GitHub wird ebenfalls gelöscht.","fr":"Supprimer ce micrologiciel ? Le fichier sur GitHub sera aussi supprimé.","es":"¿Eliminar este firmware? El archivo en GitHub también se eliminará."},"请选择产品":{"zh-Hant":"請選擇產品","en":"Please select a product","ja":"製品を選択してください","ko":"제품을 선택하세요","ru":"Выберите товар","de":"Bitte ein Produkt wählen","fr":"Veuillez choisir un produit","es":"Selecciona un producto"},"请填写版本号":{"zh-Hant":"請填寫版本號","en":"Please enter a version","ja":"バージョンを入力してください","ko":"버전을 입력하세요","ru":"Укажите версию","de":"Bitte eine Version eingeben","fr":"Veuillez saisir une version","es":"Introduce una versión"},"请选择固件文件":{"zh-Hant":"請選擇韌體檔案","en":"Please choose a firmware file","ja":"ファームウェアファイルを選択してください","ko":"펌웨어 파일을 선택하세요","ru":"Выберите файл прошивки","de":"Bitte eine Firmware-Datei wählen","fr":"Veuillez choisir un fichier micrologiciel","es":"Selecciona un archivo de firmware"},"上传文件到 GitHub…":{"zh-Hant":"上傳檔案到 GitHub…","en":"Uploading file to GitHub…","ja":"GitHub にアップロード中…","ko":"GitHub에 파일 업로드 중…","ru":"Загрузка файла на GitHub…","de":"Datei wird zu GitHub hochgeladen…","fr":"Téléversement du fichier vers GitHub…","es":"Subiendo archivo a GitHub…"},"文件上传失败":{"zh-Hant":"檔案上傳失敗","en":"File upload failed","ja":"ファイルのアップロードに失敗しました","ko":"파일 업로드 실패","ru":"Не удалось загрузить файл","de":"Datei-Upload fehlgeschlagen","fr":"Échec du téléversement du fichier","es":"Error al subir el archivo"},"写入数据库…":{"zh-Hant":"寫入資料庫…","en":"Writing to the database…","ja":"データベースに書き込み中…","ko":"데이터베이스에 기록 중…","ru":"Запись в базу данных…","de":"Wird in die Datenbank geschrieben…","fr":"Écriture dans la base de données…","es":"Escribiendo en la base de datos…"},"✓ 上传成功！约 1-2 分钟后可在产品页下载":{"zh-Hant":"✓ 上傳成功！約 1-2 分鐘後可在產品頁下載","en":"✓ Uploaded! It will be available on the product page in about 1–2 minutes.","ja":"✓ アップロードしました。1〜2 分後に製品ページからダウンロードできます。","ko":"✓ 업로드 완료! 약 1~2분 후 제품 페이지에서 다운로드할 수 있습니다.","ru":"✓ Загружено! Через 1–2 минуты файл появится на странице товара.","de":"✓ Hochgeladen! In ca. 1–2 Minuten auf der Produktseite verfügbar.","fr":"✓ Téléversé ! Disponible sur la page produit dans 1 à 2 minutes.","es":"✓ ¡Subido! Disponible en la página del producto en 1–2 minutos."},"用户中心 · Givera":{"zh-Hant":"會員中心 · Givera","en":"My account · Givera","ja":"マイページ · Givera","ko":"마이페이지 · Givera","ru":"Личный кабинет · Givera","de":"Mein Konto · Givera","fr":"Mon compte · Givera","es":"Mi cuenta · Givera"},"用户中心":{"zh-Hant":"會員中心","en":"My account","ja":"マイページ","ko":"마이페이지","ru":"Личный кабинет","de":"Mein Konto","fr":"Mon compte","es":"Mi cuenta"},"欢迎回来 👋":{"zh-Hant":"歡迎回來 👋","en":"Welcome back 👋","ja":"おかえりなさい 👋","ko":"다시 오신 것을 환영합니다 👋","ru":"С возвращением 👋","de":"Willkommen zurück 👋","fr":"Bon retour 👋","es":"Bienvenido de nuevo 👋"},"你已成功登录。这里是普通用户中心页面。":{"zh-Hant":"你已成功登入。這裡是會員中心頁面。","en":"You are signed in. This is your account page.","ja":"ログインしています。ここはマイページです。","ko":"로그인되어 있습니다. 여기는 마이페이지입니다.","ru":"Вы вошли в аккаунт. Это страница личного кабинета.","de":"Sie sind angemeldet. Dies ist Ihre Kontoseite.","fr":"Vous êtes connecté. Voici votre page de compte.","es":"Has iniciado sesión. Esta es tu página de cuenta."},"多语言内容（可选）":{"zh-Hant":"多語言內容（選填）","en":"Multilingual content (optional)","ja":"多言語コンテンツ（任意）","ko":"다국어 콘텐츠(선택)","ru":"Многоязычный контент (необязательно)","de":"Mehrsprachige Inhalte (optional)","fr":"Contenu multilingue (facultatif)","es":"Contenido multilingüe (opcional)"},"留空则显示中文原文":{"zh-Hant":"留空則顯示中文原文","en":"Leave blank to use the Chinese original","ja":"空欄の場合は中国語の原文を表示します","ko":"비워 두면 중국어 원문이 표시됩니다","ru":"Оставьте пустым, чтобы показывать китайский оригинал","de":"Leer lassen, um das chinesische Original zu zeigen","fr":"Laisser vide pour afficher l'original chinois","es":"Déjalo vacío para mostrar el original en chino"},"详细内容":{"zh-Hant":"詳細內容","en":"Details","ja":"詳細内容","ko":"상세 내용","ru":"Подробное описание","de":"Details","fr":"Détails","es":"Detalles"}};

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
  var RULE_TPL = {"cooldown":{"zh-Hant":"{1} 秒後重發","en":"{1}s","ja":"{1}秒後","ko":"{1}초 후","ru":"{1} с","de":"Noch {1} s","fr":"{1} s","es":"{1} s"},"uploadProgress":{"zh-Hant":"上傳中 {1}/{2}…","en":"Uploading {1}/{2}…","ja":"アップロード中 {1}/{2}…","ko":"업로드 중 {1}/{2}…","ru":"Загрузка {1}/{2}…","de":"Hochladen {1}/{2}…","fr":"Téléversement {1}/{2}…","es":"Subiendo {1}/{2}…"},"imageFailed":{"zh-Hant":"第 {1} 張失敗：{2}","en":"Image {1} failed: {2}","ja":"{1} 枚目で失敗：{2}","ko":"{1}번째 실패: {2}","ru":"Ошибка на изображении {1}: {2}","de":"Bild {1} fehlgeschlagen: {2}","fr":"Échec de l'image {1} : {2}","es":"Error en la imagen {1}: {2}"},"uploadedSaved":{"zh-Hant":"✓ 已上傳 {1} 張，儲存後生效（部署約需 1 分鐘）","en":"✓ {1} image(s) uploaded. Save to apply (deployment takes about 1 minute).","ja":"✓ {1} 枚アップロードしました。保存後に反映されます（反映まで約 1 分）。","ko":"✓ {1}장 업로드했습니다. 저장하면 반영됩니다(배포까지 약 1분).","ru":"✓ Загружено изображений: {1}. Сохраните изменения (публикация около 1 минуты).","de":"✓ {1} Bild(er) hochgeladen. Nach dem Speichern aktiv (Bereitstellung ca. 1 Minute).","fr":"✓ {1} image(s) téléversée(s). Enregistrez pour appliquer (déploiement ~1 minute).","es":"✓ {1} imagen(es) subida(s). Guarda para aplicar (despliegue ~1 minuto)."},"uploaded":{"zh-Hant":"✓ 已上傳 {1} 張","en":"✓ {1} image(s) uploaded","ja":"✓ {1} 枚アップロードしました","ko":"✓ {1}장 업로드했습니다","ru":"✓ Загружено изображений: {1}","de":"✓ {1} Bild(er) hochgeladen","fr":"✓ {1} image(s) téléversée(s)","es":"✓ {1} imagen(es) subida(s)"},"coverFailed":{"zh-Hant":"封面上傳失敗：{1}","en":"Cover upload failed: {1}","ja":"カバー画像のアップロードに失敗しました：{1}","ko":"대표 이미지 업로드 실패: {1}","ru":"Не удалось загрузить обложку: {1}","de":"Titelbild-Upload fehlgeschlagen: {1}","fr":"Échec du téléversement de la couverture : {1}","es":"Error al subir la portada: {1}"},"loadFailed":{"zh-Hant":"載入失敗：{1}","en":"Failed to load: {1}","ja":"読み込みに失敗しました：{1}","ko":"불러오기 실패: {1}","ru":"Не удалось загрузить: {1}","de":"Laden fehlgeschlagen: {1}","fr":"Échec du chargement : {1}","es":"Error al cargar: {1}"},"network":{"zh-Hant":"網路錯誤：{1}","en":"Network error: {1}","ja":"ネットワークエラー：{1}","ko":"네트워크 오류: {1}","ru":"Ошибка сети: {1}","de":"Netzwerkfehler: {1}","fr":"Erreur réseau : {1}","es":"Error de red: {1}"},"httpStatus":{"zh-Hant":"伺服器回應異常（HTTP {1}）","en":"Unexpected server response (HTTP {1})","ja":"サーバー応答が異常です（HTTP {1}）","ko":"서버 응답이 비정상입니다(HTTP {1})","ru":"Неожиданный ответ сервера (HTTP {1})","de":"Unerwartete Serverantwort (HTTP {1})","fr":"Réponse inattendue du serveur (HTTP {1})","es":"Respuesta inesperada del servidor (HTTP {1})"},"fileSelected":{"zh-Hant":"已選擇：{1}（{2}）","en":"Selected: {1} ({2})","ja":"選択中：{1}（{2}）","ko":"선택됨: {1}({2})","ru":"Выбрано: {1} ({2})","de":"Ausgewählt: {1} ({2})","fr":"Sélectionné : {1} ({2})","es":"Seleccionado: {1} ({2})"},"dbDeletedGhFailed":{"zh-Hant":"資料庫記錄已刪除，但 GitHub 檔案刪除失敗：{1}","en":"Database record deleted, but removing the GitHub file failed: {1}","ja":"データベースの記録は削除しましたが、GitHub 上のファイル削除に失敗しました：{1}","ko":"데이터베이스 기록은 삭제했지만 GitHub 파일 삭제에 실패했습니다: {1}","ru":"Запись в базе удалена, но удалить файл на GitHub не удалось: {1}","de":"Datenbankeintrag gelöscht, aber die GitHub-Datei konnte nicht entfernt werden: {1}","fr":"Enregistrement supprimé de la base, mais la suppression du fichier GitHub a échoué : {1}","es":"Registro eliminado de la base de datos, pero no se pudo borrar el archivo de GitHub: {1}"},"ghUploadFailed":{"zh-Hant":"GitHub 上傳失敗（HTTP {1}）","en":"GitHub upload failed (HTTP {1})","ja":"GitHub へのアップロードに失敗しました（HTTP {1}）","ko":"GitHub 업로드 실패(HTTP {1})","ru":"Не удалось загрузить на GitHub (HTTP {1})","de":"GitHub-Upload fehlgeschlagen (HTTP {1})","fr":"Échec du téléversement vers GitHub (HTTP {1})","es":"Error al subir a GitHub (HTTP {1})"},"brandSuffix":{"zh-Hant":"{1} · Givera 嘉雅科技","en":"{1} · Givera Jiaya Tech","ja":"{1} · Givera ジャヤテック","ko":"{1} · Givera 지야테크","ru":"{1} · Givera Jiaya Tech","de":"{1} · Givera Jiaya Tech","fr":"{1} · Givera Jiaya Tech","es":"{1} · Givera Jiaya Tech"}};

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
