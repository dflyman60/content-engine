import { useState } from "react";
import { withCocktailSite } from "./withCocktailSite";
import { trackEvent } from "@/lib/analytics";

function readInitialSearchDraft() {
  try {
    const path = (window.location.pathname || "").replace(/\/$/, "") || "/";
    if (path !== "/search") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  } catch {
    return "";
  }
}

export default function CocktailLayout({ children }) {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const homeHref = isLocal ? "/?site=cocktails" : "/";
  const [searchDraft, setSearchDraft] = useState(readInitialSearchDraft);

  function handleSearchKeyDown(e) {
    if (e.key !== "Enter") return;
    const trimmed = String(searchDraft).trim();
    if (!trimmed) return;
    e.preventDefault();
    const url = `/search?q=${encodeURIComponent(trimmed)}`;
    window.location.assign(withCocktailSite(url));
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily:
          'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        background: "#fafafa",
        color: "#141414",
      }}
    >
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600&display=swap");
          .vp-cocktail-header {
            height: 64px;
            padding: 0 24px;
            border-bottom: 1px solid #eee;
            background: #ffffff;
            box-sizing: border-box;
          }
          .vp-cocktail-header-inner {
            max-width: 1180px;
            margin: 0 auto;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            box-sizing: border-box;
          }
          .vp-nav-brand {
            flex: 1 1 0;
            display: flex;
            justify-content: flex-start;
            min-width: 0;
          }
          .vp-nav-brand a {
            font-family: "Raleway", sans-serif;
            font-weight: 600;
            font-size: 20px;
            color: #141414;
            text-decoration: none;
            letter-spacing: -0.02em;
          }
          .vp-nav-center {
            flex: 1 1 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0;
            flex-wrap: wrap;
            min-width: 0;
          }
          .vp-nav-link {
            font-family: "Raleway", sans-serif;
            font-size: 14px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #333;
            text-decoration: none;
            margin: 0 16px;
            white-space: nowrap;
          }
          .vp-nav-link:hover {
            color: #000;
          }
          .vp-nav-right {
            flex: 1 1 0;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            min-width: 0;
          }
          .vp-nav-search {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 13px;
            font-family: inherit;
            max-width: 180px;
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }
          .vp-nav-search::placeholder {
            color: #999;
          }
          .vp-layout-visually-hidden {
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
          @media (max-width: 900px) {
            .vp-cocktail-header {
              height: auto;
              min-height: 64px;
              padding: 12px 16px;
            }
            .vp-cocktail-header-inner {
              flex-wrap: wrap;
              height: auto;
              row-gap: 12px;
            }
            .vp-nav-brand,
            .vp-nav-center,
            .vp-nav-right {
              flex: 1 1 100%;
              justify-content: center;
            }
            .vp-nav-brand {
              justify-content: flex-start;
            }
            .vp-nav-right {
              justify-content: stretch;
            }
            .vp-nav-search {
              max-width: none;
            }
            .vp-nav-link {
              margin: 0 10px;
            }
          }
        `}
      </style>
      <header className="vp-cocktail-header">
        <div className="vp-cocktail-header-inner">
          <div className="vp-nav-brand">
            <a
              href={homeHref}
              onClick={() =>
                trackEvent("nav_click", {
                  nav_item: "Velvet Pour",
                  target_title: "Velvet Pour",
                  target_path: homeHref,
                  content_type: "navigation",
                  content_category: "navigation",
                  click_location: "header",
                })
              }
            >
              Velvet Pour
            </a>
          </div>
          <nav className="vp-nav-center" aria-label="Primary">
            <a
              className="vp-nav-link"
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
            >
              Cocktails
            </a>
            <a
              className="vp-nav-link"
              href={withCocktailSite("/resources")}
              onClick={() =>
                trackEvent("nav_click", {
                  nav_item: "Bar Resources",
                  target_title: "Bar Resources",
                  target_path: "/resources",
                  content_type: "navigation",
                  content_category: "navigation",
                  click_location: "header",
                })
              }
            >
              Bar Resources
            </a>
            <a
              className="vp-nav-link"
              href={withCocktailSite("/bars")}
              onClick={() =>
                trackEvent("nav_click", {
                  nav_item: "Best Bars",
                  target_title: "Best Bars",
                  target_path: "/bars",
                  content_type: "navigation",
                  content_category: "navigation",
                  click_location: "header",
                })
              }
            >
              Best Bars
            </a>
          </nav>
          <div className="vp-nav-right">
            <label htmlFor="vp-global-search" className="vp-layout-visually-hidden">
              Search
            </label>
            <input
              id="vp-global-search"
              type="search"
              className="vp-nav-search"
              placeholder="Search"
              autoComplete="off"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
