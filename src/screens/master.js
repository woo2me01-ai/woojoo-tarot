/* 마스터 방: 타로 마스터 고르기(입양) · 키우기(단계·경험치) */
import { $ } from "../lib/util.js";
import { L, t } from "../lib/i18n.js";
import { MASTERS, STAGES, masterOf, XP_ATTEND, XP_CARD } from "../data/masters.js";
import { masterHtml } from "../lib/master-view.js";
import { getPet, adopt, checkIn, daysAway, progress } from "../lib/pet.js";
import { animateMaster } from "../lib/motion.js";
import { moonPhase, moonSvg } from "../lib/moon.js";
import { mountMoonScene } from "../lib/moonscene.js";
import { randInt } from "../lib/util.js";
import { tap, thud } from "../lib/device.js";
import { mount } from "./shell.js";

export const xpBar = (p, pr) => `<div class="xp"><div class="bar"><i style="width:${pr.pct}%"></i></div>
  <small>${pr.next ? t("xpNext", p.xp, pr.left, L(pr.next.name)) : t("xpMax", p.xp)}</small></div>`;

let choosing = false;

// 무대 위 마스터 키: 220px의 1.5배. 가로로 긴 캐릭터(다람쥐·코끼리·고양이)는 무대 폭(약 320px)을 넘지 않게 줄여요
const stageH = m => Math.min(330, Math.round(320 / m.ar));

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
  const ph = moonPhase();
  mount(`
    <div class="head"><h1>${t("mTitle")}</h1><p>${t("mLead")}</p></div>
    <section class="card rise room">
      <div class="stage" id="stage"><canvas class="sky" aria-hidden="true"></canvas>
        <div class="bubble" id="say">${line}</div>${masterHtml(getPet(), { h:stageH(m), motion:true })}</div>
      <p class="moonday">${t("moonToday", ph.emoji, L(ph.name))}</p>
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

  mountMoonScene($("stage").querySelector("canvas.sky"));        // 별 하늘 + 10초마다 그림자가 지나가는 푸른 보름달
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
  const preview = id => masterHtml({ id, xp:0 }, { h:Math.min(92, Math.round(88 / masterOf(id).ar)), grow:false });
  const ph = moonPhase();
  mount(`
    ${p ? `<div class="topbar"><button class="iconbtn" type="button" id="cancel" aria-label="${t("back")}">←</button><h1>${t("mChange")}</h1></div>`
        : `<div class="head"><h1>${t("mPickTitle")}</h1><p>${t("mPickLead")}</p></div>`}
    <div class="masters" id="list">${MASTERS.map(m => `
      <button type="button" class="mpick${m.id === pick ? " on" : ""}" data-id="${m.id}">
        <span class="pv"><span class="moonbg">${moonSvg(ph)}</span>${preview(m.id)}</span><b>${L(m.name)}</b><small>${L(m.kind)}</small></button>`).join("")}</div>
    <p class="gift center" id="gift">${pick ? L(masterOf(pick).gift) : t("mPickHint")}</p>
    <button class="primary" type="button" id="ok"${pick ? "" : " disabled"}>${t(p ? "mChangeOk" : "mAdopt")}</button>
    ${p ? `<p class="hint center">${t("mKeepXp")}</p>` : ""}`, { tab:"master" });

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
