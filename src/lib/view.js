/* 여러 화면에서 같이 쓰는 HTML 조각 */
import { TAROT } from "../data/cards.js";
import { L, t } from "./i18n.js";
import { esc } from "./util.js";
import { starsHtml } from "./saju.js";

export function cardHtml(pk, { flipped = false, guardian = false } = {}) {
  const c = TAROT[pk.n], nm = L(c.name);
  return `<div class="tcard${pk.rev ? " rev" : ""}${flipped ? " flipped" : ""}${guardian ? " guardian" : ""}"><div class="inner">
    <div class="tback"></div>
    <div class="face"><img src="${c.img}" alt="${esc(nm)}" loading="lazy" decoding="async"></div></div></div>`;
}

export const catsHtml = cats => cats.map(c => `
  <div class="cat">
    <div class="cat-h"><span>${c.icon} ${L(c.name)}</span><span class="stars">${starsHtml(c.score)}</span></div>
    <div class="bar"><i style="width:${c.score}%"></i></div>
    <p>${L(c.text)}</p>
  </div>`).join("");

export const luckyHtml = items => `<div class="lucky">${items.map(([lab, val]) =>
  `<div class="lk"><span>${t(lab)}</span><b>${val}</b></div>`).join("")}</div>`;

export const colorDot = hex => `<i class="dot" style="background:${hex};color:${hex}"></i>`;

export function topbar(title, back = true) {
  return `<div class="topbar">${back ? `<button class="iconbtn" type="button" data-back aria-label="${t("back")}">←</button>` : ""}<h1>${title}</h1></div>`;
}
