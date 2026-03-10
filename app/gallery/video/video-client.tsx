"use client";

interface YoutubeVideo {
  id: string;
  title: string;
}

interface BlobVideo {
  url: string;
  filename: string;
}

interface Props {
  youtubeVideos: YoutubeVideo[];
  blobVideos: BlobVideo[];
}

export default function VideoClient({ youtubeVideos, blobVideos }: Props) {
  return (
    <>
      <style>{`
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1200px;
        }
        .video-card {
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .video-title {
          padding: 12px 16px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          font-family: system-ui;
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
        background: "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.35), transparent 60%), #000",
        padding: "80px 24px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
      }}>
        {/* Nav */}
        <div style={{ position: "fixed", top: 24, left: 24 }}>
          <a href="/gallery" className="back-link">← Portfolio</a>
        </div>

        <h1 style={{
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 300,
          fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: 0,
          color: "white",
        }}>Video</h1>

        {/* YouTube embeds */}
        <div className="video-grid">
          {youtubeVideos.map((v) => (
            <div key={v.id} className="video-card">
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                />
              </div>
              <div className="video-title">{v.title}</div>
            </div>
          ))}
        </div>

        {/* Blob videos */}
        {blobVideos.length > 0 && (
          <>
            <h2 style={{
              color: "rgba(255,255,255,0.5)",
              fontWeight: 300,
              fontSize: 18,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              Film
            </h2>
            <div className="video-grid">
              {blobVideos.map((v) => (
                <div key={v.url} className="video-card">
                  <video controls style={{ width: "100%", display: "block" }}>
                    <source src={v.url} />
                  </video>
                  <div className="video-title">{v.filename}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
