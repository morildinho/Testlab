import Link from "next/link";
import { getSeries, site } from "@/lib/site";
import Reveal from "./components/Reveal";
import SeriesRow from "./components/SeriesRow";

export default async function Home() {
  const series = await getSeries();

  return (
    <div className="page">
      <div className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={site.hero.src} alt="" fetchPriority="high" />
        <div className="heroTxt">
          <div>
            <div className="mono dim" style={{ marginBottom: 18 }}>
              Bergen, Norge
            </div>
            <h1 className="heroName">
              Espen
              <br />
              Vik Morild
            </h1>
          </div>
          <div style={{ textAlign: "right", maxWidth: 300 }}>
            <p style={{ margin: "0 0 14px", fontSize: 17, lineHeight: 1.6, color: "rgba(237,236,234,.8)" }}>
              {site.tagline}
            </p>
            <div className="mono dim">
              <span className="cue">Utvalgte serier ↓</span>
            </div>
          </div>
        </div>
      </div>

      {series.map((s, i) => (
        <SeriesRow key={s.id} s={s} idx={i} />
      ))}

      <Reveal
        style={{
          padding: "14vh 30px",
          borderTop: "1px solid rgba(255,255,255,.11)",
          display: "flex",
          flexWrap: "wrap",
          gap: 40,
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <div className="mono dim" style={{ marginBottom: 16 }}>
            Video
          </div>
          <h2
            className="syne"
            style={{ fontWeight: 600, fontSize: "clamp(28px,4vw,54px)", margin: 0, letterSpacing: "-.02em" }}
          >
            Bevegelige bilder,
            <br />
            lyd og live
          </h2>
        </div>
        <Link className="btnGhost mono" href="/film">
          Se videoarbeid →
        </Link>
      </Reveal>
    </div>
  );
}
