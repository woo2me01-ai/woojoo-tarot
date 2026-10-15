/* 프로필 입력 (첫 실행 · 설정에서 수정) — 웹 사주 입력 폼과 같은 규칙 */
import { $ } from "../lib/util.js";
import { t } from "../lib/i18n.js";
import { DANGI, lunarToSolar, kstToday } from "../lib/calendar.js";
import { hourOptions } from "../lib/saju.js";
import { go } from "../lib/router.js";
import * as store from "../lib/store.js";
import { topbar } from "../lib/view.js";
import { mount } from "./shell.js";

const MIN_YEAR = 1920;
const opts = (items, value) => items.map(o => `<option value="${o.v}"${String(o.v) === String(value ?? "") ? " selected" : ""}>${o.label}</option>`).join("");

export function renderProfile() {
  const p = store.get("profile"), editing = !!p, inp = p ? p.input : {};
  let cal = p ? p.cal : "solar";
  const thisYear = kstToday().y;
  const years = [{ v:"", label:t("selY") }];
  for (let y = thisYear; y >= MIN_YEAR; y--) years.push({ v:y, label:t("yearOpt", y) });
  const months = [{ v:"", label:t("selM") }].concat(Array.from({ length:12 }, (_, i) => ({ v:i + 1, label:t("monthOpt", i + 1) })));

  mount(`
    ${editing ? topbar(t("pEditTitle")) : `<div class="head" style="margin-top:24px"><h1>${t("pTitle")}</h1><p>${t("pLead")}</p></div>`}
    <div class="card rise">
      <label class="f" for="name">${t("fName")}</label>
      <input type="text" id="name" maxlength="10" placeholder="${t("namePh")}" value="${p ? p.name.replace(/"/g, "&quot;") : ""}">
      <label class="f">${t("fBirth")}</label>
      <div class="seg" id="calSeg">
        <button type="button" data-cal="solar">${t("solar")}</button>
        <button type="button" data-cal="lunar"${DANGI ? "" : ` disabled title="${t("noLunar")}"`}>${t("lunar")}</button>
      </div>
      <div class="row3" style="margin-top:8px">
        <select id="by" aria-label="${t("selY")}">${opts(years, inp.y)}</select>
        <select id="bm" aria-label="${t("selM")}">${opts(months, inp.m)}</select>
        <select id="bd" aria-label="${t("selD")}"></select>
      </div>
      <label class="check" id="leapWrap"><input type="checkbox" id="leap"${inp.leap ? " checked" : ""}> ${t("leap")}</label>
      <label class="f" for="bh">${t("fHour")}</label>
      <select id="bh">${opts(hourOptions(), p ? p.hour : "")}</select>
      <button class="primary" id="save" type="button">${t(editing ? "pSaveEdit" : "pSave")}</button>
      <div class="err" id="err"></div>
      <p class="hint">🔒 ${t("privacy")}</p>
    </div>
    <p class="fun">${t("fun")}</p>`, { fallback:"settings" });

  const fillDays = keep => {
    const max = cal === "lunar" ? 30 : 31, v = keep ?? $("bd").value;
    $("bd").innerHTML = opts([{ v:"", label:t("selD") }].concat(Array.from({ length:max }, (_, i) => ({ v:i + 1, label:t("dayOpt", i + 1) }))), v && +v <= max ? v : "");
  };
  const setCal = c => {
    cal = c;
    document.querySelectorAll("#calSeg button").forEach(b => b.classList.toggle("on", b.dataset.cal === c));
    $("leapWrap").classList.toggle("hidden", c !== "lunar");
    fillDays();
  };
  document.querySelectorAll("#calSeg button").forEach(b => b.addEventListener("click", () => setCal(b.dataset.cal)));
  fillDays(inp.d);
  setCal(cal);

  $("save").addEventListener("click", () => {
    const y = +$("by").value, m = +$("bm").value, d = +$("bd").value;
    const fail = msg => { $("err").textContent = msg; };
    if (!y || !m || !d) return fail(t("errDate"));
    const leap = cal === "lunar" && $("leap").checked;
    let solar, lunar = null;
    if (cal === "lunar") {
      if (!DANGI) return fail(t("errNoLunar"));
      solar = lunarToSolar(y, m, d, leap);
      if (!solar) return fail(t("errLunar", y, m, d, leap));
      lunar = { y, m, d, leap };
    } else {
      const dt = new Date(Date.UTC(y, m - 1, d));
      if (dt.getUTCMonth() !== m - 1) return fail(t("errSolar", y, m, d));
      solar = { y, m, d };
    }
    const td = kstToday();
    if (Date.UTC(solar.y, solar.m - 1, solar.d) > Date.UTC(td.y, td.m - 1, td.d)) return fail(t("errFuture"));
    store.set("profile", { name:$("name").value.trim().slice(0, 10), cal, input:{ y, m, d, leap }, solar, lunar, hour:$("bh").value });
    go(editing ? "settings" : "home", true);
  });
}
