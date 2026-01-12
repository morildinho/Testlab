"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { images } from "./images";

export default function GalleryClient() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, []);

  const handleDownload = async () => {
    const image = images[currentIndex];
    try {
      const response = await fetch(image.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = image.src.split("/").pop() || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrev();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToPrev, goToNext]);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .gallery-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .hero {
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(180deg, rgba(138, 43, 226, 0.15) 0%, transparent 100%);
        }

        .hero-title {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff 0%, #c9a0ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 3vw, 1.25rem);
          color: #b0b0b0;
          margin-bottom: 1.5rem;
          font-weight: 400;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #a78bfa;
          text-decoration: none;
          font-size: 0.95rem;
          padding: 0.75rem 1.5rem;
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.6);
        }

        .gallery-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .masonry-grid {
          column-count: 1;
          column-gap: 1rem;
        }

        @media (min-width: 640px) {
          .masonry-grid {
            column-count: 2;
          }
        }

        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 3;
          }
        }

        @media (min-width: 1400px) {
          .masonry-grid {
            column-count: 4;
          }
        }

        .gallery-item {
          break-inside: avoid;
          margin-bottom: 1rem;
          cursor: pointer;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .gallery-item img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.4s ease;
        }

        .gallery-item:hover img {
          transform: scale(1.03);
        }

        .gallery-item-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: flex-end;
          padding: 1rem;
        }

        .gallery-item:hover .gallery-item-overlay {
          opacity: 1;
        }

        .gallery-item-alt {
          color: #fff;
          font-size: 0.875rem;
          font-weight: 500;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .lightbox-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.5);
        }

        .lightbox-counter {
          color: #888;
          font-size: 0.9rem;
        }

        .lightbox-actions {
          display: flex;
          gap: 0.75rem;
        }

        .lightbox-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s ease;
        }

        .lightbox-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .lightbox-close {
          background: rgba(255, 100, 100, 0.2);
        }

        .lightbox-close:hover {
          background: rgba(255, 100, 100, 0.3);
        }

        .lightbox-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1rem;
        }

        .lightbox-image-container {
          max-width: 90%;
          max-height: 100%;
          position: relative;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: calc(100vh - 140px);
          object-fit: contain;
          border-radius: 8px;
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .lightbox-nav:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .lightbox-prev {
          left: 1rem;
        }

        .lightbox-next {
          right: 1rem;
        }

        @media (max-width: 640px) {
          .lightbox-nav {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .lightbox-header {
            padding: 0.75rem 1rem;
          }

          .lightbox-btn {
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
          }
        }

        .lightbox-caption {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-size: 0.9rem;
          max-width: 80%;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 640px) {
          .lightbox-caption {
            white-space: normal;
            max-width: 90%;
          }
        }
      `}</style>

      <div className="gallery-page">
        <header className="hero">
          <h1 className="hero-title">NOWLA – Highlights 2026</h1>
          <p className="hero-subtitle">
            A visual journey through the moments that defined us
          </p>
          <a href="https://nowla.org" className="back-link">
            <span>←</span> Back to nowla.org
          </a>
        </header>

        <main className="gallery-container">
          <div className="masonry-grid">
            {images.map((image, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => openLightbox(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(index);
                  }
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                  loading={index < 4 ? "eager" : "lazy"}
                />
                <div className="gallery-item-overlay">
                  <span className="gallery-item-alt">{image.alt}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {lightboxOpen && (
          <div
            className="lightbox"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
          >
            <div className="lightbox-header">
              <span className="lightbox-counter">
                {currentIndex + 1} / {images.length}
              </span>
              <div className="lightbox-actions">
                <button className="lightbox-btn" onClick={handleDownload}>
                  <span>↓</span> Download
                </button>
                <button
                  className="lightbox-btn lightbox-close"
                  onClick={closeLightbox}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="lightbox-content">
              <button
                className="lightbox-nav lightbox-prev"
                onClick={goToPrev}
                aria-label="Previous image"
              >
                ‹
              </button>

              <div className="lightbox-image-container">
                <img
                  src={images[currentIndex].src}
                  alt={images[currentIndex].alt}
                  className="lightbox-image"
                />
              </div>

              <button
                className="lightbox-nav lightbox-next"
                onClick={goToNext}
                aria-label="Next image"
              >
                ›
              </button>
            </div>

            <div className="lightbox-caption">{images[currentIndex].alt}</div>
          </div>
        )}
      </div>
    </>
  );
}
