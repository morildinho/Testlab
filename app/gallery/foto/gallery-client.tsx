"use client";

import { useState, useEffect, useCallback } from "react";

interface GalleryImage {
  url: string;
  pathname: string;
  filename: string;
  uploadedAt: Date;
}

interface GalleryClientProps {
  images: GalleryImage[];
}

// Viser filnavn uten filendelse, f.eks. "Gåte 01.jpg" → "Gåte 01"
const caption = (filename: string) => filename.replace(/\.[a-z0-9]+$/i, "");

export default function GalleryClient({ images }: GalleryClientProps) {
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
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleDownload = async () => {
    const image = images[currentIndex];
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = image.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(image.url, "_blank");
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
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  return (
    <>
      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .gallery-item:hover img {
          transform: scale(1.05);
        }

        .gallery-item-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: flex-end;
          padding: 0.75rem;
        }

        .gallery-item:hover .gallery-item-overlay {
          opacity: 1;
        }

        .gallery-item-name {
          color: #fff;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.95);
          display: flex;
          flex-direction: column;
          animation: lbFadeIn 0.2s ease;
        }

        @keyframes lbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .lightbox-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(0,0,0,0.5);
          flex-shrink: 0;
        }

        .lightbox-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .lightbox-counter {
          color: #888;
          font-size: 0.85rem;
        }

        .lightbox-filename {
          color: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lightbox-actions {
          display: flex;
          gap: 0.75rem;
        }

        .lightbox-btn {
          background: rgba(255,255,255,0.1);
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
          font-family: inherit;
        }

        .lightbox-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .lightbox-btn-download {
          background: rgba(59,130,246,0.3);
        }

        .lightbox-btn-download:hover {
          background: rgba(59,130,246,0.5);
        }

        .lightbox-close {
          background: rgba(255,100,100,0.2);
        }

        .lightbox-close:hover {
          background: rgba(255,100,100,0.3);
        }

        .lightbox-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1rem;
          min-height: 0;
        }

        .lightbox-image-container {
          max-width: 90%;
          max-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: calc(100vh - 120px);
          object-fit: contain;
          border-radius: 8px;
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
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
          font-family: inherit;
        }

        .lightbox-nav:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .lightbox-prev { left: 1rem; }
        .lightbox-next { right: 1rem; }

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
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
          .lightbox-btn .btn-text {
            display: none;
          }
        }
      `}</style>

      <div className="gallery-grid">
        {images.map((image, index) => (
          <div
            key={image.pathname}
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
            <img
              src={image.url}
              alt={caption(image.filename)}
              loading={index < 8 ? "eager" : "lazy"}
            />
            <div className="gallery-item-overlay">
              <span className="gallery-item-name">{caption(image.filename)}</span>
            </div>
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div className="lightbox-header">
            <div className="lightbox-info">
              <span className="lightbox-counter">
                {currentIndex + 1} / {images.length}
              </span>
              <span className="lightbox-filename">
                {caption(images[currentIndex].filename)}
              </span>
            </div>
            <div className="lightbox-actions">
              <button
                className="lightbox-btn lightbox-btn-download"
                onClick={handleDownload}
              >
                <span>↓</span>
                <span className="btn-text">Download</span>
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
                src={images[currentIndex].url}
                alt={caption(images[currentIndex].filename)}
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
        </div>
      )}
    </>
  );
}
