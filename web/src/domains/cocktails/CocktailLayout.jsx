import SiteShell from "../../components/layout/SiteShell";

export default function CocktailLayout({ children }) {
  return (
    <SiteShell
      title="Velvet Pour"
      subtitle="Award-inspired cocktails, home bar guidance, and refined recipes."
    >
      {children}
    </SiteShell>
  );
}
