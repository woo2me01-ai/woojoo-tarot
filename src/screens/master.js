/* 마스터 방: 타로 마스터 고르기(입양) · 키우기(단계·경험치) */
import { $ } from "../lib/util.js";
import { L, t } from "../lib/i18n.js";
import { MASTERS, STAGES, masterOf, XP_ATTEND, XP_CARD } from "../data/masters.js";
import { masterHtml, stageOf } from "../lib/master-view.js";
import { getPet, adopt, checkIn, daysAway, progress, xpOf } from "../lib/pet.js";
import { animateMaster } from "../lib/motion.js";
import { phaseOf } from "../lib/moon.js";
import { mountMoonScene } from "../lib/moonscene.js";
import { mountSky } from "../lib/skyscene.js";
import { randInt } from "../lib/util.js";
import { tap, thud } from "../lib/device.js";
import { mount } from "./shell.js";

export const xpBar = (p, pr) => `<div class="xp"><div class="bar"><i style="width:${pr.pct}%"></i></div>
  <small>${pr.next ? t("xpNext", p.xp, pr.left, L(pr.next.name)) : t("xpMax", p.xp)}</small></div>`;

let choosing = false;

export function renderMaster(reset) {
  if (reset === true) choosing = false;          // 탭으로 새로 들어오면 고르기 화면은 닫아요
  const p = getPet();
  if (!p || choosing) return renderAdopt(p);
  const gained = checkIn();
  const m = masterOf(p.id), pr = progress(getPet());
  const away = daysAway();
  const line = gained && gained.stageUp ? t("mStageUp", L(pr.cur.name))
    : gained && away >= 3 ? t("mMissed", away)
    : t("mLines")[randInt(t("mLines").length)];
  const stage = () => `<canvas class="sky" aria-hidden="true"></canvas><canvas class="moonbg" aria-hidden="true"></canvas>${masterHtml(getPet(), { h:220, motion:true, fit:165 })}`;   // 직접 찍은 달 사진
  mount(`
    <div class="head"><h1>${t("mTitle")}</h1><p>${t("mLead")}</p></div>
    <section class="card rise room">
      <div class="bubble" id="say">${line}</div>
      <div class="stage" id="stage">${stage()}</div>
      <p class="moonday" id="moonday"></p>
      <div class="who center">${L(m.name)} <span class="chip" style="margin:0">${L(pr.cur.name)}</span></div>
      <p class="small center">${L(m.kind)} · ${L(m.gift)}</p>
      ${xpBar(getPet(), pr)}
      <div class="todo">
        <span class="${pr.todayDone.att ? "done" : ""}">${pr.todayDone.att ? "✅" : "⬜"} ${t("mAttend")} +${XP_ATTEND}</span>
        <a href="#/home" class="${pr.todayDone.card ? "done" : ""}">${pr.todayDone.card ? "✅" : "⬜"} ${t("mCard")} +${XP_CARD}</a>
      </div>
      <div class="stages">${STAGES.map((s, i) => `<span class="${i <= pr.stage ? "on" : ""}">${i + 1}</span>`).join("")}</div>
    </section>
    <button class="btn" type="button" id="change" style="width:100%">${t("mChange")}</button>
    <p class="hint center">${t("mHint")}</p>`, { tab:"master" });

  mountSky($("stage").querySelector("canvas.sky"));                // 달 뒤 은하수 + 떨어지는 유성
  // 오늘 밤 서울에서 보이는 실제 달 모양 (그린 뒤 이름·밝기를 아래에 적어요)
  mountMoonScene($("stage").querySelector("canvas.moonbg"), v => {
    const n = phaseOf(v.lit, v.waxing);
    if ($("moonday")) $("moonday").textContent = t("moonTonight", n.emoji, L(n.name), Math.round(v.lit * 100));
  });
  const mover = animateMaster($("stage").querySelector(".mst"));
  $("stage").addEventListener("click", () => {
    thud();
    $("say").textContent = t("mTap")[randInt(t("mTap").length)];
    mover.cheer();
  });
  $("change").addEventListener("click", () => { choosing = true; renderMaster(); });
}

function renderAdopt(p) {
  let pick = p ? p.id : null;
  // 가로로 긴 캐릭터(다람쥐·고양이)도 칸 안에 들어오게 너비 기준으로 줄여요
  const preview = id => masterHtml({ id, xp:0 }, { h:92, grow:false, fit:48 });   // 칸 안쪽 너비의 절반쯤
  mount(`
    ${p ? `<div class="topbar"><button class="iconbtn" type="button" id="cancel" aria-label="${t("back")}">←</button><h1>${t("mChange")}</h1></div>`
        : `<div class="head"><h1>${t("mPickTitle")}</h1><p>${t("mPickLead")}</p></div>`}
    <div class="masters" id="list">${MASTERS.map(m => `
      <button type="button" class="mpick${m.id === pick ? " on" : ""}" data-id="${m.id}">
        <span class="pv"><canvas class="pvmoon" aria-hidden="true"></canvas>${preview(m.id)}</span><b>${L(m.name)}</b><small>${L(m.kind)}</small>${xpOf(m.id) ? `<em class="lv">${L(STAGES[stageOf(xpOf(m.id))].name)}</em>` : ""}</button>`).join("")}</div>
    <p class="gift center" id="gift">${pick ? L(masterOf(pick).gift) : t("mPickHint")}</p>
    <button class="primary" type="button" id="ok"${pick ? "" : " disabled"}>${t(p ? "mChangeOk" : "mAdopt")}</button>
    ${p ? `<p class="hint center">${t("mKeepXp")}</p>` : ""}`, { tab:"master" });

  document.querySelectorAll("canvas.pvmoon").forEach(c => mountMoonScene(c));   // 칸마다 마스터 방과 같은 오늘 밤 달
  $("list").addEventListener("click", e => {
    const b = e.target.closest(".mpick"); if (!b) return;
    tap();
    pick = b.dataset.id;
    $("list").querySelectorAll(".mpick").forEach(x => x.classList.toggle("on", x === b));
    $("gift").textContent = L(masterOf(pick).gift);
    $("ok").disabled = false;
  });
  $("ok").addEventListener("click", () => { if (!pick) return; thud(); adopt(pick); choosing = false; renderMaster(); window.scrollTo(0, 0); });
  if ($("cancel")) $("cancel").addEventListener("click", () => { choosing = false; renderMaster(); });
}
