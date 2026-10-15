/* 리딩 한 판의 상태와 풀이 규칙 (웹 타로 규칙 + 테마·별자리 연결) */
import { TAROT, TOPICS, ANSWERS } from "../data/cards.js";
import { SPREADS, themeById, CHOICE_SUM } from "../data/themes.js";
import { zodiacNote, GUARDIAN } from "../data/astro.js";
import { L, LANG, t } from "./i18n.js";
import { randInt } from "./util.js";
import { kstToday, dateKey } from "./calendar.js";
import * as store from "./store.js";

export const REVERSED_CHANCE = 35;   // 역방향이 나올 확률(%)

/* 지금 진행 중인 리딩: kind = "daily" | "theme" | "free" */
export let session = null;

export function startSession({ kind, themeId = null, question = "", spread = "one", ab = null }) {
  const theme = themeById(themeId);
  const topic = theme ? theme.topic : (TOPICS.find(tp => tp.re.test(question)) || {}).key || null;
  const order = TAROT.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = randInt(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  session = { kind, themeId, theme, question, topic, ab, spread:theme ? theme.spread : spread, order, picks:[], saved:false };
  return session;
}
export const setSession = s => { session = s; };

export const needCount = s => SPREADS[s.spread].ko.length;
export function positions(s) {
  const pos = L(SPREADS[s.spread]).slice();
  if (s.spread === "choice" && s.ab) {      // A/B 이름을 적었으면 자리 이름에 같이 보여 줘요
    if (s.ab.a) pos[1] = `A · ${s.ab.a}`;
    if (s.ab.b) pos[2] = `B · ${s.ab.b}`;
  }
  return pos;
}

export function pickAt(s, deckIndex) {
  const useRev = store.get("settings").reversed;
  const pk = { n:s.order[deckIndex], rev:useRev && randInt(100) < REVERSED_CHANCE };
  s.picks.push(pk);
  return pk;
}

/* 오늘의 카드: 하루 한 장, 뽑으면 날짜와 함께 저장 */
export function savedDaily() {
  const d = store.get("daily");
  return d && d.date === dateKey(kstToday()) && TAROT[d.n] ? d : null;
}
export function drawDaily() {
  const useRev = store.get("settings").reversed;
  const d = { date:dateKey(kstToday()), n:randInt(TAROT.length), rev:useRev && randInt(100) < REVERSED_CHANCE };
  store.set("daily", d);
  store.addHistory({ ts:Date.now(), kind:"daily", picks:[{ n:d.n, rev:d.rev }] });
  return d;
}
export function dailySession(d) {
  return { kind:"daily", themeId:null, theme:null, question:"", topic:null, ab:null, spread:"daily", order:[], picks:[{ n:d.n, rev:d.rev }], saved:true };
}

/* 풀이 */
export const cf = (c, f) => (LANG === "en" ? c.E : c.K)[f];      // 카드 풀이를 현재 언어로
export function cardMeaning(s, pk) {
  const c = TAROT[pk.n], topic = s.kind === "daily" ? null : s.topic;
  if (!c.suit) return pk.rev ? cf(c, "revText") : topic ? cf(c, topic) : cf(c, "upText");
  // 마이너: 카드 풀이 + 질문 주제에 맞춘 수트 조언
  return cf(c, pk.rev ? "revText" : "upText") + (topic ? " " + cf(c, topic) : "");
}
export const leadOf = (s, i) => s.theme ? L(s.theme.lead[i]) : "";
const yesScore = pk => pk.rev ? { yes:0, maybe:-1, no:0 }[TAROT[pk.n].yes] : { yes:1, maybe:0, no:-1 }[TAROT[pk.n].yes];
export const answerOf = pk => L(ANSWERS[pk.rev ? "rev" : "up"][TAROT[pk.n].yes]);

// 결과의 분위기: 1 좋음 · 0 반반 · -1 아쉬움 (마스터 표정에 써요). 여러 장이면 마지막 카드에 두 배 무게
export function toneOf(s) {
  const p = s.picks;
  if (s.spread === "choice" && p.length >= 3) return Math.sign(Math.max(yesScore(p[1]), yesScore(p[2])));
  const sum = p.reduce((a, pk, i) => a + yesScore(pk) * (p.length >= 3 && i === p.length - 1 ? 2 : 1), 0);
  return p.length >= 3 ? (sum >= 2 ? 1 : sum < 0 ? -1 : 0) : Math.sign(sum);
}

// 여러 장일 때 한 줄 정리: 마지막(결과) 카드에 두 배 무게
export function summaryOf(s) {
  const p = s.picks;
  if (p.length < 3) return null;
  if (s.spread === "choice") {
    const a = yesScore(p[1]), b = yesScore(p[2]);
    return L(a > b ? CHOICE_SUM.a : b > a ? CHOICE_SUM.b : CHOICE_SUM.even);
  }
  const sum = yesScore(p[0]) + yesScore(p[1]) + yesScore(p[2]) * 2;
  return t(sum >= 2 ? "sumGood" : sum >= 0 ? "sumMixed" : "sumBad");
}

// 별자리 한 줄: 수호 카드가 있으면 그 카드, 없으면 결과(마지막)·조언 카드 기준
export function zodiacOf(s, sign) {
  if (sign == null || !s.picks.length) return null;
  const g = s.picks.find(pk => pk.n === GUARDIAN[sign]);
  const pk = g || s.picks[s.picks.length - 1];
  return { ...zodiacNote(sign, TAROT[pk.n], pk.n), card:TAROT[pk.n] };
}

export function saveHistory(s) {
  if (s.saved) return;
  s.saved = true;
  store.addHistory({ ts:Date.now(), kind:s.kind, themeId:s.themeId, question:s.question, spread:s.spread, ab:s.ab, picks:s.picks });
}
