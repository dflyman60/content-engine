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

      <header style={{ padding: "32px", borderBottom: "1px solid #ddd", background: "#fff" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h1>{title}</h1>
          <p style={{ color: "#666" }}>{subtitle}</p>
      
          <div style={{ marginTop: "12px" }}>
            <a href="/" style={{ marginRight: "16px" }}>UAP</a>
            <a href="/?site=cocktails">Cocktails</a>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
