/* 마스터 키우기: 출석 +15XP, 오늘의 카드 +5XP (하루 한 번씩). 기록은 기기의 "pet" 키 하나에 둬요
   pet = { id, xp, xpBy:{ 다른 마스터 id: 그 마스터가 쌓은 xp }, since, day:{ key, att, card }, last }
   경험치는 마스터마다 따로예요. 새 마스터는 아기 점술가(0XP)부터, 키우던 마스터로 돌아오면 그 경험치 그대로 */
import { STAGES, XP_ATTEND, XP_CARD } from "../data/masters.js";
import { DAY_MS, kstToday, dateKey } from "./calendar.js";
import { stageOf } from "./master-view.js";
import * as store from "./store.js";

export const getPet = () => store.get("pet");
const save = p => { store.set("pet", p); return p; };

export function adopt(id) {
  const old = getPet();
  if (!old) return save({ id, xp:0, xpBy:{}, since:dateKey(kstToday()), day:null, last:null });
  if (old.id === id) return old;
  const xpBy = { ...(old.xpBy || {}), [old.id]:old.xp };          // 지금 마스터 경험치는 맡겨 두고
  return save({ ...old, id, xp:xpBy[id] || 0, xpBy });             // 새 마스터는 0부터 (예전에 키웠으면 그 경험치)
}
// 마스터별 경험치 (고르기 화면에서 단계 보여 줄 때)
export const xpOf = id => { const p = getPet(); return !p ? 0 : p.id === id ? p.xp : (p.xpBy || {})[id] || 0; };

function today(p) {
  const key = dateKey(kstToday());
  return p.day && p.day.key === key ? p.day : { key, att:false, card:false };
}

// 경험치를 더하고, 단계가 올랐으면 알려 줘요
function gain(kind, xp) {
  const p = getPet(); if (!p) return null;
  const d = today(p); if (d[kind]) return null;
  const before = stageOf(p.xp);
  const np = save({ ...p, xp:p.xp + xp, day:{ ...d, [kind]:true }, ...(kind === "att" ? { last:d.key, prev:p.last } : {}) });
  return { xp, stageUp:stageOf(np.xp) > before };
}
export const checkIn = () => gain("att", XP_ATTEND);
export const cardXp = () => gain("card", XP_CARD);

// 마지막으로 온 날에서 며칠 지났는지 (오늘 출석 전 기록 기준)
export function daysAway(p = getPet()) {
  if (!p || !p.prev) return 0;
  const [y, m, d] = p.prev.split("-").map(Number), td = kstToday();
  return Math.round((Date.UTC(td.y, td.m - 1, td.d) - Date.UTC(y, m - 1, d)) / DAY_MS);
}

export function progress(p = getPet()) {
  const i = stageOf(p.xp), cur = STAGES[i], next = STAGES[i + 1];
  return { stage:i, cur, next, pct:next ? Math.round((p.xp - cur.xp) / (next.xp - cur.xp) * 100) : 100,
           left:next ? next.xp - p.xp : 0, todayDone:today(p) };
}
