/* 화면 테마: "dark"(기본) · "light"(화이트) · "system"(기기 설정 따르기)
   <html data-theme="light|dark">로 styles.css의 색 토큰을 바꾸고, 주소창·상태바 색(theme-color)도 맞춰요. */
const media = matchMedia("(prefers-color-scheme: light)");
let pref = "dark";

const resolved = () => pref === "system" ? (media.matches ? "light" : "dark") : pref;

function paint() {
  const mode = resolved();
  document.documentElement.dataset.theme = mode;
  const bg = mode === "light" ? "#f5f3fb" : "#0a0a18";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", mode);
}

export function applyTheme(p) {
  pref = p === "light" || p === "system" ? p : "dark";
  paint();
}
// 기기 설정을 따를 때, 기기가 밝게/어둡게 바뀌면 바로 따라가요
media.addEventListener?.("change", () => { if (pref === "system") paint(); });
