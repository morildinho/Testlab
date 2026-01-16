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

  let cursor: string | undefined;
  do {
    const response = await list({
      prefix: `now/${year}/${albumSlug}/`,
      cursor,
    });

    for (const blob of response.blobs) {
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

  // Sort by uploadedAt descending (newest first)
  images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

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
          padding: 2.5rem 2rem;
          text-align: center;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%);
        }

        .hero-logo {
          width: clamp(140px, 30vw, 240px);
          height: auto;
          margin-bottom: 1rem;
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
          text-transform: capitalize;
        }

        .hero-title {
          font-size: clamp(1.75rem, 5vw, 2.75rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
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
          <img
            src="/images/NOW_white.webp"
            alt="NOW"
            className="hero-logo"
          />
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
