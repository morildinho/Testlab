export const metadata = {
  title: "Morildinho.no",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <style>{`
        .nav-link {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          font-family: 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: rgba(255,255,255,1);
        }
      `}</style>
    <div
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        background:
          "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(900px 500px at 10% 30%, rgba(59,130,246,0.15), transparent 60%), radial-gradient(900px 500px at 90% 70%, rgba(147,51,234,0.12), transparent 60%), #000",
      }}
    >
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
        <a href="/om" className="nav-link">
          Om Espen
        </a>
        <a
          href="https://www.firemedia.no"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontStyle: "italic",
            fontWeight: 600,
          }}
        >
          FIRE
        </a>
      </nav>

      {/* Hero - Centered image */}
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <img
          src="/images/morild-graffiti.webp"
          alt="Morild Graffiti"
          loading="eager"
          style={{
            width: "clamp(380px, 50vw, 700px)",
            height: "auto",
            objectFit: "contain",
            mixBlendMode: "lighten",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
            filter:
              "drop-shadow(0 0 40px rgba(59,130,246,0.5)) saturate(1.1)",
          }}
        />
      </main>

      {/* Bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 384,
          height: 192,
          borderRadius: 9999,
          filter: "blur(60px)",
          opacity: 0.3,
          background:
            "radial-gradient(ellipse, rgba(59,130,246,1) 0%, transparent 70%)",
        }}
      />

      {/* Ground line */}
      <div
        style={{
          position: "absolute",
          bottom: 96,
          left: "50%",
          transform: "translateX(-50%)",
          width: 128,
          height: 4,
          borderRadius: 9999,
          background:
            "linear-gradient(90deg, transparent, rgba(59,130,246,1), transparent)",
          boxShadow: "0 0 20px rgba(59,130,246,0.5)",
        }}
      />
    </div>
    </>
  );
}
