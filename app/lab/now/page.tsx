import type { Metadata } from "next";
import { list } from "@vercel/blob";
import Link from "next/link";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NOW Highlights",
  description: "See all the highlights from past NOW events",
  robots: {
    index: false,
    follow: false,
  },
};

// Returns base path based on host
async function getBasePath() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  return host === "highlights.nowla.org" ? "" : "/lab/now";
}

interface YearInfo {
  year: string;
  thumbnailUrl: string | null;
  albumCount: number;
}

async function getYears(): Promise<YearInfo[]> {
  const yearMap = new Map<string, { thumbnail: string | null; albums: Set<string> }>();
  const imageExtensions = /\.(jpg|jpeg|png|webp|gif)$/i;

  let cursor: string | undefined;
  do {
    const response = await list({
      prefix: "now/",
      cursor,
    });

    for (const blob of response.blobs) {
      // Check for year thumbnail (now/2025-thumbnail.jpg)
      const thumbnailMatch = blob.pathname.match(/^now\/(\d{4})-thumbnail\./);
      if (thumbnailMatch) {
        const year = thumbnailMatch[1];
        const existing = yearMap.get(year) || { thumbnail: null, albums: new Set() };
        existing.thumbnail = blob.url;
        yearMap.set(year, existing);
        continue;
      }

      // Check for album images (now/2025/album-name/photo.jpg)
      if (!imageExtensions.test(blob.pathname)) continue;

      const parts = blob.pathname.split("/");
      if (parts.length >= 4) {
        const year = parts[1];
        const album = parts[2];

        if (/^\d{4}$/.test(year)) {
          const existing = yearMap.get(year) || { thumbnail: null, albums: new Set() };
          existing.albums.add(album);
          yearMap.set(year, existing);
        }
      }
    }

    cursor = response.cursor;
  } while (cursor);

  const years: YearInfo[] = [];
  for (const [year, data] of yearMap) {
    years.push({
      year,
      thumbnailUrl: data.thumbnail,
      albumCount: data.albums.size,
    });
  }

  // Sort by year descending (newest first)
  years.sort((a, b) => parseInt(b.year) - parseInt(a.year));

  return years;
}

export default async function NowLandingPage() {
  const years = await getYears();
  const basePath = await getBasePath();

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .page {
          min-height: 100vh;
          background: #ffffff;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .hero {
          padding: 4rem 2rem;
          text-align: center;
        }

        .hero-logo {
          width: clamp(200px, 30vw, 300px);
          height: auto;
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.75rem;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: #718096;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .years-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          justify-items: center;
        }

        .year-card {
          width: 100%;
          max-width: 320px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.3s ease;
        }

        .year-card:hover {
          transform: translateY(-8px);
        }

        .year-thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          background: #E9A84A;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .year-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .year-label {
          text-align: center;
          margin-top: 1rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
        }

        .year-album-count {
          text-align: center;
          font-size: 0.9rem;
          color: #718096;
          margin-top: 0.25rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.75rem;
        }

        .empty-text {
          color: #718096;
        }
      `}</style>

      <div className="page">
        <header className="hero">
          <img
            src="/images/NOW_logo_dark.png"
            alt="NOW - Nordic Opportunity Week"
            className="hero-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="hero-title">NOW Highlights</h1>
          <p className="hero-subtitle">See all the highlights from past NOW events</p>
        </header>

        <main className="container">
          {years.length === 0 ? (
            <div className="empty-state">
              <h2 className="empty-title">No Events Yet</h2>
              <p className="empty-text">Check back later for highlights from NOW events.</p>
            </div>
          ) : (
            <div className="years-grid">
              {years.map((yearInfo) => (
                <Link
                  key={yearInfo.year}
                  href={`${basePath}/${yearInfo.year}`}
                  className="year-card"
                >
                  <div className="year-thumbnail">
                    {yearInfo.thumbnailUrl && (
                      <img
                        src={yearInfo.thumbnailUrl}
                        alt={`NOW ${yearInfo.year}`}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="year-label">{yearInfo.year}</div>
                  {yearInfo.albumCount > 0 && (
                    <div className="year-album-count">
                      {yearInfo.albumCount} album{yearInfo.albumCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
