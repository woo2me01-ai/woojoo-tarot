// 캐릭터 시트(image/Charactor/*.png)에서 포즈를 하나씩 잘라 배경을 지우고 public/chars/<id>/<pose>.webp로 넣어요.
// 포즈마다 그림 크기와 걷기·달리기 방향을 src/data/poses.json에 적어요.
// 사용: node scripts/extract-chars.mjs            → 포즈 WebP + poses.json 생성
//       node scripts/extract-chars.mjs --debug    → 시트마다 번호 붙인 미리보기(scratch/)만 만들어요
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { CHAR_SHEETS } from "./char-sheets.mjs";

const root = new URL("../", import.meta.url);
const p = rel => fileURLToPath(new URL(rel, root));
const DEBUG = process.argv.includes("--debug");
const FRONT_H = 480;        // 정면 포즈의 높이(px). 같은 캐릭터의 다른 포즈는 같은 배율로 줄여요
const WHITE = 232;          // 이 밝기 이상이고 바깥과 이어진 픽셀은 배경
const LINE = 215;
const ROW2 = ["walk", "run", "smile", "laugh", "cry", "angry"];   // 시트 아랫줄 포즈
const FACE_W = .63;         // 얼굴만 그린 표정의 기본 너비(정면 키에 대한 비율)

async function loadSheet(file) {
  const { data, info } = await sharp(p("image/Charactor/" + file)).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
  return { data, w:info.width, h:info.height };
}

// 가로·세로로 r픽셀씩 넓히기 (선 틈 메우기)
function dilate(mask, w, h, r) {
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let last = -1e9;
    for (let x = 0; x < w; x++) { if (mask[y * w + x]) last = x; if (x - last <= r) tmp[y * w + x] = 1; }
    last = 1e9;
    for (let x = w - 1; x >= 0; x--) { if (mask[y * w + x]) last = x; if (last - x <= r) tmp[y * w + x] = 1; }
  }
  for (let x = 0; x < w; x++) {
    let last = -1e9;
    for (let y = 0; y < h; y++) { if (tmp[y * w + x]) last = y; if (y - last <= r) out[y * w + x] = 1; }
    last = 1e9;
    for (let y = h - 1; y >= 0; y--) { if (tmp[y * w + x]) last = y; if (last - y <= r) out[y * w + x] = 1; }
  }
  return out;
}

// 바깥에서부터 흰 배경을 채워 투명하게 만들어요.
// 연필선에 작은 틈이 있으면 안쪽까지 새어 들어가서, 선을 r픽셀 굵게 만든 벽으로 먼저 채우고 → 벽 두께만큼 다시 선까지 붙여요
function removeBackground({ data, w, h }, { gap = 0, line:lineLum = LINE } = {}) {
  const n = w * h, lum = new Uint8Array(n);
  for (let i = 0; i < n; i++) lum[i] = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
  const r = gap || Math.max(2, Math.round(w / 640));
  const line = new Uint8Array(n); for (let i = 0; i < n; i++) line[i] = lum[i] < lineLum ? 1 : 0;
  const wall = dilate(line, w, h, r);
  const bg = new Uint8Array(n), stack = [];
  const push = i => { if (!bg[i] && !wall[i] && lum[i] >= WHITE) { bg[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop(), x = i % w;
    if (x > 0) push(i - 1); if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w); if (i < n - w) push(i + w);
  }
  for (let k = 0; k <= r + 1; k++) {                       // 벽 두께만큼 선 쪽으로 다시 넓혀요
    const add = [];
    for (let i = 0; i < n; i++) {
      if (bg[i] || lum[i] < WHITE) continue;
      const x = i % w;
      if ((x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < n - w && bg[i + w])) add.push(i);
    }
    for (const i of add) bg[i] = 1;
  }
  for (let i = 0; i < n; i++) {
    if (bg[i]) { data[i * 4 + 3] = 0; continue; }
    const x = i % w;
    const edge = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < n - w && bg[i + w]);
    if (edge) data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round((255 - lum[i]) * 4)));
  }
  return bg;
}

// 배경이 아닌 픽셀 덩어리(8방향 연결)
function blobs(bg, w, h) {
  const lab = new Int32Array(w * h).fill(-1), out = [];
  for (let s = 0; s < w * h; s++) {
    if (bg[s] || lab[s] >= 0) continue;
    const id = out.length, b = { id, n:0, x0:w, y0:h, x1:0, y1:0 }, st = [s];
    lab[s] = id;
    while (st.length) {
      const i = st.pop(), x = i % w, y = (i / w) | 0;
      b.n++; if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (!bg[j] && lab[j] < 0) { lab[j] = id; st.push(j); }
      }
    }
    out.push(b);
  }
  return { out, lab };
}

// 큰 덩어리만 캐릭터로 보고(글자·반짝이 제외) 왼쪽 위부터 번호를 매겨요
function sprites(list) {
  const max = Math.max(...list.map(b => b.n));
  const big = list.filter(b => b.n > max * 0.12);
  const rowH = Math.max(...big.map(b => b.y1 - b.y0)) * 0.6;
  return big.sort((a, b) => Math.abs(((a.y0 + a.y1) - (b.y0 + b.y1)) / 2) > rowH ? (a.y0 + a.y1) - (b.y0 + b.y1) : a.x0 - b.x0);
}

function crop(sheet, lab, b, keepAll = false) {
  const { data, w } = sheet, cw = b.x1 - b.x0 + 1, ch = b.y1 - b.y0 + 1, buf = Buffer.alloc(cw * ch * 4), main = new Uint8Array(cw * ch);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const si = (b.y0 + y) * w + b.x0 + x;
    if (lab[si] === b.id) main[y * cw + x] = 1;
    if (keepAll ? lab[si] >= 0 : lab[si] === b.id) data.copy(buf, (y * cw + x) * 4, si * 4, si * 4 + 4);   // 옆에 붙은 반짝이·글자는 빼요 (keepAll: 따로 떨어진 눈·입도 살려요)
  }
  return { buf, cw, ch, main };
}

// 선 안쪽을 흰색으로 채워요: 그 줄의 좌우 끝 사이이면서 그 칸의 맨 위 선보다 아래인 투명 픽셀 (귀 사이는 안 채워지고, 아래가 열린 얼굴도 채워져요)
function fillInside(buf, w, h, main) {
  const on = i => buf[i * 4 + 3] > 40, edge = i => main[i] && on(i);
  const rl = new Int32Array(h).fill(w), rr = new Int32Array(h).fill(-1), ct = new Int32Array(w).fill(h), cb = new Int32Array(w).fill(-1);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (edge(y * w + x)) {
    if (x < rl[y]) rl[y] = x; if (x > rr[y]) rr[y] = x; if (y < ct[x]) ct[x] = y; if (y > cb[x]) cb[x] = y;
  }
  let maxSpan = 0; for (let y = 0; y < h; y++) maxSpan = Math.max(maxSpan, rr[y] - rl[y]);
  for (let y = 0; y < h; y++) if (rr[y] - rl[y] >= maxSpan * .6) for (let x = rl[y] + 1; x < rr[y]; x++) {   // 얼굴 폭이 좁아지는 아래쪽(목·반짝이 줄)은 안 채워요
    const i = y * w + x;
    if (!on(i) && y > ct[x]) { buf[i * 4] = buf[i * 4 + 1] = buf[i * 4 + 2] = 254; buf[i * 4 + 3] = 255; }
  }
}

const manifest = {};
for (const c of CHAR_SHEETS) {
  const sheet = await loadSheet(c.file);
  const bg = removeBackground(sheet, c);
  const { out, lab } = blobs(bg, sheet.w, sheet.h);
  const sp = sprites(out);

  if (DEBUG) {
    await mkdir(p("scratch/"), { recursive:true });
    const scale = 1200 / sheet.w;
    const boxes = sp.map((b, i) => `<rect x="${b.x0 * scale}" y="${b.y0 * scale}" width="${(b.x1 - b.x0) * scale}" height="${(b.y1 - b.y0) * scale}" fill="none" stroke="red" stroke-width="2"/>
      <text x="${b.x0 * scale + 4}" y="${b.y0 * scale + 22}" font-size="22" fill="red" font-weight="bold">${i}</text>`).join("");
    const sh = Math.round(sheet.h * scale);
    const base = await sharp(sheet.data, { raw:{ width:sheet.w, height:sheet.h, channels:4 } }).resize(1200).flatten({ background:"#9ab" }).png().toBuffer();
    await sharp(base).composite([{ input:Buffer.from(`<svg width="1200" height="${sh}">${boxes}</svg>`) }]).png().toFile(p(`scratch/${c.id}.png`));
    console.log(c.id, sp.length, "poses");
    continue;
  }

  await mkdir(p(`public/chars/${c.id}/`), { recursive:true });
  const fb = sp[c.poses.front], k = FRONT_H / (fb.y1 - fb.y0 + 1);
  const entry = manifest[c.id] = {};
  let k2 = null;
  for (const pose of ["front", ...Object.keys(c.poses).filter(x => x !== "front")]) {
    const pb = sp[c.poses[pose]];
    if (!pb) { console.error(`${c.id}: ${pose}(${c.poses[pose]}) 없음`); continue; }
    // 시트 아랫줄(걷기·달리기·표정)은 윗줄보다 작게 그려져 있어서, 걷기 포즈 키를 정면 키에 맞춘 배율로 키워요
    if (ROW2.includes(pose) && !k2) {
      const wb = sp[c.poses.walk];
      k2 = k * (c.row2 || Math.min(1.6, Math.max(1, (fb.y1 - fb.y0) / (wb.y1 - wb.y0) * .96)));
    }
    let kk = ROW2.includes(pose) ? k2 : k;
    const faceOnly = pose !== "front" && (pb.y1 - pb.y0) * kk < FRONT_H * .7;
    if (faceOnly)                                   // 얼굴만 그린 표정: 얼굴 너비를 정한 비율로
      kk = (c.faceW || FACE_W) * FRONT_H / (pb.x1 - pb.x0);
    if (c.scale && c.scale[pose]) kk *= c.scale[pose];
    const solid = c.solid && c.solid.includes(pose);
    const { buf, cw, ch, main } = crop(sheet, lab, pb, solid);
    if (solid) fillInside(buf, cw, ch, main);
    if (c.cut && c.cut[pose]) {                     // 옆 포즈의 장식이 붙어 온 부분 지우기 (비율 x0, y0, x1, y1)
      const [x0, y0, x1, y1] = c.cut[pose];
      for (let y = Math.round(y0 * ch); y < y1 * ch; y++) for (let x = Math.round(x0 * cw); x < x1 * cw; x++) buf[(y * cw + x) * 4 + 3] = 0;
    }
    const W = Math.max(1, Math.round(cw * kk)), H = Math.max(1, Math.round(ch * kk));
    await sharp(buf, { raw:{ width:cw, height:ch, channels:4 } }).resize(W, H, { kernel:"lanczos3" })
      .webp({ quality:80, alphaQuality:90, effort:6 }).toFile(p(`public/chars/${c.id}/${pose}.webp`));
    const dir = typeof c.dir === "string" ? c.dir : c.dir && c.dir[pose];
    entry[pose] = { w:W, h:H,
      ...((pose === "walk" || pose === "run") && dir ? { face:dir } : {}),           // 바라보는 쪽은 걷기·달리기에만 써요
      ...(faceOnly || (c.partial && c.partial.includes(pose)) ? { part:true } : {}) };   // 몸이 다 안 그려진 포즈 (기본·누를 때는 안 써요)
  }
  console.log(c.id, "아랫줄 배율", (k2 / k).toFixed(2));
}
if (!DEBUG) await writeFile(p("src/data/poses.json"), JSON.stringify(manifest));
