import { getAllUapCases } from "../../utils/contentLoader";

export default function UapHome() {
  const cases = getAllUapCases();

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px" }}>
      <h2>Explore UAP Cases</h2>
      <p>
        A structured archive of notable UAP incidents, sightings, and reports.
      </p>

      <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
        {cases.map((item) => (
          <a
            key={item.slug}
            href={`/cases/${item.slug}`}
            style={{
              display: "block",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
