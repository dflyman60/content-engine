import { getAllCocktailResources } from "../utils/contentLoader";
import { withCocktailSite } from "../domains/cocktails/withCocktailSite";
import { trackEvent } from "@/lib/analytics";

const fontHeading = '"Raleway", sans-serif';
const fontBody = '"Roboto", sans-serif';
const maxContent = "1180px";

function getResourceImage(item) {
  const raw =
    item?.hero_image ??
    item?.heroImage ??
    item?.image ??
    item?.cover_image ??
    item?.coverImage ??
    item?.photo ??
    item?.thumbnail ??
    null;
  if (raw == null) return null;
  const s = typeof raw === "string" ? raw.trim() : "";
  return s.length > 0 ? s : null;
}

function summarySnippet(text, max = 130) {
  if (text == null) return "";
  const first = String(text).split(/\n\s*\n/)[0].trim();
  return first.length > max ? `${first.slice(0, max).trim()}…` : first;
}

function primaryCategory(item) {
  const tags = Array.isArray(item?.tags) ? item.tags : [];
  return tags.length > 0 ? String(tags[0]) : undefined;
}

export default function BarsIndexPage() {
  const items = getAllCocktailResources().filter((r) =>
    (r.tags || []).some((t) => String(t).toLowerCase() === "best bars"),
  );

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
            Best Cocktail Bars in the U.S.
          </h1>
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
            U.S. cocktail bars worth the trip — atmosphere, technique, and execution briefly noted.
          </p>
        </div>
      </section>

      <section
        style={{
          maxWidth: maxContent,
          margin: "0 auto",
          padding: "40px 24px 56px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {items.map((item) => {
            const img = getResourceImage(item);
            const blurb =
              summarySnippet(item.summary ?? item.subtitle ?? "", 130) ||
              summarySnippet(item.subtitle ?? "", 130);
            return (
              <a
                key={item.slug}
                href={withCocktailSite(`/resources/${item.slug}`)}
                onClick={() =>
                  trackEvent("recipe_click", {
                    recipe_name: item.title || item.slug,
                    target_title: item.title || item.slug,
                    target_path: `/resources/${item.slug}`,
                    content_type: "recipe",
                    content_category: "bars",
                    recipe_type: primaryCategory(item),
                    location: "list",
                    click_location: "list",
                  })
                }
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
                      alt=""
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
                <div style={{ padding: "14px 16px 18px" }}>
                  <div
                    style={{
                      fontFamily: fontHeading,
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#141414",
                      lineHeight: 1.35,
                      marginBottom: blurb ? "8px" : 0,
                    }}
                  >
                    {item.title}
                  </div>
                  {blurb ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: 300,
                        color: "#666",
                        lineHeight: 1.45,
                      }}
                    >
                      {blurb}
                    </p>
                  ) : null}
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
