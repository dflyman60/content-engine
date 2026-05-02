import {
  getUapCaseBySlug,
  getRelatedUapCases,
} from "../../utils/contentLoader";

export default function UapCasePage({ slug }) {
  const data = getUapCaseBySlug(slug);

  if (!data) {
    return (
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "32px" }}>
        <h2>Case not found</h2>
        <a href="/">Back to all cases</a>
      </main>
    );
  }

  const related = getRelatedUapCases(data);

  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "32px" }}>
      <a href="/">← Back to cases</a>

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

      {data.sections.map((section, index) => (
        <section key={index} style={{ marginTop: "24px" }}>
          <h3>{section.heading}</h3>
          <p>{section.content}</p>
        </section>
      ))}

      {related.length > 0 && (
        <section style={{ marginTop: "40px" }}>
          <h3>Explore more cases</h3>

          <div style={{ display: "grid", gap: "12px" }}>
            {related.map((item) => (
              <a
                key={item.slug}
                href={`/cases/${item.slug}`}
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
