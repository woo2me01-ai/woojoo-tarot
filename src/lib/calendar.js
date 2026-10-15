/* 날짜·천문 계산 — 웹(fortune/index.html)에서 옮겨 옴 */
import { pad2 } from "./util.js";

const DAY_MS = 864e5;
// 60갑자 순번 (0 = 甲子). 1900-01-01이 甲戌(10)일인 것을 기준으로 함
function dayIdx(y, m, d) {
  const jdn = Math.floor(Date.UTC(y, m - 1, d) / DAY_MS) + 2440588;
  return ((jdn + 49) % 60 + 60) % 60;
}
// 태양의 겉보기 황경(도). Meeus 저정밀식, 오차 약 0.01°
function sunLon(ms) {
  const T = (ms / DAY_MS + 2440587.5 - 2451545) / 36525, r = Math.PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * r;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  const om = (125.04 - 1934.136 * T) * r;
  return ((L0 + C - 0.00569 - 0.00478 * Math.sin(om)) % 360 + 360) % 360;
}

// 음력(한국 단기력): 브라우저 내장 달력 사용
const DANGI = (() => {
  try {
    const f = new Intl.DateTimeFormat("en-u-ca-dangi", { timeZone:"UTC", year:"numeric", month:"numeric", day:"numeric" });
    return f.resolvedOptions().calendar === "dangi" ? f : null;
  } catch (e) { return null; }
})();
function toLunar(ms) {
  let y = null, yr = null, m = 0, d = 0, leap = false;
  for (const p of DANGI.formatToParts(new Date(ms))) {
    if (p.type === "relatedYear") y = +p.value;
    else if (p.type === "year") yr = p.value;
    else if (p.type === "month") { m = parseInt(p.value, 10); leap = /\D/.test(p.value); }
    else if (p.type === "day") d = parseInt(p.value, 10);
  }
  if (y === null) { y = parseInt(yr, 10); if (y > 3000) y -= 2333; }
  return { y, m, d, leap };
}
function lunarToSolar(ly, lm, ld, leap) {
  let ms = Date.UTC(ly, 0, 1) + ((lm - 1) * 29 + ld - 1) * DAY_MS;
  for (let i = 0; i < 110; i++, ms += DAY_MS) {
    const Lu = toLunar(ms);
    if (Lu.y === ly && Lu.m === lm && Lu.d === ld && Lu.leap === leap) {
      const dt = new Date(ms);
      return { y:dt.getUTCFullYear(), m:dt.getUTCMonth() + 1, d:dt.getUTCDate() };
    }
  }
  return null;
}

function kstToday() {
  const d = new Date(Date.now() + 9 * 3600e3);
  return { y:d.getUTCFullYear(), m:d.getUTCMonth() + 1, d:d.getUTCDate(), wd:d.getUTCDay() };
}
const dateKey = o => `${o.y}-${pad2(o.m)}-${pad2(o.d)}`;

/* 같은 사람·같은 날이면 항상 같은 결과 (언어를 바꿔도 같은 결과) */
function hashStr(str) { let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return () => { a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// 달의 황경(도). Meeus 주요 항만 사용, 오차 약 0.3°
function moonLon(ms) {
  const T = (ms / DAY_MS + 2440587.5 - 2451545) / 36525, r = Math.PI / 180;
  const D = (297.8501921 + 445267.1114034 * T) * r, M = (357.5291092 + 35999.0502909 * T) * r;
  const Mp = (134.9633964 + 477198.8675055 * T) * r, F = (93.2720950 + 483202.0175233 * T) * r;
  const Lm = 218.3164477 + 481267.88123421 * T
          + 6.289 * Math.sin(Mp) + 1.274 * Math.sin(2 * D - Mp) + 0.658 * Math.sin(2 * D)
          + 0.214 * Math.sin(2 * Mp) - 0.186 * Math.sin(M) - 0.114 * Math.sin(2 * F);
  return (Lm % 360 + 360) % 360;
}

export { DAY_MS, dayIdx, sunLon, moonLon, DANGI, toLunar, lunarToSolar, kstToday, dateKey, hashStr, mulberry32, pick };
