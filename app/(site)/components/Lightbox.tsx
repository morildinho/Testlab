"use client";

import { useCallback, useEffect } from "react";
import type { Photo } from "@/lib/site";
import FadeImg from "./FadeImg";

type Props = {
  photos: Photo[];
  i: number;
  setI: (fn: (prev: number) => number) => void;
  select: (i: number) => void;
  close: () => void;
  label: string;
  meta: string;
};

export default function Lightbox({ photos, i, setI, select, close, label, meta }: Props) {
  const n = photos.length;
  const prev = useCallback(() => setI((p) => (p - 1 + n) % n), [n, setI]);
  const next = useCallback(() => setI((p) => (p + 1) % n), [n, setI]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.body.dataset.modal = "1";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      delete document.body.dataset.modal;
    };
  }, [close, prev, next]);

  const pad = (v: number) => String(v).padStart(2, "0");

  return (
    <div className="lb">
      <div className="lbTop">
        <div className="mono dim">
          {label} · {pad(i + 1)} / {pad(n)}
        </div>
        <button
          onClick={close}
          className="mono"
          style={{ background: "none", border: 0, color: "inherit", cursor: "pointer", letterSpacing: ".14em" }}
        >
          Lukk ✕
        </button>
      </div>
      <div className="lbMain" style={{ position: "relative" }}>
        <button className="lbNav" style={{ left: 0 }} onClick={prev} aria-label="Forrige">
          ←
        </button>
        <FadeImg
          key={i}
          src={photos[i].src}
          alt={`${label} ${pad(i + 1)}`}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
        <button className="lbNav" style={{ right: 0 }} onClick={next} aria-label="Neste">
          →
        </button>
      </div>
      <div className="mono dim" style={{ textAlign: "center", paddingBottom: 14 }}>
        {meta}
      </div>
      <div className="strip">
        {photos.map((p, j) => (
          <button key={p.src + j} className={j === i ? "on" : ""} onClick={() => select(j)} aria-label={`Bilde ${j + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
