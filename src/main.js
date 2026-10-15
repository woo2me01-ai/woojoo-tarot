/* 우주점빵 타로 — 앱 시작 */
import "./styles.css";
import { App } from "@capacitor/app";
import { initStore, get } from "./lib/store.js";
import { setLang, LANG } from "./lib/i18n.js";
import { kstToday, dateKey } from "./lib/calendar.js";
import { route, startRouter, currentRoute, back } from "./lib/router.js";
import { renderProfile } from "./screens/profile.js";
import { renderHome } from "./screens/home.js";
import { renderThemes, renderAsk } from "./screens/tarot.js";
import { renderDraw } from "./screens/draw.js";
import { renderResult } from "./screens/result.js";
import { renderZodiac } from "./screens/zodiac.js";
import { renderSettings } from "./screens/settings.js";
import { renderMaster } from "./screens/master.js";
import { applyCardMoon } from "./lib/moon.js";
import { isPanelOpen, closeSharePanel } from "./lib/share.js";
import { applyTheme } from "./lib/theme.js";

const TAB_ROOTS = ["home", "tarot", "master", "zodiac", "settings"];

await initStore();
applyCardMoon();                       // 카드 뒷면 가운데 달을 오늘 모양으로
setLang(get("settings").lang || LANG);
applyTheme(get("settings").theme);       // 다크 · 화이트 · 기기 설정 따르기

route("profile", renderProfile);
route("home", renderHome);
route("tarot", renderThemes);
route("ask", renderAsk);
route("draw", renderDraw);
route("result", renderResult);
route("zodiac", renderZodiac);
route("settings", renderSettings);
route("master", () => renderMaster(true));

// 프로필이 없으면 첫 화면은 프로필 입력
startRouter(name => get("profile") ? name : "profile");

// 안드로이드 뒤로 가기: 탭 첫 화면이면 홈으로, 홈이면 앱 종료
App.addListener("backButton", () => {
  if (isPanelOpen()) { closeSharePanel(); return; }                  // 공유 창이 열려 있으면 먼저 닫기
  const r = currentRoute();
  if (r === "home" || (r === "profile" && !get("profile"))) App.exitApp();
  else if (TAB_ROOTS.includes(r)) location.replace("#/home");
  else back("home");
}).catch(() => {});

// 자정이 지나 앱으로 돌아오면 홈을 새 날짜로 다시 그려요
let shownDay = dateKey(kstToday());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  const today = dateKey(kstToday());
  if (today !== shownDay) { shownDay = today; applyCardMoon(); if (currentRoute() === "home") renderHome(); }
});
