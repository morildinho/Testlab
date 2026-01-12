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

export default function UploadNow2025() {
  const [album, setAlbum] = useState("event-1");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const albumSlug = useMemo(() => slugify(album) || "event-1", [album]);

  async function onUpload() {
    setError(null);
    setResults([]);

    if (!files || files.length === 0) {
      setError("Velg minst én bildefil.");
      return;
    }

    setIsUploading(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const pathname = `now2025/${albumSlug}/${file.name}`;

        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          multipart: true, // robust for større filer
          clientPayload: JSON.stringify({ album: albumSlug }),
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

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ marginBottom: 8 }}>NOW 2025 — Upload</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Last opp bilder til album (event-1, event-2, osv.). Bildene lagres i Vercel
        Blob under <code>now2025/&lt;album&gt;/</code>.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Album (blir del av URL):</span>
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
            Forhåndsvisning:{" "}
            <code>/lab/now2025/{albumSlug}</code>
          </small>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Bilder:</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
        </label>

        <button
          onClick={onUpload}
          disabled={isUploading}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.18)",
            background: isUploading ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)",
            color: "inherit",
            cursor: isUploading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {isUploading ? "Laster opp..." : "Last opp"}
        </button>

        {error && (
          <p style={{ color: "tomato", marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>

      {results.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 18 }}>Ferdig lastet opp</h2>
          <ul style={{ paddingLeft: 18 }}>
            {results.map((r) => (
              <li key={r.url} style={{ marginBottom: 6 }}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.pathname}
                </a>
              </li>
            ))}
          </ul>

          <p style={{ opacity: 0.85 }}>
            Se albumet her:{" "}
            <a href={`/lab/now2025/${albumSlug}`}>
              /lab/now2025/{albumSlug}
            </a>
          </p>
        </section>
      )}
    </main>
  );
}

