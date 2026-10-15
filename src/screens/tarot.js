/* 타로 탭 · 테마 목록 + 질문 화면 */
import { $, esc } from "../lib/util.js";
import { L, t } from "../lib/i18n.js";
import { THEMES, FREE_SPREADS, SPREADS, themeById } from "../data/themes.js";
import { startSession } from "../lib/reading.js";
import { go } from "../lib/router.js";
import { topbar } from "../lib/view.js";
import { mount } from "./shell.js";

export function renderThemes() {
  mount(`
    <div class="head"><h1>${t("themesTitle")}</h1><p>${t("themesLead")}</p></div>
    <div class="themes rise">
      ${THEMES.map(x => `<a class="theme" href="#/ask/${x.id}"><span class="ic">${x.icon}</span><b>${L(x.title)}</b><small>${L(x.desc)}</small></a>`).join("")}
      <a class="theme wide" href="#/ask/free"><span class="ic">✍️</span><span><b>${t("freeTitle").replace("✍️ ", "")}</b><br><small>${t("freeLead")}</small></span></a>
    </div>
    <p class="fun">${t("fun")}</p>`, { tab:"tarot" });
}

export function renderAsk([id]) {
  const theme = themeById(id), free = !theme;
  let spread = "one";
  mount(`
    ${topbar(free ? t("freeTitle") : `${theme.icon} ${L(theme.title)}`)}
    <div class="card rise">
      ${free ? `<p class="summary" style="margin-top:0">${t("freeLead")}</p>` : `<p class="summary" style="margin-top:0">${L(theme.desc)}</p>
        <p class="small">${L(SPREADS[theme.spread]).join(" · ")}</p>`}
      <label class="f" for="q">${t("tQLabel")}</label>
      <textarea id="q" rows="3" maxlength="80" placeholder="${free ? t("tQPh") : t("tQPhTheme")}"></textarea>
      ${theme && theme.ab ? `<div class="row2" style="margin-top:8px">
          <input type="text" id="optA" maxlength="12" placeholder="A">
          <input type="text" id="optB" maxlength="12" placeholder="B"></div>` : ""}
      ${free ? `<label class="f">${t("spreadLabel")}</label>
        <div class="seg" id="spreadSeg">${FREE_SPREADS.map(k => `<button type="button" data-s="${k}" class="${k === spread ? "on" : ""}">${t("cardsN", SPREADS[k].ko.length)} · ${L(SPREADS[k]).join("·")}</button>`).join("")}</div>` : ""}
      <button class="primary" id="go" type="button">${t("goShuffle")}</button>
      <div class="err" id="err"></div>
      <p class="hint">🔒 ${t("qPrivate")}</p>
    </div>`, { fallback:"tarot" });

  if (free) document.querySelectorAll("#spreadSeg button").forEach(b => b.addEventListener("click", () => {
    spread = b.dataset.s;
    document.querySelectorAll("#spreadSeg button").forEach(x => x.classList.toggle("on", x === b));
  }));
  $("go").addEventListener("click", () => {
    const q = $("q").value.trim();
    if (free && q.length < 2) { $("err").textContent = t("askErr"); return; }
    const ab = theme && theme.ab ? { a:esc($("optA").value.trim()), b:esc($("optB").value.trim()) } : null;
    startSession({ kind:free ? "free" : "theme", themeId:theme ? theme.id : null, question:q, spread, ab });
    go("draw");
  });
}
