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

// 빛나는 별 모양(네 갈래 반짝임 + 가운데 동그라미). n = 별 개수(1~5)로 크기가 정해져요
function sparkle(x, y, n, today) {
  const r = 1.6 + n * .9, L = r * (1.8 + n * .25), w = r * .38, f = v => v.toFixed(1);
  const color = today ? "var(--lemon)" : n >= 4 ? "#f4f1ff" : n >= 3 ? "#d9d2ff" : "#a99fd6";
  return `<g class="wk-star${today ? " today" : ""}" style="--d:${(Math.random() * 2).toFixed(2)}s">
    ${today || n >= 4 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.6)}" fill="${color}" opacity=".18"/>` : ""}
    <path d="M${f(x)} ${f(y - L)} L${f(x + w)} ${f(y - w)} L${f(x + L)} ${f(y)} L${f(x + w)} ${f(y + w)} L${f(x)} ${f(y + L)} L${f(x - w)} ${f(y + w)} L${f(x - L)} ${f(y)} L${f(x - w)} ${f(y - w)}Z" fill="${color}"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(r * .55)}" fill="#fff"/></g>`;
}

/* days: weekOf() 결과 · scores: 날짜별 총운(25~98) · ti: 오늘의 순번(0=월) */
export function weekChartHtml(days, scores, ti) {
  const W = 210, H = 86, padX = 14, top = 12, bottom = 64;
  const xs = days.map((_, i) => padX + i * (W - padX * 2) / 6);
  const ys = scores.map(s => bottom - (Math.max(25, Math.min(98, s)) - 25) / 73 * (bottom - top));
  const line = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const label = d => LANG === "en" ? WD_SHORT.en[d.wd] : WD_SHORT.ko[d.wd];
  const aria = t("weekAria", days.map((d, i) => `${label(d)} ${scores[i]}`).join(", "));
  return `<svg class="weekchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria}">
    <polyline class="wk-line" points="${line}" pathLength="100" fill="none" stroke="rgba(196,181,253,.55)" stroke-width="1.1" stroke-linejoin="round"/>
    ${xs.map((x, i) => sparkle(x, ys[i], starCount(scores[i]), i === ti)).join("")}
    <text x="${xs[ti].toFixed(1)}" y="${(ys[ti] - 9 - starCount(scores[ti]) * 1.6).toFixed(1)}" class="wk-score">${scores[ti]}</text>
    ${xs.map((x, i) => `<text x="${x.toFixed(1)}" y="${H - 6}" class="wk-day${i === ti ? " today" : ""}">${label(days[i])}</text>`).join("")}
  </svg>`;
}
