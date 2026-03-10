import Link from "next/link";

export const metadata = {
  title: "Om Espen – Morildinho.no",
  robots: { index: false, follow: false },
};

export default function OmPage() {
  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .om-page {
          min-height: 100vh;
          background: radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.35), transparent 60%),
                      radial-gradient(900px 500px at 10% 30%, rgba(59,130,246,0.15), transparent 60%),
                      radial-gradient(900px 500px at 90% 70%, rgba(147,51,234,0.12), transparent 60%),
                      #000;
          color: #fff;
          font-family: 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
        }

        .nav-link {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: rgba(255,255,255,1);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.9rem;
          margin-bottom: 3rem;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #fff;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 6rem 2rem 4rem;
        }

        .title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 1.5rem;
          color: rgba(255,255,255,0.9);
        }

        .subtitle {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.6);
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .content {
          line-height: 1.8;
          color: rgba(255,255,255,0.75);
        }

        .content p {
          margin-bottom: 1.5rem;
        }

        .content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: rgba(255,255,255,0.85);
        }

        .content ul {
          list-style: none;
          margin-left: 0;
          padding-left: 0;
        }

        .content li {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
          position: relative;
        }

        .content li:before {
          content: "→";
          position: absolute;
          left: 0;
          color: rgba(59,130,246,0.7);
        }

        .highlight {
          color: rgba(59,130,246,0.9);
          font-weight: 600;
        }

        .contact-link {
          color: rgba(59,130,246,0.9);
          text-decoration: none;
          border-bottom: 1px solid rgba(59,130,246,0.3);
          transition: border-color 0.2s;
        }
        .contact-link:hover {
          border-bottom-color: rgba(59,130,246,0.9);
        }
      `}</style>

      <div className="om-page">
        {/* Top left navigation */}
        <nav
          style={{
            position: "fixed",
            top: 24,
            left: 24,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <a href="/gallery" className="nav-link">
            Portfolio
          </a>
          <a href="/om" className="nav-link" style={{ color: "rgba(255,255,255,1)" }}>
            Om Espen
          </a>
          <a
            href="https://www.firemedia.no"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            style={{
              fontStyle: "italic",
              fontWeight: 600,
            }}
          >
            FIRE
          </a>
        </nav>

        <main className="container">
          <Link href="/" className="back-link">
            ← Tilbake
          </Link>

          <h1 className="title">Om Espen Morild</h1>
          <p className="subtitle">
            Podcast- og videoprodusent med 25 års erfaring i digital kinoproduksjon og video/lydproduksjon.
          </p>

          <div className="content">
            <p>
              Jeg er en Bergensbasert medieprodusent som brenner for lyd og bilde.
              Med over to tiår i bransjen har jeg jobbet med alt fra podcaster og
              reklameproduksjon til live streaming og sosiale medier.
            </p>

            <h2>Hva jeg gjør</h2>
            <ul>
              <li>Podcastproduksjon (full syklus: opptak, redigering, publisering)</li>
              <li>Videoredigering</li>
              <li>Lydopptak og redigering</li>
              <li>Live streaming</li>
              <li>Innhold for sosiale medier</li>
              <li>Fotografi</li>
            </ul>

            <h2>Bakgrunn</h2>
            <p>
              Jeg er selvlært innen video- og lydredigering, og har bygget min kompetanse
              gjennom 25 år med praktisk erfaring i feltet. I dag jobber jeg som
              podcast- og videoprodusent hos <span className="highlight">Fire Media</span> i Bergen.
              Tidligere har jeg drevet mitt eget firma, Mainstream AS med fokus på podcast og video,
              og jeg har vært podcastprodusent i innholdsbyrået Apriil Innhold. Ifølge mine midt på
              treet regneferdigheter har jeg faktisk talt opp over 1000 produserte podcastepisoder.
            </p>

            <h2>Verktøy & teknologi</h2>
            <p>
              Jeg jobber med profesjonell redigerings- og opptaksprogramvare som DaVinci Resolve,
              Adobe Premiere, Audition og Logic Pro for video og lyd, og lager musikk på hobbybasis
              i kjellerstuen. Jeg leker meg også med AI-verktøy som OpenClaw, Claude Code etc.
              og har noen AI-prosjekter på si.
            </p>

            <h2>Kontakt</h2>
            <p>
              Interessert i et samarbeid? Ta kontakt via{" "}
              <a href="https://www.firemedia.no" target="_blank" rel="noopener noreferrer" className="contact-link">
                Fire Media
              </a>
              .
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
