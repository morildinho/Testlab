import type { Metadata } from "next";
import { getVideos } from "@/lib/site";
import FilmClient from "./film-client";

export const metadata: Metadata = {
  title: "Film",
  description: "Videoarbeid av Espen Vik Morild — utvalg fra podcast-, reklame- og streamingproduksjon.",
  alternates: { canonical: "/film" },
};

export default async function FilmPage() {
  const videos = await getVideos();

  return (
    <div className="page">
      <div className="wrap">
        <div className="mono dim" style={{ marginBottom: 20 }}>
          Video
        </div>
        <h1 className="pageH">Film</h1>
        <p
          style={{
            maxWidth: "46ch",
            fontSize: 17,
            lineHeight: 1.7,
            color: "rgba(237,236,234,.62)",
            marginTop: 26,
          }}
        >
          Utvalg fra podcast-, reklame- og streamingproduksjon.
        </p>
        <FilmClient videos={videos} />
      </div>
    </div>
  );
}
