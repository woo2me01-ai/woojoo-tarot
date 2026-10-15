/* 해시 라우터: #/home, #/tarot, #/ask/<테마|free>, #/draw, #/result, #/zodiac, #/settings, #/profile */
const routes = {};
let current = null;

export const route = (name, render) => { routes[name] = render; };
export const go = (path, replace = false) => {
  const h = "#/" + path;
  if (replace) location.replace(h); else location.hash = h;
};
export const back = fallback => {
  if (history.length > 1) history.back(); else go(fallback || "home", true);
};
export const currentRoute = () => current;

export function startRouter(guard) {
  const run = () => {
    const [name, ...rest] = location.hash.replace(/^#\/?/, "").split("/");
    const target = guard(name || "home");
    if (target !== (name || "home")) { go(target, true); return; }
    const render = routes[target] || routes.home;
    current = target;
    render(rest.map(decodeURIComponent));
    window.scrollTo(0, 0);
  };
  window.addEventListener("hashchange", run);
  run();
}
