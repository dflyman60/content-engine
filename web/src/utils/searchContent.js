import {
  getAllCocktailRecipes,
  getAllCocktailResources,
} from "./contentLoader";

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function stripHtml(s) {
  return String(s ?? "").replace(/<[^>]*>/g, " ");
}

function isBestBarsResource(item) {
  return safeArr(item?.tags).some(
    (t) => String(t).toLowerCase() === "best bars",
  );
}

function joinLower(...parts) {
  return parts
    .filter((p) => p != null && String(p).trim() !== "")
    .map((p) => String(p))
    .join("\n")
    .toLowerCase();
}

function collectSectionBlocksText(item) {
  const lists = [item?.sections, item?.editorial_sections];
  const chunks = [];
  for (const list of lists) {
    for (const block of safeArr(list)) {
      if (typeof block === "string") {
        chunks.push(block);
      } else if (block && typeof block === "object") {
        chunks.push(
          block.title,
          block.heading,
          block.body,
          block.content,
          block.text,
        );
      }
    }
  }
  return stripHtml(chunks.filter(Boolean).join(" "));
}

function collectQuickMixText(recipe) {
  const qm = recipe?.quick_mix;
  if (!qm || typeof qm !== "object") return "";
  return joinLower(
    qm.headline,
    ...safeArr(qm.badges).map(String),
    ...safeArr(qm.lines).map(String),
  );
}

function collectListText(arr) {
  return safeArr(arr)
    .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
    .join(" ");
}

function recipeHaystack(recipe) {
  return joinLower(
    recipe.title,
    recipe.subtitle,
    recipe.summary,
    ...safeArr(recipe.tags).map(String),
    collectSectionBlocksText(recipe),
    collectQuickMixText(recipe),
    collectListText(recipe.ingredients),
    collectListText(recipe.steps),
    recipe.notes,
  );
}

function resourceHaystack(resource) {
  return joinLower(
    resource.title,
    resource.subtitle,
    resource.summary,
    ...safeArr(resource.tags).map(String),
    collectSectionBlocksText(resource),
    collectListText(resource.ingredients),
    collectListText(resource.steps),
    resource.notes,
  );
}

function firstBlurb(item) {
  const raw = item.summary ?? item.subtitle ?? "";
  if (raw == null || String(raw).trim() === "") return "";
  return String(raw).split(/\n\s*\n/)[0].trim();
}

/**
 * @param {string} query
 * @returns {Array<{ type: 'cocktail' | 'resource' | 'bar', title: string, summary: string, slug: string, href: string }>}
 */
export function searchContent(query) {
  const q = String(query ?? "").trim();
  if (!q) return [];

  const needle = q.toLowerCase();
  const out = [];

  for (const recipe of getAllCocktailRecipes()) {
    if (recipeHaystack(recipe).includes(needle)) {
      out.push({
        type: "cocktail",
        title: String(recipe.title ?? "").trim() || "Cocktail",
        summary: firstBlurb(recipe),
        slug: recipe.slug,
        href: `/drinks/${recipe.slug}`,
      });
    }
  }

  for (const resource of getAllCocktailResources()) {
    if (!resourceHaystack(resource).includes(needle)) continue;
    const bar = isBestBarsResource(resource);
    out.push({
      type: bar ? "bar" : "resource",
      title: String(resource.title ?? "").trim() || "Resource",
      summary: firstBlurb(resource),
      slug: resource.slug,
      href: `/resources/${resource.slug}`,
    });
  }

  return out;
}
