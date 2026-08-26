"use client";

import { useEffect, useState } from "react";
import type { Video } from "@/lib/site";
import Frame from "../components/Frame";
import Reveal from "../components/Reveal";

export default function FilmClient({ videos }: { videos: Video[] }) {
  const [open, setOpen] = useState<Video | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.dataset.modal = "1";
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.body.dataset.modal;
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div style={{ display: "grid", gap: "70px", marginTop: 80 }}>
        {videos.map((v, i) => (
          <Reveal
            key={v.id}
            delay={i * 80}
            style={{
              display: "grid",
              gridTemplateColumns: i === 0 ? "1fr" : "1.6fr 1fr",
              gap: 30,
              alignItems: "end",
            }}
          >
            <div
              className="vcard"
              onClick={() => setOpen(v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(v);
                }
              }}
              aria-label={`Spill av ${v.title}`}
            >
              <Frame
                src={`https://i.ytimg.com/vi/${v.yt}/maxresdefault.jpg`}
                fallback={`https://i.ytimg.com/vi/${v.yt}/hqdefault.jpg`}
                ratio={16 / 9}
                alt={v.title}
                eager={i < 2}
              />
              <div className="play">
                <div className="playDot">
                  <span style={{ marginLeft: 4, fontSize: 13 }}>▶</span>
                </div>
              </div>
            </div>
            <div style={{ paddingBottom: 6 }}>
              <h2
                className="syne"
                style={{
                  fontWeight: 600,
                  fontSize: "clamp(22px,2.6vw,34px)",
                  margin: "0 0 10px",
                  letterSpacing: "-.015em",
                }}
              >
                {v.title}
              </h2>
              {v.meta && <div className="mono dim">{v.meta}</div>}
              {v.note && (
                <p
                  style={{
                    margin: "10px 0 0",
                    maxWidth: "38ch",
                    fontSize: 16,
                    lineHeight: 1.65,
                    color: "rgba(237,236,234,.62)",
                  }}
                >
                  {v.note}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {open && (
        <div className="lb" onClick={() => setOpen(null)}>
          <div className="lbTop">
            <div className="mono dim">{open.title}</div>
            <button
              className="mono"
              style={{ background: "none", border: 0, color: "inherit", cursor: "pointer", letterSpacing: ".14em" }}
            >
              Lukk ✕
            </button>
          </div>
          <div
            className="lbMain"
            onClick={(e) => e.stopPropagation()}
            style={{ flexDirection: "column", gap: 16 }}
          >
            <div
              style={{
                width: "min(1100px,100%)",
                aspectRatio: "16/9",
                background: "#000",
                border: "1px solid rgba(255,255,255,.14)",
              }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${open.yt}?autoplay=1&rel=0`}
                title={open.title}
                allow="accelerometer;autoplay;clipboard-write;encrypted-media;picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0, display: "block" }}
              />
            </div>
            <div
              style={{
                width: "min(1100px,100%)",
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "baseline",
              }}
            >
              {open.note ? (
                <p style={{ margin: 0, maxWidth: "56ch", fontSize: 15, lineHeight: 1.65, color: "rgba(237,236,234,.6)" }}>
                  {open.note}
                </p>
              ) : (
                <span />
              )}
              <a
                className="mono dim"
                href={`https://youtu.be/${open.yt}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ whiteSpace: "nowrap" }}
              >
                Åpne på YouTube ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
