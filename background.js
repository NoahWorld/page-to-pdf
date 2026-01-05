const PAPER_SIZES = {
  A4: { width: 8.27, height: 11.69 },
  Letter: { width: 8.5, height: 11 }
};

const MARGINS = {
  none: 0,
  small: 0.25,
  default: 0.4
};

const AUTO_LOAD_DEFAULTS = {
  stepPx: 800,
  intervalMs: 380,
  maxDurationMs: 60000,
  stableRounds: 8,
  backToTop: true,
  clickMore: true,
  minHeightChange: 4
};

const PRINT_FIX_KEY = "__page_to_pdf_print_fix_restore__";
const PRINT_COLOR_STYLE_ID = "__page_to_pdf_print_color_style__";

function waitForDownloadComplete(downloadId) {
  return new Promise((resolve, reject) => {
    const onChanged = (delta) => {
      if (delta.id !== downloadId) return;

      if (delta.state?.current === "complete") {
        chrome.downloads.onChanged.removeListener(onChanged);
        resolve();
      }

      if (delta.state?.current === "interrupted") {
        chrome.downloads.onChanged.removeListener(onChanged);
        reject(new Error("Download interrupted"));
      }
    };

    chrome.downloads.onChanged.addListener(onChanged);
  });
}

async function downloadPdfBase64(base64, filename) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const urlObj = globalThis.URL || globalThis.webkitURL;
  const url = urlObj?.createObjectURL ? urlObj.createObjectURL(blob) : null;
  const finalUrl = url || `data:application/pdf;base64,${base64}`;
  let downloadId;

  try {
    downloadId = await chrome.downloads.download({
      url: finalUrl,
      filename,
      saveAs: false
    });

    await waitForDownloadComplete(downloadId);
  } finally {
    if (url && urlObj?.revokeObjectURL) {
      urlObj.revokeObjectURL(url);
    }
  }
}

async function sendProgress(requestId, state) {
  if (!requestId) return;
  try {
    await chrome.runtime.sendMessage({ type: "EXPORT_STATUS", requestId, state });
  } catch (_err) {
    // ignore if popup already closed
  }
}

function sanitizeFilename(name) {
  if (!name) return "page";
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || "page";
}

function buildFilename(settings = {}, tabTitle = "", tabUrl = "") {
  const title = sanitizeFilename(tabTitle || "page");
  let domain = "";
  try {
    domain = new URL(tabUrl || "").hostname || "";
  } catch (_e) {
    domain = "";
  }

  let base = title;
  if (settings.filenameRule === "domainTitle" && domain) {
    base = `${domain} - ${title}`;
  } else if (settings.filenameRule === "prefixTitle" && settings.prefix) {
    base = `${sanitizeFilename(settings.prefix)} ${title}`;
  }

  return `${sanitizeFilename(base)}.pdf`;
}

function buildPrintOptions(settings = {}) {
  const size = PAPER_SIZES[settings.paperSize] || PAPER_SIZES.A4;
  const isLandscape = settings.orientation === "landscape";
  const margin = MARGINS[settings.margins] ?? MARGINS.default;

  const paperWidth = size.width;
  const paperHeight = size.height;

  return {
    landscape: isLandscape,
    printBackground: Boolean(settings.includeBg),
    preferCSSPageSize: false,
    paperWidth,
    paperHeight,
    marginTop: margin,
    marginBottom: margin,
    marginLeft: margin,
    marginRight: margin
  };
}

async function attachDebugger(target) {
  try {
    await chrome.debugger.attach(target, "1.3");
  } catch (err) {
    const msg = err?.message || "";
    if (msg.includes("another debugger") || msg.includes("already attached")) {
      try {
        await chrome.debugger.detach(target);
      } catch (_e) {
        // ignore and retry
      }
      await chrome.debugger.attach(target, "1.3");
    } else {
      throw err;
    }
  }
}

async function evaluateInPage(target, expression) {
  const { result, exceptionDetails } = await chrome.debugger.sendCommand(target, "Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  if (exceptionDetails) {
    const text = exceptionDetails?.exception?.description || exceptionDetails?.text || "Runtime.evaluate failed";
    throw new Error(text);
  }

  return result?.value;
}

async function applyPrintScrollContainerFix(target) {
  const expression = `(() => {
    try {
      if (globalThis[${JSON.stringify(PRINT_FIX_KEY)}]) {
        return { applied: false, alreadyApplied: true };
      }

      const restore = [];

      const mark = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const styleAttr = el.getAttribute("style");
        restore.push({ el, styleAttr: styleAttr == null ? null : styleAttr });
        el.style.overflow = "visible";
        el.style.overflowY = "visible";
        el.style.overflowX = "visible";
        el.style.maxHeight = "none";
        el.style.height = "auto";
        return true;
      };

      // Ensure root elements don't constrain height.
      mark(document.documentElement);
      mark(document.body);

      let changed = 0;
      const all = Array.from(document.querySelectorAll("*"));
      for (const el of all) {
        // Skip very small elements to reduce risk and work.
        if (el.clientHeight < 80) continue;
        const cs = globalThis.getComputedStyle ? getComputedStyle(el) : null;
        if (!cs) continue;
        const oy = cs.overflowY;
        const scrollable = (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 4;
        if (!scrollable) continue;
        if (mark(el)) changed += 1;
      }

      globalThis[${JSON.stringify(PRINT_FIX_KEY)}] = restore;
      return { applied: true, changed };
    } catch (e) {
      return { applied: false, error: String(e && e.message ? e.message : e) };
    }
  })()`;

  return evaluateInPage(target, expression);
}

async function detectPageLooksDark(target) {
  const expression = `(() => {
    if (!globalThis.getComputedStyle) return false;

    const parse = (bg) => {
      const m = String(bg || "").match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\)/i);
      if (!m) return null;
      const r = Math.max(0, Math.min(255, Number(m[1])));
      const g = Math.max(0, Math.min(255, Number(m[2])));
      const b = Math.max(0, Math.min(255, Number(m[3])));
      const a = m[4] == null ? 1 : Number(m[4]);
      if (!Number.isFinite(a)) return null;
      return { r, g, b, a };
    };

    const findBgFromEl = (el) => {
      let cur = el;
      for (let i = 0; i < 25 && cur; i += 1) {
        if (cur.nodeType !== 1) break;
        const cs = getComputedStyle(cur);
        const parsed = parse(cs.backgroundColor);
        if (parsed && parsed.a >= 0.2) return parsed;
        cur = cur.parentElement;
      }
      return null;
    };

    const points = [
      [8, 8],
      [Math.floor(window.innerWidth / 2), 8],
      [8, Math.floor(window.innerHeight / 2)],
      [Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2)]
    ];

    let best = null;
    for (const [x, y] of points) {
      const el = document.elementFromPoint(x, y);
      const bg = findBgFromEl(el) || findBgFromEl(document.body) || findBgFromEl(document.documentElement);
      if (!bg) continue;
      if (!best || bg.a > best.a) best = bg;
    }

    if (!best) return false;
    const lum = (0.2126 * best.r + 0.7152 * best.g + 0.0722 * best.b) / 255;
    return lum < 0.5;
  })()`;

  return Boolean(await evaluateInPage(target, expression));
}

async function applyPrintColorModeFix(target, settings = {}) {
  let mode = settings.colorMode;
  if (mode !== "dark" && mode !== "light") {
    mode = (await detectPageLooksDark(target)) ? "dark" : "light";
  }

  try {
    await chrome.debugger.sendCommand(target, "Emulation.setEmulatedMedia", { media: "screen" });
  } catch (_e) {
    await chrome.debugger.sendCommand(target, "Emulation.setEmulatedMedia", { media: "screen" });
  }

  const cssText =
    "*{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }" +
    `html{ color-scheme: ${mode} !important; }` +
    `body{ color-scheme: ${mode} !important; }`;

  const expression = `(() => {
    const id = ${JSON.stringify(PRINT_COLOR_STYLE_ID)};
    if (document.getElementById(id)) return { applied: false, alreadyApplied: true };
    const style = document.createElement("style");
    style.id = id;
    style.textContent = ${JSON.stringify(cssText)};
    (document.documentElement || document.head || document.body).appendChild(style);
    return { applied: true, mode: ${JSON.stringify(mode)} };
  })()`;

  return evaluateInPage(target, expression);
}

async function restorePrintColorModeFix(target) {
  try {
    await chrome.debugger.sendCommand(target, "Emulation.setEmulatedMedia", { media: "screen" });
  } catch (_e) {
    // ignore
  }

  const expression = `(() => {
    const el = document.getElementById(${JSON.stringify(PRINT_COLOR_STYLE_ID)});
    if (el && el.parentNode) el.parentNode.removeChild(el);
    return { restored: Boolean(el) };
  })()`;

  return evaluateInPage(target, expression);
}

async function restorePrintScrollContainerFix(target) {
  const expression = `(() => {
    const restore = globalThis[${JSON.stringify(PRINT_FIX_KEY)}];
    if (!Array.isArray(restore)) return { restored: 0 };

    let restored = 0;
    for (const item of restore) {
      const el = item && item.el;
      if (!el || el.nodeType !== 1) continue;
      if (item.styleAttr == null) {
        el.removeAttribute("style");
      } else {
        el.setAttribute("style", item.styleAttr);
      }
      restored += 1;
    }

    try {
      delete globalThis[${JSON.stringify(PRINT_FIX_KEY)}];
    } catch (_e) {
      globalThis[${JSON.stringify(PRINT_FIX_KEY)}] = null;
    }

    return { restored };
  })()`;

  return evaluateInPage(target, expression);
}

function isPrintableUrl(url = "") {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:", "file:"].includes(parsed.protocol)) return false;
    if (parsed.hostname === "chrome.google.com" && parsed.pathname.startsWith("/webstore")) return false;
    return true;
  } catch (_e) {
    const lower = url.toLowerCase();
    if (
      lower.startsWith("chrome://") ||
      lower.startsWith("edge://") ||
      lower.startsWith("brave://") ||
      lower.startsWith("vivaldi://") ||
      lower.startsWith("opera://") ||
      lower.startsWith("chrome-extension://")
    ) {
      return false;
    }
    return false;
  }
}

async function autoLoadLongPageViaCDP(target, options = {}) {
  const opts = { ...AUTO_LOAD_DEFAULTS, ...(options || {}) };
  const expression = `(async () => {
    const opts = ${JSON.stringify(opts)};
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    const raf2 = () => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    const keywordList = ["load more", "show more", "more", "more results", "更多", "加载更多", "展开", "顯示更多"];

    const findScrollable = () => {
      const docScroller = document.scrollingElement || document.documentElement || document.body;
      const candidates = Array.from(document.querySelectorAll("*")).filter((el) => {
        const style = window.getComputedStyle(el);
        const oy = style.overflowY;
        const scrollable = oy === "auto" || oy === "scroll";
        return scrollable && el.scrollHeight > el.clientHeight + 4;
      });
      let best = null;
      for (const el of candidates) {
        if (!best || el.clientHeight > best.clientHeight) {
          best = el;
        }
      }
      if (best && best.scrollHeight > (docScroller?.scrollHeight || 0) * 1.1) {
        return { node: best, type: "element" };
      }
      return { node: docScroller, type: "window" };
    };

    const scroller = findScrollable();
    const getHeight = () => {
      if (!scroller.node) return 0;
      if (scroller.type === "window") {
        const doc = document.documentElement || document.body;
        return Math.max(
          doc?.scrollHeight || 0,
          document.body ? document.body.scrollHeight : 0,
          document.documentElement ? document.documentElement.scrollHeight : 0
        );
      }
      return scroller.node.scrollHeight || 0;
    };
    const getTop = () => {
      if (!scroller.node) return 0;
      if (scroller.type === "window") {
        return (
          window.scrollY ||
          (document.documentElement ? document.documentElement.scrollTop : 0) ||
          (document.body ? document.body.scrollTop : 0) ||
          0
        );
      }
      return scroller.node.scrollTop || 0;
    };
    const setTop = (v) => {
      if (!scroller.node) return;
      if (scroller.type === "window") {
        window.scrollTo({ top: v, behavior: "auto" });
      } else {
        scroller.node.scrollTop = v;
      }
    };

    const maybeClickMore = async () => {
      if (!opts.clickMore) return false;
      const buttons = Array.from(document.querySelectorAll("button, a, [role='button']"));
      for (const el of buttons) {
        const text = (el.innerText || el.textContent || "").trim().toLowerCase();
        if (!text) continue;
        if (keywordList.some((k) => text.includes(k))) {
          el.click();
          await raf2();
          await wait(Math.min(Math.max(120, opts.intervalMs), 500));
          return true;
        }
      }
      return false;
    };

    const start = Date.now();
    let steps = 0;
    let stableRounds = 0;
    let reason = "";
    let lastHeight = getHeight();

    while (Date.now() - start < opts.maxDurationMs) {
      await maybeClickMore();
      const beforeTop = getTop();
      setTop(beforeTop + opts.stepPx);
      await raf2();
      await wait(opts.intervalMs);

      const h = getHeight();
      steps += 1;
      if (h <= lastHeight + (opts.minHeightChange || 2)) {
        stableRounds += 1;
      } else {
        stableRounds = 0;
      }
      if (h > lastHeight) {
        lastHeight = h;
      }

      if (stableRounds >= opts.stableRounds) {
        reason = "stable";
        break;
      }
    }

    if (!reason) {
      reason = Date.now() - start >= opts.maxDurationMs ? "timeout" : "finished";
    }

    const finalScrollTop = getTop();
    const finalHeight = lastHeight;

    if (opts.backToTop) {
      setTop(0);
      await raf2();
    }

    return { done: true, reason, steps, finalHeight, finalScrollTop, scroller: scroller.type };
  })();`;

  const { result } = await chrome.debugger.sendCommand(target, "Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  return result?.value || null;
}

async function exportTabToPdf(message) {
  const { tabId, tabTitle, tabUrl, settings = {}, requestId } = message;
  if (!tabId) {
    throw new Error("Missing tab ID");
  }
  if (!isPrintableUrl(tabUrl)) {
    throw new Error("This page cannot be exported (Chrome system or restricted page).");
  }

  const target = { tabId };
  let attached = false;
  let warning = null;
  let fixApplied = false;
  let colorFixApplied = false;

  try {
    await sendProgress(requestId, settings.autoScroll ? "auto-scrolling" : "printing");
    await attachDebugger(target);
    attached = true;

    await chrome.debugger.sendCommand(target, "Page.enable");
    await chrome.debugger.sendCommand(target, "Runtime.enable");

    try {
      const res = await applyPrintColorModeFix(target, settings);
      colorFixApplied = Boolean(res?.applied) || Boolean(res?.alreadyApplied);
    } catch (err) {
      console.warn("color mode fix failed", err);
      await chrome.debugger.sendCommand(target, "Emulation.setEmulatedMedia", { media: "screen" });
    }

    if (settings.autoScroll) {
      try {
        await autoLoadLongPageViaCDP(target, settings.autoScrollOptions || {});
      } catch (err) {
        console.warn("auto-load failed", err);
        warning = "Auto-load failed, exporting anyway.";
      }
    }

    try {
      const res = await applyPrintScrollContainerFix(target);
      fixApplied = Boolean(res?.applied);
    } catch (err) {
      console.warn("print fix failed", err);
    }

    await sendProgress(requestId, "printing");
    const printOptions = buildPrintOptions(settings);
    const { data } = await chrome.debugger.sendCommand(target, "Page.printToPDF", printOptions);

    await sendProgress(requestId, "downloading");
    const filename = buildFilename(settings, tabTitle, tabUrl);
    await downloadPdfBase64(data, filename);

    await sendProgress(requestId, "done");
    return { ok: true, warning };
  } finally {
    if (attached && colorFixApplied) {
      try {
        await restorePrintColorModeFix(target);
      } catch (err) {
        console.warn("restore color mode fix failed", err);
      }
    }
    if (attached && fixApplied) {
      try {
        await restorePrintScrollContainerFix(target);
      } catch (err) {
        console.warn("restore print fix failed", err);
      }
    }
    if (attached) {
      try {
        await chrome.debugger.detach(target);
      } catch (err) {
        console.warn("detach failed", err);
      }
    }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "EXPORT_PDF") return;

  exportTabToPdf(message)
    .then((res) => sendResponse(res))
    .catch((err) => {
      console.error(err);
      sendResponse({ ok: false, error: err?.message || "Export failed" });
    });

  return true;
});
