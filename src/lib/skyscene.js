/* 마스터 탭 달 뒤의 밤하늘: 은하수 + 떨어지는 유성 (캔버스)
   은하수는 한 번만 그려 두고(왼쪽 아래 → 오른쪽 위 비스듬한 띠), 매 프레임엔 별 반짝임과 유성만 새로 그려요.
   유성은 화면에 동시에 2~3개까지, 1~4초 간격으로 랜덤하게 떨어져요. 동작 줄이기 설정이면 유성 없이 은하수만. */
import { mulberry32 } from "./calendar.js";

const MAX_METEORS = 3;

function paintMilkyWay(W, H, rnd) {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  // 띠의 중심선: 왼쪽 아래에서 오른쪽 위로
  const ax = W * -.05, ay = H * .95, bx = W * 1.05, by = H * .05;
  const len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len, nx = -uy, ny = ux;
  const band = Math.min(W, H) * .22;                        // 띠 두께(표준편차쯤)
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;   // -1~1, 가운데로 몰림
  // 은은한 빛구름: 띠를 따라 겹친 보랏빛·푸른빛 덩어리
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 40; i++) {
    const t = rnd(), o = gauss() * band * .6, x = ax + ux * len * t + nx * o, y = ay + uy * len * t + ny * o;
    const r = band * (.6 + rnd() * .9), cl = g.createRadialGradient(x, y, 0, x, y, r);
    const hue = rnd() < .5 ? "150,140,255" : "120,170,255";
    cl.addColorStop(0, `rgba(${hue},${.1 + rnd() * .1})`); cl.addColorStop(1, `rgba(${hue},0)`);
    g.fillStyle = cl; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // 은하수 별 먼지: 띠 가운데로 촘촘하게
  const dust = Math.round(W * H / 22);
  for (let i = 0; i < dust; i++) {
    const t = rnd(), o = gauss() * band * 1.1, x = ax + ux * len * t + nx * o, y = ay + uy * len * t + ny * o;
    const a = Math.max(0, 1 - Math.abs(o) / (band * 1.1)) * (.3 + rnd() * .6);
    g.fillStyle = `rgba(${215 + rnd() * 40},${220 + rnd() * 35},255,${a.toFixed(2)})`;
    g.fillRect(x, y, rnd() < .92 ? .8 : 1.5, rnd() < .92 ? .8 : 1.5);
  }
  // 어두운 먼지띠: 가운데를 따라 살짝 가려서 실제 은하수처럼
  g.globalCompositeOperation = "source-over";
  for (let i = 0; i < 14; i++) {
    const t = rnd(), o = gauss() * band * .15, x = ax + ux * len * t + nx * o, y = ay + uy * len * t + ny * o;
    const r = band * (.25 + rnd() * .35), d = g.createRadialGradient(x, y, 0, x, y, r);
    d.addColorStop(0, "rgba(8,6,24,.3)"); d.addColorStop(1, "rgba(8,6,24,0)");
    g.fillStyle = d; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return c;
}

/* 캔버스에 밤하늘을 붙여요. 캔버스가 화면에서 빠지면 저절로 멈춰요 */
export function mountSky(canvas) {
  if (!canvas) return;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H) { if (canvas.isConnected) requestAnimationFrame(() => mountSky(canvas)); return; }
  const dpr = Math.min(2, window.devicePixelRatio || 1), rnd = mulberry32(915);
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const g = canvas.getContext("2d"); g.scale(dpr, dpr);
  const mw = paintMilkyWay(Math.round(W * dpr), Math.round(H * dpr), rnd);
  const stars = [...Array(Math.round(W * H / 2200))].map(() => ({ x:rnd() * W, y:rnd() * H, r:.5 + rnd() ** 3 * 1.3, p:rnd() * 6.3, s:.8 + rnd() * 2 }));
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const meteors = [];
  let next = performance.now() + 600;

  // 유성 하나: 오른쪽 위 하늘에서 왼쪽 아래로(가끔 반대로) 비스듬히, 꼬리는 점점 옅게
  function spawn(now) {
    const dir = Math.random() < .75 ? -1 : 1, ang = (28 + Math.random() * 22) * Math.PI / 180;
    meteors.push({ x:W * (dir < 0 ? .35 + Math.random() * .7 : -.05 + Math.random() * .5), y:H * (Math.random() * .35),
      vx:Math.cos(ang) * dir, vy:Math.sin(ang), speed:W * (.9 + Math.random() * .7), len:40 + Math.random() * 60,
      born:now, life:700 + Math.random() * 700 });
    next = now + 1000 + Math.random() * 3000;
  }

  function frame(now) {
    if (!canvas.isConnected) return;
    if (document.hidden) { requestAnimationFrame(frame); return; }
    g.clearRect(0, 0, W, H);
    g.drawImage(mw, 0, 0, W, H);
    for (const s of stars) {                                 // 반짝이는 별
      const a = still ? .7 : .45 + .4 * Math.sin(now / 1000 * s.s + s.p);
      g.fillStyle = `rgba(230,236,255,${a.toFixed(2)})`;
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
    }
    if (!still) {
      if (now > next && meteors.length < MAX_METEORS) spawn(now);
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i], t = (now - m.born) / m.life;
        if (t >= 1) { meteors.splice(i, 1); continue; }
        const d = m.speed * (now - m.born) / 1000, hx = m.x + m.vx * d, hy = m.y + m.vy * d;
        const fade = t < .15 ? t / .15 : 1 - (t - .15) / .85;  // 확 밝아졌다가 서서히 사라져요
        const tx = hx - m.vx * m.len, ty = hy - m.vy * m.len;
        const tail = g.createLinearGradient(hx, hy, tx, ty);
        tail.addColorStop(0, `rgba(255,255,255,${(.95 * fade).toFixed(2)})`);
        tail.addColorStop(.3, `rgba(200,220,255,${(.45 * fade).toFixed(2)})`);
        tail.addColorStop(1, "rgba(200,220,255,0)");
        g.strokeStyle = tail; g.lineWidth = 1.6; g.lineCap = "round";
        g.beginPath(); g.moveTo(hx, hy); g.lineTo(tx, ty); g.stroke();
        g.fillStyle = `rgba(255,255,255,${fade.toFixed(2)})`;
        g.beginPath(); g.arc(hx, hy, 1.4, 0, Math.PI * 2); g.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
