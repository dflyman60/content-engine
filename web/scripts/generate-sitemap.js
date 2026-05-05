import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = "https://www.velvetpour.bar";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.resolve(ROOT_DIR, "..", "data", "cocktails");
const RECIPES_DIR = path.resolve(DATA_DIR, "recipes");
const RESOURCES_DIR = path.resolve(DATA_DIR, "resources");
const OUTPUT_FILE = path.resolve(ROOT_DIR, "public", "sitemap.xml");

async function readSlugs(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const slugs = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const fullPath = path.resolve(dirPath, entry.name);
    const raw = await readFile(fullPath, "utf8");
    const data = JSON.parse(raw);
    const slug = typeof data?.slug === "string" ? data.slug.trim() : "";
    if (slug) slugs.push(slug);
  }

  return slugs.sort((a, b) => a.localeCompare(b));
}

function buildUrlXml(routePath) {
  const normalizedPath =
    routePath === "/" ? "/" : `/${String(routePath).replace(/^\/+/, "")}`;
  const loc = `${BASE_URL}${normalizedPath}`;
  return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
}

async function generateSitemap() {
  const recipeSlugs = await readSlugs(RECIPES_DIR);
  const resourceSlugs = await readSlugs(RESOURCES_DIR);

  const routes = [
    "/",
    "/cocktails",
    "/resources",
    "/bars",
    ...recipeSlugs.map((slug) => `/drinks/${slug}`),
    ...resourceSlugs.map((slug) => `/resources/${slug}`),
  ];

  const uniqueSortedRoutes = [...new Set(routes)].sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  });

  const body = uniqueSortedRoutes.map(buildUrlXml).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  await writeFile(OUTPUT_FILE, xml, "utf8");
  console.log(`Sitemap generated: ${OUTPUT_FILE}`);
}

generateSitemap().catch((error) => {
  console.error("Failed to generate sitemap.", error);
  process.exit(1);
});
