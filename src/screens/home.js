/* 홈 · 오늘의 운세: 오늘의 카드 + 사주 + 별자리 요약 + 행운 + 테마 바로가기 */
import { $, sleep } from "../lib/util.js";
import { L, LANG, t } from "../lib/i18n.js";
import { DAY_MS, dayIdx, kstToday, dateKey } from "../lib/calendar.js";
import { computeFortune, starsHtml, hm } from "../lib/saju.js";
import { computeZodiac } from "../lib/zodiac.js";
import { EL, BRANCHES_KO, ANIMALS_EN } from "../data/saju.js";
import { SIGNS, TXT } from "../data/zodiac.js";
import { TAROT } from "../data/cards.js";
import { THEMES, QUICK_THEMES } from "../data/themes.js";
import { savedDaily, drawDaily, dailySession, setSession, cf } from "../lib/reading.js";
import { go } from "../lib/router.js";
import { tap, thud } from "../lib/device.js";
import * as store from "../lib/store.js";
import { cardHtml, catsHtml, luckyHtml, colorDot } from "../lib/view.js";
import { mount } from "./shell.js";
import { masterOf } from "../data/masters.js";
import { masterHtml } from "../lib/master-view.js";
import { getPet, checkIn, cardXp, progress } from "../lib/pet.js";
import { xpBar } from "./master.js";
import { weekOf, weekChartHtml } from "../lib/weekchart.js";
import { keepToday, dayLog, fromFortune } from "../lib/sajulog.js";
import { animateMaster } from "../lib/motion.js";
import { mountMoonScene } from "../lib/moonscene.js";

// 홈 위쪽의 마스터 카드 (없으면 데려오기 안내)
function masterCard(gained) {
  const p = getPet();
  if (!p) return `<a class="card rise mhome new" href="#/master"><span class="mnew">🧙</span>
    <div><b>${t("mHomeNew")}</b><small>${t("mHomeNewD")}</small></div><span class="go">→</span></a>`;
  const m = masterOf(p.id), pr = progress(p);
  return `<a class="card rise mhome" href="#/master"><div class="mini"><canvas class="minimoon" aria-hidden="true"></canvas>${masterHtml(p, { h:92, motion:true, fit:56 })}</div>
    <div class="minfo"><div class="who">${L(m.name)} <span class="chip" style="margin:0">${L(pr.cur.name)}</span></div>
      ${gained ? `<span class="badge">${t("xpGot", gained.xp)}</span>` : ""}
      ${xpBar(p, pr)}</div></a>`;
}

function updateStreak(today) {
  const s = store.get("streak"), key = dateKey(today);
  if (s && s.last === key) return s.count;
  const yd = new Date(Date.UTC(today.y, today.m - 1, today.d) - DAY_MS);
  const yKey = dateKey({ y:yd.getUTCFullYear(), m:yd.getUTCMonth() + 1, d:yd.getUTCDate() });
  const count = s && s.last === yKey ? s.count + 1 : 1;
  store.set("streak", { last:key, count });
  return count;
}

const dailyInfo = d => {
  const c = TAROT[d.n];
  return `<div class="pos">${t(d.rev ? "reversed" : "upright")}</div>
    <h3>${L(c.name)}</h3><div class="kw">${cf(c, d.rev ? "rev" : "up")}</div>
    <button class="btn" type="button" id="dailyMore" style="padding:8px 14px;font-size:13px">${t("dailyMore")} →</button>`;
};

export function renderHome() {
  const p = store.get("profile"), td = kstToday(), ti = dayIdx(td.y, td.m, td.d);
  const streak = updateStreak(td);
  const gained = checkIn();
  const f = computeFortune(p), z = computeZodiac(p), s = SIGNS[z.sign];
  keepToday(td, f);                                                     // 오늘 사주를 이 기기에 남겨요 (7일 보관)
  const week = weekOf(td), wi = week.findIndex(d => d.d === td.d && d.m === td.m);
  // 요일별 사주: 지난 날은 이 기기에 남은 기록, 기록이 없거나 앞으로 올 날은 다시 계산
  const dayData = i => i === wi ? { ...fromFortune(f), saved:true }
    : (i < wi && dayLog(week[i])) ? { ...dayLog(week[i]), saved:true } : { ...fromFortune(computeFortune(p, week[i])), saved:false };
  const weekDays = week.map((_, i) => dayData(i)), weekScores = weekDays.map(x => x.score);
  const daily = savedDaily();
  const e = EL[f.lucky.el], lh = f.lucky.hour, lhStart = (2 * lh - 1) * 60 + 30;
  const lhName = LANG === "en" ? `${ANIMALS_EN[lh]} ${hm(lhStart)}–${hm(lhStart + 119)}` : `${BRANCHES_KO[lh]}시 ${hm(lhStart)}~${hm(lhStart + 119)}`;
  const quick = QUICK_THEMES.map(id => THEMES.find(x => x.id === id));

  mount(`
    <div class="head">
      <div class="today">${t("todayLine", td, { s:ti % 10, b:ti % 12 })}</div>
      <h1>${t("hello", p.name)}</h1>
      ${streak >= 2 ? `<span class="badge">${t("streak", streak)}</span>` : ""}
    </div>

    ${masterCard(gained)}

    <section class="card rise">
      <h2>${t("dailyTitle")}</h2>
      <div class="daily">
        <div id="dailyCard">${cardHtml(daily || { n:0, rev:false }, { flipped:!!daily }).replace(daily ? "" : /<img[^>]*>/, "")}</div>
        <div class="info" id="dailyInfo">${daily ? dailyInfo(daily) : `<p>${t("dailyTap")}</p>`}</div>
      </div>
    </section>

    <section class="card rise">
      <h2>${t("sajuTitle")}</h2>
      <div id="saju">${sajuHtml(wi, true)}</div>
    </section>

    <section class="card rise">
      <h2>${t("catsTitle")}<span class="dayof" id="catsDay"></span></h2>
      <div id="cats">${catsHtml(f.cats)}</div>
    </section>

    <section class="card rise">
      <h2>${t("zodiacTitle")}<a href="#/zodiac">${t("seeZodiac")} →</a></h2>
      <div class="zhead">
        <div class="zsym">${s.sym + TXT}</div>
        <div><div class="who">${L(s.name)}</div>
          <div class="scoreline"><span class="stars" style="font-size:16px">${starsHtml(z.scores[0])}</span><span class="score"><b>${z.scores[0]}</b>${t("pts")}</span></div></div>
      </div>
      <span class="chip">${L(z.H.key)}</span>
      <p class="summary">${L(z.summary)}</p>
    </section>

    <section class="card rise">
      <h2>${t("luckyTitle")}</h2>
      ${luckyHtml([["lColor", colorDot(e.hex) + L(e.color)], ["lNum", e.nums], ["lDir", L(e.dir)], ["lTime", lhName],
                   ["lItem", L(z.item)], ["lFriend", L(SIGNS[z.friend].name)]])}
      <p class="quote"><span class="grad">“${L(f.quote)}”</span></p>
    </section>

    <section class="card rise">
      <h2>${t("quickTitle")}<a href="#/tarot">${t("allThemes")} →</a></h2>
      <div class="themes">${quick.map(x => `<a class="theme" href="#/ask/${x.id}"><span class="ic">${x.icon}</span><b>${L(x.title)}</b><small>${L(x.desc)}</small></a>`).join("")}</div>
    </section>
    <p class="fun">${t("fun")}</p>`, { tab:"home" });

  animateMaster(document.querySelector(".mhome .mst"), { roam:18 });
  mountMoonScene(document.querySelector(".mhome canvas.minimoon"));      // 마스터 방과 같은 오늘 밤 사진 달
  // 요일을 누르면 그날 사주(점수·한 줄·분야별)로 바꿔 보여 줘요
  $("saju").addEventListener("click", e => {
    const h = e.target.closest(".wk-hit, [data-today]"); if (!h) return;
    showDay(h.dataset.today != null ? wi : +h.dataset.i);
  });
  $("saju").addEventListener("keydown", e => {
    const h = e.target.closest(".wk-hit"); if (h && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); showDay(+h.dataset.i); }
  });
  function showDay(i) {
    tap();
    $("saju").innerHTML = sajuHtml(i, false);
    $("cats").innerHTML = catsHtml(weekDays[i].cats);
    $("catsDay").textContent = i === wi ? "" : ` · ${t("dayOf", week[i])}`;
  }
  function sajuHtml(i, replay) {
    const d = weekDays[i];
    return `${i === wi ? "" : `<p class="dayof">${t("dayOf", week[i])}${d.saved ? "" : ` · ${t("sajuRecalc")}`} <button type="button" class="linkbtn inline" data-today>${t("backToday")}</button></p>`}
      <div class="scoreweek">
        <div class="sc"><span class="bigstars">${starsHtml(d.score)}</span><span class="score"><b>${d.score}</b>${t("pts")}</span></div>
        <div class="wk"><small>${t("weekTitle")}</small>${weekChartHtml(week, weekScores, wi, i, { replay })}</div>
      </div>
      <span class="chip">${L(d.key)}</span>
      <p class="summary">${L(d.summary)}</p>
      ${d.rel ? `<p class="note">${L(d.rel)}</p>` : ""}`;
  }

  const openDaily = () => { setSession(dailySession(savedDaily())); go("result"); };
  if (daily) { $("dailyMore").addEventListener("click", openDaily); $("dailyCard").addEventListener("click", openDaily); return; }

  // 아직 안 뽑았으면: 카드를 누르면 뒤집혀요
  let busy = false;
  $("dailyCard").addEventListener("click", async () => {
    if (busy) return; busy = true;
    tap();
    const d = drawDaily();
    if (cardXp()) {
      document.querySelector(".mhome").outerHTML = masterCard(null);
      animateMaster(document.querySelector(".mhome .mst"), { roam:18 });
      mountMoonScene(document.querySelector(".mhome canvas.minimoon"));
    }
    $("dailyCard").innerHTML = cardHtml(d);
    await sleep(60);
    $("dailyCard").querySelector(".tcard").classList.add("flipped");
    await sleep(700);
    thud();
    $("dailyInfo").innerHTML = dailyInfo(d);
    $("dailyMore").addEventListener("click", openDaily);
    $("dailyCard").addEventListener("click", openDaily);
  }, { once:true });
}
