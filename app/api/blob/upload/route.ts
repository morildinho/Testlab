import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        // Enkle "guardrails" - allow paths like "now/2025/album/photo.jpg" or "now/2025-thumbnail.jpg"
        if (!pathname.startsWith("now/")) {
          throw new Error("Invalid upload path. Must start with now/.");
        }

        // valgfritt: hindre rot i root
        if (!pathname.includes("/")) {
          throw new Error("Invalid upload path.");
        }

        // Allow JSON for album metadata files
        const isMetadata = pathname.endsWith("metadata.json");
        const allowedTypes = isMetadata
          ? ["application/json"]
          : ALLOWED_IMAGE_TYPES;

        return {
          // Metadata files use exact path (allows overwrite on edit), images get random suffix
          addRandomSuffix: !isMetadata,

          allowedContentTypes: allowedTypes,
          maximumSizeInBytes: isMetadata ? 1024 * 10 : 25 * 1024 * 1024, // 10KB for metadata, 25MB for images

          // Du kan bruke dette senere hvis du vil “logge” hvem/hvilket album
          tokenPayload: JSON.stringify({
            clientPayload,
            multipart,
          }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Her kan du senere skrive til DB / logg / etc.
        console.log("Upload completed:", blob.url, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

