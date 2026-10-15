// 앱 아이콘 · 스플래시 · 플레이 스토어 그래픽을 앱 그림(달 사진 + 마스터 캐릭터)으로 만들어요.
// 사용: npm run store:assets
//  → android/app/src/main/res/mipmap-*/ic_launcher*.png, drawable*/splash.png
//  → release/graphics/icon-512.png, feature-graphic-1024x500.png
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const p = rel => fileURLToPath(new URL("../" + rel, import.meta.url));
const RES = "android/app/src/main/res/";
const MOON = p("public/moon.webp");
const HERO = p("public/chars/panda/front.webp");                       // 아이콘·스플래시의 주인공: 몽실
const GANG = ["blackcat/front", "puppy/front", "panda/front", "tiger/smile", "unicorn/front"];  // 대표 그래픽에 줄 세울 마스터
const BG1 = "#0a0a18", BG2 = "#1c1550";

// 밤하늘 바탕: 남색 그라데이션 + 보랏빛 빛무리 + 작은 별
function skySvg(w, h, { stars = 60, seed = 7 } = {}) {
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const dots = [...Array(stars)].map(() => `<circle cx="${(rnd() * w).toFixed(1)}" cy="${(rnd() * h).toFixed(1)}" r="${(.4 + rnd() ** 3 * 1.8) * Math.max(1, w / 500)}" fill="#fff" opacity="${(.3 + rnd() * .6).toFixed(2)}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BG1}"/><stop offset="1" stop-color="${BG2}"/></linearGradient>
    <radialGradient id="r" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="#8b5cf6" stop-opacity=".35"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>${dots}</svg>`;
}
// 달무리(은은한 흰빛)
const haloSvg = d => `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}"><defs><radialGradient id="h">
  <stop offset=".55" stop-color="#f0eee1" stop-opacity=".45"/><stop offset="1" stop-color="#f0eee1" stop-opacity="0"/></radialGradient></defs>
  <circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}" fill="url(#h)"/></svg>`;
// 캐릭터 둘레 흰 빛(앱 화면과 같은 느낌)
const glow = async (file, h) => {
  const img = await sharp(file).resize({ height:Math.round(h) }).png().toBuffer();
  const m = await sharp(img).metadata();
  const halo = await sharp(img).extractChannel("alpha").blur(Math.max(1, h / 90)).linear(1.6, 0).toBuffer();
  const white = await sharp({ create:{ width:m.width, height:m.height, channels:3, background:"#fbf7ef" } }).joinChannel(halo).png().toBuffer();
  return { buf:await sharp(white).composite([{ input:img }]).png().toBuffer(), w:m.width, h:m.height };
};

/* 달 + 몽실 한 장면 (투명 바탕). S = 정사각 크기, 내용은 가운데 원(지름 ≈ 0.61 S) 안에: 적응형 아이콘 안전 영역 */
async function heroLayer(S) {
  const md = Math.round(S * .46), mx = Math.round(S * .5 - md / 2), my = Math.round(S * .44 - md / 2);
  const hd = Math.round(md * 1.35);
  const moon = await sharp(MOON).resize(md, md).png().toBuffer();
  const ch = await glow(HERO, S * .38);
  return sharp({ create:{ width:S, height:S, channels:4, background:{ r:0, g:0, b:0, alpha:0 } } }).composite([
    { input:Buffer.from(haloSvg(hd)), left:Math.round(S * .5 - hd / 2), top:Math.round(S * .44 - hd / 2) },
    { input:moon, left:mx, top:my },
    { input:ch.buf, left:Math.round(S / 2 - ch.w / 2), top:Math.round(S * .76 - ch.h) },
  ]).png().toBuffer();
}

const DPI = { mdpi:1, hdpi:1.5, xhdpi:2, xxhdpi:3, xxxhdpi:4 };

// 1) 런처 아이콘: 적응형(배경·전경 따로) + 예전 기기용 네모·동그라미
for (const [d, k] of Object.entries(DPI)) {
  const F = Math.round(108 * k), L = Math.round(48 * k);
  const fg = await heroLayer(F);
  await sharp(fg).toFile(p(`${RES}mipmap-${d}/ic_launcher_foreground.png`));
  await sharp(Buffer.from(skySvg(F, F, { stars:18 }))).png().toFile(p(`${RES}mipmap-${d}/ic_launcher_background.png`));
  // 예전 기기용(안드로이드 7 이하): 108dp 장면에서 가운데 72dp를 잘라 48dp로
  const full = await sharp(Buffer.from(skySvg(F, F, { stars:18 }))).composite([{ input:fg }]).png().toBuffer();
  const crop = await sharp(full).extract({ left:Math.round(18 * k), top:Math.round(18 * k), width:Math.round(72 * k), height:Math.round(72 * k) }).resize(L, L).png().toBuffer();
  const rr = Buffer.from(`<svg width="${L}" height="${L}"><rect width="${L}" height="${L}" rx="${L * .2}" fill="#fff"/></svg>`);
  const cc = Buffer.from(`<svg width="${L}" height="${L}"><circle cx="${L / 2}" cy="${L / 2}" r="${L / 2}" fill="#fff"/></svg>`);
  await sharp(crop).composite([{ input:rr, blend:"dest-in" }]).png().toFile(p(`${RES}mipmap-${d}/ic_launcher.png`));
  await sharp(crop).composite([{ input:cc, blend:"dest-in" }]).png().toFile(p(`${RES}mipmap-${d}/ic_launcher_round.png`));
}

// 2) 스플래시: 밤하늘 가운데에 달 + 몽실 + 앱 이름
async function splash(w, h, file) {
  const S = Math.round(Math.min(w, h) * .62);
  const scene = await heroLayer(S);
  const fs = Math.round(Math.min(w, h) * .075);
  const title = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <text x="${w / 2}" y="${Math.round(h / 2 + S * .36 + fs)}" text-anchor="middle" font-family="Malgun Gothic, Noto Sans KR, sans-serif"
      font-weight="700" font-size="${fs}" fill="#ecebff">우주 타로</text></svg>`);
  await sharp(Buffer.from(skySvg(w, h, { stars:Math.round(w * h / 9000) }))).composite([
    { input:scene, left:Math.round(w / 2 - S / 2), top:Math.round(h / 2 - S * .55) },
    { input:title, left:0, top:0 },
  ]).png().toFile(p(file));
}
const SPLASH = { mdpi:[320, 480], hdpi:[480, 800], xhdpi:[720, 1280], xxhdpi:[960, 1600], xxxhdpi:[1280, 1920] };
for (const [d, [w, h]] of Object.entries(SPLASH)) {
  await splash(w, h, `${RES}drawable-port-${d}/splash.png`);
  await splash(h, w, `${RES}drawable-land-${d}/splash.png`);
}
await splash(480, 320, `${RES}drawable/splash.png`);

// 3) 플레이 스토어 그래픽
await mkdir(p("release/graphics"), { recursive:true });
{   // 앱 아이콘 512×512 (스토어가 모서리를 알아서 둥글게 깎아요)
  const fg = await heroLayer(704);
  const full = await sharp(Buffer.from(skySvg(704, 704, { stars:30 }))).composite([{ input:fg }]).png().toBuffer();
  await sharp(full).extract({ left:96, top:96, width:512, height:512 }).png().toFile(p("release/graphics/icon-512.png"));
}
{   // 대표 그래픽 1024×500: 왼쪽 글, 오른쪽 달 + 마스터들
  const W = 1024, H = 500, md = 300;
  const moon = await sharp(MOON).resize(md, md).png().toBuffer();
  const layers = [
    { input:Buffer.from(haloSvg(420)), left:640, top:10 },
    { input:moon, left:700, top:70 },
  ];
  let x = 430;
  for (const [i, f] of GANG.entries()) {
    const c = await glow(p(`public/chars/${f}.webp`), i % 2 ? 150 : 170);
    layers.push({ input:c.buf, left:Math.round(x), top:H - 30 - c.h });
    x += c.w * .72;
  }
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <text x="56" y="168" font-family="Malgun Gothic, Noto Sans KR, sans-serif" font-weight="800" font-size="64" fill="#ecebff">우주 타로</text>
    <text x="58" y="224" font-family="Malgun Gothic, Noto Sans KR, sans-serif" font-weight="600" font-size="28" fill="#c4b5fd">타로 · 사주 · 별자리</text>
    <text x="58" y="266" font-family="Malgun Gothic, Noto Sans KR, sans-serif" font-weight="600" font-size="28" fill="#c4b5fd">그리고 나만의 타로 마스터</text></svg>`);
  await sharp(Buffer.from(skySvg(W, H, { stars:140 }))).composite([...layers, { input:text, left:0, top:0 }])
    .flatten({ background:BG1 }).png().toFile(p("release/graphics/feature-graphic-1024x500.png"));
}
console.log("아이콘·스플래시·스토어 그래픽을 만들었어요");
