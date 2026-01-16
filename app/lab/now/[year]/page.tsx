import type { Metadata } from "next";
import { list } from "@vercel/blob";
import Link from "next/link";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// Returns base path based on host
async function getBasePath() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  return host === "highlights.nowla.org" ? "" : "/lab/now";
}

interface AlbumInfo {
  slug: string;
  imageCount: number;
  thumbnailUrl: string;
  latestUpload: Date;
}

async function getAlbums(year: string): Promise<AlbumInfo[]> {
  const albumMap = new Map<
    string,
    { count: number; newestUrl: string; newestDate: Date }
  >();

  const imageExtensions = /\.(jpg|jpeg|png|webp|gif)$/i;

  let cursor: string | undefined;
  do {
    const response = await list({
      prefix: `now/${year}/`,
      cursor,
    });

    for (const blob of response.blobs) {
      // Skip non-image files
      if (!imageExtensions.test(blob.pathname)) continue;

      // Extract album name: now/2025/album-name/photo.jpg
      const parts = blob.pathname.split("/");
      if (parts.length < 4) continue;

      const albumSlug = parts[2];
      const uploadedAt =
        blob.uploadedAt instanceof Date
          ? blob.uploadedAt
          : new Date(blob.uploadedAt);

      const existing = albumMap.get(albumSlug);
      if (existing) {
        existing.count++;
        if (uploadedAt.getTime() > existing.newestDate.getTime()) {
          existing.newestUrl = blob.url;
          existing.newestDate = uploadedAt;
        }
      } else {
        albumMap.set(albumSlug, {
          count: 1,
          newestUrl: blob.url,
          newestDate: uploadedAt,
        });
      }
    }

    cursor = response.cursor;
  } while (cursor);

  const albums: AlbumInfo[] = [];
  for (const [slug, data] of albumMap) {
    albums.push({
      slug,
      imageCount: data.count,
      thumbnailUrl: data.newestUrl,
      latestUpload: data.newestDate,
    });
  }

  // Sort albums by latest upload (newest first)
  albums.sort((a, b) => b.latestUpload.getTime() - a.latestUpload.getTime());

  return albums;
}

interface MetadataProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { year } = await params;

  return {
    title: `NOW ${year} – Photo Albums`,
    description: `View photos from NOW ${year} events`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface PageProps {
  params: Promise<{ year: string }>;
}

export default async function YearPage({ params }: PageProps) {
  const { year } = await params;
  const albums = await getAlbums(year);
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
          background: linear-gradient(135deg, #006263 0%, #007c7c 100%);
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .hero {
          padding: 3rem 2rem;
          text-align: center;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%);
        }

        .hero-logo {
          width: clamp(180px, 40vw, 320px);
          height: auto;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .hero-subtitle {
          font-size: clamp(0.95rem, 2.5vw, 1.15rem);
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
        }

        .hero-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #fff;
          text-decoration: none;
          font-size: 0.9rem;
          padding: 0.65rem 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .hero-link:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .albums-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .album-card {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .album-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .album-thumbnail {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
          background: rgba(0, 0, 0, 0.3);
        }

        .album-info {
          padding: 1.25rem;
        }

        .album-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
        }

        .album-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .album-count {
          background: rgba(255, 255, 255, 0.15);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 16px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .empty-text {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.5rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .empty-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          transition: background 0.3s ease;
        }

        .empty-link:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div className="page">
        <header className="hero">
          <img
            src="/images/NOW_white.webp"
            alt="NOW"
            className="hero-logo"
          />
          <h1 className="hero-title">NOW {year}</h1>
          <p className="hero-subtitle">Photo Albums & Highlights</p>
          <div className="hero-links">
            <a href="https://nowla.org" className="hero-link">
              <span>←</span> Back to nowla.org
            </a>
            <Link href={basePath || "/"} className="hero-link">
              All Years
            </Link>
          </div>
        </header>

        <main className="container">
          {albums.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📷</div>
              <h2 className="empty-title">No Albums Yet</h2>
              <p className="empty-text">
                No photos have been uploaded for {year} yet.
              </p>
              <Link href={basePath || "/"} className="empty-link">
                <span>←</span> Back to All Years
              </Link>
            </div>
          ) : (
            <div className="albums-grid">
              {albums.map((album) => (
                <Link
                  key={album.slug}
                  href={`${basePath}/${year}/${album.slug}`}
                  className="album-card"
                >
                  <img
                    src={album.thumbnailUrl}
                    alt={`${album.slug} album thumbnail`}
                    className="album-thumbnail"
                    loading="lazy"
                  />
                  <div className="album-info">
                    <h2 className="album-name">
                      {album.slug.replace(/-/g, " ")}
                    </h2>
                    <div className="album-meta">
                      <span>
                        Updated{" "}
                        {album.latestUpload.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="album-count">
                        {album.imageCount} photo{album.imageCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
