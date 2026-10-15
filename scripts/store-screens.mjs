// 플레이 스토어용 휴대폰 스크린샷(1080×1920, 9:16)을 앱을 실제로 눌러 가며 찍어요.
// 설치된 크롬으로 빌드한 앱(dist)을 열고, 프로필 입력 → 오늘의 카드 → 마스터 → 타로 → 결과 → 별자리 → 화이트 테마 순서로 찍어요.
// 사용: npm run store:screens   (결과: release/graphics/screenshots/01-home.png …)
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build, preview } from "vite";
import puppeteer from "puppeteer-core";

const p = rel => fileURLToPath(new URL("../" + rel, import.meta.url));
const OUT = "release/graphics/screenshots/";
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
const sleep = ms => new Promise(r => setTimeout(r, ms));

await build({ root:p(""), logLevel:"warn" });
const server = await preview({ root:p(""), preview:{ port:4319, strictPort:true }, logLevel:"warn" });
const URL0 = "http://localhost:4319/";
await mkdir(p(OUT), { recursive:true });

const browser = await puppeteer.launch({ executablePath:CHROME, headless:true, args:["--lang=ko-KR"] });
const page = await browser.newPage();
await page.setViewport({ width:360, height:640, deviceScaleFactor:3, isMobile:true, hasTouch:true });   // 1080×1920
await page.emulateMediaFeatures([{ name:"prefers-reduced-motion", value:"no-preference" }]);
// 주소의 # 뒤만 바꾸면 새로고침이 안 돼서, 저장값을 바꾼 뒤엔 reload로 다시 읽게 해요
const go = async (hash, reload = false) => {
  await page.goto(URL0 + "#/" + hash, { waitUntil:"networkidle0" });
  if (reload) await page.reload({ waitUntil:"networkidle0" });
  await sleep(1400);
};
const shot = async (name, settle = 900) => { await sleep(settle); await page.screenshot({ path:p(OUT + name + ".png") }); console.log("📸", name); };
const click = async sel => { await page.waitForSelector(sel, { visible:true }); await page.click(sel); };

// 처음 실행: 프로필 입력
await go("profile");
await page.select("#by", "1995"); await page.select("#bm", "5"); await sleep(100); await page.select("#bd", "12");
await page.type("#name", "별빛");
await click("#save");
await sleep(1200);

// 마스터 데려오기(몽실) → 그랜드 마스터로 키운 모습
await go("master");
await click('.mpick[data-id="panda"]'); await click("#ok");
await page.evaluate(() => {
  const k = "CapacitorStorage.pet", pet = JSON.parse(localStorage.getItem(k));
  localStorage.setItem(k, JSON.stringify({ ...pet, xp:3650 }));
});

// 1. 홈: 오늘의 카드 뒤집기
await go("home", true);
await click("#dailyCard"); await sleep(1500);
await shot("01-home");

// 2. 마스터 방
await go("master");
await shot("02-master", 1500);

// 3. 타로 주제
await go("tarot");
await shot("03-tarot-themes");

// 4. 카드 고르기 → 5. 결과 (재회 · 3장)
await go("ask/reunion");
await page.type("#q", "그 사람과 다시 만날 수 있을까요?");
await click("#go");
await sleep(1800);
await page.evaluate(() => document.querySelectorAll("#deck button")[7].click()); await sleep(500);
await page.evaluate(() => document.querySelectorAll("#deck button")[23].click()); await sleep(300);
await shot("04-draw", 400);
await page.evaluate(() => document.querySelectorAll("#deck button")[51].click());
await page.waitForFunction(() => location.hash === "#/result", { timeout:8000 });
await shot("05-result", 1500);

// 6. 별자리
await go("zodiac");
await shot("06-zodiac");

// 7. 화이트 테마 홈
await page.evaluate(() => {
  const k = "CapacitorStorage.settings", st = JSON.parse(localStorage.getItem(k) || "{}");
  localStorage.setItem(k, JSON.stringify({ ...st, theme:"light" }));
});
await go("home", true);
await page.evaluate(() => window.scrollTo(0, 360));
await shot("07-home-light");

await browser.close();
server.httpServer.close();
console.log("스크린샷을 " + OUT + "에 저장했어요");
