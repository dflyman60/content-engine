import SiteShell from "../../components/layout/SiteShell";

export default function UapLayout({ children }) {
  return (
    <SiteShell
      title="UAP Cases"
      subtitle="Structured case notes, sightings, reports, and unexplained encounters."
    >
      {children}
    </SiteShell>
  );
}
