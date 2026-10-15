/* 마스터 키우기: 출석 +15XP, 오늘의 카드 +5XP (하루 한 번씩). 기록은 기기의 "pet" 키 하나에 둬요
   pet = { id, xp, since, day:{ key, att, card }, last } */
import { STAGES, XP_ATTEND, XP_CARD } from "../data/masters.js";
import { DAY_MS, kstToday, dateKey } from "./calendar.js";
import { stageOf } from "./master-view.js";
import * as store from "./store.js";

export const getPet = () => store.get("pet");
const save = p => { store.set("pet", p); return p; };

export function adopt(id) {
  const old = getPet();
  // 마스터를 바꿔도 쌓은 경험치는 그대로 이어가요
  return save(old ? { ...old, id } : { id, xp:0, since:dateKey(kstToday()), day:null, last:null });
}

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
