const CANONICAL_ORIGIN = "https://www.velvetpour.bar";

export function cocktailRecipeCanonicalHref(slug) {
  if (!slug || typeof slug !== "string") return null;
  const s = slug.trim();
  if (!s) return null;
  return `${CANONICAL_ORIGIN}/drinks/${encodeURIComponent(s)}`;
}

/** Used only when the JSON title is short or vague — keeps existing wording when already clear. */
const TITLE_SUFFIX_BY_SLUG = {
  "gin-and-tonic": "Bright, Bubbly Highball",
  margarita: "Fresh Citrus & Tequila Classic",
  daiquiri: "Simple Rum & Lime Balance",
  martini: "Cold, Lean & Spirit-Forward",
  "whiskey-sour": "Citrusy Shaken Whiskey Classic",
  negroni: "Bitter, Balanced & Timeless Cocktail",
  manhattan: "Classic Whiskey-Vermouth Cocktail",
  "old-fashioned": "Stirred Whiskey & Bitters Classic",
};

export function isVagueRecipeTitle(title) {
  const t = String(title ?? "").trim();
  if (!t) return true;
  if (t.length < 24) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= 4) return true;
  if (/^how to make\b/i.test(t)) return false;
  return false;
}

export function buildCocktailRecipeDocumentTitle(recipe) {
  if (!recipe?.title) return "Velvet Pour";
  const title = String(recipe.title).trim();
  const slug = String(recipe.slug ?? "").trim();
  const suffix = TITLE_SUFFIX_BY_SLUG[slug];
  if (isVagueRecipeTitle(title) && suffix) {
    return `${title} | ${suffix}`;
  }
  return `${title} | Velvet Pour`;
}

function clampMetaDescription(text, max = 158) {
  const t = String(text).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 60 ? cut.slice(0, lastSpace) : cut;
  return `${base.trim()}…`;
}

export function buildCocktailRecipeMetaDescription(recipe) {
  const raw = recipe?.summary;
  if (raw != null && String(raw).trim() !== "") {
    const paras = String(raw)
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const line = (paras[0] ?? "").replace(/\s+/g, " ").trim();
    if (line.length >= 120) return clampMetaDescription(line);
    if (line.length >= 40) {
      return clampMetaDescription(
        `${line} Recipe notes, balance, and technique from Velvet Pour.`,
      );
    }
  }
  const label = drinkDisplayName(recipe);
  return clampMetaDescription(
    `${label} cocktail—what it is, how to build it, and how to keep it balanced. Velvet Pour.`,
  );
}

export function drinkDisplayName(recipe) {
  const t = recipe?.title;
  if (t && String(t).trim()) {
    const rest = String(t).replace(/^How to Make (?:a |an )?/i, "").trim();
    if (rest) {
      const head =
        rest.split(/\s+(?:That|Without|You'll)\b/i)[0]?.trim() ?? "";
      const cleaned = head.replace(/^(a|an)\s+/i, "").trim();
      if (cleaned) return cleaned;
    }
  }
  return humanizeSlug(recipe?.slug ?? "");
}

function humanizeSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function recipeHeroImageAlt(recipe) {
  const name = drinkDisplayName(recipe);
  return `${name} cocktail in a glass`;
}

export function editorialTitlesLower(editorialBlocks) {
  return editorialBlocks
    .map((b) => (b.title ? String(b.title).toLowerCase() : ""))
    .filter(Boolean);
}

export function needsIngredientsH2(titlesLower) {
  return !titlesLower.some((t) => /\bingredient/.test(t));
}

export function needsHowToH2(titlesLower) {
  return !titlesLower.some((t) =>
    /\bhow to make\b|\bhow to build\b|\bmethod\b|\binstructions\b|\bstep\b|\bsteps\b/.test(
      t,
    ),
  );
}

export function needsVariationsH2(titlesLower) {
  return !titlesLower.some((t) =>
    /\bvariations?\b|\briffs?\b|\balternatives?\b/.test(t),
  );
}

export function pickInternalDrinkSlugs(currentSlug, limit = 3) {
  const priority = [
    "manhattan",
    "old-fashioned",
    "negroni",
    "margarita",
    "daiquiri",
  ];
  const cur = String(currentSlug ?? "").trim();
  const out = [];
  for (const s of priority) {
    if (s !== cur) out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

export function variationBlurbForSlug(slug) {
  const map = {
    manhattan:
      "Perfect and Dry builds tweak vermouth—same frame, different sweetness.",
    martini:
      "Gin or vodka, wet or dry—adjust vermouth and dilution with intention.",
    margarita:
      "Ratios and rim salt move the dial—small shifts, loud results.",
    daiquiri:
      "White rum and lime reward restraint; sweetness stays a dial, not a flood.",
    negroni:
      "Swap spirits thoughtfully—same counted pour, different backbone.",
    "old-fashioned":
      "Rye versus bourbon changes the spine; sweetener depth finishes the story.",
    "gin-and-tonic": null,
    "whiskey-sour": null,
  };
  return map[slug] ?? null;
}
