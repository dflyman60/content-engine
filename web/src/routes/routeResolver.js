import { getDomainConfig } from "../config/domains";

export function resolveCurrentRoute() {
  const site = getDomainConfig();
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  if (path === "/") {
    return { site, type: "home", slug: null };
  }

  if (site.key === "cocktails") {
    if (path === "/cocktails" || path === "/drinks") {
      return { site, type: "cocktails_index", slug: null };
    }
    if (path === "/resources") {
      return { site, type: "resources_index", slug: null };
    }
    if (path === "/bars") {
      return { site, type: "bars_index", slug: null };
    }
    if (path === "/search") {
      return { site, type: "search", slug: null };
    }
  }

  if (site.key === "cocktails" && path.startsWith("/resources/")) {
    const rest = path.slice("/resources/".length).replace(/^\/+/, "");
    const slug = rest.split("/")[0] || "";
    if (slug) {
      return { site, type: "resource", slug };
    }
  }

  if (path.startsWith(site.contentBasePath + "/")) {
    const slug = path.replace(site.contentBasePath + "/", "").split("/")[0] || "";
    if (slug) {
      const type = site.key === "cocktails" ? "recipe" : "content";
      return { site, type, slug };
    }
  }

  return { site, type: "not_found", slug: null };
}
