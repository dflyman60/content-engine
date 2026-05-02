import { useEffect } from "react";
import { resolveCurrentRoute } from "./routes/routeResolver";

import {
  getUapCaseBySlug,
  getCocktailRecipeBySlug,
} from "./utils/contentLoader";

import UapLayout from "./domains/uap/UapLayout";
import UapHome from "./domains/uap/UapHome";
import UapCasePage from "./domains/uap/UapCasePage";

import CocktailLayout from "./domains/cocktails/CocktailLayout";
import CocktailHome from "./domains/cocktails/CocktailHome";
import CocktailRecipePage from "./domains/cocktails/CocktailRecipePage";

function NotFound() {
  return (
    <main style={{ padding: "40px", fontFamily: "system-ui" }}>
      <h1>Not Found</h1>
      <p>This page does not exist.</p>
    </main>
  );
}

export default function App() {
  const route = resolveCurrentRoute();

  useEffect(() => {
    if (route.type === "content" && route.slug) {
      if (route.site.key === "cocktails") {
        const recipe = getCocktailRecipeBySlug(route.slug);
        document.title = recipe ? `${recipe.title} | Velvet Pour` : "Velvet Pour";
      } else {
        const uapCase = getUapCaseBySlug(route.slug);
        document.title = uapCase ? `${uapCase.title} | UAP Cases` : "UAP Cases";
      }
      return;
    }

    document.title =
      route.site.key === "cocktails" ? "Velvet Pour" : "UAP Cases";
  }, [route]);

  if (route.site.key === "cocktails") {
    return (
      <CocktailLayout>
        {route.type === "home" && <CocktailHome />}
        {route.type === "content" && <CocktailRecipePage slug={route.slug} />}
        {route.type === "not_found" && <NotFound />}
      </CocktailLayout>
    );
  }

  return (
    <UapLayout>
      {route.type === "home" && <UapHome />}
      {route.type === "content" && <UapCasePage slug={route.slug} />}
      {route.type === "not_found" && <NotFound />}
    </UapLayout>
  );
}
