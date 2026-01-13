import type { Metadata } from "next";
import { list } from "@vercel/blob";

export const metadata: Metadata = {
  title: "NOW 2025 — Album",
  robots: { index: false, follow: false },
};

function niceTitle(album: string) {
  return album.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const { album } = await params;

  // Viktig: dette må matche pathen du bruker i uploaden:
  // now2025/<album>/<filename>
  const prefix = `now2025/${album}/`;

  const { blobs } = await list({
    prefix,
    limit: 1000,
  });

const images = blobs
  .filter((b) => /\.(jpg|jpeg|png|webp|gif)$/i.test(b.pathname))
  .sort((a, b) => (a.uploadedAt || "").localeCompare(b.uploadedAt || ""));

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "baseline",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>NOW 2025 — {niceTitle(album)}</h1>
          <p style={{ opacity: 0.8, marginTop: 0 }}>
            {images.length} bilder i dette albumet.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/lab/now2025/upload" style={{ opacity: 0.9 }}>
            Upload
          </a>
        </div>
      </div>

      {images.length === 0 ? (
        <p style={{ marginTop: 24, opacity: 0.85 }}>
          Ingen bilder funnet under <code>{prefix}</code>.
          <br />
          Last opp via{" "}
          <a href="/lab/now2025/upload">/lab/now2025/upload</a> og bruk album-navn{" "}
          <code>{album}</code>.
        </p>
      ) : (
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {images.map((img) => (
            <a
              key={img.url}
              href={img.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                textDecoration: "none",
                color: "inherit",
              }}
              title="Åpne original"
            >
              <img
                src={img.url}
                alt={img.pathname}
                loading="lazy"
                style={{
                  width: "100%",
                  height: 240,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div style={{ padding: "10px 10px", fontSize: 12, opacity: 0.8 }}>
                Åpne / last ned
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
