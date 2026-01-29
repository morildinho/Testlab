import type { Metadata } from "next";
import { list } from "@vercel/blob";
import Link from "next/link";
import { headers } from "next/headers";
import GalleryClient from "./gallery-client";

export const dynamic = "force-dynamic";

// Returns base path based on host
async function getBasePath() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  return host === "highlights.nowla.org" ? "" : "/lab/now";
}

export interface GalleryImage {
  url: string;
  pathname: string;
  filename: string;
  uploadedAt: Date;
}

async function getAlbumImages(year: string, albumSlug: string): Promise<GalleryImage[]> {
  const images: GalleryImage[] = [];
  const imageExtensions = /\.(jpg|jpeg|png|webp|gif)$/i;
  let metadataUrl: string | null = null;

  let cursor: string | undefined;
  do {
    const response = await list({
      prefix: `now/${year}/${albumSlug}/`,
      cursor,
    });

    for (const blob of response.blobs) {
      // Track metadata.json URL
      if (blob.pathname.endsWith("metadata.json")) {
        metadataUrl = blob.url;
        continue;
      }

      // Filter by image extension
      if (!imageExtensions.test(blob.pathname)) continue;

      const uploadedAt =
        blob.uploadedAt instanceof Date
          ? blob.uploadedAt
          : new Date(blob.uploadedAt);

      const pathSegments = blob.pathname.split("/");
      const filename = pathSegments[pathSegments.length - 1];

      images.push({
        url: blob.url,
        pathname: blob.pathname,
        filename,
        uploadedAt,
      });
    }

    cursor = response.cursor;
  } while (cursor);

  // Check for custom order in metadata.json
  let orderArray: string[] | null = null;
  if (metadataUrl) {
    try {
      const res = await fetch(metadataUrl, { cache: "no-store" });
      if (res.ok) {
        const meta = await res.json();
        if (Array.isArray(meta.order) && meta.order.length > 0) {
          orderArray = meta.order;
        }
      }
    } catch {
      // Ignore - fall back to date sort
    }
  }

  if (orderArray) {
    const orderMap = new Map<string, number>();
    orderArray.forEach((filename, index) => orderMap.set(filename, index));

    images.sort((a, b) => {
      const aIdx = orderMap.get(a.filename);
      const bIdx = orderMap.get(b.filename);
      if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
      if (aIdx !== undefined) return -1;
      if (bIdx !== undefined) return 1;
      return b.uploadedAt.getTime() - a.uploadedAt.getTime();
    });
  } else {
    images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  return images;
}

// Dynamic metadata for Open Graph sharing
interface MetadataProps {
  params: Promise<{ year: string; album: string }>;
  searchParams: Promise<{ photo?: string }>;
}

export async function generateMetadata({ params, searchParams }: MetadataProps): Promise<Metadata> {
  const { year, album } = await params;
  const { photo } = await searchParams;
  const albumDisplayName = album.replace(/-/g, " ");

  // Get images to find the specific photo if shared
  const images = await getAlbumImages(year, album);
  const photoIndex = photo ? parseInt(photo, 10) : null;
  const specificPhoto = photoIndex !== null && images[photoIndex] ? images[photoIndex] : null;

  // Use specific photo or first image as thumbnail
  const ogImage = specificPhoto?.url || images[0]?.url || "/images/NOW_white.webp";

  const title = specificPhoto
    ? `Photo from ${albumDisplayName} – NOW ${year}`
    : `${albumDisplayName} – NOW ${year}`;

  const description = specificPhoto
    ? `Check out this photo from the ${albumDisplayName} album at NOW ${year}`
    : `View photos from the ${albumDisplayName} album at NOW ${year}`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: specificPhoto ? `Photo from ${albumDisplayName}` : albumDisplayName,
        },
      ],
      type: "website",
      siteName: `NOW ${year}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

interface PageProps {
  params: Promise<{ year: string; album: string }>;
}

export default async function AlbumPage({ params }: PageProps) {
  const { year, album } = await params;
  const images = await getAlbumImages(year, album);
  const basePath = await getBasePath();

  const albumDisplayName = album.replace(/-/g, " ");

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

        .hero-logo-link {
          display: inline-block;
          transition: opacity 0.2s ease;
        }

        .hero-logo-link:hover {
          opacity: 0.85;
        }

        .hero-logo {
          width: clamp(180px, 40vw, 320px);
          height: auto;
          margin-bottom: 1.5rem;
        }

        .breadcrumb {
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .breadcrumb a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb a:hover {
          color: #fff;
        }

        .breadcrumb-sep {
          margin: 0 0.5rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .breadcrumb-current {
          color: #fff;
          font-weight: 600;
        }

        .hero-title {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .hero-meta {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 16px;
        }

        .empty-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .empty-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .empty-text {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.5rem;
        }

        .empty-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          text-decoration: none;
          padding: 0.65rem 1.25rem;
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
          <a href="https://www.nowla.org/" className="hero-logo-link">
            <img
              src="/images/NOW_white.webp"
              alt="NOW"
              className="hero-logo"
            />
          </a>
          <nav className="breadcrumb">
            <Link href={basePath || "/"}>All Years</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href={`${basePath}/${year}`}>{year}</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{albumDisplayName}</span>
          </nav>
          <h1 className="hero-title">{albumDisplayName}</h1>
          <p className="hero-meta">
            {images.length} photo{images.length !== 1 ? "s" : ""}
          </p>
        </header>

        <main className="container">
          {images.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h2 className="empty-title">No Photos in This Album</h2>
              <p className="empty-text">
                This album doesn&apos;t have any images yet.
              </p>
              <Link href={`${basePath}/${year}`} className="empty-link">
                <span>←</span> Back to Albums
              </Link>
            </div>
          ) : (
            <GalleryClient images={images} albumName={albumDisplayName} />
          )}
        </main>
      </div>
    </>
  );
}
