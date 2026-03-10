import Link from "next/link";

export const metadata = {
  title: "Portfolio – Morildinho.no",
  robots: { index: false, follow: false },
};

export default function PortfolioPage() {
  return (
    <>
      <style>{`
        .portfolio-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 48px 64px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          text-decoration: none;
          color: white;
          transition: border-color 0.3s, background 0.3s, transform 0.2s;
          cursor: pointer;
          min-width: 200px;
        }
        .portfolio-card:hover {
          border-color: rgba(59,130,246,0.6);
          background: rgba(59,130,246,0.08);
          transform: translateY(-2px);
        }
        .card-title {
          font-size: 28px;
          font-weight: 600;
          font-family: 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
          letter-spacing: 0.05em;
        }
        .card-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          font-family: system-ui, -apple-system, sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .back-link {
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          font-size: 14px;
          font-family: system-ui;
          transition: color 0.2s;
        }
        .back-link:hover { color: rgba(255,255,255,0.8); }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(900px 500px at 10% 30%, rgba(59,130,246,0.15), transparent 60%), #000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: 24,
      }}>
        {/* Back nav */}
        <div style={{ position: "fixed", top: 24, left: 24 }}>
          <Link href="/" className="back-link">← Hjem</Link>
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 300,
          fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: 0,
          color: "white",
        }}>Portfolio</h1>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/gallery/foto" className="portfolio-card">
            <span className="card-title">FOTO</span>
          </Link>
          <Link href="/gallery/video" className="portfolio-card">
            <span className="card-title">VIDEO</span>
          </Link>
        </div>
      </div>
    </>
  );
}
