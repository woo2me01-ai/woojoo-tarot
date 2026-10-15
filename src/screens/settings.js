/* 설정: 내 정보 · 역방향 · 공개 방식 · 언어 · 앱 정보 */
import { $ } from "../lib/util.js";
import { L, LANG, t, setLang } from "../lib/i18n.js";
import { sunSign } from "../lib/zodiac.js";
import { hourLabel } from "../lib/saju.js";
import { SIGNS } from "../data/zodiac.js";
import { go } from "../lib/router.js";
import * as store from "../lib/store.js";
import { mount } from "./shell.js";
import { applyTheme } from "../lib/theme.js";

const VERSION = "1.0.0";   // android/app/build.gradle의 versionName과 같게

export function renderSettings() {
  const p = store.get("profile"), st = store.get("settings"), sign = SIGNS[sunSign(p)];
  const birth = `${p.cal === "lunar" ? t("lunar") : t("solar")} ${p.input.y}.${p.input.m}.${p.input.d}${p.input.leap ? ` (${t("leap")})` : ""}`;
  const seg = (id, items, value) => `<div class="seg" id="${id}">${items.map(([v, lab]) => `<button type="button" data-v="${v}" class="${v === value ? "on" : ""}">${lab}</button>`).join("")}</div>`;

  mount(`
    <div class="head"><h1>${t("tabSettings")}</h1></div>
    <section class="card rise">
      <h2>${t("sProfile")}<button class="more" type="button" id="edit">${t("sEdit")} →</button></h2>
      <div class="who">${p.name || "—"} <span class="chip" style="margin:0">${sign.sym}︎ ${L(sign.name)}</span></div>
      <p class="small">${birth} · ${t("fHour")} ${hourLabel(p.hour)}</p>
    </section>
    <section class="card rise">
      <h2>${t("sReading")}</h2>
      <div class="setrow"><div class="lab"><b>${t("sReversed")}</b><small>${t("sReversedD")}</small></div>
        <label class="switch"><input type="checkbox" id="rev"${st.reversed ? " checked" : ""}><span></span></label></div>
      <div class="setrow"><div class="lab"><b>${t("sReveal")}</b></div>${seg("reveal", [["each", t("sRevealEach")], ["all", t("sRevealAll")]], st.reveal)}</div>
      <div class="setrow"><div class="lab"><b>${t("sLang")}</b></div>${seg("lang", [["ko", "한국어"], ["en", "English"]], LANG)}</div>
      <div class="setrow"><div class="lab"><b>${t("sTheme")}</b></div>${seg("theme", [["dark", t("sThemeDark")], ["light", t("sThemeLight")], ["system", t("sThemeSystem")]], st.theme || "dark")}</div>
    </section>
    <section class="card rise">
      <h2>${t("sAbout")}</h2>
      <p class="small">🔒 ${t("sPrivacy")}</p>
      <p class="small">🃏 ${t("credit")}</p>
      <p class="small">🌐 <a class="plain" href="https://woojoojumbbang.com" target="_blank" rel="noopener">${t("sWeb")}</a></p>
      <p class="small">${t("sVersion")} ${VERSION}</p>
    </section>
    <p class="fun">${t("fun")}</p>`, { tab:"settings" });

  const save = patch => store.set("settings", { ...store.get("settings"), ...patch });
  $("edit").addEventListener("click", () => go("profile"));
  $("rev").addEventListener("change", e => save({ reversed:e.target.checked }));
  const wireSeg = (id, fn) => $(id).addEventListener("click", e => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    $(id).querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    fn(b.dataset.v);
  });
  wireSeg("reveal", v => save({ reveal:v }));
  wireSeg("lang", v => { save({ lang:v }); setLang(v); renderSettings(); });
  wireSeg("theme", v => { save({ theme:v }); applyTheme(v); });
}
