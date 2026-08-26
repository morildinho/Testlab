import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { checkAdmin } from "@/lib/admin-auth";

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
        // Enkle "guardrails" - allow paths like "now/2025/album/photo.jpg",
        // "now/2025-thumbnail.jpg" eller "serier/hjelle/01_bilde.jpg"
        if (!pathname.startsWith("now/") && !pathname.startsWith("serier/")) {
          throw new Error("Invalid upload path. Must start with now/ or serier/.");
        }

        // valgfritt: hindre rot i root
        if (!pathname.includes("/")) {
          throw new Error("Invalid upload path.");
        }

        // serier/ er innholdet på den offentlige nettsiden — krever passord.
        // now/ er uendret (se /lab).
        if (pathname.startsWith("serier/")) {
          let password: string | null = null;
          try {
            password = JSON.parse(clientPayload ?? "{}")?.password ?? null;
          } catch {
            password = null;
          }
          const auth = checkAdmin(password);
          if (!auth.ok) throw new Error(auth.message);
        }

        // Allow JSON for album metadata files
        const isMetadata = pathname.endsWith("metadata.json");
        const allowedTypes = isMetadata
          ? ["application/json"]
          : ALLOWED_IMAGE_TYPES;

        return {
          // Use exact paths for all uploads (no random suffix appended)
          addRandomSuffix: false,
          // Allow overwriting existing files (re-uploads, metadata updates)
          allowOverwrite: true,

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

