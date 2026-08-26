"use client";

import { useState, type CSSProperties } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

/** Bilde uten skjelett — toner inn når det er lastet. */
export default function FadeImg({ src, alt = "", className = "", style }: Props) {
  const [on, setOn] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      // Se kommentaren i Frame.tsx: bilder som allerede er i cache når React
      // hydrerer fyrer aldri `onLoad`.
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0) setOn(true);
      }}
      src={src}
      alt={alt}
      onLoad={() => setOn(true)}
      className={`fadeimg${on ? " ready" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    />
  );
}
