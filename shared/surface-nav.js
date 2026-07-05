// surface-nav.js — 공통 Surface Switcher (Layer A)
// framework-agnostic vanilla JS. 로드 시 스스로 <body>에 우상단 고정 nav를 주입한다.
// React root(#root) 밖(body 직속)에 append하므로 React re-render에 지워지지 않는다.
//
// 사용법: 각 페이지 </body> 직전에
//   <script src="<상대경로>/shared/surface-nav.js" data-surface-root="root|anatomy"></script>
//
// data-surface-root:
//   "root"    — 저장소 루트에 있는 페이지 (Animation Player, Zoom Plan)
//   "anatomy" — transformer-anatomy/ 아래 페이지 (Transformer Anatomy)
//
// URL 계약: 파일명 공백은 %20. anatomy는 루트보다 한 단계 아래 → "../".
// DS 토큰만 사용(hex 하드코딩 금지). Pretendard(--font-sans). emoji 금지.

(function () {
  "use strict";
  if (window.__surfaceNavMounted) return;
  window.__surfaceNavMounted = true;

  var script = document.currentScript ||
    (function () {
      var all = document.getElementsByTagName("script");
      for (var i = all.length - 1; i >= 0; i--) {
        if ((all[i].src || "").indexOf("surface-nav.js") !== -1) return all[i];
      }
      return null;
    })();
  var root = (script && script.getAttribute("data-surface-root")) || "root";
  var isAnatomy = root === "anatomy";
  var base = isAnatomy ? "../" : "";        // 루트까지의 상대 접두사
  var anatBase = isAnatomy ? "" : "transformer-anatomy/";

  // ── Surface registry ──
  // 이 저장소에 실재하는 인터랙티브 surface만 등록한다.
  // Zoom Plan(정적 문서 + 참조 이미지)을 추가하려면 아래에 한 줄 더 넣으면 된다:
  //   { id:"plan", label:"Zoom Plan", href: base + "Transformer%20Zoom%20Plan.html", match:["Zoom Plan"] }
  var SURFACES = [
    { id: "player", label: "Animation Player",
      href: base + "AI-ML%20Animation%20Player.html",
      match: ["AI-ML Animation Player", "AI-ML%20Animation%20Player"] },
    { id: "anatomy", label: "Transformer Anatomy",
      href: anatBase + "Transformer%20Anatomy.html",
      match: ["Transformer Anatomy", "Transformer%20Anatomy"] },
  ];

  var path = decodeURIComponent(location.pathname);
  function isCurrent(s) {
    return s.match.some(function (m) { return path.indexOf(m) !== -1; });
  }

  // ── Theme: anatomy = dark canvas, root pages = light ──
  var theme = (document.documentElement.dataset && document.documentElement.dataset.navTheme)
    || (isAnatomy ? "dark" : "light");
  var dark = theme === "dark";

  var C = dark
    ? { bg: "var(--color-dark-sage-2)", border: "var(--color-dark-sage-6)",
        fg: "var(--color-dark-sage-11)", fgOn: "var(--color-dark-sage-12)",
        bgOn: "var(--color-dark-sage-4)", hover: "var(--color-dark-sage-3)",
        brand: "var(--color-dark-violet-11)" }
    : { bg: "var(--color-white)", border: "var(--color-slate-5)",
        fg: "var(--color-slate-9)", fgOn: "var(--color-white)",
        bgOn: "var(--color-slate-12)", hover: "var(--color-slate-2)",
        brand: "var(--color-violet-9)" };

  function mount() {
    if (document.querySelector("[data-surface-nav]")) return;

    var nav = document.createElement("nav");
    nav.setAttribute("data-surface-nav", "");
    nav.setAttribute("aria-label", "Surface navigation");
    nav.style.cssText = [
      "position:fixed", "top:16px", "right:16px", "z-index:200",
      "display:flex", "gap:6px", "align-items:center",
      "padding:5px", "border-radius:var(--radius-md)",
      "background:" + C.bg, "border:1px solid " + C.border,
      "box-shadow:var(--shadow-md)", "font-family:var(--font-sans)",
      "-webkit-backdrop-filter:blur(8px)", "backdrop-filter:blur(8px)",
    ].join(";");

    SURFACES.forEach(function (s) {
      var on = isCurrent(s);
      var el = document.createElement(on ? "span" : "a");
      el.textContent = s.label;
      if (on) {
        el.setAttribute("aria-current", "page");
      } else {
        el.href = s.href;
      }
      el.style.cssText = [
        "font-size:12.5px", "font-weight:" + (on ? "700" : "500"),
        "line-height:1", "padding:7px 12px", "border-radius:var(--radius-sm)",
        "text-decoration:none", "white-space:nowrap",
        "transition:var(--transition-color)",
        "cursor:" + (on ? "default" : "pointer"),
        "color:" + (on ? C.fgOn : C.fg),
        "background:" + (on ? C.bgOn : "transparent"),
      ].join(";");
      if (!on) {
        el.addEventListener("mouseenter", function () { el.style.background = C.hover; el.style.color = C.brand; });
        el.addEventListener("mouseleave", function () { el.style.background = "transparent"; el.style.color = C.fg; });
        el.addEventListener("focus", function () { el.style.outline = "2px solid " + C.brand; el.style.outlineOffset = "3px"; });
        el.addEventListener("blur", function () { el.style.outline = "none"; });
      }
      nav.appendChild(el);
    });

    document.body.appendChild(nav);
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
