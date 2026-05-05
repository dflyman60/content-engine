import { Fragment } from "react";
import {
  getCocktailRecipeBySlug,
  getCocktailResourceBySlug,
  getRelatedCocktailRecipes,
} from "../../utils/contentLoader";
import CocktailSidebar from "./components/CocktailSidebar";
import { withCocktailSite } from "./withCocktailSite";
import { trackEvent } from "@/lib/analytics";

/** Recipe-blog article: Raleway headers, Roboto body (main column only). */
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
  accentSoft: "rgba(180, 83, 9, 0.1)",
  accentLine: "rgba(180, 83, 9, 0.45)",
  navBand: "#161616",
  navBandMuted: "rgba(255,255,255,0.72)",
  btnPrimary: "#0f0f0f",
  btnSecondaryBg: "#ffffff",
  btnSecondaryBorder: "#ebebeb",
  proseMax: "680px",
  /** Main column body copy — matches homepage editorial rhythm */
  bodyLineHeight: 1.6,
  quickMixWarm: "#faf7f2",
  quickMixBorder: "rgba(180, 83, 9, 0.14)",
  adSurface: "#f5f5f5",
  adBorder: "#e8e8e8",
  heroFallbackGradient:
    "linear-gradient(155deg, #fffbf5 0%, #fef3e7 38%, #f7e8d8 72%, #efe2d6 100%)",
  heroFallbackGlow:
    "radial-gradient(ellipse 85% 65% at 72% 28%, rgba(251, 191, 36, 0.18) 0%, transparent 52%)",
  heroGlassStroke: "#9a3412",
  heroImageShadow: "0 10px 22px rgba(0, 0, 0, 0.08)",
  recipeCardShadow:
    "0 3px 10px rgba(0, 0, 0, 0.12), 0 14px 40px rgba(0, 0, 0, 0.15), 0 28px 56px rgba(0, 0, 0, 0.1)",
  articleFeatureShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
  sidebarCardBg: "#fafafa",
  sidebarCardBorder: "#ececec",
  sidebarHeader: "#1a1a1a",
  linkBlue: "#2563eb",
  reviewBadgeBorder: "#22c55e",
};

function getHeroImageSrc(data) {
  const raw =
    data?.hero_image ??
    data?.heroImage ??
    data?.image ??
    data?.cover_image ??
    data?.coverImage ??
    data?.photo ??
    data?.thumbnail ??
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

/**
 * Prototype: turn `related` slugs into links for /drinks/gin-and-tonic only.
 * Recipe slug wins if both exist; resources use /resources/{slug}. Skips unknowns.
 */
function resolveGinTonicLearnMore(pageSlug, relatedRaw) {
  if (pageSlug !== "gin-and-tonic") return [];
  const out = [];
  for (const entry of safeArr(relatedRaw)) {
    const s = typeof entry === "string" ? entry.trim() : "";
    if (!s) continue;
    const recipe = getCocktailRecipeBySlug(s);
    if (recipe?.slug) {
      const raw = recipe.summary ?? "";
      const normalized =
        raw != null && String(raw).trim() !== ""
          ? String(raw).replace(/\s+/g, " ").trim()
          : "";
      const truncated =
        normalized.length > 200 ? `${normalized.slice(0, 200)}…` : normalized;
      out.push({
        key: `r-${recipe.slug}`,
        href: `/drinks/${recipe.slug}`,
        title: recipe.title != null ? String(recipe.title) : recipe.slug,
        summary: truncated,
      });
      continue;
    }
    const resource = getCocktailResourceBySlug(s);
    if (resource?.slug) {
      const raw = resource.summary ?? "";
      const normalized =
        raw != null && String(raw).trim() !== ""
          ? String(raw).replace(/\s+/g, " ").trim()
          : "";
      const truncated =
        normalized.length > 200 ? `${normalized.slice(0, 200)}…` : normalized;
      out.push({
        key: `res-${resource.slug}`,
        href: `/resources/${resource.slug}`,
        title: resource.title != null ? String(resource.title) : resource.slug,
        summary: truncated,
      });
    }
  }
  return out;
}

function normalizeQuickMix(data) {
  const q = data?.quick_mix ?? data?.quickMix ?? data?.quick_mix_preview;
  if (q == null) return null;
  if (typeof q === "string") {
    return { headline: null, lines: [q], badges: [] };
  }
  if (typeof q === "object") {
    return {
      headline: q.headline ?? q.title ?? null,
      lines: safeArr(q.lines ?? q.bullets),
      badges: safeArr(q.badges ?? q.tags),
    };
  }
  return null;
}

function normalizeEditorial(data) {
  const raw =
    data?.editorial_sections ??
    data?.editorialSections ??
    data?.editorial ??
    data?.drip_sections ??
    [];
  const list = safeArr(raw);
  return list
    .map((block, i) => {
      if (typeof block === "string") {
        return { key: `ed-${i}`, title: null, body: block };
      }
      const title = block?.title ?? block?.heading ?? block?.headline ?? null;
      const body = block?.body ?? block?.content ?? block?.text ?? "";
      if (!String(body).trim() && !title) return null;
      return { key: `ed-${i}`, title, body };
    })
    .filter(Boolean);
}

/** Split editorial body on blank lines for multiple paragraphs. */
function editorialParagraphs(body) {
  return String(body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
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

const PROFILE_SCALE_MAX = 10;

/** Prototype defaults when JSON `profile` is absent (see gin-and-tonic). */
const PROFILE_DEFAULTS_BY_SLUG = {
  "gin-and-tonic": { strength: 4, taste: 3 },
};

function clampProfileScale(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return null;
  return Math.max(0, Math.min(PROFILE_SCALE_MAX, Math.round(n)));
}

/**
 * Future: `data.profile.strength` / `data.profile.taste` (0–10).
 * Falls back to slug-based defaults, then a neutral midpoint.
 */
function resolveStrengthTasteProfile(data, slug) {
  const profile =
    data?.profile != null && typeof data.profile === "object" ? data.profile : null;
  const sRaw = profile?.strength;
  const tRaw = profile?.taste;
  const fromJson = {
    strength: clampProfileScale(sRaw != null ? Number(sRaw) : NaN),
    taste: clampProfileScale(tRaw != null ? Number(tRaw) : NaN),
  };
  const fallback =
    PROFILE_DEFAULTS_BY_SLUG[String(slug || "").trim()] ?? {
      strength: 5,
      taste: 5,
    };
  return {
    strengthValue:
      fromJson.strength != null ? fromJson.strength : fallback.strength,
    tasteValue: fromJson.taste != null ? fromJson.taste : fallback.taste,
  };
}

function CompactScaleTrack({ value, leftLabel, midLabel, rightLabel }) {
  const ticks = [];
  for (let i = 0; i <= PROFILE_SCALE_MAX; i += 1) {
    ticks.push(i);
  }
  return (
    <div
      className="vp-profile-compact-scale"
      style={{
        minWidth: 0,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "12px",
          marginBottom: "4px",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "3px",
            right: "3px",
            top: 0,
            bottom: 0,
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: "1px",
              marginTop: "-0.5px",
              background: "#d8d8d8",
            }}
          />
          {ticks.map((i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                left: `${(i / PROFILE_SCALE_MAX) * 100}%`,
                top: "50%",
                width: "1px",
                height: "3px",
                marginTop: "-1.5px",
                marginLeft: "-0.5px",
                background: "#c4c4c4",
                transform: "translateX(-50%)",
              }}
            />
          ))}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: `${(value / PROFILE_SCALE_MAX) * 100}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#222",
              border: "1px solid #fff",
              boxShadow: "0 0 0 1px #999",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
      <div className="vp-profile-compact-labels">
        <span>{leftLabel}</span>
        <span>{midLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function StrengthTasteGuide({ strengthValue, tasteValue }) {
  return (
    <section
      aria-label={`Strength ${strengthValue} of ${PROFILE_SCALE_MAX}, taste ${tasteValue} of ${PROFILE_SCALE_MAX}`}
      style={{
        marginTop: "14px",
        marginBottom: "16px",
        padding: "12px 14px",
        border: "1px solid #e6e6e6",
        borderRadius: "12px",
        background: "#fff",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3
        style={{
          fontFamily: velvet.fontHeading,
          fontWeight: 600,
          fontSize: "12px",
          margin: "0 0 8px",
          color: velvet.text,
          letterSpacing: "0.02em",
        }}
      >
        Strength & Taste
      </h3>
      <div className="vp-profile-compact-grid">
        <div className="vp-profile-compact-row-label">Strength</div>
        <CompactScaleTrack
          value={strengthValue}
          leftLabel="Light"
          midLabel="Medium"
          rightLabel="Boozy"
        />
        <div className="vp-profile-compact-row-label">Taste</div>
        <CompactScaleTrack
          value={tasteValue}
          leftLabel="Dry / Bitter"
          midLabel="Balanced"
          rightLabel="Sweet"
        />
      </div>
    </section>
  );
}

export default function CocktailRecipePage({ slug }) {
  const data = getCocktailRecipeBySlug(slug);

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
        <h2 style={{ fontFamily: velvet.fontHeading, fontWeight: 600 }}>Recipe not found</h2>
        <a href={withCocktailSite("/cocktails")} style={{ color: velvet.accent, fontWeight: 500 }}>
          Back to recipes
        </a>
      </main>
    );
  }

  const heroSrc = getHeroImageSrc(data);
  const related = getRelatedCocktailRecipes(data);
  const learnMoreLinks = resolveGinTonicLearnMore(slug, data.related);
  const ingredients = safeArr(data.ingredients);
  const steps = safeArr(data.steps);
  const tags = safeArr(data.tags);
  const quickMix = normalizeQuickMix(data);
  const editorialBlocks = normalizeEditorial(data);
  const hasSummary = data.summary != null && data.summary !== "";
  const { strengthValue, tasteValue } = resolveStrengthTasteProfile(data, slug);

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
        overflowX: "clip",
      }}
    >
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600&family=Roboto:wght@300;400;500&display=swap");
          .vp-recipe-layout {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 44px 40px;
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
            font-family: "Roboto", sans-serif;
            color: #333;
          }
          @media (max-width: 960px) {
            .vp-recipe-layout {
              flex-direction: column;
              gap: 36px;
            }
            .vp-recipe-sidebar {
              flex-basis: auto;
              width: 100%;
            }
          }
          @media print {
            .vp-recipe-sidebar {
              display: none !important;
            }
            #recipe {
              box-shadow: none !important;
              border: 1px solid #bbb !important;
              break-inside: avoid;
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
          .vp-recipe-print {
            transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          }
          @media (hover: hover) {
            .vp-recipe-print:hover {
              background-color: #fafafa !important;
              border-color: #e0e0e0 !important;
            }
            .vp-recipe-jump:hover {
              background-color: #1a1a1a !important;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
            }
          }
          /* Inline resource links in editorial JSON — subtle, no default link chrome */
          .vp-editorial-inline a {
            text-decoration: none !important;
            color: inherit !important;
            font-weight: inherit !important;
          }
          .vp-editorial-inline a span {
            font-size: 9px !important;
            margin-left: 1px !important;
            position: relative !important;
            top: -6px !important;
            opacity: 0.5 !important;
            letter-spacing: -1px !important;
          }
          @media (max-width: 520px) {
            .vp-recipe-title {
              font-size: 32px !important;
              line-height: 1.1 !important;
            }
          }
          .vp-profile-compact-grid {
            display: grid;
            grid-template-columns: 84px 1fr;
            gap: 6px 12px;
            align-items: center;
            width: 100%;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
          }
          .vp-profile-compact-row-label {
            font-size: 11px;
            font-weight: 500;
            color: #666;
            font-family: "Roboto", sans-serif;
            letter-spacing: 0.02em;
            min-width: 0;
          }
          .vp-profile-compact-labels {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 4px;
            font-size: 10px;
            color: #888;
            line-height: 1.25;
            font-family: "Roboto", sans-serif;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .vp-profile-compact-labels span {
            flex: 1 1 0;
            min-width: 0;
            text-align: center;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          @media (min-width: 520px) {
            .vp-profile-compact-labels {
              font-size: 11px;
              gap: 6px;
            }
          }
          @media (max-width: 480px) {
            .vp-profile-compact-grid {
              grid-template-columns: 1fr;
              gap: 6px;
            }
            .vp-profile-compact-row-label {
              margin-bottom: -2px;
            }
            .vp-profile-compact-labels {
              font-size: 10px;
              gap: 3px;
            }
          }
          .vp-recipe-card-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 28px;
            align-items: start;
          }
          .vp-recipe-card-col-heading {
            font-family: "Raleway", sans-serif;
            font-size: 13px;
            font-weight: 700;
            margin: 0 0 14px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #141414;
          }
          .vp-recipe-card-header {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 8px;
            padding-bottom: 14px;
            border-bottom: 1px solid #e8e8e8;
          }
          .vp-recipe-card-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }
          .vp-recipe-card-action {
            font-family: "Roboto", sans-serif;
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            padding: 6px 12px;
            border-radius: 999px;
            border: 1px solid #e5e5e5;
            background: #fafafa;
            color: #555;
            cursor: default;
            transition: background-color 0.15s ease, border-color 0.15s ease;
          }
          @media (hover: hover) {
            .vp-recipe-card-action:hover {
              background: #f3f3f3;
              border-color: #ddd;
            }
          }
          .vp-recipe-card-instructions {
            border-left: 1px solid #eee;
            padding-left: 24px;
          }
          .vp-recipe-card-ingredients-list {
            margin: 0;
            padding-left: 1.25em;
            line-height: 1.7;
            color: #333;
            font-size: 1rem;
            font-family: "Roboto", sans-serif;
            font-weight: 400;
          }
          .vp-recipe-card-ingredients-list li {
            margin-bottom: 10px;
          }
          .vp-recipe-card-ingredients-list li:last-child {
            margin-bottom: 0;
          }
          .vp-recipe-card-steps-list {
            list-style: none;
            margin: 0;
            padding: 0;
            counter-reset: vp-step;
            color: #333;
            font-size: 1rem;
            font-family: "Roboto", sans-serif;
            font-weight: 400;
          }
          .vp-recipe-card-steps-list li {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            line-height: 1.7;
            margin-bottom: 14px;
          }
          .vp-recipe-card-steps-list li:last-child {
            margin-bottom: 0;
          }
          .vp-recipe-card-steps-list li::before {
            counter-increment: vp-step;
            content: counter(vp-step);
            flex-shrink: 0;
            width: 26px;
            height: 26px;
            margin-top: 1px;
            border-radius: 50%;
            background: #f7f7f7;
            border: 1px solid #e8e8e8;
            color: #666;
            font-size: 12px;
            font-weight: 600;
            line-height: 1;
            font-family: "Roboto", sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @media (max-width: 768px) {
            .vp-recipe-card-grid {
              grid-template-columns: 1fr;
            }
            .vp-recipe-card-instructions {
              border-left: none;
              padding-left: 0;
            }
          }
          @media print {
            .vp-recipe-card-grid {
              grid-template-columns: 1fr;
            }
            .vp-recipe-card-instructions {
              border-left: none;
              padding-left: 0;
            }
            .vp-recipe-card-actions {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Full-width article / nav band */}
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
            href={withCocktailSite("/cocktails")}
            onClick={() =>
              trackEvent("nav_click", {
                nav_item: "Cocktails",
                target_title: "Cocktails",
                target_path: "/cocktails",
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
            ← Cocktails
          </a>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "min(100%, 1180px)",
          margin: "0 auto",
          padding: "40px 22px 80px",
          boxSizing: "border-box",
        }}
      >
        <div className="vp-recipe-layout">
          <div className="vp-recipe-main">
            {/* Top editorial feature: title, summary, hero, CTAs, tags */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #eee",
                borderRadius: "14px",
                padding: "28px",
                marginBottom: "32px",
                boxShadow: velvet.articleFeatureShadow,
                boxSizing: "border-box",
                maxWidth: "100%",
              }}
            >
              <header style={{ margin: 0 }}>
                <h1
                  className="vp-recipe-title"
                  style={{
                    fontFamily: velvet.fontHeading,
                    fontWeight: 600,
                    fontSize: "42px",
                    lineHeight: "1.08",
                    margin: "0 0 14px",
                    letterSpacing: "-0.02em",
                    color: velvet.text,
                  }}
                >
                  {data.title ?? "Cocktail"}
                </h1>
                {hasSummary && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      lineHeight: "1.65",
                      color: "#444",
                      maxWidth: "680px",
                      fontWeight: 300,
                      fontFamily: velvet.fontBody,
                    }}
                  >
                    {data.summary}
                  </p>
                )}
              </header>

            {/* Hero — fixed crop, cover; editorial shadow (no parallax) */}
            {heroSrc ? (
              <figure
                style={{
                  margin: "24px 0 18px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: `1px solid ${velvet.border}`,
                  boxShadow: velvet.heroImageShadow,
                  maxWidth: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxHeight: "420px",
                    aspectRatio: "16 / 10",
                    background: velvet.bgSoft,
                  }}
                >
                  <img
                    src={heroSrc}
                    alt={
                      data.title
                        ? `${data.title} — featured image`
                        : "Recipe featured image"
                    }
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              </figure>
            ) : (
              <div
                role="img"
                aria-label="Recipe feature visual"
                style={{
                  margin: "24px 0 18px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: `1px solid ${velvet.border}`,
                  background: velvet.heroFallbackGradient,
                  width: "100%",
                  maxHeight: "420px",
                  aspectRatio: "16 / 10",
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
                      "linear-gradient(0deg, rgba(180, 83, 9, 0.06) 0%, transparent 100%)",
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
                    <linearGradient id={`vp-hero-liquid-${slug ?? "recipe"}`} x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity="0.35" />
                      <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#fff7ed" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="145" cy="38" rx="22" ry="14" fill="rgba(251, 191, 36, 0.35)" />
                  <path
                    d="M52 28h96l-18 96H70L52 28z"
                    fill={`url(#vp-hero-liquid-${slug ?? "recipe"})`}
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
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "12px",
                marginBottom: tags.length > 0 ? "14px" : 0,
              }}
            >
              <a
                href="#recipe"
                className="vp-recipe-jump"
                onClick={() =>
                  trackEvent("cta_click", {
                    cta_name: "Jump to Recipe",
                    target_title: "Jump to Recipe",
                    target_path: "#recipe",
                    content_type: "navigation",
                    content_category: "engagement",
                    click_location: "article",
                  })
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 26px",
                  borderRadius: "8px",
                  background: velvet.btnPrimary,
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  border: `1px solid ${velvet.btnPrimary}`,
                  fontFamily: velvet.fontBody,
                  transition: "background-color 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <span aria-hidden style={{ fontSize: "12px", opacity: 0.9 }}>
                  ↓
                </span>
                Jump to Recipe
              </a>
              <button
                type="button"
                className="vp-recipe-print"
                aria-label="Print recipe (coming soon)"
                aria-disabled="true"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 26px",
                  borderRadius: "8px",
                  border: `1px solid ${velvet.btnSecondaryBorder}`,
                  background: velvet.btnSecondaryBg,
                  color: velvet.mutedSoft,
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "default",
                  fontFamily: velvet.fontBody,
                }}
              >
                Print
              </button>
            </div>

            {tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  margin: 0,
                  maxWidth: "100%",
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: velvet.mutedSoft,
                      fontWeight: 500,
                      background: "#f0f0f0",
                      fontFamily: velvet.fontBody,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <StrengthTasteGuide strengthValue={strengthValue} tasteValue={tasteValue} />
            </div>

            <AdSlot label="Ad slot — top (728x90 / responsive)" />

            {/* Quick Mix — cheat-sheet style */}
            {quickMix && (quickMix.lines.length > 0 || quickMix.headline || quickMix.badges.length > 0) && (
              <section
                aria-label="Quick mix preview"
                style={{
                  marginTop: "24px",
                  marginBottom: "32px",
                  padding: "18px 22px 20px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #e3e3e3",
                  borderTop: "3px solid #111",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 14px rgba(0, 0, 0, 0.045)",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#777",
                    marginBottom: 0,
                    fontWeight: 700,
                    fontFamily: velvet.fontBody,
                  }}
                >
                  Quick Mix
                </div>
                {quickMix.headline && (
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "24px",
                      fontWeight: 600,
                      fontFamily: velvet.fontHeading,
                      color: velvet.text,
                      lineHeight: 1.22,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {quickMix.headline}
                  </p>
                )}
                {quickMix.badges.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginTop: quickMix.headline ? "10px" : "8px",
                    }}
                  >
                    {quickMix.badges.map((b) => (
                      <span
                        key={b}
                        style={{
                          fontSize: "11px",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          background: "#f4f4f4",
                          border: "1px solid #e5e5e5",
                          color: "#333",
                          fontFamily: velvet.fontBody,
                          fontWeight: 500,
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
                {quickMix.lines.length > 0 && (
                  <div
                    style={{
                      marginTop:
                        quickMix.headline || quickMix.badges.length > 0 ? "10px" : "8px",
                    }}
                  >
                    {quickMix.lines.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          borderTop: "1px solid #e8e8e8",
                          padding: "9px 0",
                          fontSize: "15px",
                          lineHeight: "1.5",
                          color: "#333",
                          fontFamily: velvet.fontBody,
                          fontWeight: 400,
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Editorial — homepage-aligned section titles, readable body */}
            {editorialBlocks.length > 0 && (
              <div style={{ marginBottom: "44px" }}>
                {editorialBlocks.map((block, index) => (
                  <Fragment key={block.key}>
                    <article
                      style={{
                        maxWidth: velvet.proseMax,
                        marginTop: index === 0 ? 0 : "34px",
                        paddingTop: index === 0 ? 0 : "28px",
                        borderTop: index === 0 ? "none" : "1px solid #eee",
                      }}
                    >
                      {block.title && (
                        <h2
                          style={{
                            fontFamily: velvet.fontHeading,
                            fontSize: "24px",
                            fontWeight: 600,
                            margin: "0 0 12px",
                            color: velvet.text,
                            lineHeight: 1.25,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {block.title}
                        </h2>
                      )}
                      {editorialParagraphs(block.body).map((para, pi, paras) => {
                        const hasInlineHtml = para.includes("<a ");
                        return (
                          <p
                            key={`${block.key}-p-${pi}`}
                            className={hasInlineHtml ? "vp-editorial-inline" : undefined}
                            style={{
                              margin: "0",
                              marginBottom: pi < paras.length - 1 ? "1em" : "0",
                              fontSize: "17px",
                              lineHeight: "1.75",
                              color: "#333",
                              fontWeight: 300,
                              fontFamily: velvet.fontBody,
                            }}
                            {...(hasInlineHtml
                              ? { dangerouslySetInnerHTML: { __html: para } }
                              : { children: para })}
                          />
                        );
                      })}
                    </article>
                    {index === 0 && <AdSlot label="Ad slot — mid content" />}
                  </Fragment>
                ))}
              </div>
            )}

            <AdSlot label="Affiliate slot — bar tools / glassware" />

            {/* Recipe card — primary destination, printable, light */}
            <section
              id="recipe"
              style={{
                scrollMarginTop: "28px",
                padding: "26px",
                borderRadius: "12px",
                background: "#ffffff",
                border: "1px solid #e4e4e4",
                boxShadow: velvet.recipeCardShadow,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div className="vp-recipe-card-header">
                <h2
                  style={{
                    fontFamily: velvet.fontHeading,
                    fontSize: "clamp(1.25rem, 2vw, 1.375rem)",
                    fontWeight: 600,
                    margin: 0,
                    color: velvet.text,
                    letterSpacing: "0.02em",
                    lineHeight: 1.3,
                  }}
                >
                  Recipe
                </h2>
                <div className="vp-recipe-card-actions" aria-label="Recipe actions (coming soon)">
                  <button
                    type="button"
                    className="vp-recipe-card-action"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                  >
                    Print
                  </button>
                  <button
                    type="button"
                    className="vp-recipe-card-action"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="vp-recipe-card-grid">
                <section>
                  <h3 className="vp-recipe-card-col-heading">Ingredients</h3>
                  <ul className="vp-recipe-card-ingredients-list">
                    {ingredients.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="vp-recipe-card-instructions">
                  <h3 className="vp-recipe-card-col-heading">Method</h3>
                  <ol className="vp-recipe-card-steps-list">
                    {steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </section>
              </div>

              {data.notes != null && String(data.notes).trim() !== "" && (
                <section
                  style={{
                    marginTop: "28px",
                    paddingTop: "24px",
                    borderTop: `1px solid ${velvet.border}`,
                  }}
                  aria-label="Editor note"
                >
                  <h3
                    style={{
                      fontFamily: velvet.fontHeading,
                      fontSize: "14px",
                      fontWeight: 600,
                      fontStyle: "italic",
                      letterSpacing: "0.02em",
                      color: velvet.mutedStrong,
                      margin: "0 0 12px",
                    }}
                  >
                    Haley&apos;s Note
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      lineHeight: velvet.bodyLineHeight,
                      color: velvet.body,
                      fontSize: "1rem",
                      fontWeight: 300,
                      maxWidth: velvet.proseMax,
                      fontFamily: velvet.fontBody,
                    }}
                  >
                    {data.notes}
                  </p>
                </section>
              )}
            </section>

            {/* Learn — light reference list */}
            {learnMoreLinks.length > 0 && (
              <section
                style={{
                  marginTop: "32px",
                  maxWidth: velvet.proseMax,
                  paddingTop: "6px",
                }}
              >
                <h2
                  style={{
                    fontFamily: velvet.fontHeading,
                    fontSize: "clamp(1rem, 2vw, 1.0625rem)",
                    fontWeight: 600,
                    margin: "0 0 12px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#666",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${velvet.border}`,
                    lineHeight: 1.35,
                  }}
                >
                  Learn Why This Works
                </h2>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {learnMoreLinks.map((item) => {
                    const raw = item.summary ? String(item.summary).trim() : "";
                    const shortDesc =
                      raw.length > 110 ? `${raw.slice(0, 108).trim()}…` : raw;
                    return (
                      <li
                        key={item.key}
                        style={{
                          marginBottom: "14px",
                        }}
                      >
                        <a
                          href={withCocktailSite(item.href)}
                            onClick={() =>
                              trackEvent("next_article_click", {
                                current_article: data.title ?? slug,
                                current_title: data.title ?? slug,
                                next_article: item.title ?? item.key,
                                target_title: item.title ?? item.key,
                                target_path: item.href,
                                content_type: "recipe",
                                content_category: "cocktails",
                                click_location: "related",
                              })
                            }
                          style={{
                            display: "block",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.9375rem",
                              fontWeight: 500,
                              fontFamily: velvet.fontHeading,
                              letterSpacing: "0.02em",
                              color: velvet.linkBlue,
                              lineHeight: 1.4,
                            }}
                          >
                            {item.title}
                          </span>
                          {shortDesc ? (
                            <span
                              style={{
                                display: "block",
                                marginTop: "4px",
                                fontSize: "0.8125rem",
                                color: velvet.mutedSoft,
                                lineHeight: velvet.bodyLineHeight,
                                fontFamily: velvet.fontBody,
                                fontWeight: 300,
                              }}
                            >
                              {shortDesc}
                            </span>
                          ) : null}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Try This Next — distinct editorial block */}
            {related.length > 0 && (
              <section
                style={{
                  margin: "44px 0 22px",
                  padding: "26px 24px 28px",
                  borderRadius: "10px",
                  border: "1px solid #eaeaea",
                  background: "#fff",
                  boxShadow: "0 6px 22px rgba(0, 0, 0, 0.05)",
                }}
              >
                <h2
                  style={{
                    fontFamily: velvet.fontHeading,
                    fontWeight: 600,
                    fontSize: "clamp(1rem, 2vw, 1.125rem)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    margin: "0 0 18px",
                    color: velvet.text,
                    lineHeight: 1.3,
                  }}
                >
                  Try This Next
                </h2>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {related.map((item, ri) => (
                    <li
                      key={item.slug}
                      style={{
                        borderLeft: `3px solid ${velvet.accent}`,
                        paddingLeft: "18px",
                        marginBottom: ri < related.length - 1 ? "24px" : 0,
                      }}
                    >
                      <a
                        href={withCocktailSite(`/drinks/${item.slug}`)}
                        onClick={() =>
                          trackEvent("next_article_click", {
                            current_article: data.title ?? slug,
                            current_title: data.title ?? slug,
                            next_article: item.title ?? item.slug,
                            target_title: item.title ?? item.slug,
                            target_path: `/drinks/${item.slug}`,
                            content_type: "recipe",
                            content_category: "cocktails",
                            click_location: "related",
                          })
                        }
                        style={{
                          display: "block",
                          textDecoration: "none",
                          color: velvet.text,
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            fontFamily: velvet.fontHeading,
                            fontSize: "1.0625rem",
                            fontWeight: 600,
                            letterSpacing: "0.02em",
                            marginBottom:
                              item.summary != null && String(item.summary).trim() !== ""
                                ? "6px"
                                : 0,
                            lineHeight: 1.35,
                          }}
                        >
                          {item.title}
                        </span>
                        {item.summary != null && String(item.summary).trim() !== "" ? (
                          <span
                            style={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.875rem",
                              color: velvet.mutedSoft,
                              lineHeight: velvet.bodyLineHeight,
                              fontFamily: velvet.fontBody,
                              fontWeight: 300,
                            }}
                          >
                            {String(item.summary).replace(/\s+/g, " ").trim()}
                          </span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <CocktailSidebar currentSlug={slug} omitHref={`/drinks/${slug}`} />
        </div>
      </div>
    </main>
  );
}
