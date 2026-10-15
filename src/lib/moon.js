/* 오늘의 달 모양: 해와 달의 황경 차(이각)로 실제 위상을 계산해 SVG로 그려요 (한국 정오 기준, 북반구에서 보이는 모양) */
import { P } from "./util.js";
import { sunLon, moonLon, kstToday } from "./calendar.js";

const NAMES = [
  [P("삭", "New moon"), "🌑"], [P("초승달", "Waxing crescent"), "🌒"], [P("상현달", "First quarter"), "🌓"], [P("차오르는 달", "Waxing gibbous"), "🌔"],
  [P("보름달", "Full moon"), "🌕"], [P("기우는 달", "Waning gibbous"), "🌖"], [P("하현달", "Last quarter"), "🌗"], [P("그믐달", "Waning crescent"), "🌘"],
];

// 밝은 비율·차오름 여부로 이름 고르기 (moonsky.js의 오늘 밤 달에 써요)
export function phaseOf(lit, waxing) {
  const i = lit < .03 ? 0 : lit > .97 ? 4 : lit < .45 ? (waxing ? 1 : 7) : lit <= .55 ? (waxing ? 2 : 6) : (waxing ? 3 : 5);
  return { name:NAMES[i][0], emoji:NAMES[i][1] };
}

export function moonPhase(day = kstToday()) {
  const ms = Date.UTC(day.y, day.m - 1, day.d, 3);
  const e = ((moonLon(ms) - sunLon(ms)) % 360 + 360) % 360;          // 0 삭 · 90 상현 · 180 보름 · 270 하현
  const [name, emoji] = NAMES[Math.round(e / 45) % 8];
  return { e, lit:(1 - Math.cos(e * Math.PI / 180)) / 2, name, emoji };
}

/* 달 SVG. 어두운 부분도 희미하게(지구 반사광) 보여서 동그라미 모양은 늘 남아요.
   lite: 카드 뒷면처럼 작게 쓸 때(분화구·빛번짐 없이) */
export function moonSvg(ph = moonPhase(), { lite = false, dark = "rgba(196,181,253,.16)", light = "#fbf7ef" } = {}) {
  const r = 50, rx = Math.abs(Math.cos(ph.e * Math.PI / 180)) * r, f = v => v.toFixed(2);
  const waxing = ph.e < 180, crescent = ph.e < 90 || ph.e > 270;
  // 밝은 쪽 반원 + 명암 경계(반타원). 초승·그믐이면 경계가 밝은 쪽으로, 차오름·기욺이면 반대쪽으로 볼록해요
  const lit = `M50 0 A50 50 0 0 ${waxing ? 1 : 0} 50 100 A${f(rx)} 50 0 0 ${waxing === crescent ? 0 : 1} 50 0Z`;
  const id = "m" + Math.round(ph.e * 100);
  return `<svg viewBox="-6 -6 112 112" class="moon" aria-hidden="true">
    ${lite ? "" : `<defs><radialGradient id="${id}g"><stop offset="60%" stop-color="${light}" stop-opacity=".35"/><stop offset="100%" stop-color="${light}" stop-opacity="0"/></radialGradient>
      <clipPath id="${id}c"><path d="${lit}"/></clipPath></defs>
      <circle cx="50" cy="50" r="56" fill="url(#${id}g)" opacity="${f(.25 + ph.lit * .75)}"/>`}
    <circle cx="50" cy="50" r="50" fill="${dark}" stroke="rgba(251,247,239,.28)" stroke-width="${lite ? 4 : 1.2}"/>
    ${ph.lit < .01 ? "" : `<path d="${lit}" fill="${light}"/>`}
    ${lite || ph.lit < .01 ? "" : `<g clip-path="url(#${id}c)" fill="#e9e1d1" opacity=".7">
      <circle cx="34" cy="32" r="7"/><circle cx="64" cy="58" r="9"/><circle cx="40" cy="72" r="5"/><circle cx="70" cy="26" r="4"/><circle cx="22" cy="56" r="4"/></g>`}
  </svg>`;
}

// 카드 뒷면 가운데 달: CSS 변수 --moon에 넣어 모든 .tback이 같이 바뀌어요
export function applyCardMoon(ph = moonPhase()) {
  const svg = moonSvg(ph, { lite:true, dark:"#2e2268", light:"#fde68a" }).replace(/\s+/g, " ").replace('class="moon" ', 'xmlns="http://www.w3.org/2000/svg" ');
  document.documentElement.style.setProperty("--moon", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}
