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
    let title = "";
    let description = "";
  
    if (route.type === "content" && route.slug) {
      if (route.site.key === "cocktails") {
        const recipe = getCocktailRecipeBySlug(route.slug);
        if (recipe) {
          title = `${recipe.title} | Velvet Pour`;
          description = recipe.summary;
        }
      } else {
        const uapCase = getUapCaseBySlug(route.slug);
        if (uapCase) {
          title = `${uapCase.title} | UAP Cases`;
          description = uapCase.summary;
        }
      }
    } else {
      if (route.site.key === "cocktails") {
        title = "Velvet Pour";
        description = "Award-inspired cocktails, techniques, and home bar guidance.";
      } else {
        title = "UAP Cases";
        description = "Structured case analysis of UAP sightings, reports, and unexplained events.";
      }
    }

    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

  }, [route]);

===================

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
