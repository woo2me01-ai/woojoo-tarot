/* 화면 틀: 본문 + 하단 탭 */
import { t } from "../lib/i18n.js";
import { back } from "../lib/router.js";

const TABS = [["home", "🏠", "tabHome"], ["tarot", "🃏", "tabTarot"], ["zodiac", "✨", "tabZodiac"], ["settings", "⚙️", "tabSettings"]];

export function mount(html, { tab = null, fallback = "home" } = {}) {
  const app = document.getElementById("app");
  app.innerHTML = `<main class="screen${tab ? "" : " no-tab"}">${html}</main>` + (tab ? `
    <nav class="tabbar">${TABS.map(([k, ic, lab]) =>
      `<a href="#/${k}" class="${k === tab ? "on" : ""}"><span class="ic">${ic}</span>${t(lab)}</a>`).join("")}</nav>` : "");
  app.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", () => back(fallback)));
  return app;
}
