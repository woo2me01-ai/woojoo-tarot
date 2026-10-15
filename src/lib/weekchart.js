/* 이번 주(월~일) 운세 점수를 별자리처럼 그려요: 날마다 별 하나, 점수가 높을수록 위에 크고 밝게, 별끼리는 가는 선으로 이어요 */
import { DAY_MS } from "./calendar.js";
import { starCount } from "./saju.js";
import { LANG, t } from "./i18n.js";

const WD_SHORT = { ko:"일월화수목금토", en:["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] };

// 오늘이 들어 있는 주의 월요일~일요일 날짜
export function weekOf(today) {
  const base = Date.UTC(today.y, today.m - 1, today.d), wd = new Date(base).getUTCDay();
  const mon = base - ((wd + 6) % 7) * DAY_MS;
  return [...Array(7)].map((_, i) => {
    const d = new Date(mon + i * DAY_MS);
    return { y:d.getUTCFullYear(), m:d.getUTCMonth() + 1, d:d.getUTCDate(), wd:d.getUTCDay() };
  });
}

// 빛나는 별 모양(네 갈래 반짝임 + 가운데 동그라미). n = 별 개수(1~5)로 크기가 정해져요 · on = 골라 보는 날(노란 별)
function sparkle(x, y, n, on) {
  const r = 1.6 + n * .9, L = r * (1.8 + n * .25), w = r * .38, f = v => v.toFixed(1);
  const color = on ? "var(--lemon)" : n >= 4 ? "#f4f1ff" : n >= 3 ? "#d9d2ff" : "#a99fd6";
  return `<g class="wk-star${on ? " today" : ""}" style="--d:${(Math.random() * 2).toFixed(2)}s">
    ${on || n >= 4 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.6)}" fill="${color}" opacity=".18"/>` : ""}
    <path d="M${f(x)} ${f(y - L)} L${f(x + w)} ${f(y - w)} L${f(x + L)} ${f(y)} L${f(x + w)} ${f(y + w)} L${f(x)} ${f(y + L)} L${f(x - w)} ${f(y + w)} L${f(x - L)} ${f(y)} L${f(x - w)} ${f(y - w)}Z" fill="${color}"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(r * .55)}" fill="#fff"/></g>`;
}

/* days: weekOf() 결과 · scores: 날짜별 총운(25~98) · ti: 오늘의 순번(0=월) · sel: 골라 보는 날(기본 오늘)
   오늘까지의 요일은 눌러서 그날 사주를 볼 수 있어요(.wk-hit, data-i). 앞으로 올 날은 흐리게만 보여요 */
export function weekChartHtml(days, scores, ti, sel = ti, { replay = true } = {}) {
  const W = 210, H = 86, padX = 14, top = 12, bottom = 64, gap = (W - padX * 2) / 6;
  const xs = days.map((_, i) => padX + i * gap);
  const ys = scores.map(s => bottom - (Math.max(25, Math.min(98, s)) - 25) / 73 * (bottom - top));
  const line = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const label = d => LANG === "en" ? WD_SHORT.en[d.wd] : WD_SHORT.ko[d.wd];
  const aria = t("weekAria", days.map((d, i) => `${label(d)} ${scores[i]}`).join(", "));
  return `<svg class="weekchart${replay ? "" : " still"}" viewBox="0 0 ${W} ${H}" role="group" aria-label="${aria}">
    <polyline class="wk-line" points="${line}" pathLength="100" fill="none" stroke="rgba(196,181,253,.55)" stroke-width="1.1" stroke-linejoin="round"/>
    ${xs.map((x, i) => `<g class="${i > ti ? "future" : ""}">${sparkle(x, ys[i], starCount(scores[i]), i === sel)}</g>`).join("")}
    <text x="${xs[sel].toFixed(1)}" y="${(ys[sel] - 9 - starCount(scores[sel]) * 1.6).toFixed(1)}" class="wk-score">${scores[sel]}</text>
    ${xs.map((x, i) => `<text x="${x.toFixed(1)}" y="${H - 6}" class="wk-day${i === sel ? " sel" : ""}${i === ti ? " today" : ""}${i > ti ? " future" : ""}">${label(days[i])}</text>`).join("")}
    ${xs.map((x, i) => i > ti ? "" : `<rect class="wk-hit" data-i="${i}" x="${(x - gap / 2).toFixed(1)}" y="0" width="${gap.toFixed(1)}" height="${H}"
      fill="transparent" role="button" tabindex="0" aria-label="${t("dayOf", days[i])} ${scores[i]}${t("pts")}"/>`).join("")}
  </svg>`;
}
