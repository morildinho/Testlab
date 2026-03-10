import { list } from "@vercel/blob";
import VideoClient from "./video-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Video – Morildinho.no",
  robots: { index: false, follow: false },
};

const YOUTUBE_VIDEOS = [
  { id: "9udQOIb7-O0", title: "Oppsig — Premiere" },
  { id: "6W5WuWFyzXw", title: "Bergenfest 2024 — Dag 2" },
  { id: "nvyUsYVXDR0", title: "Bergenfest 2024 — Dag 3" },
];

interface BlobVideo {
  url: string;
  pathname: string;
  filename: string;
  uploadedAt: Date;
}

async function getVideos(): Promise<BlobVideo[]> {
  const videoExtensions = /\.(mp4|mov|webm|m4v)$/i;
  const videos: BlobVideo[] = [];
  let cursor: string | undefined;
  do {
    const response = await list({ prefix: "Gallery/Video/", cursor });
    for (const blob of response.blobs) {
      if (!videoExtensions.test(blob.pathname)) continue;
      videos.push({
        url: blob.url,
        pathname: blob.pathname,
        filename: blob.pathname.split("/").pop() || blob.pathname,
        uploadedAt:
          blob.uploadedAt instanceof Date
            ? blob.uploadedAt
            : new Date(blob.uploadedAt),
      });
    }
    cursor = response.cursor;
  } while (cursor);
  return videos;
}

export default async function VideoPage() {
  const videos = await getVideos();
  return <VideoClient youtubeVideos={YOUTUBE_VIDEOS} blobVideos={videos} />;
}
