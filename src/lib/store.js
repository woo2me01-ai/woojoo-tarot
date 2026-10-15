/* 기기 저장 — Capacitor Preferences (웹 미리보기에서는 localStorage로 동작)
   앱 시작 때 한 번 모두 읽어 메모리에 두고, 쓰기는 메모리 + 기기에 같이 해요. */
import { Preferences } from "@capacitor/preferences";

const KEYS = ["profile", "settings", "daily", "history", "streak"];
const DEFAULTS = {
  settings: { reversed:true, reveal:"each", lang:null },
  history: [],
};
const mem = {};

export async function initStore() {
  await Promise.all(KEYS.map(async k => {
    let v = null;
    try { const r = await Preferences.get({ key:k }); v = r.value ? JSON.parse(r.value) : null; } catch (e) {}
    mem[k] = v ?? structuredClone(DEFAULTS[k] ?? null);
  }));
  mem.settings = { ...DEFAULTS.settings, ...mem.settings };
}

export const get = k => mem[k];
export function set(k, v) {
  mem[k] = v;
  Preferences.set({ key:k, value:JSON.stringify(v) }).catch(() => {});
}

export const HISTORY_MAX = 100;
export function addHistory(entry) {
  set("history", [entry, ...(mem.history || [])].slice(0, HISTORY_MAX));
}
