/* 사주 계산 — 웹(fortune/index.html)에서 옮겨 옴 */
import { pad2 } from "./util.js";
import { LANG, t } from "./i18n.js";
import { DAY_MS, dayIdx, sunLon, kstToday, dateKey, hashStr, mulberry32, pick } from "./calendar.js";
import { BRANCHES_KO, ANIMALS_EN, BRANCH_EL, EL, GODS, tenGod, BRANCH_REL, branchRel, CATS, QUOTES, stemEl } from "../data/saju.js";

export const elName = i => LANG === "en" ? EL[i].en : EL[i].ko;

/* 태어난 시간: 서울의 실제 태양시를 반영한 30분 늦춘 구간 */
const hm = min => pad2(Math.floor(min / 60) % 24) + ":" + pad2(min % 60);
function hourOptions() {
  const ko = LANG === "ko", dash = ko ? "~" : "–";
  const o = [{ v:"", label:t("unknown") }, { v:"0a", label:(ko ? "자시" : "Rat") + ` (00:00${dash}01:29)` }];
  for (let h = 1; h < 12; h++) {
    const s = (2 * h - 1) * 60 + 30;
    o.push({ v:String(h), label:(ko ? BRANCHES_KO[h] + "시" : ANIMALS_EN[h]) + ` (${hm(s)}${dash}${hm(s + 119)})` });
  }
  o.push({ v:"0b", label:(ko ? "야자시" : "Late Rat") + ` (23:30${dash}23:59)` });
  return o;
}
function hourInfo(v) {
  if (!v) return null;
  if (v === "0a") return { branch:0, min:45, nextDay:false };
  if (v === "0b") return { branch:0, min:23 * 60 + 45, nextDay:true };
  const h = +v;
  return { branch:h, min:(2 * h - 1) * 60 + 90, nextDay:false };   // 구간 한가운데
}
const hourLabel = v => (hourOptions().find(o => o.v === v) || hourOptions()[0]).label;

// 양력 생일(한국 시간) → 사주팔자
function buildChart(y, m, d, hourV) {
  const hi = hourInfo(hourV);
  const ms = Date.UTC(y, m - 1, d, 0, hi ? hi.min : 12 * 60) - 9 * 3600e3;
  const lon = sunLon(ms);
  const sy = (m <= 2 && lon >= 270 && lon < 315) ? y - 1 : y;          // 입춘(315°) 전이면 전년
  const ys = ((sy - 4) % 10 + 10) % 10, yb = ((sy - 4) % 12 + 12) % 12;
  const mi = Math.floor(((lon - 315) % 360 + 360) % 360 / 30);         // 0 = 寅월
  const month = { s:((ys % 5) * 2 + 2 + mi) % 10, b:(2 + mi) % 12 };
  const dd = new Date(Date.UTC(y, m - 1, d) + (hi && hi.nextDay ? DAY_MS : 0));
  const di = dayIdx(dd.getUTCFullYear(), dd.getUTCMonth() + 1, dd.getUTCDate());
  const day = { s:di % 10, b:di % 12 };
  const hour = hi ? { s:((day.s % 5) * 2 + hi.branch) % 10, b:hi.branch } : null;
  return { year:{ s:ys, b:yb }, month, day, hour };
}

// day: 운세를 볼 날짜 (기본은 오늘, 주간 그래프에서는 그 주의 날짜마다)
function computeFortune(p, day = kstToday()) {
  const today = day, tKey = dateKey(today);
  const chart = buildChart(p.solar.y, p.solar.m, p.solar.d, p.hour);
  const ti = dayIdx(today.y, today.m, today.d), tp = { s:ti % 10, b:ti % 12 };
  const rng = mulberry32(hashStr(`${dateKey(p.solar)}|${p.hour}|${tKey}`));

  const gi = tenGod(chart.day.s, tp.s), god = GODS[gi];
  const rel = branchRel(chart.day.b, tp.b), relInfo = rel ? BRANCH_REL[rel] : null;
  const scores = god.base.map((b, i) => {
    const v = b + (relInfo ? relInfo.mod[i] : 0) + Math.round((rng() - 0.5) * 20);
    return Math.max(25, Math.min(98, v));
  });

  // 오행 분포: 내 사주 + 오늘 일진 중 가장 부족한 기운이 행운의 기운
  const pillars = [chart.year, chart.month, chart.day, chart.hour].filter(Boolean);
  const counts = [0,0,0,0,0];
  pillars.forEach(x => { counts[stemEl(x.s)]++; counts[BRANCH_EL[x.b]]++; });
  const withToday = counts.slice(); withToday[stemEl(tp.s)]++; withToday[BRANCH_EL[tp.b]]++;
  const minV = Math.min(...withToday);
  const luckyEl = pick(rng, withToday.map((v, i) => v === minV ? i : -1).filter(i => i >= 0));
  const luckyHour = pick(rng, [3,4,5,6,7,8,9,10,11].filter(h => BRANCH_EL[h] === luckyEl));

  return {
    today, tp, chart, counts, god, gi, scores,
    summary: pick(rng, god.text),
    relText: relInfo ? pick(rng, relInfo.text) : null,
    cats: CATS.map((c, i) => ({ icon:c.icon, name:c.name, score:scores[i + 1], text:pick(rng, c.lines[tier(scores[i + 1])]) })),
    lucky: { el:luckyEl, hour:luckyHour },
    quote: pick(rng, QUOTES),
  };
}
const tier = s => s >= 75 ? 0 : s >= 55 ? 1 : 2;
const starCount = s => s >= 88 ? 5 : s >= 74 ? 4 : s >= 58 ? 3 : s >= 42 ? 2 : 1;
const starsHtml = s => { const n = starCount(s); return "★".repeat(n) + `<span class="off">${"★".repeat(5 - n)}</span>`; };
const starsText = s => { const n = starCount(s); return "★".repeat(n) + "☆".repeat(5 - n); };

export { hm, hourOptions, hourInfo, hourLabel, buildChart, computeFortune, tier, starCount, starsHtml, starsText };
