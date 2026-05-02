export const DOMAIN_CONFIG = {
  uap: {
    key: "uap",
    label: "UAP Cases",
    hostnames: ["localhost", "uapcases.com", "www.uapcases.com"],
    contentBasePath: "/cases",
  },
  cocktails: {
    key: "cocktails",
    label: "Velvet Pour",
    hostnames: ["velvetpour.bar", "www.velvetpour.bar"],
    contentBasePath: "/drinks",
  },
};

export function getDomainConfig() {
  const hostname = window.location.hostname.toLowerCase();

  // Local-only: optional ?site= override for testing (production hostnames skip this)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const siteParam = new URLSearchParams(window.location.search).get("site");
    if (siteParam === "cocktails") {
      return DOMAIN_CONFIG.cocktails;
    }
    return DOMAIN_CONFIG.uap;
  }

  for (const config of Object.values(DOMAIN_CONFIG)) {
    if (config.hostnames.includes(hostname)) {
      return config;
    }
  }

  return DOMAIN_CONFIG.uap;
}
