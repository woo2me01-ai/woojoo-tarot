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
import { animateMaster } from "../lib/motion.js";
import { moonSvg } from "../lib/moon.js";

// 홈 위쪽의 마스터 카드 (없으면 데려오기 안내)
function masterCard(gained) {
  const p = getPet();
  if (!p) return `<a class="card rise mhome new" href="#/master"><span class="mnew">🧙</span>
    <div><b>${t("mHomeNew")}</b><small>${t("mHomeNewD")}</small></div><span class="go">→</span></a>`;
  const m = masterOf(p.id), pr = progress(p);
  return `<a class="card rise mhome" href="#/master"><div class="mini"><span class="moonbg">${moonSvg()}</span>${masterHtml(p, { h:92, motion:true })}</div>
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
  const week = weekOf(td), weekScores = week.map(d => computeFortune(p, d).scores[0]);   // 이번 주 월~일 총운
  const wi = week.findIndex(d => d.d === td.d && d.m === td.m);
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
      <div class="scoreweek">
        <div class="sc"><span class="bigstars">${starsHtml(f.scores[0])}</span><span class="score"><b>${f.scores[0]}</b>${t("pts")}</span></div>
        <div class="wk"><small>${t("weekTitle")}</small>${weekChartHtml(week, weekScores, wi)}</div>
      </div>
      <span class="chip">${L(f.god.key)}</span>
      <p class="summary">${L(f.summary)}</p>
      ${f.relText ? `<p class="note">${L(f.relText)}</p>` : ""}
    </section>

    <section class="card rise">
      <h2>${t("catsTitle")}</h2>
      ${catsHtml(f.cats)}
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
  const openDaily = () => { setSession(dailySession(savedDaily())); go("result"); };
  if (daily) { $("dailyMore").addEventListener("click", openDaily); $("dailyCard").addEventListener("click", openDaily); return; }

  // 아직 안 뽑았으면: 카드를 누르면 뒤집혀요
  let busy = false;
  $("dailyCard").addEventListener("click", async () => {
    if (busy) return; busy = true;
    tap();
    const d = drawDaily();
    if (cardXp()) { document.querySelector(".mhome").outerHTML = masterCard(null); animateMaster(document.querySelector(".mhome .mst"), { roam:18 }); }
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
