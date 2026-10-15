/* 마스터 움직임: 미소(기본) → 왼쪽 → 오른쪽 → 뒤 → 엉덩이 흔들기를 번갈아 보여 주고, 10초마다 걷거나 뛰어요.
   masterHtml(..., { motion:true })로 모든 포즈를 겹쳐 그린 .mst에 붙여요. 화면에서 사라지면 저절로 멈춰요. */
import { sleep } from "./util.js";

const IDLE = [["idle", 2600], ["left", 1100], ["idle", 700], ["right", 1100], ["idle", 700], ["back", 900], ["wiggle", 1500], ["idle", 1800]];
const LOCO_EVERY = 10000;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function animateMaster(el, { roam = 46 } = {}) {
  if (!el || el.dataset.anim) return;
  el.dataset.anim = "1";
  const layers = {}; el.querySelectorAll(".pose").forEach(p => { layers[p.dataset.pose] = p; });
  let cur = el.querySelector(".pose.on"), busy = false, step = 0, flipX = false;

  // 포즈 바꾸기: 겹쳐 둔 그림의 투명도만 바꿔서 자연스럽게 넘어가요
  const show = (name, { cls = "pop", flip = false } = {}) => {
    const p = layers[name] || layers.idle; if (!p) return;
    if (cur && cur !== p) cur.classList.remove("on", "pop", "wiggle", "step", "dash");
    p.classList.remove("pop", "wiggle", "step", "dash");
    void p.offsetWidth;                                    // 같은 애니메이션을 다시 시작하려고
    p.classList.add("on"); if (cls) p.classList.add(cls);
    el.classList.toggle("mirror", flip);
    cur = p;
  };
  const alive = () => el.isConnected;

  // 걷기·달리기: 바라보는 쪽으로 갔다가 돌아서 제자리로
  async function travel() {
    const run = Math.random() < .4, name = run && layers.run ? "run" : "walk";
    const p = layers[name]; if (!p) return;
    const face = p.dataset.face || "l", dir = Math.random() < .5 ? -1 : 1, d = (run ? roam * 1.5 : roam) * dir;
    const ms = run ? 900 : 1700, mv = el.querySelector(".mover");
    const go = async (from, to, toward) => {
      show(name, { cls:run ? "dash" : "step", flip:(toward < 0) !== (face === "l") });
      await mv.animate([{ translate:`${from}px 0` }, { translate:`${to}px 0` }], { duration:ms, easing:"ease-in-out", fill:"forwards" }).finished.catch(() => {});
    };
    busy = true;
    await go(0, d, dir); if (!alive()) return;
    await go(d, 0, -dir);
    show("idle"); busy = false;
  }

  (async function loop() {
    let last = Date.now();
    while (alive()) {
      if (!busy && !document.hidden) {
        if (!reduced() && Date.now() - last >= LOCO_EVERY) { last = Date.now(); await travel(); continue; }
        const [name, ms] = IDLE[step++ % IDLE.length];
        if (reduced() && name !== "idle") { await sleep(ms); continue; }
        if (name === "wiggle") show("back", { cls:"wiggle" }); else show(name);
        await sleep(ms);
      } else await sleep(400);
    }
  })();

  // 누르면: 웃는 얼굴(없으면 미소)로 폴짝
  return {
    async cheer() {
      if (busy) return; busy = true;
      show(layers.laugh ? "laugh" : "idle");
      el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop");
      await sleep(1200);
      el.classList.remove("hop"); show("idle"); busy = false;
    },
  };
}
