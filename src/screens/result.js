/* 결과: 카드별 풀이 + 별자리 한 줄 + 정리 + 공유 */
import { $, esc } from "../lib/util.js";
import { L, t } from "../lib/i18n.js";
import { kstToday } from "../lib/calendar.js";
import { sunSign } from "../lib/zodiac.js";
import { TAROT, TOPICS } from "../data/cards.js";
import { SIGNS } from "../data/zodiac.js";
import { ELEMENTS } from "../data/astro.js";
import { session, positions, cardMeaning, leadOf, answerOf, summaryOf, zodiacOf, saveHistory, cf, toneOf } from "../lib/reading.js";
import { go } from "../lib/router.js";
import { copyText, shareText } from "../lib/device.js";
import * as store from "../lib/store.js";
import { cardHtml, topbar } from "../lib/view.js";
import { mount } from "./shell.js";
import { randInt } from "../lib/util.js";
import { masterOf } from "../data/masters.js";
import { masterHtml, posesOf } from "../lib/master-view.js";
import { getPet } from "../lib/pet.js";
import { moonSvg } from "../lib/moon.js";

// 풀이 끝에 내 타로 마스터가 한마디 해 줘요. 좋은 결과면 웃고, 아쉬운 결과면 울거나 화를 내요(카드 대신)
function masterSays(s) {
  const p = getPet(); if (!p) return "";
  const tone = toneOf(s), nm = L(masterOf(p.id).name);
  const sad = ["cry", "angry"].filter(n => posesOf(p.id)[n]);            // 그림이 있는 표정만 (다람쥐는 화남이 없어요)
  const pose = tone > 0 ? "laugh" : tone < 0 && sad.length ? sad[randInt(sad.length)] : "idle";
  const lines = t(tone > 0 ? "mResultGood" : tone < 0 ? "mResultBad" : "mResult");
  return `<a class="msay rise ${tone > 0 ? "good" : tone < 0 ? "bad" : ""}" href="#/master"><div class="mini"><span class="moonbg">${moonSvg()}</span>${masterHtml(p, { h:84, pose })}</div>
    <div class="bubble"><small>${t("mSays", nm)}</small>${lines[randInt(lines.length)]}</div></a>`;
}

function shareLines(s, pos) {
  const lab = pk => `${L(TAROT[pk.n].name)}(${t(pk.rev ? "revShort" : "upShort")})`;
  if (s.kind === "daily") {
    const pk = s.picks[0], c = TAROT[pk.n];
    return [t("shareDaily", kstToday()), `${L(c.name)} ${t(pk.rev ? "reversed" : "upright")} — ${cf(c, pk.rev ? "rev" : "up")}`];
  }
  const head = s.theme ? `${s.theme.icon} ${L(s.theme.title)}` : t("shareAsk");
  if (s.picks.length === 1) return [head, `${t("shareAns")}${answerOf(s.picks[0])[0]} · ${lab(s.picks[0])}`];
  return [head, s.picks.map((pk, i) => `${pos[i]} ${lab(pk)}`).join(" · ")];
}

export function renderResult() {
  const s = session;
  if (!s || !s.picks.length) { go("home", true); return; }
  saveHistory(s);
  const p = store.get("profile"), sign = p ? sunSign(p) : null;
  const pos = s.kind === "daily" ? [t("dailyTitle").replace("🃏 ", "")] : positions(s);
  const z = zodiacOf(s, sign);
  const topic = s.theme ? null : (TOPICS.find(x => x.key === s.topic) || {}).label;

  let head = "";
  if (s.kind !== "daily") {
    head = (s.question ? `<p class="qecho">“${esc(s.question)}”</p>` : "")
      + `<p class="qtopic">${s.theme ? `${s.theme.icon} ${L(s.theme.title)}` : t("topic") + (topic ? L(topic) : t("topicAll"))}</p>`;
    if (s.picks.length === 1) {
      const a = answerOf(s.picks[0]);
      head += `<div class="answer"><span class="grad">${a[0]}</span></div><p class="qtopic">${a[1]}</p>`;
    }
  }
  const rows = s.picks.map((pk, i) => {
    const c = TAROT[pk.n], lead = leadOf(s, i);
    return `<div class="reading">${cardHtml(pk, { flipped:true, guardian:z && z.guardian && z.card === c })}<div>
      <div class="pos">${pos[i]} · ${t(pk.rev ? "reversed" : "upright")}</div>
      <h3>${L(c.name)} <small>${L(c.name) === c.name.en ? "" : c.name.en}</small></h3>
      <div class="kw">${cf(c, pk.rev ? "rev" : "up")}</div>
      <p>${lead ? `<span class="lead">${lead}</span> ` : ""}${cardMeaning(s, pk)}</p></div></div>`;
  }).join("");
  const sum = summaryOf(s);
  const daily = s.kind === "daily" ? TAROT[s.picks[0].n] : null;
  const zs = sign != null ? SIGNS[sign] : null;

  mount(`
    ${topbar(s.kind === "daily" ? t("dailyTitle") : t("appName"))}
    ${head}
    <section class="card rise">${rows}${sum ? `<p class="note">${sum}</p>` : ""}</section>
    ${daily ? `<section class="card rise tips">
        <div><b>${t("tipLove")}</b>${cf(daily, "love")}</div><div><b>${t("tipWork")}</b>${cf(daily, "work")}</div><div><b>${t("tipMoney")}</b>${cf(daily, "money")}</div>
      </section>` : ""}
    ${z ? `<section class="zblock rise${z.guardian ? " guardian" : ""}">
        <div class="t">${z.guardian ? t("guardianHit") : `${zs.sym}︎ ${t("zBlock", L(zs.name))}`}</div>
        ${z.guardian ? "" : `<div class="els">${ELEMENTS[z.signEl].ic} ${L(zs.name)} · ${L(ELEMENTS[z.signEl].name)} × ${ELEMENTS[z.cardEl].ic} ${L(z.card.name)} · ${L(ELEMENTS[z.cardEl].name)}</div>`}
        <p>${L(z.text)}</p></section>` : ""}
    ${masterSays(s)}
    ${daily ? `<p class="hint center">${t("dailyNote")}</p>` : ""}
    <div class="btns" style="margin-top:16px">
      <button class="btn" type="button" id="share">${t("share")}</button>
      <button class="btn" type="button" id="copy">${t("copy")}</button>
    </div>
    <div class="msg" id="msg"></div>
    ${s.kind === "daily" ? "" : `<button class="primary" type="button" id="again">${t("again")}</button>`}
    <button class="linkbtn" type="button" id="home">${t("toHome")}</button>
    <p class="fun">${t("fun")}</p>`, { fallback:"home" });

  const text = () => [...shareLines(s, pos), "", t("shareFoot")].join("\n");
  const flash = msg => { $("msg").textContent = msg; setTimeout(() => { if ($("msg")) $("msg").textContent = ""; }, 3000); };
  $("copy").addEventListener("click", async () => { if (await copyText(text())) flash(t("copied")); });
  $("share").addEventListener("click", async () => { if (!(await shareText(text())) && await copyText(text())) flash(t("copied")); });
  $("home").addEventListener("click", () => go("home"));
  if ($("again")) $("again").addEventListener("click", () => go(s.theme ? `ask/${s.theme.id}` : "ask/free"));
}
