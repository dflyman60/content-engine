export default function SiteShell({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        background: "#f7f7f5",
        color: "#171717",
      }}
    >
      <header
        style={{
          padding: "32px",
          borderBottom: "1px solid #e2e2df",
          background: "#ffffff",
        }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: "32px" }}>{title}</h1>
          {subtitle && (
            <p style={{ margin: "8px 0 0", color: "#666", fontSize: "16px" }}>
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {children}
    </div>
  );
}
