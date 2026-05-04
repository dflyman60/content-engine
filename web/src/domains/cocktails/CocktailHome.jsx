import { getAllCocktailRecipes } from "../../utils/contentLoader";
import { withCocktailSite } from "./withCocktailSite";

export default function CocktailHome() {
  const recipes = getAllCocktailRecipes();

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px" }}>
      <h2>Velvet Pour Recipes</h2>
      <p>
        Award-inspired cocktail recipes, techniques, and home bar guidance.
      </p>

      <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
        {recipes.map((item) => (
          <a
            key={item.slug}
            href={withCocktailSite(`/drinks/${item.slug}`)}
            style={{
              display: "block",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
