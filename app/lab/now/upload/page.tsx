"use client";

import { useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";

type UploadResult = {
  url: string;
  pathname: string;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i + 1);

export default function UploadNowPage() {
  const [year, setYear] = useState(currentYear.toString());
  const [album, setAlbum] = useState("event-1");
  const [files, setFiles] = useState<FileList | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [thumbnailResult, setThumbnailResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const albumSlug = useMemo(() => slugify(album) || "event-1", [album]);

  async function onUploadPhotos() {
    setError(null);
    setResults([]);

    if (!files || files.length === 0) {
      setError("Select at least one image file.");
      return;
    }

    setIsUploading(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const pathname = `now/${year}/${albumSlug}/${file.name}`;

        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          multipart: true,
          clientPayload: JSON.stringify({ year, album: albumSlug }),
        });

        return { url: blob.url, pathname: blob.pathname };
      });

      const completed = await Promise.all(uploads);
      setResults(completed);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsUploading(false);
    }
  }

  async function onUploadThumbnail() {
    setError(null);
    setThumbnailResult(null);

    if (!thumbnailFile) {
      setError("Select a thumbnail image.");
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      // Get file extension
      const ext = thumbnailFile.name.split('.').pop() || 'jpg';
      const pathname = `now/${year}-thumbnail.${ext}`;

      const blob = await upload(pathname, thumbnailFile, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        multipart: true,
        clientPayload: JSON.stringify({ type: "year-thumbnail", year }),
      });

      setThumbnailResult({ url: blob.url, pathname: blob.pathname });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsUploadingThumbnail(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ marginBottom: 8 }}>NOW Highlights — Upload</h1>
      <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 32 }}>
        Upload photos to NOW event albums. Choose a year and album name.
      </p>

      {/* Year Thumbnail Section */}
      <section style={{
        background: "rgba(255,255,255,0.05)",
        padding: 24,
        borderRadius: 16,
        marginBottom: 32,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Year Thumbnail</h2>
        <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
          Set a thumbnail image for the year card on the landing page.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Year:</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Thumbnail Image:</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            onClick={onUploadThumbnail}
            disabled={isUploadingThumbnail || !thumbnailFile}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: isUploadingThumbnail ? "rgba(255,255,255,0.08)" : "rgba(59,130,246,0.3)",
              color: "inherit",
              cursor: isUploadingThumbnail || !thumbnailFile ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: !thumbnailFile ? 0.5 : 1,
            }}
          >
            {isUploadingThumbnail ? "Uploading..." : "Set Year Thumbnail"}
          </button>

          {thumbnailResult && (
            <div style={{ marginTop: 8, padding: 12, background: "rgba(0,150,136,0.2)", borderRadius: 8 }}>
              <p style={{ fontSize: 14 }}>Thumbnail uploaded for {year}!</p>
              <a href={thumbnailResult.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, opacity: 0.8 }}>
                View thumbnail
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Photo Upload Section */}
      <section style={{
        background: "rgba(255,255,255,0.05)",
        padding: 24,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Upload Photos</h2>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Year:</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Album Name:</span>
            <input
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="event-1"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
              }}
            />
            <small style={{ opacity: 0.8 }}>
              Preview: <code>/lab/now/{year}/{albumSlug}</code>
            </small>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Photos:</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
          </label>

          <button
            onClick={onUploadPhotos}
            disabled={isUploading}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: isUploading ? "rgba(255,255,255,0.08)" : "rgba(0,150,136,0.3)",
              color: "inherit",
              cursor: isUploading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {isUploading ? "Uploading..." : "Upload Photos"}
          </button>

          {error && (
            <p style={{ color: "tomato", marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>

        {results.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Uploaded Successfully</h3>
            <ul style={{ paddingLeft: 18, fontSize: 14 }}>
              {results.map((r) => (
                <li key={r.url} style={{ marginBottom: 6 }}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.pathname}
                  </a>
                </li>
              ))}
            </ul>

            <p style={{ opacity: 0.85, marginTop: 16 }}>
              View album:{" "}
              <a href={`/lab/now/${year}/${albumSlug}`}>
                /lab/now/{year}/{albumSlug}
              </a>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
