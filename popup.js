const defaults = {
  paperSize: "A4",
  orientation: "portrait",
  includeBg: true,
  margins: "default",
  filenameRule: "title",
  prefix: "",
  autoScroll: false,
  language: "auto"
};

const els = {
  title: document.getElementById("title"),
  language: document.getElementById("language"),
  languageLabel: document.getElementById("languageLabel"),
  paperSizeLabel: document.getElementById("paperSizeLabel"),
  orientationLabel: document.getElementById("orientationLabel"),
  marginsLabel: document.getElementById("marginsLabel"),
  includeBgLabel: document.getElementById("includeBgLabel"),
  fileNameLabel: document.getElementById("fileNameLabel"),
  autoScrollLabel: document.getElementById("autoScrollLabel"),
  paperSize: document.getElementById("paperSize"),
  orientation: document.getElementById("orientation"),
  includeBg: document.getElementById("includeBg"),
  margins: document.getElementById("margins"),
  filenameRule: document.getElementById("filenameRule"),
  prefixInput: document.getElementById("prefixInput"),
  autoScroll: document.getElementById("autoScroll"),
  exportBtn: document.getElementById("exportBtn"),
  status: document.getElementById("status"),
  openDownloads: document.getElementById("openDownloads"),
  copyError: document.getElementById("copyError"),
  tipText: document.getElementById("tipText")
};

let lastErrorText = "";
let currentLang = "en";
let isWorking = false;

const translations = {
  en: {
    languageLabel: "Language",
    languageAuto: "Auto (Browser)",
    title: "Page to PDF",
    paperSizeLabel: "Paper size",
    orientationLabel: "Orientation",
    marginsLabel: "Margins",
    includeBgLabel: "Include background",
    fileNameLabel: "File name",
    autoScrollLabel: "Auto-load long page content (for lazy-loading pages)",
    exportBtn: "Export current page to PDF",
    exportingBtn: "Exporting...",
    openDownloads: "Open downloads",
    copyError: "Copy error",
    tipText: "Tip: some pages may block printing or require login.",
    statusCapturing: "Capturing",
    statusGenerating: "Generating PDF...",
    optionMarginsDefault: "Default",
    optionMarginsSmall: "Small",
    optionMarginsNone: "None",
    optionOrientationPortrait: "Portrait",
    optionOrientationLandscape: "Landscape",
    optionFilenameTitle: "Title.pdf",
    optionFilenameDomainTitle: "Domain - Title.pdf",
    optionFilenamePrefixTitle: "Custom prefix + Title.pdf",
    prefixPlaceholder: "Prefix (e.g. Notes - )",
    statusAutoScrolling: "Auto-scrolling...",
    statusPrinting: "Generating PDF...",
    statusDownloading: "Downloading...",
    statusDone: "Done ✅",
    statusFailedPrefix: "Failed:",
    failedNoTab: "Failed: cannot find active tab",
    errorCopied: "Error copied",
    copyFailed: "Copy failed"
  },
  es: {
    languageLabel: "Idioma",
    languageAuto: "Auto (navegador)",
    title: "Página a PDF",
    paperSizeLabel: "Tamaño de papel",
    orientationLabel: "Orientación",
    marginsLabel: "Márgenes",
    includeBgLabel: "Incluir fondo",
    fileNameLabel: "Nombre de archivo",
    autoScrollLabel: "Cargar contenido largo automáticamente (páginas con lazy loading)",
    exportBtn: "Exportar la página actual a PDF",
    exportingBtn: "Exportando...",
    openDownloads: "Abrir descargas",
    copyError: "Copiar error",
    tipText: "Consejo: algunas páginas pueden bloquear la impresión o requerir inicio de sesión.",
    statusCapturing: "Capturando",
    statusGenerating: "Generando PDF...",
    optionMarginsDefault: "Predeterminado",
    optionMarginsSmall: "Pequeño",
    optionMarginsNone: "Ninguno",
    optionOrientationPortrait: "Vertical",
    optionOrientationLandscape: "Horizontal",
    optionFilenameTitle: "Título.pdf",
    optionFilenameDomainTitle: "Dominio - Título.pdf",
    optionFilenamePrefixTitle: "Prefijo personalizado + Título.pdf",
    prefixPlaceholder: "Prefijo (ej. Notas - )",
    statusAutoScrolling: "Desplazando automáticamente...",
    statusPrinting: "Generando PDF...",
    statusDownloading: "Descargando...",
    statusDone: "Completado ✅",
    statusFailedPrefix: "Error:",
    failedNoTab: "Error: no se encontró la pestaña activa",
    errorCopied: "Error copiado",
    copyFailed: "Error al copiar"
  },
  pt: {
    languageLabel: "Idioma",
    languageAuto: "Auto (navegador)",
    title: "Página para PDF",
    paperSizeLabel: "Tamanho do papel",
    orientationLabel: "Orientação",
    marginsLabel: "Margens",
    includeBgLabel: "Incluir plano de fundo",
    fileNameLabel: "Nome do arquivo",
    autoScrollLabel: "Carregar conteúdo longo automaticamente (lazy loading)",
    exportBtn: "Exportar página atual para PDF",
    exportingBtn: "Exportando...",
    openDownloads: "Abrir downloads",
    copyError: "Copiar erro",
    tipText: "Dica: algumas páginas podem bloquear impressão ou exigir login.",
    statusCapturing: "Capturando",
    statusGenerating: "Gerando PDF...",
    optionMarginsDefault: "Padrão",
    optionMarginsSmall: "Pequenas",
    optionMarginsNone: "Nenhuma",
    optionOrientationPortrait: "Retrato",
    optionOrientationLandscape: "Paisagem",
    optionFilenameTitle: "Título.pdf",
    optionFilenameDomainTitle: "Domínio - Título.pdf",
    optionFilenamePrefixTitle: "Prefixo personalizado + Título.pdf",
    prefixPlaceholder: "Prefixo (ex. Notas - )",
    statusAutoScrolling: "Rolando automaticamente...",
    statusPrinting: "Gerando PDF...",
    statusDownloading: "Baixando...",
    statusDone: "Concluído ✅",
    statusFailedPrefix: "Falhou:",
    failedNoTab: "Falhou: não foi possível encontrar a aba ativa",
    errorCopied: "Erro copiado",
    copyFailed: "Falha ao copiar"
  },
  "zh-CN": {
    languageLabel: "语言",
    languageAuto: "自动（浏览器）",
    title: "页面转 PDF",
    paperSizeLabel: "纸张大小",
    orientationLabel: "方向",
    marginsLabel: "页边距",
    includeBgLabel: "包含背景",
    fileNameLabel: "文件名",
    autoScrollLabel: "自动加载长页面内容（针对懒加载）",
    exportBtn: "导出当前页面为 PDF",
    exportingBtn: "导出中...",
    openDownloads: "打开下载",
    copyError: "复制错误信息",
    tipText: "提示：部分页面可能禁止打印或需要登录。",
    statusCapturing: "正在捕获",
    statusGenerating: "生成 PDF...",
    optionMarginsDefault: "默认",
    optionMarginsSmall: "小",
    optionMarginsNone: "无",
    optionOrientationPortrait: "竖向",
    optionOrientationLandscape: "横向",
    optionFilenameTitle: "标题.pdf",
    optionFilenameDomainTitle: "域名 - 标题.pdf",
    optionFilenamePrefixTitle: "自定义前缀 + 标题.pdf",
    prefixPlaceholder: "前缀（如：笔记 - ）",
    statusAutoScrolling: "自动滚动中...",
    statusPrinting: "生成 PDF...",
    statusDownloading: "下载中...",
    statusDone: "完成 ✅",
    statusFailedPrefix: "失败：",
    failedNoTab: "失败：找不到当前标签页",
    errorCopied: "错误信息已复制",
    copyFailed: "复制失败"
  },
  "zh-TW": {
    languageLabel: "語言",
    languageAuto: "自動（瀏覽器）",
    title: "頁面轉 PDF",
    paperSizeLabel: "紙張大小",
    orientationLabel: "方向",
    marginsLabel: "頁邊距",
    includeBgLabel: "包含背景",
    fileNameLabel: "檔案名稱",
    autoScrollLabel: "自動載入長頁內容（因應 lazy loading）",
    exportBtn: "匯出當前頁面為 PDF",
    exportingBtn: "匯出中...",
    openDownloads: "開啟下載",
    copyError: "複製錯誤訊息",
    tipText: "提示：部分頁面可能禁止列印或需要登入。",
    statusCapturing: "正在擷取",
    statusGenerating: "生成 PDF...",
    optionMarginsDefault: "預設",
    optionMarginsSmall: "小",
    optionMarginsNone: "無",
    optionOrientationPortrait: "直向",
    optionOrientationLandscape: "橫向",
    optionFilenameTitle: "標題.pdf",
    optionFilenameDomainTitle: "網域 - 標題.pdf",
    optionFilenamePrefixTitle: "自訂前綴 + 標題.pdf",
    prefixPlaceholder: "前綴（如：筆記 - ）",
    statusAutoScrolling: "自動捲動中...",
    statusPrinting: "生成 PDF...",
    statusDownloading: "下載中...",
    statusDone: "完成 ✅",
    statusFailedPrefix: "失敗：",
    failedNoTab: "失敗：找不到當前分頁",
    errorCopied: "錯誤訊息已複製",
    copyFailed: "複製失敗"
  },
  ar: {
    languageLabel: "اللغة",
    languageAuto: "تلقائي (المتصفح)",
    title: "الصفحة إلى PDF",
    paperSizeLabel: "حجم الورق",
    orientationLabel: "الاتجاه",
    marginsLabel: "الهوامش",
    includeBgLabel: "تضمين الخلفية",
    fileNameLabel: "اسم الملف",
    autoScrollLabel: "تحميل محتوى الصفحة الطويلة تلقائياً (للصفحات البطيئة)",
    exportBtn: "تصدير الصفحة الحالية إلى PDF",
    exportingBtn: "جارٍ التصدير...",
    openDownloads: "فتح التنزيلات",
    copyError: "نسخ الخطأ",
    tipText: "ملاحظة: قد تمنع بعض الصفحات الطباعة أو تتطلب تسجيل الدخول.",
    statusCapturing: "جارٍ الالتقاط",
    statusGenerating: "جارٍ إنشاء PDF...",
    optionMarginsDefault: "افتراضي",
    optionMarginsSmall: "صغير",
    optionMarginsNone: "بلا",
    optionOrientationPortrait: "عمودي",
    optionOrientationLandscape: "أفقي",
    optionFilenameTitle: "العنوان.pdf",
    optionFilenameDomainTitle: "النطاق - العنوان.pdf",
    optionFilenamePrefixTitle: "بادئة مخصصة + العنوان.pdf",
    prefixPlaceholder: "بادئة (مثال: ملاحظات - )",
    statusAutoScrolling: "جارٍ التمرير التلقائي...",
    statusPrinting: "جارٍ إنشاء PDF...",
    statusDownloading: "جارٍ التنزيل...",
    statusDone: "تم ✅",
    statusFailedPrefix: "فشل:",
    failedNoTab: "فشل: تعذر العثور على اللسان النشط",
    errorCopied: "تم نسخ الخطأ",
    copyFailed: "فشل النسخ"
  }
};

function detectLanguage() {
  const lang = (navigator.language || "").toLowerCase();
  if (lang.startsWith("zh-tw") || lang.startsWith("zh-hk") || lang.startsWith("zh-mo")) return "zh-TW";
  if (lang.startsWith("zh")) return "zh-CN";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("pt")) return "pt";
  if (lang.startsWith("ar")) return "ar";
  return "en";
}

function getLocale(langSetting) {
  if (langSetting && langSetting !== "auto") return langSetting;
  return detectLanguage();
}

function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

function togglePrefixInput(rule) {
  const show = rule === "prefixTitle";
  els.prefixInput.classList.toggle("hidden", !show);
}

function getSettingsFromUI() {
  return {
    paperSize: els.paperSize.value,
    orientation: els.orientation.value,
    includeBg: els.includeBg.checked,
    margins: els.margins.value,
    filenameRule: els.filenameRule.value,
    prefix: els.prefixInput.value || "",
    autoScroll: els.autoScroll.checked,
    language: els.language.value
  };
}

function setStatus(text) {
  els.status.textContent = text || "";
}

function setWorking(working) {
  isWorking = Boolean(working);
  els.exportBtn.disabled = isWorking;
  els.exportBtn.textContent = isWorking ? t("exportingBtn") : t("exportBtn");
}

function showSuccessUI() {
  els.openDownloads.classList.remove("hidden");
  els.copyError.classList.add("hidden");
}

function showErrorUI(err) {
  lastErrorText = err || "";
  els.copyError.classList.toggle("hidden", !lastErrorText);
  els.openDownloads.classList.add("hidden");
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(defaults);
  const cfg = { ...defaults, ...stored };
  els.paperSize.value = cfg.paperSize;
  els.orientation.value = cfg.orientation;
  els.includeBg.checked = cfg.includeBg;
  els.margins.value = cfg.margins;
  els.filenameRule.value = cfg.filenameRule;
  els.prefixInput.value = cfg.prefix;
  els.autoScroll.checked = cfg.autoScroll;
  els.language.value = cfg.language;
  togglePrefixInput(cfg.filenameRule);
}

async function saveSettings() {
  const cfg = getSettingsFromUI();
  await chrome.storage.sync.set(cfg);
}

function statusLabelFromProgress(progress) {
  if (progress && typeof progress === "object") {
    if (progress.type === "capturing") {
      const current = progress.current ?? 0;
      const total = progress.total ?? 0;
      if (total) {
        return `${t("statusCapturing")} ${current}/${total}`;
      }
      return `${t("statusCapturing")} ${current}`;
    }
    if (progress.type === "generating") {
      return t("statusGenerating");
    }
  }

  switch (progress) {
    case "auto-scrolling":
      return t("statusAutoScrolling");
    case "printing":
      return t("statusPrinting");
    case "generating":
      return t("statusGenerating");
    case "downloading":
      return t("statusDownloading");
    case "done":
      return t("statusDone");
    default:
      return progress || "";
  }
}

function applyTranslations(langCode) {
  currentLang = translations[langCode] ? langCode : "en";
  document.documentElement.lang = currentLang;
  document.body.dir = currentLang === "ar" ? "rtl" : "ltr";

  els.languageLabel.textContent = t("languageLabel");
  const autoOpt = els.language.querySelector('option[value="auto"]');
  if (autoOpt) autoOpt.textContent = t("languageAuto");

  els.title.textContent = t("title");
  els.paperSizeLabel.textContent = t("paperSizeLabel");
  els.orientationLabel.textContent = t("orientationLabel");
  els.marginsLabel.textContent = t("marginsLabel");
  els.includeBgLabel.textContent = t("includeBgLabel");
  els.fileNameLabel.textContent = t("fileNameLabel");
  els.autoScrollLabel.textContent = t("autoScrollLabel");
  els.tipText.textContent = t("tipText");

  els.exportBtn.textContent = isWorking ? t("exportingBtn") : t("exportBtn");
  els.openDownloads.textContent = t("openDownloads");
  els.copyError.textContent = t("copyError");

  const marginOptions = {
    default: t("optionMarginsDefault"),
    small: t("optionMarginsSmall"),
    none: t("optionMarginsNone")
  };
  Array.from(els.margins.options).forEach((opt) => {
    if (marginOptions[opt.value]) opt.textContent = marginOptions[opt.value];
  });

  const orientationOptions = {
    portrait: t("optionOrientationPortrait"),
    landscape: t("optionOrientationLandscape")
  };
  Array.from(els.orientation.options).forEach((opt) => {
    if (orientationOptions[opt.value]) opt.textContent = orientationOptions[opt.value];
  });

  const filenameOptions = {
    title: t("optionFilenameTitle"),
    domainTitle: t("optionFilenameDomainTitle"),
    prefixTitle: t("optionFilenamePrefixTitle")
  };
  Array.from(els.filenameRule.options).forEach((opt) => {
    if (filenameOptions[opt.value]) opt.textContent = filenameOptions[opt.value];
  });

  els.prefixInput.placeholder = t("prefixPlaceholder");
}

function formatFailed(msg) {
  return `${t("statusFailedPrefix")} ${msg}`;
}

async function handleExport() {
  setWorking(true);
  lastErrorText = "";
  showErrorUI("");
  els.openDownloads.classList.add("hidden");

  await saveSettings();
  const settings = getSettingsFromUI();
  setStatus(settings.autoScroll ? t("statusAutoScrolling") : t("statusPrinting"));

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus(t("failedNoTab"));
    setWorking(false);
    return;
  }

  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const progressListener = (msg) => {
    if (msg?.type === "EXPORT_STATUS" && msg.requestId === requestId) {
      setStatus(statusLabelFromProgress(msg.state));
    }
  };
  chrome.runtime.onMessage.addListener(progressListener);

  chrome.runtime.sendMessage(
    {
      type: "EXPORT_PDF",
      tabId: tab.id,
      tabTitle: tab.title,
      tabUrl: tab.url,
      settings,
      requestId
    },
    (response) => {
      chrome.runtime.onMessage.removeListener(progressListener);

      const err = chrome.runtime.lastError;
      if (err) {
        setStatus(formatFailed(err.message));
        showErrorUI(err.message);
        setWorking(false);
        return;
      }

      if (response?.ok) {
        if (response?.warning) {
          setStatus(`${t("statusDone")} (${response.warning})`);
        } else {
          setStatus(t("statusDone"));
        }
        showSuccessUI();
      } else {
        const msg = response?.error || "Unknown error";
        setStatus(formatFailed(msg));
        showErrorUI(msg);
      }
      setWorking(false);
    }
  );
}

function bindEvents() {
  els.filenameRule.addEventListener("change", async () => {
    togglePrefixInput(els.filenameRule.value);
    await saveSettings();
  });

  [
    els.language,
    els.paperSize,
    els.orientation,
    els.includeBg,
    els.margins,
    els.prefixInput,
    els.autoScroll
  ].forEach((el) => {
    el.addEventListener("change", () => saveSettings());
    el.addEventListener("input", () => saveSettings());
  });

  els.language.addEventListener("change", async () => {
    const langSetting = els.language.value;
    await saveSettings();
    applyTranslations(getLocale(langSetting));
  });

  els.exportBtn.addEventListener("click", handleExport);

  els.openDownloads.addEventListener("click", async () => {
    try {
      await chrome.downloads.showDefaultFolder();
    } catch (_e) {
      await chrome.tabs.create({ url: "chrome://downloads/" });
    }
  });

  els.copyError.addEventListener("click", async () => {
    if (!lastErrorText) return;
    try {
      await navigator.clipboard.writeText(lastErrorText);
      setStatus(t("errorCopied"));
    } catch (_e) {
      setStatus(t("copyFailed"));
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  applyTranslations(getLocale(els.language.value || "auto"));
  bindEvents();
});
