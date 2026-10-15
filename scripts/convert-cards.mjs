// 웹의 카드 그림(JPG)을 앱용 WebP로 바꿔 public/cards/에 넣어요.
// 사용: npm run images -- "<웹 저장소>/fortune/cards"
import { readdir, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const src = process.argv[2];
if (!src) { console.error("카드 폴더 경로를 넣어 주세요."); process.exit(1); }
const out = new URL("../public/cards/", import.meta.url);
await mkdir(out, { recursive:true });

let before = 0, after = 0;
const files = (await readdir(src)).filter(f => f.endsWith(".jpg"));
for (const f of files) {
  const dest = join(out.pathname.replace(/^\/([A-Za-z]:)/, "$1"), f.replace(/\.jpg$/, ".webp"));
  await sharp(join(src, f)).resize({ width:360, withoutEnlargement:true }).webp({ quality:62, effort:6 }).toFile(dest);
  before += (await stat(join(src, f))).size; after += (await stat(dest)).size;
}
console.log(`${files.length}장 변환: ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB`);
