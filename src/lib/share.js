/* 공유 — 웹(woojoojumbbang.com/fortune)의 공유하기와 똑같이:
   1) 기기 공유 창(앱: 안드로이드 공유 시트, 웹: navigator.share)이 되면 그걸 먼저 열고
   2) 안 되는 곳(PC 일부·카카오톡 안 브라우저 등)이나 실패하면 아래에서 올라오는 공유 창(카카오톡·인스타그램·스레드·X…)을 띄워요.
   공유 글 끝에는 "👉 나도 해 보기: 링크"가 붙어요(받은 사람이 웹에서 바로 해 볼 수 있게). */
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { P } from "./util.js";
import { L, LANG, t } from "./i18n.js";

const SHARE_URL = "https://woojoojumbbang.com/fortune/";
// 카카오 개발자 사이트(developers.kakao.com)에서 앱을 만들고 JavaScript 키를 넣으면 카카오톡으로 바로 보내져요.
// 비워 두면 카카오톡 버튼은 글을 복사해 두고 대화방에 붙여 넣도록 안내해요. (웹과 같은 방식)
const KAKAO_JS_KEY = "";
const NATIVE = Capacitor.isNativePlatform();
const IN_APP = /KAKAOTALK|Instagram|FBAN|FBAV|FB_IAB|Line\/|NAVER\(inapp|DaumApps/i.test(navigator.userAgent);
const IS_TOUCH = matchMedia("(pointer: coarse)").matches;
const enc = encodeURIComponent;
const $ = id => document.getElementById(id);

// 받은 사람이 같은 언어·같은 탭으로 바로 열 수 있게 ?lang= 과 #탭을 붙여요
export function appUrl(tab) {
  const u = new URL(SHARE_URL); u.searchParams.set("lang", LANG); u.hash = tab; return u.toString();
}
const withLink = (body, url) => url ? `${body}\n\n${t("seeToo")}${url}` : body;

/* 복사: 먼저 바로 복사(execCommand), 안 되면 클립보드 API */
function copyTextSync(text) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
  return ok;
}
export async function copyText(text) {
  if (copyTextSync(text)) return true;
  try { if (navigator.clipboard) { await navigator.clipboard.writeText(text); return true; } } catch (e) {}
  return false;
}

/* 기기 공유 창 */
const nativeData = s => s.url ? { text:s.body, url:s.url } : { text:s.body };
const canNativeShare = s => NATIVE || (!!navigator.share && !IN_APP && (!navigator.canShare || navigator.canShare(nativeData(s))));
function nativeShare(s, onFail) {
  const isCancel = e => !e || e.name === "AbortError" || /cancel/i.test(e.message || "");
  if (NATIVE) Share.share({ ...nativeData(s), dialogTitle:t("shareTitle") }).catch(e => { if (!isCancel(e)) onFail(); });
  else navigator.share(nativeData(s)).catch(e => { if (!isCancel(e)) onFail(); });
}
// 앱 안에서는 외부 주소를 기기 브라우저·해당 앱으로 열어요
const openUrl = (href, self) => { if (self || NATIVE) location.href = href; else window.open(href, "_blank", "noopener"); };

function loadKakao() {
  return new Promise((res, rej) => {
    if (window.Kakao) return res(window.Kakao);
    const sc = document.createElement("script");
    sc.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"; sc.crossOrigin = "anonymous";
    sc.onload = () => res(window.Kakao); sc.onerror = rej;
    document.head.appendChild(sc);
  });
}
const SHARE_TARGETS = [
  { key:"native", label:P("기기 공유", "Device share"), ic:"📱", bg:"linear-gradient(135deg,#8b5cf6,#a78bfa)", fg:"#1c1240",
    show:s => canNativeShare(s), run:s => nativeShare(s, () => {}) },
  { key:"kakao", label:P("카카오톡", "KakaoTalk"), ic:"K", bg:"#FEE500", fg:"#191919",
    run:async s => {
      if (KAKAO_JS_KEY && s.url) {
        try {
          const K = await loadKakao();
          if (!K.isInitialized()) K.init(KAKAO_JS_KEY);
          K.Share.sendDefault({ objectType:"text", text:s.body.slice(0, 200), link:{ mobileWebUrl:s.url, webUrl:s.url }, buttonTitle:t("kakaoBtn") });
          return;
        } catch (e) {}
      }
      panelCopy(s.full, t("kakaoPaste"));
    } },
  { key:"instagram", label:P("인스타그램", "Instagram"), ic:"◎", bg:"radial-gradient(circle at 30% 110%,#fdf497 0%,#fd5949 45%,#d6249f 62%,#285AEB 95%)", fg:"#fff",
    // 인스타그램은 글을 미리 채워 보낼 수 없어서, 글을 복사해 두고 인스타그램을 열어요
    run:s => {
      const ok = copyTextSync(s.full);
      openUrl("https://www.instagram.com/");
      if (ok) $("spMsg").textContent = t("igPaste"); else panelCopy(s.full, t("igPaste"));
    } },
  { key:"threads", label:P("스레드", "Threads"), ic:"@", bg:"#000", fg:"#fff", href:s => `https://www.threads.net/intent/post?text=${enc(s.full)}` },
  { key:"x", label:P("X (트위터)", "X (Twitter)"), ic:"𝕏", bg:"#000", fg:"#fff",
    href:s => `https://twitter.com/intent/tweet?text=${enc(s.body)}${s.url ? "&url=" + enc(s.url) : ""}` },
  { key:"facebook", label:P("페이스북", "Facebook"), ic:"f", bg:"#1877F2", fg:"#fff",
    show:s => !!s.url, href:s => `https://www.facebook.com/sharer/sharer.php?u=${enc(s.url)}` },
  { key:"line", label:P("라인", "LINE"), ic:"L", bg:"#06C755", fg:"#fff", href:s => `https://line.me/R/share?text=${enc(s.full)}` },
  { key:"telegram", label:P("텔레그램", "Telegram"), ic:"✈", bg:"#26A5E4", fg:"#fff",
    show:s => !!s.url, href:s => `https://t.me/share/url?url=${enc(s.url)}&text=${enc(s.body)}` },
  { key:"whatsapp", label:P("왓츠앱", "WhatsApp"), ic:"W", bg:"#25D366", fg:"#fff", href:s => `https://wa.me/?text=${enc(s.full)}` },
  { key:"sms", label:P("문자", "SMS"), ic:"💬", bg:"#34C759", fg:"#fff", show:() => IS_TOUCH || NATIVE, self:true, href:s => `sms:?&body=${enc(s.full)}` },
];

/* 공유 창(시트): 한 번만 만들어 body에 붙여 두고 열고 닫아요 */
let panelShare = null;
function ensurePanel() {
  if ($("sharePanel")) return;
  document.body.insertAdjacentHTML("beforeend", `<div class="sheet hidden" id="sharePanel" role="dialog" aria-modal="true" aria-labelledby="spTitle">
    <div class="sheet-box">
      <div class="sheet-h"><b id="spTitle"></b><button type="button" class="sheet-x" id="spClose">✕</button></div>
      <div class="sp-grid" id="spGrid"></div>
      <p class="hint" id="spNote"></p>
      <textarea class="sharebox" id="spText" readonly></textarea>
      <div class="msg" id="spMsg"></div>
    </div></div>`);
  $("spGrid").addEventListener("click", e => {
    const b = e.target.closest(".sp-btn"); if (!b || !panelShare) return;
    const x = SHARE_TARGETS.find(y => y.key === b.dataset.k);
    if (x.run) return x.run(panelShare);
    openUrl(x.href(panelShare), x.self);
  });
  $("spClose").addEventListener("click", closeSharePanel);
  $("sharePanel").addEventListener("click", e => { if (e.target.id === "sharePanel") closeSharePanel(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && isPanelOpen()) closeSharePanel(); });
  $("spText").addEventListener("focus", e => e.target.select());
}
function openSharePanel(s) {
  ensurePanel();
  panelShare = s;
  $("spTitle").textContent = t("shareTitle");
  $("spClose").setAttribute("aria-label", t("close"));
  $("spGrid").innerHTML = SHARE_TARGETS.filter(x => !x.show || x.show(s)).map(x => `<button type="button" class="sp-btn" data-k="${x.key}">
      <span class="sp-ic" style="background:${x.bg};color:${x.fg}">${x.ic}</span><span>${L(x.label)}</span></button>`).join("");
  $("spText").value = s.full;
  $("spNote").textContent = s.url ? t("spLinked") : t("spNoLink");
  $("spMsg").textContent = "";
  $("sharePanel").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
export const isPanelOpen = () => !!$("sharePanel") && !$("sharePanel").classList.contains("hidden");
export function closeSharePanel() { if ($("sharePanel")) $("sharePanel").classList.add("hidden"); document.body.style.overflow = ""; }
async function panelCopy(text, okMsg) {
  const ok = await copyText(text);
  $("spMsg").textContent = ok ? okMsg : t("manualCopy");
  if (!ok) { $("spText").focus(); $("spText").select(); }
}

/* 화면의 공유·복사 버튼 연결 (웹의 wireShare와 같아요)
   ids: { share, copy, msg, fallback } · tab: 링크에 붙일 웹 탭(#tarot 등) · build(): 공유 글 줄 목록 */
export function wireShare({ share, copy, msg, fallback }, tab, build) {
  let timer = 0;
  const flash = m => { $(msg).textContent = m; clearTimeout(timer); timer = setTimeout(() => { if ($(msg)) $(msg).textContent = ""; }, 3000); };
  const manual = text => {
    const ta = $(fallback);
    ta.value = text; ta.classList.remove("hidden"); ta.focus(); ta.select();
    $(msg).textContent = t("manualCopy");
  };
  $(copy).addEventListener("click", async () => {
    const text = withLink(build().join("\n"), appUrl(tab));
    if (await copyText(text)) flash(t("copied")); else manual(text);
  });
  $(share).addEventListener("click", () => {
    const body = build().join("\n"), url = appUrl(tab), s = { body, url, full:withLink(body, url) };
    if (canNativeShare(s)) nativeShare(s, () => openSharePanel(s));
    else openSharePanel(s);
  });
}
