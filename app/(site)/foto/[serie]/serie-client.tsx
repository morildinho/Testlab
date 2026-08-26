"use client";

import { useState } from "react";
import type { Photo } from "@/lib/site";
import Frame from "../../components/Frame";
import Lightbox from "../../components/Lightbox";

type Props = {
  photos: Photo[];
  title: string;
  meta: string;
};

export default function SerieClient({ photos, title, meta }: Props) {
  const [lb, setLb] = useState(-1);

  return (
    <>
      <div className="masonry">
        {photos.map((p, i) => (
          <div
            className="mitem"
            key={p.src + i}
            onClick={() => setLb(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLb(i);
              }
            }}
            aria-label={`Åpne bilde ${i + 1} av ${photos.length}`}
          >
            <Frame src={p.src} ratio={p.w / p.h} eager={i < 4} alt={`${title} ${i + 1}`} />
            <span className="mnum mono">{String(i + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>

      {lb >= 0 && (
        <Lightbox
          photos={photos}
          i={lb}
          setI={(fn) => setLb((prev) => fn(prev))}
          select={(j) => setLb(j)}
          close={() => setLb(-1)}
          label={title}
          meta={meta}
        />
      )}
    </>
  );
}
