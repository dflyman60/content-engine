export const DOMAIN_CONFIG = {
  uap: {
    key: "uap",
    label: "UAP Cases",
    hostnames: ["uapcases.com", "www.uapcases.com"],
    contentBasePath: "/cases",
  },
  cocktails: {
    key: "cocktails",
    label: "Velvet Pour",
    hostnames: ["velvetpour.bar", "www.velvetpour.bar"],
    contentBasePath: "/drinks",
  },
};

function isVercelPreviewHost(hostname) {
  return hostname.endsWith(".vercel.app") || hostname.endsWith(".vercel.dev");
}

function resolveSiteFromQuery() {
  const siteParam = new URLSearchParams(window.location.search).get("site");
  if (siteParam === "cocktails") return DOMAIN_CONFIG.cocktails;
  if (siteParam === "uap") return DOMAIN_CONFIG.uap;
  return DOMAIN_CONFIG.uap;
}

/**
 * Resolve site by hostname first; localhost / Vercel preview use ?site= (default uap).
 */
export function getDomainConfig() {
  const hostname = window.location.hostname.toLowerCase();

  for (const config of Object.values(DOMAIN_CONFIG)) {
    if (config.hostnames.includes(hostname)) {
      return config;
    }
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return resolveSiteFromQuery();
  }

  if (isVercelPreviewHost(hostname)) {
    return resolveSiteFromQuery();
  }

  return DOMAIN_CONFIG.uap;
}
