// 달 사진(image/moon.jpg)에서 달만 동그랗게 오려 public/moon.webp로 넣어요 (마스터 방 배경 달)
// 밝은 픽셀이 모인 곳을 찾아 달의 가운데·반지름을 정해요. 사진을 바꿔도 이 스크립트만 다시 돌리면 돼요.
// 사용: node scripts/extract-moon.mjs
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const p = rel => fileURLToPath(new URL("../" + rel, import.meta.url));
const SRC = p("image/moon.jpg"), OUT = 512;    // 결과 크기(px): 화면 지름 256px의 두 배(고해상도 화면용)

const { data, info } = await sharp(SRC).rotate().greyscale().raw().toBuffer({ resolveWithObject:true });
const { width:w, height:h } = info;
// 밝은 픽셀(달)의 무게중심과 넓이로 가운데·반지름 계산 (밤하늘 노이즈·별은 너무 작아서 거의 영향이 없어요)
let n = 0, sx = 0, sy = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[y * w + x] > 60) { n++; sx += x; sy += y; }
const cx = sx / n, cy = sy / n, r = Math.sqrt(n / Math.PI) * 1.01;
const R = Math.round(r), S = R * 2;
console.log(`달: 가운데 (${cx.toFixed(0)}, ${cy.toFixed(0)}) · 반지름 ${r.toFixed(0)}px`);

const circle = Buffer.from(`<svg width="${OUT}" height="${OUT}"><defs><radialGradient id="m">
  <stop offset="97%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <circle cx="${OUT / 2}" cy="${OUT / 2}" r="${OUT / 2}" fill="url(#m)"/></svg>`);   // 가장자리 1~2px만 부드럽게
await sharp(SRC).rotate()
  .extract({ left:Math.round(cx - R), top:Math.round(cy - R), width:S, height:S })
  .resize(OUT, OUT, { kernel:"lanczos3" })
  .ensureAlpha()
  .composite([{ input:circle, blend:"dest-in" }])
  .webp({ quality:88, alphaQuality:95 })
  .toFile(p("public/moon.webp"));
console.log(`public/moon.webp ${OUT}×${OUT}`);
