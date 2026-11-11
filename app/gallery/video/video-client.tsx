"use client";

// En video er enten en YouTube-video (id) eller en egen videofil (videoUrl, f.eks. mp4 i Vercel Blob).
export interface VideoItem {
  id?: string;
  videoUrl?: string;
  poster?: string;
  title: string;
  description: string;
}

interface Props {
  youtubeVideos: VideoItem[];
  youtubeShorts: VideoItem[];
}

const fill = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" } as const;

function VideoCard({ video, ratio }: { video: VideoItem; ratio: string }) {
  return (
    <div className="video-card">
      <div style={{ position: "relative", paddingBottom: ratio, height: 0, background: "#000" }}>
        {video.videoUrl ? (
          <video
            src={video.videoUrl}
            controls
            playsInline
            preload="none"
            poster={video.poster}
            title={video.title}
            style={{ ...fill, objectFit: "cover" }}
          />
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={fill}
          />
        )}
      </div>
      <div className="video-info">
        <div className="video-title">{video.title}</div>
        <div className="video-desc">{video.description}</div>
      </div>
    </div>
  );
}

export default function VideoClient({ youtubeVideos, youtubeShorts }: Props) {
  return (
    <>
      <style>{`
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1200px;
        }
        .shorts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 300px));
          justify-content: center;
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
        .video-info {
          padding: 12px 16px 14px;
          font-family: system-ui;
        }
        .video-title {
          font-size: 14px;
          color: rgba(255,255,255,0.85);
        }
        .video-desc {
          margin-top: 4px;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
        }
        .section-title {
          color: rgba(255,255,255,0.5);
          font-weight: 300;
          font-size: 18px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0;
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

        {/* Liggende YouTube-videoer */}
        <div className="video-grid">
          {youtubeVideos.map((v) => (
            <VideoCard key={v.id ?? v.videoUrl} video={v} ratio="56.25%" />
          ))}
        </div>

        {/* Stående YouTube Shorts */}
        {youtubeShorts.length > 0 && (
          <>
            <h2 className="section-title">Shorts</h2>
            <div className="shorts-grid">
              {youtubeShorts.map((v) => (
                <VideoCard key={v.id ?? v.videoUrl} video={v} ratio="177.78%" />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
