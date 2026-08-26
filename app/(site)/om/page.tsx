import type { Metadata } from "next";
import { om } from "@/lib/site";

export const metadata: Metadata = {
  title: "Om",
  description: om.lead,
  alternates: { canonical: "/om" },
};

export default function OmPage() {
  return (
    <div className="page">
      <div className="wrap" style={{ maxWidth: 1200 }}>
        <div className="mono dim" style={{ marginBottom: 20 }}>
          Om
        </div>
        <h1 className="pageH">{om.tittel}</h1>
        <p
          className="syne"
          style={{
            fontWeight: 400,
            fontSize: "clamp(19px,2.2vw,27px)",
            lineHeight: 1.45,
            maxWidth: "26ch",
            margin: "34px 0 0",
            color: "rgba(237,236,234,.8)",
          }}
        >
          {om.lead}
        </p>
        <hr className="hair" style={{ margin: "70px 0 0" }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(160px,1fr) minmax(0,2.4fr)",
            gap: "54px 60px",
            marginTop: 54,
          }}
        >
          <div className="mono dim">Bakgrunn</div>
          <div style={{ fontSize: 17, lineHeight: 1.8, color: "rgba(237,236,234,.75)" }}>
            <p style={{ margin: "0 0 22px" }}>{om.intro}</p>
            {om.bakgrunn.map((t, i) => (
              <p key={i} style={{ margin: i === om.bakgrunn.length - 1 ? 0 : "0 0 22px" }}>
                {t}
              </p>
            ))}
          </div>

          <div className="mono dim">Hva jeg gjør</div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: 12,
              fontSize: 17,
              color: "rgba(237,236,234,.8)",
            }}
          >
            {om.tjenester.map((t) => (
              <li key={t} style={{ borderBottom: "1px solid rgba(255,255,255,.09)", paddingBottom: 12 }}>
                {t}
              </li>
            ))}
          </ul>

          <div className="mono dim">Verktøy</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "32px 30px" }}>
            {om.verktoy.map((g) => (
              <div key={g.gruppe}>
                <div
                  className="mono"
                  style={{ paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,.16)", marginBottom: 12 }}
                >
                  {g.gruppe}
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "grid",
                    gap: 7,
                    fontSize: 16,
                    color: "rgba(237,236,234,.72)",
                  }}
                >
                  {g.ting.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mono dim">Kontakt</div>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.8, color: "rgba(237,236,234,.75)" }}>
            Interessert i et samarbeid? Ta kontakt via{" "}
            <a
              href="https://www.firemedia.no"
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderBottom: "1px solid rgba(237,236,234,.4)" }}
            >
              Fire Media
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
