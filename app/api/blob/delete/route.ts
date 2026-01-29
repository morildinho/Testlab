import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Missing urls array" }, { status: 400 });
    }

    // Validate that all URLs are Vercel Blob URLs
    for (const url of urls) {
      if (typeof url !== "string" || !url.includes(".vercel-storage.com/")) {
        return NextResponse.json(
          { error: "Invalid blob URL: " + url },
          { status: 400 }
        );
      }
    }

    await del(urls);

    return NextResponse.json({ deleted: urls.length });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
