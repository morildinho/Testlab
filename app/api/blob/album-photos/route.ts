import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const album = searchParams.get("album");

  if (!year || !album) {
    return NextResponse.json({ error: "Missing year or album" }, { status: 400 });
  }

  const imageExtensions = /\.(jpg|jpeg|png|webp|gif)$/i;
  const images: { url: string; filename: string; uploadedAt: string }[] = [];
  let metadataUrl: string | null = null;

  let cursor: string | undefined;
  do {
    const response = await list({
      prefix: `now/${year}/${album}/`,
      cursor,
    });

    for (const blob of response.blobs) {
      if (blob.pathname.endsWith("metadata.json")) {
        metadataUrl = blob.url;
        continue;
      }
      if (!imageExtensions.test(blob.pathname)) continue;

      const pathSegments = blob.pathname.split("/");
      const filename = pathSegments[pathSegments.length - 1];

      images.push({
        url: blob.url,
        filename,
        uploadedAt: new Date(blob.uploadedAt).toISOString(),
      });
    }
    cursor = response.cursor;
  } while (cursor);

  // Default sort by date (newest first)
  images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  // Fetch existing metadata
  let currentOrder: string[] | null = null;
  let currentDescription: string | null = null;
  if (metadataUrl) {
    try {
      const res = await fetch(metadataUrl, { cache: "no-store" });
      if (res.ok) {
        const meta = await res.json();
        if (Array.isArray(meta.order)) currentOrder = meta.order;
        if (meta.description) currentDescription = meta.description;
      }
    } catch {
      // Ignore
    }
  }

  // If saved order exists, sort by it
  if (currentOrder && currentOrder.length > 0) {
    const orderMap = new Map<string, number>();
    currentOrder.forEach((fn, i) => orderMap.set(fn, i));
    images.sort((a, b) => {
      const aIdx = orderMap.get(a.filename);
      const bIdx = orderMap.get(b.filename);
      if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
      if (aIdx !== undefined) return -1;
      if (bIdx !== undefined) return 1;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }

  return NextResponse.json({ images, currentOrder, currentDescription });
}
