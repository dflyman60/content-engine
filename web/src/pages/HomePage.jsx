import {
  getAllCocktailRecipes,
  getAllCocktailResources,
} from "../utils/contentLoader";
import { withCocktailSite } from "../domains/cocktails/withCocktailSite";

const fontHeading = '"Raleway", sans-serif';
const fontBody = '"Roboto", sans-serif';
const maxContent = "1180px";

const HERO_PLACEHOLDER = "/images/cocktails/home-hero.jpg";

function getRecipeImage(item) {
  const raw =
    item?.image ??
    item?.hero_image ??
    item?.photo ??
    item?.thumbnail ??
    null;
  if (raw == null) return null;
  const s = typeof raw === "string" ? raw.trim() : "";
  return s.length > 0 ? s : null;
}

export default function HomePage() {
  const recipes = getAllCocktailRecipes();
  const featured = recipes.slice(0, 8);
  const allResources = getAllCocktailResources();
  const learnItems = allResources
    .filter((r) => !(r.tags || []).some((t) => String(t).toLowerCase() === "best bars"))
    .slice(0, 3);

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
          .vp-home-pillar {
            flex: 1 1 260px;
            max-width: 360px;
            background: #fff;
            border: 1px solid #eaeaea;
            border-radius: 10px;
            padding: 20px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
            text-decoration: none;
            color: #141414;
            box-sizing: border-box;
          }
          @media (hover: hover) {
            .vp-home-pillar:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
            }
          }
        `}
      </style>

      {/* Hero — img eager-loads; gradient overlay separate from photo */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "420px",
          padding: "96px 24px",
          boxSizing: "border-box",
          backgroundColor: "#2a2520",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={HERO_PLACEHOLDER}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center calc(50% + 120px)",
            display: "block",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "640px" }}>
          <h1
            style={{
              fontFamily: fontHeading,
              fontWeight: 600,
              fontSize: "clamp(1.5rem, 4vw, 38px)",
              color: "#fff",
              margin: 0,
              letterSpacing: "0.3px",
              lineHeight: "1.2",
            }}
          >
            Better cocktails, without the noise.
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "16px",
              fontWeight: 300,
              color: "#fff",
              opacity: 0.9,
              fontFamily: fontBody,
            }}
          >
            Simple recipes. Real understanding. No fluff.
          </p>
        </div>
      </section>

      {/* Three pillars */}
      <section
        style={{
          maxWidth: maxContent,
          margin: "40px auto 0",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {[
            {
              key: "pillar-cocktails",
              href: "/cocktails",
              title: "Cocktails",
              body: "Technique-forward recipes you can repeat—built for balance, not theatre.",
            },
            {
              key: "pillar-resources",
              href: "/resources",
              title: "Bar Resources",
              body: "Ratios, ice, citrus, tools: the fundamentals that change how drinks taste.",
            },
            {
              key: "pillar-bars",
              href: "/bars",
              title: "Best Bars",
              body: "U.S. bars worth the trip—atmosphere and execution, briefly noted.",
            },
          ].map((block) => (
            <a key={block.key} href={withCocktailSite(block.href)} className="vp-home-pillar">
              <h2
                style={{
                  fontFamily: fontHeading,
                  fontSize: "15px",
                  fontWeight: 600,
                  margin: "0 0 6px",
                  letterSpacing: "0.02em",
                  color: "#111",
                }}
              >
                {block.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 300,
                  color: "#666",
                  fontFamily: fontBody,
                  lineHeight: 1.5,
                }}
              >
                {block.body}
              </p>
            </a>
          ))}
        </div>
      </section>

      <div
        aria-hidden
        style={{
          borderTop: "1px solid #eee",
          width: "60%",
          margin: "32px auto",
        }}
      />

      {/* Brand statement */}
      <p
        style={{
          textAlign: "center",
          maxWidth: "600px",
          margin: "40px auto",
          fontSize: "16px",
          color: "#444",
          fontFamily: fontBody,
          fontWeight: 300,
          lineHeight: "1.6",
          padding: "0 24px",
        }}
      >
        Most cocktail recipes are either overcomplicated or underexplained. This is neither.
      </p>

      {/* Featured cocktails */}
      <section
        style={{
          maxWidth: maxContent,
          margin: "0 auto",
          padding: "0 24px 48px",
        }}
      >
        <h2
          style={{
            fontFamily: fontHeading,
            fontWeight: 600,
            fontSize: "18px",
            margin: "40px 0 16px",
            color: "#141414",
            letterSpacing: "0.02em",
          }}
        >
          Cocktails Worth Making
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {featured.map((item) => {
            const img = getRecipeImage(item);
            return (
              <a
                key={item.slug}
                href={withCocktailSite(`/drinks/${item.slug}`)}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #ebebeb",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    aspectRatio: "16 / 10",
                    position: "relative",
                    overflow: "hidden",
                    background: "#ececec",
                  }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`${item.title} — recipe image`}
                      loading="lazy"
                      decoding="async"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : null}
                </div>
                <div style={{ padding: "0 16px 16px" }}>
                  <div
                    style={{
                      fontFamily: fontHeading,
                      fontWeight: 500,
                      fontSize: "15px",
                      color: "#141414",
                      lineHeight: "1.5",
                      marginTop: "10px",
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Learn */}
      <section
        style={{
          maxWidth: maxContent,
          margin: "0 auto",
          padding: "0 24px 56px",
        }}
      >
        <h2
          style={{
            fontFamily: fontHeading,
            fontSize: "1.125rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#555",
            margin: "0 0 14px",
          }}
        >
          Learn
        </h2>
        <ul
          style={{
            margin: 0,
            padding: "0 0 0 1.1em",
            fontFamily: fontBody,
            fontSize: "0.9375rem",
            color: "#333",
          }}
        >
          {learnItems.map((r) => (
            <li key={r.slug} style={{ marginBottom: "10px" }}>
              <a
                href={withCocktailSite(`/resources/${r.slug}`)}
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {r.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
