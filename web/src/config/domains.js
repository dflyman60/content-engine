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
  const params = new URLSearchParams(window.location.search);
  const override = params.get("site");

  if (override === "cocktails") return DOMAIN_CONFIG.cocktails;
  if (override === "uap") return DOMAIN_CONFIG.uap;

  const hostname = window.location.hostname.toLowerCase();

  const match = Object.values(DOMAIN_CONFIG).find((site) =>
    site.hostnames.includes(hostname)
  );

  return match || DOMAIN_CONFIG.uap;
}
