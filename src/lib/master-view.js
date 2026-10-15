/* 타로 마스터 그림: 포즈 그림(public/chars/<id>/<pose>.webp)을 겹쳐 그려요. 크기는 키우기 단계에 따라 달라져요 */
import { STAGES, masterOf, MASTERS } from "../data/masters.js";
import { L } from "./i18n.js";
import POSES from "../data/poses.json";

export const stageOf = xp => { let i = 0; STAGES.forEach((s, k) => { if (xp >= s.xp) i = k; }); return i; };

/* 포즈 목록: right는 left를 좌우 반전, idle은 몸 전체가 그려진 미소 포즈가 있으면 그것, 없으면 정면
   part: 얼굴·상반신만 그린 포즈 (결과 표정에만 써요) */
export function posesOf(id) {
  const P0 = POSES[id] || POSES[MASTERS[0].id], out = {};
  for (const [k, v] of Object.entries(P0)) out[k] = { ...v, file:k };
  if (P0.left) out.right = { ...P0.left, flip:true, file:"left" };
  out.idle = P0.smile && !P0.smile.part ? out.smile : out.front;
  return out;
}
const fileOf = (id, P1) => `chars/${id}/${P1.file}.webp`;

/* 포즈 한 장. k = 화면 px / 그림 px (같은 캐릭터면 모든 포즈가 같은 배율)
   --cx: 꼬리를 뺀 몸 가운데(그림 너비 비율). 이 점이 무대·달 가운데에 오게 놓아요. 좌우 반전하면 1 - cx (--cxf) */
function layer(id, name, ps, k, cls = "") {
  const P1 = ps[name]; if (!P1) return "";
  const face = P1.flip ? (P1.face === "l" ? "r" : P1.face === "r" ? "l" : "") : P1.face || "";
  const cx = P1.flip ? 1 - (P1.cx ?? .5) : (P1.cx ?? .5);
  return `<div class="pose${P1.flip ? " flip" : ""} ${cls}" data-pose="${name}" data-face="${face}"
    style="width:${Math.round(P1.w * k)}px;height:${Math.round(P1.h * k)}px;--cx:${cx};--cxf:${(1 - cx).toFixed(3)}"><img src="${fileOf(id, P1)}" alt="" draggable="false"></div>`;
}

/* 마스터 한 명. h = 그랜드 마스터일 때 정면 높이(px), 단계가 낮으면 작게.
   pose: 처음 보일 포즈 · motion: true면 움직임에 쓰는 포즈를 겹쳐 두고 motion.js가 번갈아 보여 줘요
   fit: 몸 가운데에서 좌우로 넘으면 안 되는 너비(px). 꼬리가 길면 그만큼 작게 그려 칸 밖으로 안 나가요 */
export function masterHtml(pet, { h = 200, grow = true, cls = "", pose = "idle", motion = false, fit = 0 } = {}) {
  const m = masterOf(pet.id) || MASTERS[0], ps = posesOf(m.id);
  const name = ps[pose] ? pose : "idle";
  // 움직임·누를 때 반응엔 몸 전체가 그려진 포즈만 (웃음이 얼굴만이면 누를 때 미소 그대로 폴짝 뛰어요)
  const names = motion ? ["idle", "left", "right", "back", "walk", "run", "laugh"].filter(n => ps[n] && !ps[n].part) : [name];
  let hh = h * (m.size || 1) * (grow ? STAGES[stageOf(pet.xp || 0)].scale : 1);
  if (fit) {                                       // 정면 높이 1px당 몸 가운데에서 가장 먼 끝까지의 너비
    const reach = Math.max(...names.map(n => Math.max(ps[n].cx ?? .5, 1 - (ps[n].cx ?? .5)) * ps[n].w / ps.front.h));
    hh = Math.min(hh, fit / reach);
  }
  hh = Math.round(hh);
  const k = hh / ps.front.h;
  return `<div class="mst ${cls}${motion ? " motion" : ""}" data-id="${m.id}" style="height:${hh}px;width:${Math.round(ps.front.w * k)}px" role="img" aria-label="${L(m.name)}">
    <div class="mover">${names.map(n => layer(m.id, n, ps, k, n === name ? "on" : "")).join("")}</div></div>`;
}
