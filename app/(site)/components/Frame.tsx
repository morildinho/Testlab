"use client";

import { useState } from "react";

type Props = {
  src: string;
  /** bredde/høyde — holder plassen så layouten ikke hopper når bildet lastes */
  ratio?: number;
  alt?: string;
  eager?: boolean;
  fallback?: string;
};

export default function Frame({ src, ratio = 1.5, alt = "", eager = false, fallback }: Props) {
  const [on, setOn] = useState(false);
  const [cur, setCur] = useState(src);
  const [prevSrc, setPrevSrc] = useState(src);

  // Nullstill skjelettet hvis kildebildet byttes ut (React-mønsteret for
  // avledet state — gjøres under render, ikke i en effekt).
  if (src !== prevSrc) {
    setPrevSrc(src);
    setCur(src);
    setOn(false);
  }

  return (
    <div className={`skel${on ? " done" : ""}`} style={{ aspectRatio: ratio }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        // Serverrendret markup betyr at bildet kan være ferdig lastet (cache)
        // før React hydrerer — da fyrer `onLoad` aldri. Ref-callbacken fanger
        // det tilfellet, ellers blir bildet liggende på opacity 0.
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setOn(true);
        }}
        src={cur}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setOn(true)}
        onError={() => {
          if (fallback && cur !== fallback) setCur(fallback);
        }}
        className={`fadeimg${on ? " ready" : ""}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
