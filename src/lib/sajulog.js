/* 오늘의 사주 기록: 홈을 열 때마다 그날 운세(점수·한 줄·분야별)를 이 기기에 남기고, 딱 일주일(오늘 포함 7일)만 보관해요.
   문구는 {ko, en} 그대로 저장해서 언어를 바꿔도 그대로 보여요. 기기 저장 키: "sajuLog" = { "YYYY-MM-DD": 기록 } */
import { DAY_MS, dateKey } from "./calendar.js";
import * as store from "./store.js";

const KEEP_DAYS = 7;
const snap = f => ({ score:f.scores[0], key:f.god.key, summary:f.summary, rel:f.relText, cats:f.cats });

// 오늘 운세를 남기고, 7일보다 오래된 기록은 지워요
export function keepToday(today, f) {
  const log = { ...(store.get("sajuLog") || {}), [dateKey(today)]:snap(f) };
  const oldest = Date.UTC(today.y, today.m - 1, today.d) - (KEEP_DAYS - 1) * DAY_MS;
  for (const k of Object.keys(log)) {
    const [y, m, d] = k.split("-").map(Number);
    if (Date.UTC(y, m - 1, d) < oldest) delete log[k];
  }
  store.set("sajuLog", log);
}

// 그날 기록 (없으면 null)
export const dayLog = day => (store.get("sajuLog") || {})[dateKey(day)] || null;
export const fromFortune = snap;
