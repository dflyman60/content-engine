const uapModules = import.meta.glob("@data/uap/cases/*.json", {
  eager: true,
});

const cocktailModules = import.meta.glob("@data/cocktails/recipes/*.json", {
  eager: true,
});

export function getAllUapCases() {
  return Object.values(uapModules)
    .map((module) => module.default)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getUapCaseBySlug(slug) {
  return getAllUapCases().find((item) => item.slug === slug) || null;
}

export function getRelatedUapCases(currentCase, limit = 3) {
  if (!currentCase) return [];

  const allCases = getAllUapCases().filter(
    (item) => item.slug !== currentCase.slug
  );

  const explicitRelated = allCases.filter((item) =>
    currentCase.related?.includes(item.slug)
  );

  const tagRelated = allCases.filter((item) =>
    item.tags?.some((tag) => currentCase.tags?.includes(tag))
  );

  const combined = [...explicitRelated, ...tagRelated];

  const unique = Array.from(
    new Map(combined.map((item) => [item.slug, item])).values()
  );

  return unique.slice(0, limit);
}

export function getAllCocktailRecipes() {
  return Object.values(cocktailModules)
    .map((module) => module.default)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getCocktailRecipeBySlug(slug) {
  return getAllCocktailRecipes().find((item) => item.slug === slug) || null;
}

export function getRelatedCocktailRecipes(currentRecipe, limit = 3) {
  if (!currentRecipe) return [];

  const allRecipes = getAllCocktailRecipes().filter(
    (item) => item.slug !== currentRecipe.slug
  );

  const explicitRelated = allRecipes.filter((item) =>
    currentRecipe.related?.includes(item.slug)
  );

  const tagRelated = allRecipes.filter((item) =>
    item.tags?.some((tag) => currentRecipe.tags?.includes(tag))
  );

  const combined = [...explicitRelated, ...tagRelated];

  const unique = Array.from(
    new Map(combined.map((item) => [item.slug, item])).values()
  );

  return unique.slice(0, limit);
}
