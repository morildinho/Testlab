import VideoClient, { type VideoItem } from "./video-client";

export const metadata = {
  title: "Video – Morildinho.no",
  robots: { index: false, follow: false },
};

// Liggende videoer (16:9). "description" er rollen/jobben som vises under tittelen.
const YOUTUBE_VIDEOS: VideoItem[] = [
  { id: "9udQOIb7-O0", title: "Oppsig — Premiere", description: "Foto, klipp og musikk" },
  { id: "6W5WuWFyzXw", title: "Bergenfest 2024 — Dag 2", description: "B-foto, klipp og reportasje" },
  { id: "nvyUsYVXDR0", title: "Bergenfest 2024 — Dag 3", description: "Foto og klipp" },
];

// Stående videoer (9:16). Bruk "id" for YouTube, eller "videoUrl" for en mp4-fil.
// Asylmottaket er blokkert på YouTube pga. musikk, så den ligger som mp4 i Vercel Blob (Gallery/Shorts/).
const BLOB = "https://xzska7o3f3zmfy4y.public.blob.vercel-storage.com";
const YOUTUBE_SHORTS: VideoItem[] = [
  {
    videoUrl: `${BLOB}/Gallery/Shorts/Asylmottaket_promo.mp4`,
    poster: `${BLOB}/Gallery/Shorts/Asylmottaket_promo-poster.jpg`,
    title: "Asylmottaket promo — Utetrend.no",
    description: "Foto, klipp og reportasje",
  },
  { id: "umlFyMQ-PjM", title: "Sundt nyåpning — Utetrend.no", description: "Foto, klipp og reportasje" },
  { id: "yjzk7-4ZxoI", title: "Freaky Friday Premiere — Bergen Kino", description: "Foto, klipp og reportasje" },
];

export default function VideoPage() {
  return <VideoClient youtubeVideos={YOUTUBE_VIDEOS} youtubeShorts={YOUTUBE_SHORTS} />;
}
