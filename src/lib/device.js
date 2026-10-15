/* 기기 기능: 공유·복사·진동 (웹 미리보기에서는 브라우저 기능으로 대신해요) */
import { Share } from "@capacitor/share";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export function tap() { Haptics.impact({ style:ImpactStyle.Light }).catch(() => {}); }
export function thud() { Haptics.impact({ style:ImpactStyle.Medium }).catch(() => {}); }

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
  const ta = document.createElement("textarea");
  ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
  ta.remove();
  return ok;
}

// 안드로이드 공유 시트. 못 쓰는 곳이면 false를 돌려줘서 복사로 대신하게 해요
export async function shareText(text) {
  try {
    if (!(await Share.canShare()).value) return false;
    await Share.share({ text });
    return true;
  } catch (e) {
    return !!(e && /cancel/i.test(e.message || ""));   // 사용자가 닫은 건 실패가 아니에요
  }
}
