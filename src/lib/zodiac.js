/* 별자리 운세 계산 — 웹(fortune/index.html)에서 옮겨 옴 */
import { sunLon, moonLon, kstToday, dateKey, hashStr, mulberry32, pick } from "./calendar.js";
import { hourInfo, tier } from "./saju.js";
import { CATS } from "../data/saju.js";
import { SIGNS, HOUSES, ZCAT_LINES, LUCKY_ITEMS } from "../data/zodiac.js";

function sunSign(p) {
  const hi = hourInfo(p.hour);
  return Math.floor(sunLon(Date.UTC(p.solar.y, p.solar.m - 1, p.solar.d, 0, hi ? hi.min : 720) - 9 * 3600e3) / 30);
}
// 운세는 별자리로만 정해져요 (앱의 별자리 탭에서 다른 별자리도 볼 수 있게 별자리 번호로도 계산)
const computeZodiac = p => computeZodiacSign(sunSign(p));
function computeZodiacSign(sign) {
  const today = kstToday();
  const moon = Math.floor(moonLon(Date.UTC(today.y, today.m - 1, today.d, 3)) / 30);   // 오늘 낮 12시(한국)
  const house = (moon - sign + 12) % 12, H = HOUSES[house];
  const rng = mulberry32(hashStr(`zodiac|${sign}|${dateKey(today)}`));                 // 같은 별자리면 같은 운세
  const me = sign % 4, mo = moon % 4;                                                   // 0불 1흙 2공기 3물
  const harmony = me === mo ? 6 : (me + 2) % 4 === mo ? 3 : -3;
  const scores = H.base.map(b => Math.max(25, Math.min(98, b + harmony + Math.round((rng() - 0.5) * 20))));
  const friends = SIGNS.map((_, j) => j).filter(j => j !== sign && (j % 4 === me || j % 4 === (me + 2) % 4));
  return {
    today, sign, moon, house, H, scores,
    summary: pick(rng, H.text),
    cats: CATS.map((c, i) => ({ icon:c.icon, name:c.name, score:scores[i + 1], text:ZCAT_LINES[i][tier(scores[i + 1])] })),
    item: pick(rng, LUCKY_ITEMS), num: 1 + Math.floor(rng() * 9), friend: pick(rng, friends),
  };
}

export { sunSign, computeZodiac, computeZodiacSign };
