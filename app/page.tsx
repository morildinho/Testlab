export const metadata = {
  title: "Morildinho.no",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        background:
          "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(900px 500px at 10% 30%, rgba(59,130,246,0.15), transparent 60%), radial-gradient(900px 500px at 90% 70%, rgba(147,51,234,0.12), transparent 60%), #000",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img
            src="/next.svg"
            alt="Logo"
            style={{
              width: 32,
              height: 32,
              filter: "invert(1)",
            }}
          />
          <span style={{ fontSize: 18, fontWeight: 700 }}>
            Morildinho AI Lab
          </span>
          <div
            style={{
              display: "none",
              gap: 18,
              fontSize: 14,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
              About
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main
        style={{
          minHeight: "100vh",
          paddingTop: 96,
          paddingLeft: 16,
          paddingRight: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
            marginBottom: 32,
          }}
        >
          Experimental AI Research Lab
        </p>

        <h1
          style={{
            margin: 0,
            marginBottom: 24,
            fontSize: "clamp(44px, 6vw, 96px)",
            fontWeight: 600,
            lineHeight: 0.95,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
          }}
        >
          MORILDINHO.NO
        </h1>

        <div style={{ position: "relative" }}>
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
        </div>

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
      </main>
    </div>
  );
}
