import type { Metadata } from "next";
import Link from "next/link";
import { getSeries } from "@/lib/site";
import Frame from "../components/Frame";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "Foto",
  description: "Fotoserier av Espen Vik Morild — landskap, festival og reportasje fra Bergen og Vestlandet.",
  alternates: { canonical: "/foto" },
};

export default async function FotoPage() {
  const series = await getSeries();

  return (
    <div className="page">
      <div className="wrap">
        <div className="mono dim" style={{ marginBottom: 20 }}>
          Foto — {series.length} serier
        </div>
        <h1 className="pageH">Foto</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "40px 24px",
            marginTop: 70,
          }}
        >
          {series.map((s, i) => {
            const antall = s.photos.length;
            const card = (
              <>
                <div className="vcard">
                  {s.cover ? (
                    <Frame src={s.cover.src} ratio={0.8} alt={s.title} />
                  ) : (
                    <div className="slot" style={{ aspectRatio: "4/5" }}>
                      <span className="mono dim">oppdragsbilder</span>
                    </div>
                  )}
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 14 }}
                >
                  <h2 className="syne" style={{ fontWeight: 600, fontSize: 24, margin: 0, letterSpacing: "-.01em" }}>
                    {s.title}
                  </h2>
                  <span className="mono dim">{antall > 0 ? `${antall} bilder` : "kommer"}</span>
                </div>
                <p className="mono dim" style={{ marginTop: 8 }}>
                  {s.meta}
                </p>
              </>
            );

            return (
              <Reveal key={s.id} delay={i * 90}>
                {antall > 0 ? <Link href={`/foto/${s.id}`}>{card}</Link> : <div>{card}</div>}
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
