import { searchContent } from "../utils/searchContent";
import { withCocktailSite } from "../domains/cocktails/withCocktailSite";

const fontHeading = '"Raleway", sans-serif';
const fontBody = '"Roboto", sans-serif';
const maxContent = "1180px";

function getQueryFromLocation() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
}

function groupResults(flat) {
  const groups = { cocktail: [], resource: [], bar: [] };
  for (const item of flat) {
    if (item.type === "cocktail") groups.cocktail.push(item);
    else if (item.type === "resource") groups.resource.push(item);
    else if (item.type === "bar") groups.bar.push(item);
  }
  return groups;
}

function ResultRow({ item }) {
  return (
    <a
      href={withCocktailSite(item.href)}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        border: "1px solid #ebebeb",
        borderRadius: "8px",
        padding: "16px 18px",
        background: "#fff",
        marginBottom: "12px",
        transition: "box-shadow 0.15s ease",
      }}
    >
      <div
        style={{
          fontFamily: fontHeading,
          fontWeight: 600,
          fontSize: "16px",
          color: "#141414",
          lineHeight: 1.35,
          marginBottom: item.summary ? "6px" : 0,
        }}
      >
        {item.title}
      </div>
      {item.summary ? (
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 300,
            color: "#666",
            lineHeight: 1.5,
          }}
        >
          {item.summary}
        </p>
      ) : null}
    </a>
  );
}

function Section({ title, items }) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginBottom: "36px" }}>
      <h2
        style={{
          fontFamily: fontHeading,
          fontSize: "1.125rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#555",
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      <div>
        {items.map((item) => (
          <ResultRow key={`${item.type}-${item.slug}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  const q = getQueryFromLocation();
  const flat = q ? searchContent(q) : [];
  const grouped = groupResults(flat);
  const hasQuery = q.length > 0;
  const hasResults = flat.length > 0;

  return (
    <main
      style={{
        fontFamily: fontBody,
        color: "#141414",
        lineHeight: 1.6,
        background: "#fafafa",
      }}
    >
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600&family=Roboto:wght@300;400;500&display=swap");
        `}
      </style>

      <section
        style={{
          width: "100%",
          backgroundColor: "#2a2520",
          color: "#fff",
          padding: "56px 24px 48px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: maxContent, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: fontHeading,
              fontWeight: 600,
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              margin: 0,
              letterSpacing: "0.02em",
              lineHeight: 1.2,
            }}
          >
            Search Results
          </h1>
          {hasQuery ? (
            <p
              style={{
                margin: "14px 0 0",
                fontSize: "16px",
                fontWeight: 300,
                opacity: 0.92,
                maxWidth: "720px",
                lineHeight: 1.55,
              }}
            >
              <span style={{ opacity: 0.85 }}>Query:</span> {q}
            </p>
          ) : (
            <p
              style={{
                margin: "14px 0 0",
                fontSize: "16px",
                fontWeight: 300,
                opacity: 0.92,
                maxWidth: "720px",
                lineHeight: 1.55,
              }}
            >
              Enter a search term above.
            </p>
          )}
        </div>
      </section>

      <section
        style={{
          maxWidth: maxContent,
          margin: "0 auto",
          padding: "40px 24px 56px",
        }}
      >
        {!hasQuery ? null : !hasResults ? (
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#555",
              fontWeight: 400,
            }}
          >
            No results found.
          </p>
        ) : (
          <>
            <Section title="Cocktails" items={grouped.cocktail} />
            <Section title="Bar Resources" items={grouped.resource} />
            <Section title="Best Bars" items={grouped.bar} />
          </>
        )}
      </section>
    </main>
  );
}
