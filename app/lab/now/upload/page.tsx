"use client";

import React, { useEffect, useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";

type UploadResult = {
  url: string;
  pathname: string;
};

function slugify(input: string) {
  return input
    .trim()
    .replace(/æ/gi, "ae")
    .replace(/ø/gi, "o")
    .replace(/å/gi, "a")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i + 1);

export default function UploadNowPage() {
  const [year, setYear] = useState(currentYear.toString());
  const [album, setAlbum] = useState("");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [uploadAlbums, setUploadAlbums] = useState<string[]>([]);
  const [isLoadingUploadAlbums, setIsLoadingUploadAlbums] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [thumbnailResult, setThumbnailResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit description state
  const [editYear, setEditYear] = useState(currentYear.toString());
  const [editAlbum, setEditAlbum] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [editResult, setEditResult] = useState<string | null>(null);

  // Reorder state
  const [reorderYear, setReorderYear] = useState(currentYear.toString());
  const [reorderAlbum, setReorderAlbum] = useState("");
  const [availableAlbums, setAvailableAlbums] = useState<string[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [reorderPhotos, setReorderPhotos] = useState<{ url: string; filename: string }[]>([]);
  const [existingDescription, setExistingDescription] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [reorderResult, setReorderResult] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const albumSlug = useMemo(() => {
    if (album === "__new__") return slugify(newAlbumName) || "new-album";
    return album || "event-1";
  }, [album, newAlbumName]);
  const editAlbumSlug = useMemo(() => slugify(editAlbum), [editAlbum]);

  // Load albums for upload + reorder sections on mount
  useEffect(() => {
    loadUploadAlbums(year);
    onLoadAlbums(reorderYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUploadAlbums(yearValue: string) {
    setUploadAlbums([]);
    setIsLoadingUploadAlbums(true);
    try {
      const res = await fetch(`/api/blob/albums?year=${yearValue}`);
      if (res.ok) {
        const data = await res.json();
        setUploadAlbums(data.albums || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingUploadAlbums(false);
    }
  }

  async function onUploadPhotos() {
    setError(null);
    setResults([]);

    if (!files || files.length === 0) {
      setError("Select at least one image file.");
      return;
    }

    if (!albumSlug || albumSlug === "event-1" && album === "") {
      setError("Select or create an album.");
      return;
    }

    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const uploads = fileArray.map(async (file, index) => {
        let filename = file.name;
        if (prefix.trim()) {
          const ext = file.name.split(".").pop() || "jpg";
          const num = String(index + 1).padStart(4, "0");
          filename = `${prefix.trim()}_${num}.${ext}`;
        }
        const pathname = `now/${year}/${albumSlug}/${filename}`;

        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          multipart: true,
          clientPayload: JSON.stringify({ year, album: albumSlug }),
        });

        return { url: blob.url, pathname: blob.pathname };
      });

      const completed = await Promise.all(uploads);

      // Upload metadata.json with description if provided
      if (description.trim()) {
        const metadata = JSON.stringify({ description: description.trim() });
        const metadataBlob = new Blob([metadata], { type: "application/json" });
        const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" });
        const metadataPath = `now/${year}/${albumSlug}/metadata.json`;

        await upload(metadataPath, metadataFile, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          clientPayload: JSON.stringify({ type: "album-metadata", year, album: albumSlug }),
        });
      }

      setResults(completed);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsUploading(false);
    }
  }

  async function onLoadAlbums(yearValue: string) {
    setReorderYear(yearValue);
    setReorderAlbum("");
    setReorderPhotos([]);
    setSelectedIndices(new Set());
    setReorderResult(null);
    setAvailableAlbums([]);
    setIsLoadingAlbums(true);
    try {
      const res = await fetch(`/api/blob/albums?year=${yearValue}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableAlbums(data.albums || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingAlbums(false);
    }
  }

  async function onLoadPhotos() {
    setError(null);
    setReorderResult(null);
    setReorderPhotos([]);
    setSelectedIndices(new Set());

    if (!reorderAlbum) {
      setError("Select an album.");
      return;
    }

    setIsLoadingPhotos(true);
    try {
      const res = await fetch(
        `/api/blob/album-photos?year=${reorderYear}&album=${reorderAlbum}`
      );
      if (!res.ok) throw new Error("Failed to load photos");
      const data = await res.json();

      if (data.images.length === 0) {
        setError("No photos found in this album.");
        return;
      }

      setReorderPhotos(data.images);
      setExistingDescription(data.currentDescription);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoadingPhotos(false);
    }
  }

  async function onSaveOrder() {
    setError(null);
    setReorderResult(null);

    if (reorderPhotos.length === 0) {
      setError("Load photos first.");
      return;
    }

    setIsSavingOrder(true);
    try {
      const metadataObj: { description?: string; order: string[] } = {
        order: reorderPhotos.map((p: { url: string; filename: string }) => p.filename),
      };
      if (existingDescription) {
        metadataObj.description = existingDescription;
      }

      const metadata = JSON.stringify(metadataObj);
      const metadataBlob = new Blob([metadata], { type: "application/json" });
      const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" });
      const metadataPath = `now/${reorderYear}/${reorderAlbum}/metadata.json`;

      await upload(metadataPath, metadataFile, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        clientPayload: JSON.stringify({ type: "album-metadata", year: reorderYear, album: reorderAlbum }),
      });

      setReorderResult("Photo order saved!");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSavingOrder(false);
    }
  }

  function toggleSelect(index: number) {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleDragStart(index: number) {
    // If dragging a non-selected photo, select only that one
    if (!selectedIndices.has(index)) {
      setSelectedIndices(new Set([index]));
    }
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex === null) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const selected = selectedIndices.size > 0 ? selectedIndices : new Set([dragIndex]);
    // Collect selected items in their current order
    const selectedItems = Array.from(selected)
      .sort((a, b) => a - b)
      .map((i) => reorderPhotos[i]);
    // Remove selected items
    const remaining = reorderPhotos.filter((_, i) => !selected.has(i));
    // Find the drop position in the remaining array
    let dropPos = index;
    // Adjust drop position: count how many selected items were before the drop index
    const selectedBeforeDrop = Array.from(selected).filter((i) => i < index).length;
    dropPos = index - selectedBeforeDrop;
    // Insert selected items at the drop position
    remaining.splice(dropPos, 0, ...selectedItems);
    setReorderPhotos(remaining);
    setSelectedIndices(new Set());
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  async function onSaveDescription() {
    setError(null);
    setEditResult(null);

    if (!editAlbumSlug) {
      setError("Enter an album name.");
      return;
    }

    if (!editDescription.trim()) {
      setError("Enter a description.");
      return;
    }

    setIsSavingDescription(true);
    try {
      // Fetch existing metadata to preserve order array
      let existingOrder: string[] | null = null;
      try {
        const res = await fetch(`/api/blob/album-photos?year=${editYear}&album=${editAlbumSlug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.currentOrder) existingOrder = data.currentOrder;
        }
      } catch {
        // Ignore - save description without preserving order
      }

      const metadataObj: Record<string, unknown> = { description: editDescription.trim() };
      if (existingOrder) metadataObj.order = existingOrder;

      const metadata = JSON.stringify(metadataObj);
      const metadataBlob = new Blob([metadata], { type: "application/json" });
      const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" });
      const metadataPath = `now/${editYear}/${editAlbumSlug}/metadata.json`;

      await upload(metadataPath, metadataFile, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        clientPayload: JSON.stringify({ type: "album-metadata", year: editYear, album: editAlbumSlug }),
      });

      setEditResult(`Description saved for ${editAlbumSlug}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSavingDescription(false);
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
              onChange={(e) => {
                setYear(e.target.value);
                setAlbum("");
                loadUploadAlbums(e.target.value);
              }}
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
            <span>Album:</span>
            <select
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              disabled={isLoadingUploadAlbums}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
                opacity: isLoadingUploadAlbums ? 0.5 : 1,
              }}
            >
              <option value="">
                {isLoadingUploadAlbums ? "Loading albums..." : "Select an existing album"}
              </option>
              {uploadAlbums.map((slug) => (
                <option key={slug} value={slug}>
                  {slug.replace(/-/g, " ")}
                </option>
              ))}
              <option value="__new__">+ Create new album</option>
            </select>
          </label>

          {album === "__new__" && (
            <label style={{ display: "grid", gap: 6 }}>
              <span>New Album Name:</span>
              <input
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="e.g. NOW come on MAAN"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.2)",
                  color: "inherit",
                }}
              />
              <small style={{ opacity: 0.8 }}>
                Slug: <code>{slugify(newAlbumName) || "..."}</code>
              </small>
            </label>
          )}

          {albumSlug && album && (
            <small style={{ opacity: 0.8 }}>
              Upload path: <code>/lab/now/{year}/{albumSlug}</code>
            </small>
          )}

          <label style={{ display: "grid", gap: 6 }}>
            <span>Description (optional):</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of this album"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Filename Prefix (optional):</span>
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. NOW2025"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
              }}
            />
            <small style={{ opacity: 0.7 }}>
              {prefix.trim()
                ? `Files will be renamed: ${prefix.trim()}_0001.jpg, ${prefix.trim()}_0002.jpg, ...`
                : "Leave empty to keep original filenames."}
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

      {/* Edit Album Description Section */}
      <section style={{
        background: "rgba(255,255,255,0.05)",
        padding: 24,
        borderRadius: 16,
        marginTop: 32,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Edit Album Description</h2>
        <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
          Update or add a description for an existing album.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Year:</span>
            <select
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
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
              value={editAlbum}
              onChange={(e) => setEditAlbum(e.target.value)}
              placeholder="e.g. NOW come on MAAN"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
              }}
            />
            {editAlbumSlug && (
              <small style={{ opacity: 0.8 }}>
                Album slug: <code>{editAlbumSlug}</code>
              </small>
            )}
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Description:</span>
            <input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="A short description of this album"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
              }}
            />
          </label>

          <button
            onClick={onSaveDescription}
            disabled={isSavingDescription || !editAlbumSlug}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: isSavingDescription ? "rgba(255,255,255,0.08)" : "rgba(59,130,246,0.3)",
              color: "inherit",
              cursor: isSavingDescription || !editAlbumSlug ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: !editAlbumSlug ? 0.5 : 1,
            }}
          >
            {isSavingDescription ? "Saving..." : "Save Description"}
          </button>

          {editResult && (
            <div style={{ marginTop: 8, padding: 12, background: "rgba(0,150,136,0.2)", borderRadius: 8 }}>
              <p style={{ fontSize: 14 }}>{editResult}</p>
            </div>
          )}
        </div>
      </section>

      {/* Reorder Album Photos Section */}
      <section style={{
        background: "rgba(255,255,255,0.05)",
        padding: 24,
        borderRadius: 16,
        marginTop: 32,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Reorder Album Photos</h2>
        <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
          Select an album, then click photos to select multiple and drag to reorder.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Year:</span>
            <select
              value={reorderYear}
              onChange={(e) => onLoadAlbums(e.target.value)}
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
            <span>Album:</span>
            <select
              value={reorderAlbum}
              onChange={(e) => {
                setReorderAlbum(e.target.value);
                setReorderPhotos([]);
                setSelectedIndices(new Set());
                setReorderResult(null);
              }}
              disabled={isLoadingAlbums}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.2)",
                color: "inherit",
                opacity: isLoadingAlbums ? 0.5 : 1,
              }}
            >
              <option value="">
                {isLoadingAlbums ? "Loading albums..." : availableAlbums.length === 0 ? "Select year first or no albums found" : "Select an album"}
              </option>
              {availableAlbums.map((slug) => (
                <option key={slug} value={slug}>
                  {slug.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={onLoadPhotos}
            disabled={isLoadingPhotos || !reorderAlbum}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: isLoadingPhotos ? "rgba(255,255,255,0.08)" : "rgba(59,130,246,0.3)",
              color: "inherit",
              cursor: isLoadingPhotos || !reorderAlbum ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: !reorderAlbum ? 0.5 : 1,
            }}
          >
            {isLoadingPhotos ? "Loading..." : "Load Photos"}
          </button>
        </div>

        {reorderPhotos.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 14, opacity: 0.8 }}>
                Click to select, then drag to move. {selectedIndices.size > 0 && `${selectedIndices.size} selected.`}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setSelectedIndices(new Set(reorderPhotos.map((_, i) => i)))}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.1)",
                    color: "inherit",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Select All
                </button>
                {selectedIndices.size > 0 && (
                  <button
                    onClick={() => setSelectedIndices(new Set())}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.1)",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Deselect
                  </button>
                )}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 8,
              }}
            >
              {reorderPhotos.map((photo: { url: string; filename: string }, index: number) => {
                const isSelected = selectedIndices.has(index);
                const isDragging = dragIndex !== null && selectedIndices.has(dragIndex) ? isSelected : dragIndex === index;
                return (
                  <div
                    key={photo.filename}
                    draggable
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSelect(index);
                    }}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "grab",
                      border: dragOverIndex === index
                        ? "2px solid rgba(59,130,246,0.8)"
                        : isSelected
                          ? "2px solid rgba(59,130,246,0.6)"
                          : "2px solid transparent",
                      opacity: isDragging ? 0.4 : 1,
                      transition: "border-color 0.15s ease, opacity 0.15s ease",
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(59,130,246,0.9)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        &#10003;
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                        padding: "16px 6px 4px",
                        fontSize: 10,
                        color: "#fff",
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onSaveOrder}
              disabled={isSavingOrder}
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: isSavingOrder ? "rgba(255,255,255,0.08)" : "rgba(0,150,136,0.3)",
                color: "inherit",
                cursor: isSavingOrder ? "not-allowed" : "pointer",
                fontWeight: 600,
                width: "100%",
              }}
            >
              {isSavingOrder ? "Saving..." : "Save Order"}
            </button>

            {reorderResult && (
              <div style={{ marginTop: 8, padding: 12, background: "rgba(0,150,136,0.2)", borderRadius: 8 }}>
                <p style={{ fontSize: 14 }}>{reorderResult}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
