import type { Metadata } from "next";
import GalleryClient from "./gallery-client";

export const metadata: Metadata = {
  title: "NOWLA – Highlights 2026",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NowGalleryPage() {
  return <GalleryClient />;
}
