import { Fragment, useState } from "react";
import {
  getAllCocktailRecipes,
  getCocktailRecipeBySlug,
  getCocktailResourceBySlug,
} from "../../utils/contentLoader";
import CocktailSidebar from "./components/CocktailSidebar";
import { withCocktailSite } from "./withCocktailSite";
import { trackEvent } from "@/lib/analytics";

const velvet = {
  fontHeading: '"Raleway", sans-serif',
  fontBody: '"Roboto", sans-serif',
  bg: "#fafafa",
  bgSoft: "#f5f5f5",
  surface: "#ffffff",
  border: "#e8e8e8",
  borderStrong: "#dddddd",
  text: "#141414",
  body: "#333333",
  muted: "#3d3d3d",
  mutedStrong: "#1a1a1a",
  mutedSoft: "#6b6b6b",
  accent: "#b45309",
  navBand: "#161616",
  navBandMuted: "rgba(255,255,255,0.72)",
  proseMax: "680px",
  bodyLineHeight: 1.7,
  heroFallbackGradient:
    "linear-gradient(155deg, #fffbf5 0%, #fef3e7 38%, #f7e8d8 72%, #efe2d6 100%)",
  heroFallbackGlow:
    "radial-gradient(ellipse 85% 65% at 72% 28%, rgba(251, 191, 36, 0.18) 0%, transparent 52%)",
  heroGlassStroke: "#9a3412",
  heroImageShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
};

function getHeroImageSrc(data) {
  const raw =
    data?.hero_image ??
    data?.heroImage ??
    data?.image ??
    data?.cover_image ??
    data?.coverImage ??
    null;
  if (raw == null) return null;
  const s = typeof raw === "string" ? raw.trim() : "";
  return s.length > 0 ? s : null;
}

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function isOutboundHref(href) {
  if (!href || !/^https?:\/\//i.test(href)) return false;
  try {
    const target = new URL(href, window.location.origin);
    return target.hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

function editorialParagraphs(body) {
  return String(body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function normalizeSections(data) {
  return safeArr(data?.sections)
    .map((block, i) => {
      if (typeof block === "string") {
        return { key: `sec-${i}`, title: null, body: block };
      }
      const title = block?.title ?? block?.heading ?? null;
      const body = block?.body ?? block?.content ?? block?.text ?? "";
      if (!String(body).trim() && !title) return null;
      return { key: `sec-${i}`, title, body };
    })
    .filter(Boolean);
}

function resolveSidebarAnchorSlug(resource) {
  for (const entry of safeArr(resource?.related)) {
    const s = typeof entry === "string" ? entry.trim() : "";
    if (s && getCocktailRecipeBySlug(s)) return s;
  }
  if (getCocktailRecipeBySlug("old-fashioned")) return "old-fashioned";
  const first = getAllCocktailRecipes()[0];
  return first?.slug ?? "old-fashioned";
}

function relatedRecipesFromResource(resource) {
  return safeArr(resource?.related)
    .map((entry) => {
      const slug = typeof entry === "string" ? entry.trim() : "";
      return slug ? getCocktailRecipeBySlug(slug) : null;
    })
    .filter(Boolean);
}

function AdSlot({ label }) {
  return (
    <div
      aria-hidden="true"
      style={{
        border: "1px dashed #ddd",
        borderRadius: "10px",
        padding: "16px",
        margin: "24px 0",
        textAlign: "center",
        fontSize: "12px",
        lineHeight: velvet.bodyLineHeight,
        color: "#999",
        background: "#fafafa",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {label}
    </div>
  );
}

function HeroFallback({ idSuffix }) {
  const gid = `vp-res-hero-${idSuffix}`;
  return (
    <div
      role="img"
      aria-label="Article feature visual"
      style={{
        margin: "0 0 16px",
        borderRadius: "11px",
        overflow: "hidden",
        border: `1px solid ${velvet.border}`,
        background: velvet.heroFallbackGradient,
        width: "100%",
        maxHeight: "420px",
        aspectRatio: "16 / 9",
        minHeight: "200px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: velvet.heroImageShadow,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: velvet.heroFallbackGlow,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "42%",
          background:
            "linear-gradient(0deg, rgba(180, 83, 9, 0.07) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <svg
        width="200"
        height="168"
        viewBox="0 0 200 168"
        aria-hidden
        style={{ position: "relative", zIndex: 1 }}
      >
        <defs>
          <linearGradient id={gid} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fff7ed" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <ellipse cx="145" cy="38" rx="22" ry="14" fill="rgba(251, 191, 36, 0.35)" />
        <path
          d="M52 28h96l-18 96H70L52 28z"
          fill={`url(#${gid})`}
          stroke={velvet.heroGlassStroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M64 40h72"
          fill="none"
          stroke={velvet.heroGlassStroke}
          strokeWidth="1.5"
          opacity="0.45"
        />
        <path
          d="M100 124v20M78 144h44"
          fill="none"
          stroke={velvet.heroGlassStroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function CocktailResourcePage({ slug }) {
  const data = getCocktailResourceBySlug(slug);
  const [heroFailed, setHeroFailed] = useState(false);

  if (!data) {
    return (
      <main
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: "32px 24px",
          minHeight: "100vh",
          background: velvet.bg,
          color: velvet.body,
          fontFamily: velvet.fontBody,
          lineHeight: velvet.bodyLineHeight,
        }}
      >
        <h2 style={{ fontFamily: velvet.fontHeading, fontWeight: 600 }}>
          Resource not found
        </h2>
        <a href={withCocktailSite("/resources")} style={{ color: velvet.accent, fontWeight: 500 }}>
          Back to bar resources
        </a>
      </main>
    );
  }

  const heroSrc = getHeroImageSrc(data);
  const showHeroImage = Boolean(heroSrc) && !heroFailed;
  const tags = safeArr(data.tags);
  const isBestBarPage = tags.some(
    (t) => String(t).toLowerCase() === "best bars",
  );
  const categoryBackHref = isBestBarPage
    ? withCocktailSite("/bars")
    : withCocktailSite("/resources");
  const categoryBackLabel = isBestBarPage ? "← Best Bars" : "← Bar Resources";
  const sectionBlocks = normalizeSections(data);
  const relatedRecipes = relatedRecipesFromResource(data);
  const sidebarAnchor = resolveSidebarAnchorSlug(data);
  const sidebarRecipe =
    getCocktailRecipeBySlug(sidebarAnchor) ?? getAllCocktailRecipes()[0];
  const gradientId = String(data.slug || slug || "resource").replace(/[^a-zA-Z0-9_-]/g, "") || "resource";

  return (
    <main
      onClickCapture={(e) => {
        const anchor = e.target.closest ? e.target.closest("a[href]") : null;
        if (!anchor) return;
        const href = anchor.getAttribute("href") || "";
        if (isOutboundHref(href)) {
          trackEvent("outbound_click", {
            target_title: anchor.textContent?.trim() || href,
            target_path: href,
            content_type: "external",
            content_category: "external",
            click_location: "article",
          });
        }
      }}
      style={{
        minHeight: "100vh",
        position: "relative",
        background: velvet.bg,
        color: velvet.body,
        fontFamily: velvet.fontBody,
        lineHeight: velvet.bodyLineHeight,
      }}
    >
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600&family=Roboto:wght@300;400;500&display=swap");
          .vp-recipe-layout {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 40px 36px;
          }
          .vp-recipe-main {
            flex: 1 1 480px;
            min-width: 0;
            max-width: 680px;
            color: #333;
            font-family: "Roboto", sans-serif;
            line-height: ${velvet.bodyLineHeight};
          }
          .vp-recipe-sidebar {
            flex: 0 0 300px;
            width: 300px;
            max-width: 100%;
            line-height: ${velvet.bodyLineHeight};
          }
          @media (max-width: 960px) {
            .vp-recipe-layout {
              flex-direction: column;
            }
            .vp-recipe-sidebar {
              flex-basis: auto;
              width: 100%;
            }
          }
          .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
        `}
      </style>

      <div
        style={{
          background: velvet.navBand,
          color: "#fff",
          borderBottom: `3px solid ${velvet.accent}`,
        }}
      >
        <div
          style={{
            maxWidth: "min(100%, 1180px)",
            margin: "0 auto",
            padding: "12px 22px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "12px",
          }}
        >
          <a
            href={categoryBackHref}
            onClick={() =>
              trackEvent("nav_click", {
                nav_item: String(categoryBackLabel || "Back").replace(/^←\s*/, ""),
                target_title: String(categoryBackLabel || "Back").replace(/^←\s*/, ""),
                target_path: isBestBarPage ? "/bars" : "/resources",
                content_type: "navigation",
                content_category: "navigation",
                click_location: "header",
              })
            }
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {categoryBackLabel}
          </a>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "min(100%, 1180px)",
          margin: "0 auto",
          padding: "36px 22px 80px",
        }}
      >
        <div className="vp-recipe-layout">
          <div className="vp-recipe-main">
            <header
              style={{
                marginBottom: "22px",
                paddingBottom: "14px",
                borderBottom: `1px solid ${velvet.border}`,
              }}
            >
              <h1
                style={{
                  fontFamily: velvet.fontHeading,
                  fontWeight: 600,
                  fontSize: "clamp(2.375rem, 5vw, 2.625rem)",
                  lineHeight: 1.2,
                  margin: 0,
                  letterSpacing: "-0.02em",
                  color: velvet.text,
                }}
              >
                {data.title ?? "Resource"}
              </h1>
              {data.subtitle != null && String(data.subtitle).trim() !== "" ? (
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: "clamp(1.05rem, 2vw, 1.2rem)",
                    fontWeight: 400,
                    color: velvet.muted,
                    fontFamily: velvet.fontBody,
                    lineHeight: velvet.bodyLineHeight,
                    maxWidth: velvet.proseMax,
                  }}
                >
                  {data.subtitle}
                </p>
              ) : null}
            </header>

            {showHeroImage ? (
              <>
                <figure
                  style={{
                    margin: "0 0 16px",
                    borderRadius: "11px",
                    overflow: "hidden",
                    border: `1px solid ${velvet.border}`,
                    boxShadow: velvet.heroImageShadow,
                  }}
                >
                  <img
                    src={heroSrc}
                    alt={
                      data.title ? `${data.title} — featured image` : "Article image"
                    }
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => setHeroFailed(true)}
                    style={{
                      width: "100%",
                      maxHeight: "420px",
                      height: "auto",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                </figure>
                {data.image != null && String(data.image).trim() !== "" ? (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      textAlign: "right",
                      marginTop: "6px",
                    }}
                  >
                    Representative interior image
                  </div>
                ) : null}
              </>
            ) : (
              <HeroFallback idSuffix={gradientId} />
            )}

            <AdSlot label="Ad slot — top (728x90 / responsive)" />

            <div style={{ marginBottom: "32px" }}>
              {data.summary != null && String(data.summary).trim() !== "" ? (
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: "1rem",
                    lineHeight: velvet.bodyLineHeight,
                    color: velvet.body,
                    maxWidth: velvet.proseMax,
                    fontWeight: 300,
                    fontFamily: velvet.fontBody,
                  }}
                >
                  {data.summary}
                </p>
              ) : null}

              {tags.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop:
                      data.summary != null && String(data.summary).trim() !== ""
                        ? "12px"
                        : 0,
                  }}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "6px 10px",
                        border: "none",
                        borderRadius: "999px",
                        fontSize: "12px",
                        letterSpacing: "0.02em",
                        color: velvet.mutedSoft,
                        fontWeight: 500,
                        background: "#f4f4f4",
                        fontFamily: velvet.fontBody,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {sectionBlocks.length > 0 ? (
              <div style={{ marginBottom: "40px" }}>
                {sectionBlocks.map((block, index) => (
                  <Fragment key={block.key}>
                    <article
                      style={{
                        maxWidth: velvet.proseMax,
                        marginBottom:
                          index < sectionBlocks.length - 1 ? "36px" : 0,
                        paddingBottom:
                          index < sectionBlocks.length - 1 ? "36px" : 0,
                        borderBottom:
                          index < sectionBlocks.length - 1
                            ? `1px solid ${velvet.border}`
                            : "none",
                      }}
                    >
                      {block.title ? (
                        <h2
                          style={{
                            fontFamily: velvet.fontHeading,
                            fontSize: "clamp(1.375rem, 2vw, 1.5rem)",
                            fontWeight: 500,
                            margin: "0 0 10px",
                            color: velvet.mutedStrong,
                            lineHeight: velvet.bodyLineHeight,
                            letterSpacing: "0.3px",
                          }}
                        >
                          {block.title}
                        </h2>
                      ) : null}
                      {editorialParagraphs(block.body).map((para, pi, paras) => (
                        <p
                          key={`${block.key}-p-${pi}`}
                          style={{
                            margin: "0",
                            marginBottom: pi < paras.length - 1 ? "16px" : "0",
                            fontSize: "1rem",
                            lineHeight: velvet.bodyLineHeight,
                            color: velvet.body,
                            fontWeight: 300,
                            fontFamily: velvet.fontBody,
                          }}
                        >
                          {para}
                        </p>
                      ))}
                    </article>
                    {index < sectionBlocks.length - 1 ? (
                      <AdSlot label="Ad slot — between sections" />
                    ) : null}
                  </Fragment>
                ))}
              </div>
            ) : null}

            <AdSlot label="Affiliate slot — bar tools / glassware" />

            {relatedRecipes.length > 0 ? (
              <section style={{ marginTop: "48px" }}>
                <h2
                  style={{
                    fontFamily: velvet.fontHeading,
                    fontSize: "clamp(1.375rem, 2vw, 1.5rem)",
                    fontWeight: 600,
                    margin: "0 0 20px",
                    letterSpacing: "0.3px",
                    color: velvet.text,
                    paddingBottom: "12px",
                    borderBottom: `1px solid ${velvet.border}`,
                    lineHeight: velvet.bodyLineHeight,
                  }}
                >
                  Related recipes
                </h2>
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    gridTemplateColumns: "1fr",
                  }}
                >
                  {relatedRecipes.map((item) => (
                    <a
                      key={item.slug}
                      href={withCocktailSite(`/drinks/${item.slug}`)}
                      onClick={() =>
                        trackEvent("next_article_click", {
                          current_article: data.title ?? slug,
                          current_title: data.title ?? slug,
                          next_article: item.title ?? item.slug,
                          target_title: item.title ?? item.slug,
                          target_path: `/drinks/${item.slug}`,
                          content_type: "recipe",
                          content_category: isBestBarPage ? "bars" : "resources",
                          click_location: "related",
                        })
                      }
                      style={{
                        display: "block",
                        padding: "16px 18px",
                        borderRadius: "6px",
                        border: `1px solid ${velvet.border}`,
                        background: "#fff",
                        textDecoration: "none",
                        color: velvet.text,
                        transition: "border-color 0.15s",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "1.0625rem",
                          fontWeight: 500,
                          fontFamily: velvet.fontHeading,
                          letterSpacing: "0.3px",
                        }}
                      >
                        {item.title}
                      </strong>
                      {item.summary != null && item.summary !== "" ? (
                        <span
                          style={{
                            fontSize: "0.9375rem",
                            color: velvet.mutedSoft,
                            lineHeight: velvet.bodyLineHeight,
                            fontFamily: velvet.fontBody,
                            fontWeight: 300,
                          }}
                        >
                          {String(item.summary).replace(/\s+/g, " ").slice(0, 180)}
                          {String(item.summary).length > 180 ? "…" : ""}
                        </span>
                      ) : null}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <CocktailSidebar
            sidebarRecipeSlug={sidebarRecipe?.slug ?? sidebarAnchor}
            omitHref={`/resources/${slug}`}
          />
        </div>
      </div>
    </main>
  );
}
