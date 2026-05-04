import { useEffect } from "react";
import { resolveCurrentRoute } from "./routes/routeResolver";

import {
  getUapCaseBySlug,
  getCocktailRecipeBySlug,
  getCocktailResourceBySlug,
} from "./utils/contentLoader";

import UapLayout from "./domains/uap/UapLayout";
import UapHome from "./domains/uap/UapHome";
import UapCasePage from "./domains/uap/UapCasePage";

import CocktailLayout from "./domains/cocktails/CocktailLayout";
import CocktailRecipePage from "./domains/cocktails/CocktailRecipePage";
import CocktailResourcePage from "./domains/cocktails/CocktailResourcePage";
import HomePage from "./pages/HomePage";
import CocktailsIndexPage from "./pages/CocktailsIndexPage";
import ResourcesIndexPage from "./pages/ResourcesIndexPage";
import BarsIndexPage from "./pages/BarsIndexPage";
import SearchPage from "./pages/SearchPage";

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

    if (route.type === "recipe" && route.slug && route.site.key === "cocktails") {
      const recipe = getCocktailRecipeBySlug(route.slug);
      title = recipe ? `${recipe.title} | Velvet Pour` : "Velvet Pour";
      description =
        recipe?.summary ||
        "Award-inspired cocktails, techniques, and home bar guidance.";
    } else if (route.type === "resource" && route.slug && route.site.key === "cocktails") {
      const resource = getCocktailResourceBySlug(route.slug);
      title = resource ? `${resource.title} | Velvet Pour` : "Velvet Pour";
      description =
        resource?.summary ||
        resource?.subtitle ||
        "Award-inspired cocktails, techniques, and home bar guidance.";
    } else if (
      route.site.key === "cocktails" &&
      route.type === "cocktails_index"
    ) {
      title = "Cocktails | Velvet Pour";
      description =
        "Technique-forward cocktail recipes built for balance—repeatable at home.";
    } else if (
      route.site.key === "cocktails" &&
      route.type === "resources_index"
    ) {
      title = "Bar Resources | Velvet Pour";
      description =
        "Fundamentals, technique, and ingredient guides for better cocktails at home.";
    } else if (route.site.key === "cocktails" && route.type === "bars_index") {
      title = "Best Bars | Velvet Pour";
      description =
        "U.S. cocktail bars worth the trip—short notes for serious drinkers.";
    } else if (route.site.key === "cocktails" && route.type === "search") {
      title = "Search | Velvet Pour";
      description =
        "Search cocktails, bar resources, and best bars across Velvet Pour.";
    } else if (route.type === "content" && route.slug) {
      const uapCase = getUapCaseBySlug(route.slug);
      title = uapCase ? `${uapCase.title} | UAP Cases` : "UAP Cases";
      description =
        uapCase?.summary ||
        "Structured case analysis of UAP sightings, reports, and unexplained events.";
    } else if (route.site.key === "cocktails") {
      title = "Velvet Pour";
      description =
        "Award-inspired cocktails, techniques, and home bar guidance.";
    } else {
      title = "UAP Cases";
      description =
        "Structured case analysis of UAP sightings, reports, and unexplained events.";
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

  if (route.site.key === "cocktails") {
    return (
      <CocktailLayout>
        {route.type === "cocktails_home" && <HomePage />}
        {route.type === "cocktails_index" && <CocktailsIndexPage />}
        {route.type === "resources_index" && <ResourcesIndexPage />}
        {route.type === "bars_index" && <BarsIndexPage />}
        {route.type === "search" && <SearchPage />}
        {route.type === "recipe" && <CocktailRecipePage slug={route.slug} />}
        {route.type === "resource" && <CocktailResourcePage slug={route.slug} />}
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
