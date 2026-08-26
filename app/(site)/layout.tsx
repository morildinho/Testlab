import type { Metadata } from "next";
import Bar from "./components/Bar";
import Footer from "./components/Footer";
import "./site.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://morildinho.no"),
  title: {
    default: "Espen Vik Morild — foto, film og lyd fra Bergen",
    template: "%s — Morildinho",
  },
  description:
    "Fotograf, podcast- og videoprodusent i Bergen. Fotoserier, videoarbeid og 25 års erfaring fra digital kinoproduksjon, podcast og streaming.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: "Morildinho",
    title: "Espen Vik Morild — foto, film og lyd fra Bergen",
    description: "Fotograf, podcast- og videoprodusent i Bergen.",
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <Bar />
      {children}
      <Footer />
    </div>
  );
}
