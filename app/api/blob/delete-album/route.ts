import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const { year, album } = await request.json();

    if (!year || !album) {
      return NextResponse.json({ error: "Missing year or album" }, { status: 400 });
    }

    const prefix = `now/${year}/${album}/`;
    const urlsToDelete: string[] = [];

    let cursor: string | undefined;
    do {
      const response = await list({ prefix, cursor });
      for (const blob of response.blobs) {
        urlsToDelete.push(blob.url);
      }
      cursor = response.cursor;
    } while (cursor);

    if (urlsToDelete.length === 0) {
      return NextResponse.json({ error: "No files found in this album" }, { status: 404 });
    }

    await del(urlsToDelete);

    return NextResponse.json({ deleted: urlsToDelete.length });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
