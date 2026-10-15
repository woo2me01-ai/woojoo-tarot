/* 서울 하늘에서 보이는 실제 달 모양: 밝은 부분 비율 + 밝은 쪽이 기울어진 방향
   (Meeus 「Astronomical Algorithms」 47·48장의 주요 항만 써서 각도 오차 1~2° 안팎)
   - 위상: 해와 달 사이 각도(이각)로 밝은 비율 k
   - 기울기: 달에서 본 해의 방향(밝은 쪽 위치각 χ)을 관측자의 천정 기준으로 돌려요(시차각 q) */
import { DAY_MS, sunLon, moonLon } from "./calendar.js";

const SEOUL = { lat:37.5665, lon:126.978 };
const rad = Math.PI / 180, deg = 180 / Math.PI;

// 달의 황위(도): 주요 4항
function moonLat(T) {
  const D = (297.8501921 + 445267.1114034 * T) * rad, Mp = (134.9633964 + 477198.8675055 * T) * rad;
  const F = (93.2720950 + 483202.0175233 * T) * rad;
  return 5.128 * Math.sin(F) + .2806 * Math.sin(Mp + F) + .2777 * Math.sin(Mp - F) + .1732 * Math.sin(2 * D - F);
}
// 황경·황위 → 적경·적위 (라디안)
function toEq(lam, bet, eps) {
  const l = lam * rad, b = bet * rad;
  return { ra:Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l)),
           dec:Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l)) };
}

/* ms 시각의 달 모양. lit: 밝은 비율(0~1) · up: 밝은 쪽 방향(화면 기준, 위=0°, 시계 방향 +) · alt: 고도(°) */
function viewAt(ms, place = SEOUL) {
  const jd = ms / DAY_MS + 2440587.5, T = (jd - 2451545) / 36525;
  const eps = (23.4393 - .013 * T) * rad;
  const ls = sunLon(ms), lm = moonLon(ms), bm = moonLat(T);
  const sun = toEq(ls, 0, eps), moon = toEq(lm, bm, eps);
  const cosPsi = Math.cos(bm * rad) * Math.cos((lm - ls) * rad);
  const lit = (1 - cosPsi) / 2;
  // 밝은 쪽 위치각 χ (북쪽에서 동쪽으로)
  const dA = sun.ra - moon.ra;
  const chi = Math.atan2(Math.cos(sun.dec) * Math.sin(dA),
    Math.sin(sun.dec) * Math.cos(moon.dec) - Math.cos(sun.dec) * Math.sin(moon.dec) * Math.cos(dA));
  // 시간각 H · 고도 · 시차각 q
  const lst = ((280.46061837 + 360.98564736629 * (jd - 2451545) + place.lon) % 360) * rad;
  const H = lst - moon.ra, phi = place.lat * rad;
  const alt = Math.asin(Math.sin(phi) * Math.sin(moon.dec) + Math.cos(phi) * Math.cos(moon.dec) * Math.cos(H)) * deg;
  const q = Math.atan2(Math.sin(H), Math.tan(phi) * Math.cos(moon.dec) - Math.sin(moon.dec) * Math.cos(H));
  // 하늘을 올려다볼 때 위치각은 천정에서 왼쪽(동쪽)으로 늘어나요 → 화면 각도(위=0°, 시계 방향 +)로 바꾸면 부호가 반대
  const up = ((-(chi - q) * deg) % 360 + 360) % 360;
  const waxing = ((lm - ls) % 360 + 360) % 360 < 180;
  return { lit, up, alt, waxing, ms };
}

/* 오늘 밤 서울에서 보이는 달: 지금 떠 있으면 지금, 아니면 앞으로 24시간 중 가장 높이 뜨는 때의 모양 */
export function moonTonight(now = Date.now()) {
  const cur = viewAt(now);
  if (cur.alt > 5) return cur;
  let best = cur;
  for (let t = now; t < now + DAY_MS; t += 20 * 60e3) { const v = viewAt(t); if (v.alt > best.alt) best = v; }
  return best;
}
