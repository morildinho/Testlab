import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json({ error: "Missing year" }, { status: 400 });
  }

  const imageExtensions = /\.(jpg|jpeg|png|webp|gif)$/i;
  const albumSlugs = new Set<string>();

  let cursor: string | undefined;
  do {
    const response = await list({
      prefix: `now/${year}/`,
      cursor,
    });

    for (const blob of response.blobs) {
      const parts = blob.pathname.split("/");
      if (parts.length < 4) continue;
      // Only count albums that have actual images
      if (imageExtensions.test(blob.pathname)) {
        albumSlugs.add(parts[2]);
      }
    }
    cursor = response.cursor;
  } while (cursor);

  const albums = Array.from(albumSlugs).sort();

  return NextResponse.json({ albums });
}
