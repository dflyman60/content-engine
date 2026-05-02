import {
  getCocktailRecipeBySlug,
  getRelatedCocktailRecipes,
} from "../../utils/contentLoader";

export default function CocktailRecipePage({ slug }) {
  const data = getCocktailRecipeBySlug(slug);

  if (!data) {
    return (
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "32px" }}>
        <h2>Recipe not found</h2>
        <a href="/?site=cocktails">Back to recipes</a>
      </main>
    );
  }

  const related = getRelatedCocktailRecipes(data);

  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "32px" }}>
      <a href="/?site=cocktails">← Back to recipes</a>

      <h2>{data.title}</h2>
      <p>{data.summary}</p>

      {data.tags?.length > 0 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {data.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "999px",
                fontSize: "12px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <section style={{ marginTop: "28px" }}>
        <h3>Ingredients</h3>
        <ul>
          {data.ingredients.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "28px" }}>
        <h3>Method</h3>
        <ol>
          {data.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      {data.notes && (
        <section style={{ marginTop: "28px" }}>
          <h3>Notes</h3>
          <p>{data.notes}</p>
        </section>
      )}

      {related.length > 0 && (
        <section style={{ marginTop: "40px" }}>
          <h3>Try next</h3>

          <div style={{ display: "grid", gap: "12px" }}>
            {related.map((item) => (
              <a
                key={item.slug}
                href={`/drinks/${item.slug}?site=cocktails`}
                style={{
                  display: "block",
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
