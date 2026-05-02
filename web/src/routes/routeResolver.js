import { getDomainConfig } from "../config/domains";

export function resolveCurrentRoute() {
  const site = getDomainConfig();
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  if (path === "/") {
    return { site, type: "home", slug: null };
  }

  if (path.startsWith(site.contentBasePath + "/")) {
    const slug = path.replace(site.contentBasePath + "/", "");
    return { site, type: "content", slug };
  }

  return { site, type: "not_found", slug: null };
}
