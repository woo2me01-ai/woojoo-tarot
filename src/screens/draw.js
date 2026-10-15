/* 셔플 · 카드 선택: 섞기 연출(건너뛰기 가능) → 78장에서 고르기 → 공개 방식(한 장씩/한꺼번에) */
import { $, esc, sleep } from "../lib/util.js";
import { L, t } from "../lib/i18n.js";
import { TOPICS } from "../data/cards.js";
import { session, needCount, positions, pickAt } from "../lib/reading.js";
import { go } from "../lib/router.js";
import { tap, thud } from "../lib/device.js";
import * as store from "../lib/store.js";
import { cardHtml, topbar } from "../lib/view.js";
import { mount } from "./shell.js";

const SHUFFLE_MS = 1200;

export function renderDraw() {
  const s = session;
  if (!s || s.kind === "daily") { go("tarot", true); return; }
  if (s.picks.length === needCount(s)) { go("result", true); return; }   // 결과에서 뒤로 온 경우
  const need = needCount(s), pos = positions(s), reveal = store.get("settings").reveal;
  const topic = s.theme ? L(s.theme.title) : (TOPICS.find(x => x.key === s.topic) || {}).label;

  mount(`
    ${topbar(s.theme ? `${s.theme.icon} ${L(s.theme.title)}` : t("freeTitle"))}
    ${s.question ? `<p class="qecho">“${esc(s.question)}”</p>` : ""}
    <p class="qtopic">${t("topic")}${topic ? L(topic) : t("topicAll")}</p>
    <div id="shuffle" class="center">
      <div class="shuffle"><div class="tback"></div><div class="tback"></div><div class="tback"></div><div class="tback"></div></div>
      <p class="guide">${t("shuffling")}</p>
      <button class="linkbtn" id="skip" type="button">${t("skip")}</button>
    </div>
    <div id="table" class="hidden">
      <div class="slots n${need}" id="slots">${pos.map(p => `<div class="slot"><div class="empty"></div><span class="pos">${p}</span></div>`).join("")}</div>
      <p class="guide" id="guide">${t("pickN", need, need)}</p>
      <div class="deck" id="deck">${s.order.map((_, i) => `<button type="button" class="tback" data-i="${i}" aria-label="${t("cardAria", i + 1)}"></button>`).join("")}</div>
      <button class="primary hidden" id="reveal" type="button">${t("revealAll")}</button>
    </div>`, { fallback:"tarot" });

  let shown = false;
  const showTable = () => {
    if (shown) return; shown = true;
    $("shuffle").classList.add("hidden");
    $("table").classList.remove("hidden");
  };
  $("skip").addEventListener("click", showTable);
  setTimeout(showTable, SHUFFLE_MS);

  const flip = async (k, delay = 0) => {
    await sleep(delay);
    const c = $("slots").children[k].querySelector(".tcard");
    c.classList.add("flipped");
    thud();
  };
  const finish = async () => {
    $("deck").classList.add("done");
    $("guide").textContent = t("pickDone");
    if (reveal === "all") {
      $("reveal").classList.remove("hidden");
      $("reveal").addEventListener("click", async () => {
        $("reveal").classList.add("hidden");
        await Promise.all(s.picks.map((_, k) => flip(k, k * 350)));
        await sleep(900);
        go("result", true);
      }, { once:true });
    } else {
      await sleep(1100);
      go("result", true);
    }
  };

  $("deck").addEventListener("click", e => {
    const b = e.target.closest("button[data-i]");
    if (!b || b.classList.contains("taken") || s.picks.length >= need) return;
    b.classList.add("taken");
    tap();
    const pk = pickAt(s, +b.dataset.i), k = s.picks.length - 1;
    $("slots").children[k].querySelector(".empty").outerHTML = cardHtml(pk);   // 뒤집기 전에 그림을 미리 불러와요
    if (reveal === "each") flip(k, 120);
    if (s.picks.length < need) $("guide").textContent = t("pickN", need - s.picks.length, need);
    else finish();
  });
}
