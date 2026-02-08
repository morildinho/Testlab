import { list } from "@vercel/blob";
import Link from "next/link";
import GalleryClient from "./gallery-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Photo Gallery – Morildinho.no",
  robots: { index: false, follow: false },
};

interface GalleryImage {
  url: string;
  pathname: string;
  filename: string;
  uploadedAt: Date;
}

async function getImages(): Promise<GalleryImage[]> {
  const imageExtensions = /\.(jpg|jpeg|png|webp|gif)$/i;
  const images: GalleryImage[] = [];

  let cursor: string | undefined;
  do {
    const response = await list({
      prefix: "gallery/",
      cursor,
    });

    for (const blob of response.blobs) {
      if (!imageExtensions.test(blob.pathname)) continue;

      const filename = blob.pathname.split("/").pop() || blob.pathname;
      images.push({
        url: blob.url,
        pathname: blob.pathname,
        filename,
        uploadedAt:
          blob.uploadedAt instanceof Date
            ? blob.uploadedAt
            : new Date(blob.uploadedAt),
      });
    }

    cursor = response.cursor;
  } while (cursor);

  images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  return images;
}

export default async function GalleryPage() {
  const images = await getImages();

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .gallery-page {
          min-height: 100vh;
          background: radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.35), transparent 60%),
                      radial-gradient(900px 500px at 10% 30%, rgba(59,130,246,0.15), transparent 60%),
                      radial-gradient(900px 500px at 90% 70%, rgba(147,51,234,0.12), transparent 60%),
                      #000;
          color: #fff;
          font-family: 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
        }

        .gallery-header {
          padding: 3rem 2rem 2rem;
          text-align: center;
        }

        .gallery-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          transition: color 0.2s;
        }

        .gallery-back:hover {
          color: #fff;
        }

        .gallery-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .gallery-subtitle {
          color: rgba(255,255,255,0.6);
          font-size: 0.95rem;
        }

        .gallery-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 4rem;
        }

        .empty-state {
          text-align: center;
          padding: 6rem 2rem;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: rgba(255,255,255,0.8);
        }

        .empty-text {
          color: rgba(255,255,255,0.5);
        }
      `}</style>

      <div className="gallery-page">
        <header className="gallery-header">
          <div>
            <Link href="/" className="gallery-back">
              ← Back
            </Link>
          </div>
          <h1 className="gallery-title">PHOTO GALLERY</h1>
          <p className="gallery-subtitle">{images.length} photos</p>
        </header>

        <main className="gallery-container">
          {images.length === 0 ? (
            <div className="empty-state">
              <h2 className="empty-title">No Photos Yet</h2>
              <p className="empty-text">
                Upload photos to the &quot;gallery/&quot; folder in Vercel Blob
                to see them here.
              </p>
            </div>
          ) : (
            <GalleryClient images={images} />
          )}
        </main>
      </div>
    </>
  );
}
