import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFilledSeries, getSerie } from "@/lib/site";
import SerieClient from "./serie-client";

type Params = { params: Promise<{ serie: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { serie } = await params;
  const s = await getSerie(serie);
  if (!s) return { title: "Serie" };
  return {
    title: s.title,
    description: s.note || `Fotoserie: ${s.title} (${s.meta}) av Espen Vik Morild.`,
    alternates: { canonical: `/foto/${s.id}` },
    openGraph: s.cover ? { images: [{ url: s.cover.src }] } : undefined,
  };
}

export default async function SeriePage({ params }: Params) {
  const { serie } = await params;
  const s = await getSerie(serie);
  if (!s) notFound();

  const filled = await getFilledSeries();
  const idx = filled.findIndex((x) => x.id === s.id);
  const next = filled.length > 0 ? filled[(idx + 1) % filled.length] : null;

  return (
    <div className="page">
      <div className="wrap">
        <Link href="/foto" className="mono dim">
          ← Alle serier
        </Link>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 40,
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 40,
          }}
        >
          <h1 className="pageH">{s.title}</h1>
          <div style={{ maxWidth: "32ch" }}>
            {s.note && (
              <p style={{ margin: "0 0 10px", fontSize: 16, lineHeight: 1.7, color: "rgba(237,236,234,.65)" }}>
                {s.note}
              </p>
            )}
            <div className="mono dim">
              {s.nr} · {s.photos.length} bilder · {s.meta}
            </div>
          </div>
        </div>

        <SerieClient photos={s.photos} title={s.title} meta={s.meta} />

        <hr className="hair" style={{ margin: "70px 0 26px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <span className="mono dim">Slutt på serien</span>
          {next && (
            <Link href={`/foto/${next.id}`} className="mono">
              Neste serie →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
