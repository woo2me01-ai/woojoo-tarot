/* 마스터 방 뒤 배경: 반짝이는 별 하늘 + 푸른 보름달 (캔버스 모션 그래픽)
   10초마다 달 그림자가 왼쪽에서 오른쪽으로 서서히 덮었다가, 오른쪽에서 왼쪽으로 걷히며 다시 보름달이 돼요.
   달·하늘 무늬는 한 번만 그려 두고(오프스크린), 매 프레임엔 별 반짝임과 그림자만 새로 그려요. */
import { mulberry32 } from "./calendar.js";

const CYCLE = 10000;                         // 한 주기(ms)
const COVER = 3600, DARK = 500, UNCOVER = 3600;   // 덮기 · 다 덮인 채 잠깐 · 걷히기 (나머지는 보름달)
const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

// 그림자 경계 위치 u: -1 = 그림자 없음(보름달), 1 = 다 덮임
function shadowAt(ms) {
  const t = ms % CYCLE;
  if (t < COVER) return -1 + 2 * ease(t / COVER);
  if (t < COVER + DARK) return 1;
  if (t < COVER + DARK + UNCOVER) return 1 - 2 * ease((t - COVER - DARK) / UNCOVER);
  return -1;
}

function makeCanvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

/* 밤하늘: 짙은 남색 바탕 + 푸른 성운 + 은하수처럼 흩뿌린 작은 별 */
function paintSky(w, h, rnd) {
  const c = makeCanvas(w, h), g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#040817"); bg.addColorStop(.55, "#071330"); bg.addColorStop(1, "#0a1c45");
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) {                                  // 성운
    const x = w * (.45 + rnd() * .6), y = h * rnd() * .7, r = Math.max(w, h) * (.18 + rnd() * .25);
    const n = g.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, `rgba(60,120,230,${.10 + rnd() * .08})`); n.addColorStop(1, "rgba(60,120,230,0)");
    g.fillStyle = n; g.fillRect(0, 0, w, h);
  }
  for (let i = 0; i < w * h / 90; i++) {                          // 은하수 먼지: 오른쪽 위로 비스듬한 띠에 몰려 있어요
    const t = rnd(), x = w * (.3 + t * .8) + (rnd() - .5) * w * .35, y = h * (.9 - t * 1.1) + (rnd() - .5) * h * .35;
    g.fillStyle = `rgba(${170 + rnd() * 60},${200 + rnd() * 50},255,${rnd() * .35})`;
    g.fillRect(x, y, rnd() < .9 ? 1 : 1.6, rnd() < .9 ? 1 : 1.6);
  }
  return c;
}

/* 푸른 보름달: 밝은 고원 + 어두운 바다(불규칙한 얼룩) + 크고 작은 크레이터 + 빛줄기 크레이터 + 가장자리 빛 */
function paintMoon(R, rnd) {
  const S = Math.ceil(R * 2), c = makeCanvas(S, S), g = c.getContext("2d");
  const dot = (x, y, r, fill) => { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  g.translate(R, R);
  g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.clip();
  const base = g.createRadialGradient(-R * .2, -R * .2, R * .05, 0, 0, R);
  base.addColorStop(0, "#eefaff"); base.addColorStop(.35, "#b8e4ff"); base.addColorStop(.75, "#6cb6f6"); base.addColorStop(1, "#3c88e0");
  g.fillStyle = base; g.fillRect(-R, -R, S, S);

  // 바다: 작은 얼룩을 여러 겹 겹쳐서 가장자리가 들쭉날쭉하게 (실제 달처럼 위쪽·왼쪽에 몰려 있어요)
  const MARIA = [[-.35, -.3, .3], [.05, -.42, .24], [.35, -.15, .2], [-.52, .12, .18], [-.18, .08, .17], [.3, .3, .13], [-.02, .44, .09], [.12, -.08, .12]];
  g.filter = `blur(${Math.max(.6, R * .012)}px)`;
  for (const [mx, my, mr] of MARIA) for (let k = 0; k < 26; k++) {
    const d = Math.sqrt(rnd()) * mr, a = rnd() * Math.PI * 2;
    g.fillStyle = `rgba(22,62,150,${.07 + rnd() * .1})`;
    g.beginPath();
    g.ellipse((mx + Math.cos(a) * d) * R, (my + Math.sin(a) * d) * R, mr * R * (.18 + rnd() * .35), mr * R * (.12 + rnd() * .3), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  g.filter = "none";
  for (let i = 0; i < 1400; i++) {                              // 고원의 잔 반짝임과 얼룩
    const x = (rnd() * 2 - 1) * R, y = (rnd() * 2 - 1) * R;
    if (rnd() < .6) dot(x, y, rnd() * R * .012 + .3, `rgba(235,250,255,${rnd() * .35})`);
    else dot(x, y, rnd() * R * .02 + .3, `rgba(25,70,160,${rnd() * .12})`);
  }
  for (let i = 0; i < 90; i++) {                               // 크레이터: 어두운 속 + 오른쪽 아래 밝은 테
    const x = (rnd() * 2 - 1) * R * .95, y = (rnd() * 2 - 1) * R * .95, r = R * (.008 + rnd() ** 2 * .055);
    if (x * x + y * y > R * R * .9) continue;
    dot(x, y, r, "rgba(30,78,170,.26)");
    g.strokeStyle = "rgba(240,252,255,.45)"; g.lineWidth = Math.max(.5, r * .25);
    g.beginPath(); g.arc(x, y, r, -.3, Math.PI * .85); g.stroke();
  }
  // 빛줄기 크레이터(티코·코페르니쿠스·케플러·아리스타르코스 자리): 가늘고 길게 퍼지는 밝은 선
  g.globalCompositeOperation = "lighter";
  for (const [rx, ry, len, n] of [[-.12, .66, 1.25, 70], [-.24, .02, .6, 44], [-.5, -.02, .38, 30], [-.62, -.2, .28, 20], [.42, .55, .3, 18]]) {
    const x = rx * R, y = ry * R;
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, l = R * len * (.25 + rnd() * .75);
      const ray = g.createLinearGradient(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l);
      ray.addColorStop(0, `rgba(150,215,255,${.22 + rnd() * .2})`); ray.addColorStop(1, "rgba(150,215,255,0)");
      g.strokeStyle = ray; g.lineWidth = Math.max(.4, R * (.002 + rnd() * .007));
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    const core = g.createRadialGradient(x, y, 0, x, y, R * .08);
    core.addColorStop(0, "rgba(255,255,255,.9)"); core.addColorStop(.35, "rgba(190,235,255,.45)"); core.addColorStop(1, "rgba(150,215,255,0)");
    g.fillStyle = core; g.beginPath(); g.arc(x, y, R * .08, 0, Math.PI * 2); g.fill();
  }
  g.globalCompositeOperation = "source-over";
  const limb = g.createRadialGradient(0, 0, R * .6, 0, 0, R);    // 가장자리는 살짝 어둡게, 맨 끝은 밝은 테
  limb.addColorStop(0, "rgba(10,40,120,0)"); limb.addColorStop(.9, "rgba(10,40,120,.22)"); limb.addColorStop(1, "rgba(120,200,255,.35)");
  g.fillStyle = limb; g.fillRect(-R, -R, S, S);
  g.strokeStyle = "rgba(200,238,255,.8)"; g.lineWidth = Math.max(1, R * .01);
  g.beginPath(); g.arc(0, 0, R - g.lineWidth / 2, 0, Math.PI * 2); g.stroke();
  return c;
}

/* 캔버스에 장면을 붙이고 움직여요. 캔버스가 화면에서 빠지면 저절로 멈춰요 */
export function mountMoonScene(canvas, { moonY = .55, moonR = .37 } = {}) {
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), rnd = mulberry32(20261015);
  const W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H) return;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const g = canvas.getContext("2d"); g.scale(dpr, dpr);
  const R = Math.min(W * moonR, H * .42), cx = W / 2, cy = H * moonY;
  const sky = paintSky(Math.round(W * dpr), Math.round(H * dpr), rnd);
  const moon = paintMoon(Math.round(R * dpr), rnd);
  const stars = [...Array(Math.round(W * H / 1400))].map(() => ({
    x:rnd() * W, y:rnd() * H, r:.4 + rnd() ** 3 * 1.6, a:.35 + rnd() * .65, p:rnd() * Math.PI * 2, s:.6 + rnd() * 1.8,
    big:rnd() < .06,
  }));
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();

  function frame(now) {
    if (!canvas.isConnected) return;
    if (document.hidden) { requestAnimationFrame(frame); return; }
    const ms = still ? CYCLE - 1 : now - t0, sec = ms / 1000;
    g.drawImage(sky, 0, 0, W, H);
    for (const s of stars) {                                     // 반짝이는 별 (큰 별은 십자 빛)
      const tw = still ? 1 : .55 + .45 * Math.sin(sec * s.s + s.p), al = s.a * tw;
      g.fillStyle = `rgba(220,238,255,${al})`;
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
      if (s.big) {
        g.strokeStyle = `rgba(200,230,255,${al * .6})`; g.lineWidth = .7;
        const L = s.r * 5 * tw;
        g.beginPath(); g.moveTo(s.x - L, s.y); g.lineTo(s.x + L, s.y); g.moveTo(s.x, s.y - L); g.lineTo(s.x, s.y + L); g.stroke();
      }
    }
    const u = shadowAt(ms), lit = (1 - u) / 2;                  // lit: 1 보름달 · 0 다 덮임
    const glow = g.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.7);   // 달무리 (밝을수록 크게)
    glow.addColorStop(0, `rgba(110,190,255,${.12 + lit * .55})`); glow.addColorStop(1, "rgba(90,170,255,0)");
    g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, R * 1.7, 0, Math.PI * 2); g.fill();
    g.drawImage(moon, cx - R, cy - R, R * 2, R * 2);
    if (u > -1) {
      // 그림자: 왼쪽 가장자리부터 경계선(반타원, 가로 반지름 = u × 그 줄의 폭)까지
      g.save();
      g.beginPath(); g.arc(cx, cy, R + .5, 0, Math.PI * 2); g.clip();
      g.filter = `blur(${Math.max(1.5, R * .03)}px)`;
      g.fillStyle = "rgba(3,9,28,.9)";
      g.beginPath();
      g.arc(cx, cy, R + 2, Math.PI / 2, Math.PI * 1.5);                       // 왼쪽 반원(위→아래 반대로 돌아요)
      g.ellipse(cx, cy, Math.abs(u) * (R + 2), R + 2, 0, -Math.PI / 2, Math.PI / 2, u < 0);
      g.fill();
      g.filter = "none";
      g.restore();
    }
    if (!still) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
