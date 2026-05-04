/**
 * Velvet Pour internal links: append `site=cocktails` on localhost only so production
 * (e.g. velvetpour.bar) stays clean `/` URLs. Idempotent for existing `site=`.
 */
function isLocalDevHost() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

export function withCocktailSite(path) {
  if (path == null || path === "") {
    return isLocalDevHost() ? "/?site=cocktails" : "/";
  }
  const p = String(path).trim();
  if (p === "" || p.startsWith("#")) return p;
  if (/^https?:\/\//i.test(p)) return p;
  if (!isLocalDevHost()) return p;
  if (/(^|[?&])site=/.test(p)) return p;
  return `${p}${p.includes("?") ? "&" : "?"}site=cocktails`;
}

/** Alias for withCocktailSite; defaults path to "/". */
export function cocktailHref(path = "/") {
  return withCocktailSite(path);
}
