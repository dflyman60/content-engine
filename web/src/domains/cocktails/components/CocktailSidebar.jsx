import {
  getCocktailRecipeBySlug,
  getCocktailResourceBySlug,
  getRelatedCocktailRecipes,
} from "../../../utils/contentLoader";
import { withCocktailSite } from "../withCocktailSite";

const velvet = {
  fontBody: '"Roboto", sans-serif',
  bgSoft: "#f5f5f5",
  border: "#e8e8e8",
  borderStrong: "#dddddd",
  text: "#141414",
  muted: "#3d3d3d",
  mutedSoft: "#6b6b6b",
  sidebarCardBg: "#fafafa",
  sidebarCardBorder: "#ececec",
  sidebarHeader: "#1a1a1a",
  linkBlue: "#2563eb",
  reviewBadgeBorder: "#22c55e",
  bodyLineHeight: 1.7,
};

const MAX_ITEMS = 3;

/** Full pool for Bar Resources: first 3 used as default; 4th+ fill in when the current page is hidden. */
const FALLBACK_BAR_RESOURCES_POOL = [
  { title: "Most Cocktails Fail Here (And It’s Not the Alcohol)", href: "/resources/cocktail-balance-and-ratios" },
  { title: "You Don’t Need 15 Tools (Just These for Stirred Drinks)", href: "/resources/essential-tools-for-stirred-cocktails" },
  { title: "Your Ice Is Quietly Ruining Your Drink", href: "/resources/ice-matters-in-cocktails" },
  { title: "Fresh Citrus Changes Everything (And It’s Not Subtle)", href: "/resources/fresh-citrus-matters" },
  { title: "Your Gin & Tonic Is Only As Good As Your Tonic", href: "/resources/tonic-matters" },
];

/** U.S. bar profiles; pool for omit + fill when viewing a bar resource. */
const FALLBACK_BEST_BARS_POOL = [
  { title: "Sip & Guzzle, New York", href: "/resources/sip-and-guzzle-new-york" },
  { title: "Jewel of the South, New Orleans", href: "/resources/jewel-of-the-south-new-orleans" },
  { title: "Kumiko, Chicago", href: "/resources/kumiko-chicago" },
];

const FALLBACK_LATEST_REVIEWS = [
  { title: "Best Mixing Glasses for Home Bars", href: "#" },
  { title: "Large Ice Molds Worth Buying", href: "#" },
  { title: "Bitters Every Home Bar Should Own", href: "#" },
];

const FALLBACK_ABOUT = {
  title: "About",
  text: "Velvet Pour is a cocktail journal focused on technique, balance, and drinks worth making more than once.",
  imageSrc: null,
};

/** Unified thumbnail size for sidebar link rows */
const ROW_THUMB_SIZE = 68;

const SIDEBAR_CARD_PAD = "12px";
const SIDEBAR_SECTION_GAP = "32px";

function resolveAbout(sidebar) {
  const raw = sidebar?.about ?? sidebar?.about_block;
  if (
    raw != null &&
    typeof raw === "object" &&
    !Array.isArray(raw)
  ) {
    const title =
      raw.title != null && String(raw.title).trim() !== ""
        ? String(raw.title).trim()
        : FALLBACK_ABOUT.title;
    const textRaw = raw.text ?? raw.body ?? raw.description ?? "";
    const text = String(textRaw).trim();
    const imgRaw = raw.image ?? raw.photo ?? raw.thumbnail ?? null;
    const imageSrc =
      imgRaw != null && String(imgRaw).trim() !== ""
        ? String(imgRaw).trim()
        : null;
    return {
      title,
      text: text || FALLBACK_ABOUT.text,
      imageSrc,
    };
  }
  return { ...FALLBACK_ABOUT };
}

/** Square image slot: optional `src` fills the frame; otherwise neutral placeholder. */
function SidebarRowThumb({ src, size = ROW_THUMB_SIZE }) {
  const boxStyle = {
    flexShrink: 0,
    width: size,
    height: size,
    background: velvet.bgSoft,
    border: `1px solid ${velvet.border}`,
    borderRadius: "4px",
    overflow: "hidden",
  };
  if (src) {
    return (
      <div aria-hidden style={boxStyle}>
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }
  return <div aria-hidden style={boxStyle} />;
}

function AboutCard({ about }) {
  if (!about) return null;
  const { title, text, imageSrc } = about;
  return (
    <div
      style={{
        marginBottom: SIDEBAR_SECTION_GAP,
        padding: `${SIDEBAR_CARD_PAD} ${SIDEBAR_CARD_PAD} 14px`,
        borderRadius: "10px",
        border: `1px solid ${velvet.sidebarCardBorder}`,
        background: velvet.sidebarCardBg,
      }}
    >
      <div
        aria-hidden
        style={{
          width: "100%",
          height: "112px",
          marginBottom: "12px",
          borderRadius: "6px",
          overflow: "hidden",
          background: velvet.bgSoft,
          border: `1px solid ${velvet.border}`,
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: velvet.muted,
          marginBottom: "8px",
          fontFamily: velvet.fontBody,
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          lineHeight: velvet.bodyLineHeight,
          color: velvet.text,
          fontFamily: velvet.fontBody,
          fontWeight: 400,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function safeLinkItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (row == null) return null;
      if (typeof row === "string") return { title: row, href: "#", text: "", thumbSrc: null };
      const title = row.title != null ? String(row.title).trim() : "";
      const href =
        row.href != null && String(row.href).trim() !== ""
          ? String(row.href)
          : "#";
      if (!title) return null;
      const textRaw = row.text ?? row.blurb ?? row.description ?? "";
      const text = String(textRaw).trim();
      const imgRaw = row.image ?? row.thumbnail ?? row.photo ?? null;
      const thumbSrc =
        imgRaw != null && String(imgRaw).trim() !== ""
          ? String(imgRaw).trim()
          : null;
      return {
        title,
        href,
        score: row.score != null ? String(row.score) : null,
        text,
        thumbSrc,
      };
    })
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}

function pickLinkSection(jsonItems, fallback) {
  const fromJson = safeLinkItems(jsonItems);
  return fromJson.length > 0 ? fromJson : safeLinkItems(fallback);
}

function normalizeSidebarHref(h) {
  if (h == null || h === "#") return "";
  let s = String(h).trim();
  const q = s.indexOf("?");
  if (q >= 0) s = s.slice(0, q);
  while (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function hrefMatchesOmit(itemHref, omitHref) {
  if (!omitHref) return false;
  const a = normalizeSidebarHref(itemHref);
  const b = normalizeSidebarHref(omitHref);
  return a !== "" && b !== "" && a === b;
}

/** Drop the link that points at the current page, then fill from `fillerPool` up to MAX_ITEMS. */
function filterOmitAndFillLinkItems(items, fillerPool, omitHref) {
  const pool = Array.isArray(fillerPool) ? fillerPool : [];
  let out = Array.isArray(items)
    ? items.filter((it) => it && !hrefMatchesOmit(it.href, omitHref))
    : [];
  const seen = new Set(
    out.map((it) => normalizeSidebarHref(it?.href)).filter(Boolean),
  );
  for (const row of pool) {
    if (out.length >= MAX_ITEMS) break;
    const href = normalizeSidebarHref(row?.href);
    if (!href || href === "#") continue;
    if (hrefMatchesOmit(row.href, omitHref)) continue;
    if (seen.has(href)) continue;
    out.push(row);
    seen.add(href);
  }
  return out.slice(0, MAX_ITEMS);
}

/** Align with resource page hero: same field precedence as `CocktailResourcePage` `getHeroImageSrc`. */
function resourceHeroImageSrc(data) {
  if (!data || typeof data !== "object") return null;
  const raw =
    data.hero_image ??
    data.heroImage ??
    data.image ??
    data.cover_image ??
    data.coverImage ??
    null;
  if (raw == null) return null;
  const s = typeof raw === "string" ? raw.trim() : "";
  return s.length > 0 ? s : null;
}

function resourceSlugFromBarHref(href) {
  const norm = normalizeSidebarHref(href);
  const m = norm.match(/^\/resources\/([^/]+)$/);
  return m ? m[1] : null;
}

/** Fill `thumbSrc` from `data/cocktails/resources` when a row points at `/resources/:slug` (Bar Resources, U.S. best bars, etc.). */
function enrichResourceLinkThumbs(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (!item || typeof item !== "object") return item;
    if (item.thumbSrc) return item;
    const slug = resourceSlugFromBarHref(item.href);
    if (!slug) return item;
    const res = getCocktailResourceBySlug(slug);
    const thumb = res ? resourceHeroImageSrc(res) : null;
    return thumb ? { ...item, thumbSrc: thumb } : item;
  });
}

function buildBarResources(jsonItems, omitHref) {
  const fromRecipe = safeLinkItems(jsonItems);
  const base =
    fromRecipe.length > 0 ? fromRecipe : safeLinkItems(FALLBACK_BAR_RESOURCES_POOL);
  return enrichResourceLinkThumbs(
    filterOmitAndFillLinkItems(base, FALLBACK_BAR_RESOURCES_POOL, omitHref),
  );
}

function buildBestBars(jsonItems, omitHref) {
  const fromRecipe = safeLinkItems(jsonItems);
  const base =
    fromRecipe.length > 0 ? fromRecipe : safeLinkItems(FALLBACK_BEST_BARS_POOL);
  return enrichResourceLinkThumbs(
    filterOmitAndFillLinkItems(base, FALLBACK_BEST_BARS_POOL, omitHref),
  );
}

/**
 * Cocktail Recipes sidebar: recipe JSON only (`data/cocktails/recipes`), never resources.
 * 1) If `sidebar.featured` exists: map slugs → getCocktailRecipeBySlug, preserve order, drop invalid / excludeSlug, max 3.
 * 2) Else: getRelatedCocktailRecipes(currentRecipe) (already excludes current recipe), max 3.
 */
function resolveCocktailRecipes(currentRecipe, excludeSlug, sidebar) {
  if (!currentRecipe || typeof currentRecipe !== "object" || !currentRecipe.slug) return [];
  const exclude = String(excludeSlug || "").trim();
  const featured = sidebar?.featured;

  if (Array.isArray(featured) && featured.length > 0) {
    const out = [];
    for (const entry of featured) {
      if (out.length >= MAX_ITEMS) break;
      const slug =
        typeof entry === "string"
          ? entry.trim()
          : entry != null && typeof entry === "object"
            ? String(entry.slug ?? entry.id ?? "").trim()
            : "";
      if (!slug || slug === exclude) continue;
      const recipe = getCocktailRecipeBySlug(slug);
      if (!recipe || typeof recipe !== "object" || !recipe.slug) continue;
      if (recipe.slug === exclude) continue;
      if (String(recipe.type || "").toLowerCase() === "resource") continue;
      out.push(recipe);
    }
    if (out.length > 0) return out;
  }

  const related = getRelatedCocktailRecipes(currentRecipe, MAX_ITEMS);
  if (!Array.isArray(related)) return [];
  return related
    .filter((r) => r && typeof r === "object" && r.slug && String(r.type || "").toLowerCase() !== "resource")
    .filter((r) => !exclude || r.slug !== exclude)
    .slice(0, MAX_ITEMS);
}

function SectionHeader({ children, tightBottom = false }) {
  return (
    <div
      style={{
        background: velvet.sidebarHeader,
        color: "#fff",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "10px 12px",
        margin: tightBottom
          ? `-${SIDEBAR_CARD_PAD} -${SIDEBAR_CARD_PAD} 0`
          : `-${SIDEBAR_CARD_PAD} -${SIDEBAR_CARD_PAD} 12px`,
        borderRadius: "9px 9px 0 0",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function LinkListCard({ title, items, marginBottom = SIDEBAR_SECTION_GAP }) {
  if (!items.length) return null;
  return (
    <div
      style={{
        marginBottom,
        padding: `${SIDEBAR_CARD_PAD} ${SIDEBAR_CARD_PAD} 14px`,
        borderRadius: "10px",
        border: `1px solid ${velvet.sidebarCardBorder}`,
        background: velvet.sidebarCardBg,
      }}
    >
      <SectionHeader>{title}</SectionHeader>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, index) => (
          <li
            key={`${title}-${index}-${item.title}`}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              paddingBottom: index < items.length - 1 ? "10px" : 0,
              marginBottom: index < items.length - 1 ? "10px" : 0,
              borderBottom:
                index < items.length - 1 ? `1px solid #eee` : "none",
            }}
          >
            {item.thumbSrc ? <SidebarRowThumb src={item.thumbSrc} /> : null}
            <div style={{ minWidth: 0, flex: 1 }}>
              <a
                href={withCocktailSite(item.href)}
                style={{
                  display: "block",
                  fontSize: "12px",
                  lineHeight: 1.45,
                  color: velvet.linkBlue,
                  textDecoration: "none",
                  fontFamily: velvet.fontBody,
                  fontWeight: 600,
                  marginBottom: item.text ? "3px" : 0,
                }}
              >
                {item.title}
              </a>
              {item.text ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    lineHeight: velvet.bodyLineHeight,
                    color: velvet.mutedSoft,
                    fontFamily: velvet.fontBody,
                  }}
                >
                  {item.text}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewsCard({ title, items }) {
  if (!items.length) return null;
  return (
    <div
      style={{
        marginBottom: SIDEBAR_SECTION_GAP,
        padding: `${SIDEBAR_CARD_PAD} ${SIDEBAR_CARD_PAD} 14px`,
        borderRadius: "10px",
        border: `1px solid ${velvet.sidebarCardBorder}`,
        background: velvet.sidebarCardBg,
      }}
    >
      <SectionHeader tightBottom>{title}</SectionHeader>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, index) => (
          <li
            key={`review-${index}-${item.title}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 0",
              borderBottom:
                index < items.length - 1 ? `1px solid #eee` : "none",
            }}
          >
            <SidebarRowThumb src={item.thumbSrc} />
            <a
              href={withCocktailSite(item.href)}
              style={{
                flex: "1",
                minWidth: 0,
                fontSize: "12px",
                lineHeight: 1.45,
                color: velvet.linkBlue,
                textDecoration: "none",
                fontFamily: velvet.fontBody,
                fontWeight: 600,
              }}
            >
              <span style={{ display: "block", marginBottom: item.text ? "4px" : 0 }}>
                {item.title}
              </span>
              {item.text ? (
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: velvet.mutedSoft,
                  }}
                >
                  {item.text}
                </span>
              ) : null}
            </a>
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: `2px solid ${velvet.reviewBadgeBorder}`,
                fontSize: "12px",
                fontWeight: 700,
                color: velvet.text,
                fontFamily: velvet.fontBody,
              }}
            >
              {item.score && String(item.score).trim() !== ""
                ? item.score
                : "→"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function recipeThumbSrc(recipe) {
  const raw =
    recipe?.image ??
    recipe?.thumbnail ??
    recipe?.photo ??
    recipe?.hero_image ??
    recipe?.heroImage ??
    null;
  if (raw == null) return null;
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

function CocktailRecipesCard({ recipes }) {
  const rows = Array.isArray(recipes)
    ? recipes.filter((r) => r && typeof r === "object" && String(r.slug || "").trim())
    : [];
  return (
    <div
      style={{
        marginBottom: SIDEBAR_SECTION_GAP,
        padding: `${SIDEBAR_CARD_PAD} ${SIDEBAR_CARD_PAD} 14px`,
        borderRadius: "10px",
        border: `1px solid ${velvet.sidebarCardBorder}`,
        background: velvet.sidebarCardBg,
      }}
    >
      <SectionHeader>Cocktail Recipes</SectionHeader>
      {rows.length > 0 ? (
        <>
          {rows.map((item, index) => {
            const slug = String(item.slug || "").trim();
            const title =
              item.title != null && String(item.title).trim() !== ""
                ? String(item.title).trim()
                : slug;
            const thumb = recipeThumbSrc(item);
            return (
              <div
                key={slug}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  paddingBottom: "12px",
                  marginBottom: "12px",
                  borderBottom:
                    index < rows.length - 1 ? `1px solid #eee` : "none",
                }}
              >
                <SidebarRowThumb src={thumb} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <a
                    href={withCocktailSite(`/drinks/${slug}`)}
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      lineHeight: 1.45,
                      color: velvet.text,
                      textDecoration: "none",
                      fontFamily: velvet.fontBody,
                    }}
                  >
                    {title}
                  </a>
                </div>
              </div>
            );
          })}
          <div
            aria-hidden="true"
            style={{
              marginTop: "2px",
              padding: "10px 8px",
              border: "1px dashed #ddd",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "11px",
              lineHeight: velvet.bodyLineHeight,
              color: velvet.mutedSoft,
              fontFamily: velvet.fontBody,
              background: velvet.bgSoft,
            }}
          >
            Sidebar slot — more recipe picks coming soon
          </div>
        </>
      ) : (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "13px",
            lineHeight: velvet.bodyLineHeight,
            color: velvet.mutedSoft,
            fontFamily: velvet.fontBody,
          }}
        >
          Recipe picks for this page coming soon.
        </p>
      )}
    </div>
  );
}

function SearchStub() {
  return (
    <div
      style={{
        padding: `${SIDEBAR_CARD_PAD} ${SIDEBAR_CARD_PAD} 14px`,
        borderRadius: "10px",
        border: `1px solid ${velvet.sidebarCardBorder}`,
        background: velvet.sidebarCardBg,
      }}
    >
      <div
        style={{
          background: velvet.sidebarHeader,
          color: "#fff",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "10px 12px",
          margin: `-${SIDEBAR_CARD_PAD} -${SIDEBAR_CARD_PAD} 10px`,
          borderRadius: "9px 9px 0 0",
          textTransform: "uppercase",
        }}
      >
        Search the Site
      </div>
      <label htmlFor="vp-sidebar-search" className="visually-hidden">
        Search the site
      </label>
      <input
        id="vp-sidebar-search"
        type="search"
        placeholder="Search the site …"
        readOnly
        tabIndex={-1}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 12px",
          fontSize: "14px",
          border: `1px solid ${velvet.borderStrong}`,
          borderRadius: "2px",
          color: velvet.muted,
          background: "#fff",
          fontFamily: velvet.fontBody,
        }}
      />
      <p
        style={{
          margin: "8px 0 0",
          fontSize: "11px",
          lineHeight: velvet.bodyLineHeight,
          color: velvet.mutedSoft,
          fontFamily: velvet.fontBody,
        }}
      >
        Search coming soon
      </p>
    </div>
  );
}

/**
 * Velvet Pour recipe sidebar: JSON-driven sections with fallbacks.
 * @param {{ currentSlug?: string, sidebarRecipeSlug?: string, omitHref?: string }} props — pass `omitHref` as the current page path to hide that link in Bar Resources and Best Cocktail Bars in the U.S. (and swap in another item when the pool allows).
 */
export default function CocktailSidebar({ currentSlug, sidebarRecipeSlug, omitHref }) {
  const anchorSlug =
    String(sidebarRecipeSlug || currentSlug || "").trim() || null;
  const currentRecipe = anchorSlug ? getCocktailRecipeBySlug(anchorSlug) : null;
  const sidebar = currentRecipe?.sidebar ?? null;
  const sections = sidebar?.sections ?? {};

  const barResources = buildBarResources(
    sections.bar_resources ?? sections.barResources,
    omitHref,
  );
  const bestBars = buildBestBars(
    sections.best_bars ?? sections.bestBars,
    omitHref,
  );
  const latestReviewsRaw = pickLinkSection(
    sections.latest_reviews ?? sections.latestReviews,
    FALLBACK_LATEST_REVIEWS
  );
  const latestReviews = latestReviewsRaw.map(
    ({ title, href, score, text, thumbSrc }) => ({
      title,
      href,
      score,
      text,
      thumbSrc,
    })
  );

  const cocktailRecipes = currentRecipe
    ? resolveCocktailRecipes(currentRecipe, anchorSlug, sidebar)
    : [];
  const about = resolveAbout(sidebar);

  return (
    <aside
      className="vp-recipe-sidebar"
      aria-label="Velvet Pour sidebar"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
      }}
    >
      <AboutCard about={about} />
      <LinkListCard title="Bar Resources" items={barResources} />
      <LinkListCard title="Best Cocktail Bars in the U.S." items={bestBars} />
      <CocktailRecipesCard recipes={cocktailRecipes} />
      <ReviewsCard title="Latest Reviews" items={latestReviews} />
      <SearchStub />
    </aside>
  );
}
