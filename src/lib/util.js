/* 작은 도우미 */
export const P = (ko, en) => ({ ko, en });
export const pad2 = n => String(n).padStart(2, "0");
export const $ = id => document.getElementById(id);
export function esc(x) { return String(x).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); }
export function randInt(n) {
  if (globalThis.crypto && crypto.getRandomValues) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
  return Math.floor(Math.random() * n);
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
