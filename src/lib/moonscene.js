/* 마스터 방 캐릭터 뒤의 달: 직접 찍은 달 사진(public/moon.webp, scripts/extract-moon.mjs) 위에
   오늘 밤 서울에서 실제로 보이는 그림자를 그려요 — 밝은 비율과 밝은 쪽 기울기는 moonsky.js가 계산해요.
   그림자 경계는 실제 달처럼 반타원이고, 그림자 쪽도 지구 반사광처럼 아주 희미하게 보여요. 5분마다 다시 그려요. */
import { moonTonight } from "./moonsky.js";

const REDRAW = 5 * 60e3;

/* 캔버스에 달을 붙여요. 캔버스가 화면에서 빠지면 저절로 멈춰요. onView(v)로 지금 그린 달 정보를 알려 줘요 */
export function mountMoonScene(canvas, onView) {
  if (!canvas) return;
  const S = canvas.clientWidth;
  if (!S) { if (canvas.isConnected) requestAnimationFrame(() => mountMoonScene(canvas, onView)); return; }   // 아직 크기가 안 잡혔으면 다음 프레임에
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = canvas.height = Math.round(S * dpr);
  const g = canvas.getContext("2d"); g.scale(dpr, dpr);
  const R = S / 2 / 1.25, c = S / 2;                             // 캔버스 가장자리엔 달무리 자리를 남겨요
  const img = new Image();

  function draw() {
    if (!canvas.isConnected) return;
    const v = moonTonight(), u = 1 - 2 * v.lit;                   // u: -1 보름달 ~ 1 삭
    g.clearRect(0, 0, S, S);
    const glow = g.createRadialGradient(c, c, R * .92, c, c, R * 1.25);       // 달무리 (밝을수록 진하게)
    glow.addColorStop(0, `rgba(240,238,225,${.04 + v.lit * .3})`); glow.addColorStop(1, "rgba(240,238,225,0)");
    g.fillStyle = glow; g.beginPath(); g.arc(c, c, R * 1.25, 0, Math.PI * 2); g.fill();
    g.drawImage(img, c - R, c - R, R * 2, R * 2);
    if (u > -.995) {
      // 밝은 쪽이 오른쪽(+x)인 자리에서 그림자를 그린 뒤, 실제 밝은 쪽 방향(v.up, 위=0° 시계 방향)으로 돌려요
      g.save();
      g.translate(c, c); g.rotate((v.up - 90) * Math.PI / 180);
      g.beginPath(); g.arc(0, 0, R + .5, 0, Math.PI * 2); g.clip();
      g.filter = `blur(${Math.max(1, R * .02)}px)`;               // 실제 명암 경계도 살짝 번져 보여요
      g.fillStyle = "rgba(3,6,18,.9)";
      g.beginPath();
      g.arc(0, 0, R + 2, Math.PI / 2, Math.PI * 1.5);                         // 그림자 쪽 반원(아래 → 왼쪽 → 위)
      g.ellipse(0, 0, Math.abs(u) * (R + 2), R + 2, 0, -Math.PI / 2, Math.PI / 2, u < 0);   // 명암 경계: 초승·그믐이면 밝은 쪽으로 볼록
      g.fill();
      g.restore();
    }
    if (onView) onView(v);
    setTimeout(draw, REDRAW);
  }
  img.onload = draw;
  img.src = "moon.webp";
}
