/* 별자리 탭: 내 별자리(또는 고른 별자리)의 오늘 운세 + 수호 카드 */
import { $ } from "../lib/util.js";
import { L, t } from "../lib/i18n.js";
import { sunSign, computeZodiacSign } from "../lib/zodiac.js";
import { starsHtml } from "../lib/saju.js";
import { SIGNS, TXT } from "../data/zodiac.js";
import { TAROT } from "../data/cards.js";
import { GUARDIAN, GUARDIAN_MSG, ELEMENTS, SIGN_ELEMENT } from "../data/astro.js";
import { cf } from "../lib/reading.js";
import * as store from "../lib/store.js";
import { cardHtml, catsHtml, luckyHtml, colorDot } from "../lib/view.js";
import { mount } from "./shell.js";

export function renderZodiac([pick]) {
  const p = store.get("profile"), mine = sunSign(p);
  const sign = pick != null && SIGNS[+pick] ? +pick : mine;
  const z = computeZodiacSign(sign), s = SIGNS[sign], el = ELEMENTS[SIGN_ELEMENT(sign)];
  const g = GUARDIAN[sign], gc = TAROT[g];

  mount(`
    <section class="card rise">
      <div class="zhead">
        <div class="zsym">${s.sym + TXT}</div>
        <div>
          <div class="who">${sign === mine ? t("zWho", p.name, L(s.name)) : L(s.name)}</div>
          <div class="zdates">${t("zDates", L(s.dates))} · ${el.ic} ${L(el.name)}</div>
          <div class="scoreline"><span class="stars" style="font-size:16px">${starsHtml(z.scores[0])}</span><span class="score"><b>${z.scores[0]}</b>${t("pts")}</span></div>
        </div>
      </div>
      <span class="chip">${L(z.H.key)}</span>
      <p class="summary">${L(z.summary)}</p>
      <p class="note">🌙 ${t("zMoon", L(SIGNS[z.moon].name), z.house + 1, L(z.H.area))}</p>
    </section>

    <section class="card rise"><h2>${t("catsTitle")}</h2>${catsHtml(z.cats)}</section>

    <section class="card rise">
      <h2>${t("luckyTitle")}</h2>
      ${luckyHtml([["lColor", colorDot(s.hex) + L(s.color)], ["lNum", z.num], ["lItem", L(z.item)], ["lFriend", L(SIGNS[z.friend].name)]])}
    </section>

    <section class="card rise">
      <h2>${t("zGuardian")}</h2>
      <div class="reading">${cardHtml({ n:g, rev:false }, { flipped:true, guardian:true })}<div>
        <h3>${L(gc.name)} <small>${gc.name.en === L(gc.name) ? "" : gc.name.en}</small></h3>
        <div class="kw">${cf(gc, "up")}</div>
        <p>${L(GUARDIAN_MSG[sign])}</p></div></div>
    </section>

    <section class="card rise"><h2>${t("zAboutTitle")}</h2><p class="summary" style="margin:0">${L(s.about)}</p></section>

    <section class="card rise">
      <h2>${t("zOthers")}</h2>
      <div class="signs" id="signs">${SIGNS.map((x, i) => `<button type="button" data-i="${i}" class="${i === sign ? "on" : ""}${i === mine ? " me" : ""}">${x.sym + TXT}<small>${i === mine ? t("zMine") : L(x.name).replace("자리", "")}</small></button>`).join("")}</div>
      <p class="hint">${t("zHint")}</p>
    </section>`, { tab:"zodiac" });

  $("signs").addEventListener("click", e => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    location.replace(+b.dataset.i === mine ? "#/zodiac" : `#/zodiac/${b.dataset.i}`);
  });
}
