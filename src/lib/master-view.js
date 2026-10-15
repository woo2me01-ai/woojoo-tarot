/* 타로 마스터 그림: 포즈 그림(public/chars/<id>/<pose>.webp)을 겹쳐 그려요. 크기는 키우기 단계에 따라 달라져요 */
import { STAGES, masterOf, MASTERS } from "../data/masters.js";
import { L } from "./i18n.js";
import POSES from "../data/poses.json";

export const stageOf = xp => { let i = 0; STAGES.forEach((s, k) => { if (xp >= s.xp) i = k; }); return i; };

/* 포즈 목록: right는 left를 좌우 반전, idle은 몸 전체가 그려진 미소 포즈가 있으면 그것, 없으면 정면 */
export function posesOf(id) {
  const P0 = POSES[id] || POSES[MASTERS[0].id], out = { ...P0 };
  if (P0.left) out.right = { ...P0.left, flip:true };
  out.idle = P0.smile || P0.front;
  return out;
}
const POSE_FILE = { right:"left" };
const fileOf = (id, name, ps) => `chars/${id}/${POSE_FILE[name] || (name === "idle" ? (ps.smile ? "smile" : "front") : name)}.webp`;

/* 포즈 한 장. k = 화면 px / 그림 px (같은 캐릭터면 모든 포즈가 같은 배율) */
function layer(id, name, ps, k, cls = "") {
  const P1 = ps[name]; if (!P1) return "";
  const face = P1.flip ? (P1.face === "l" ? "r" : P1.face === "r" ? "l" : "") : P1.face || "";
  return `<div class="pose${P1.flip ? " flip" : ""} ${cls}" data-pose="${name}" data-face="${face}"
    style="width:${Math.round(P1.w * k)}px;height:${Math.round(P1.h * k)}px"><img src="${fileOf(id, name, ps)}" alt="" draggable="false"></div>`;
}

/* 마스터 한 명. h = 그랜드 마스터일 때 정면 높이(px), 단계가 낮으면 작게.
   pose: 처음 보일 포즈 · motion: true면 움직임에 쓰는 포즈를 겹쳐 두고 motion.js가 번갈아 보여 줘요 */
export function masterHtml(pet, { h = 200, grow = true, cls = "", pose = "idle", motion = false } = {}) {
  const m = masterOf(pet.id) || MASTERS[0], ps = posesOf(m.id);
  const hh = Math.round(h * (grow ? STAGES[stageOf(pet.xp || 0)].scale : 1)), k = hh / ps.front.h;
  const name = ps[pose] ? pose : "idle";
  const names = motion ? ["idle", "left", "right", "back", "walk", "run", "laugh"].filter(n => ps[n]) : [name];
  return `<div class="mst ${cls}${motion ? " motion" : ""}" data-id="${m.id}" style="height:${hh}px;width:${Math.round(ps.front.w * k)}px" role="img" aria-label="${L(m.name)}">
    <div class="mover">${names.map(n => layer(m.id, n, ps, k, n === name ? "on" : "")).join("")}</div></div>`;
}
