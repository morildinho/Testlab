"use client";

import { useState, useEffect, useCallback } from "react";
import JSZip from "jszip";

interface GalleryImage {
  url: string;
  pathname: string;
  filename: string;
  uploadedAt: Date;
}

interface GalleryClientProps {
  images: GalleryImage[];
  albumName: string;
}

export default function GalleryClient({ images, albumName }: GalleryClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [albumShareMenuOpen, setAlbumShareMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [albumCopied, setAlbumCopied] = useState(false);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setShareMenuOpen(false);
  };

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setShareMenuOpen(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setShareMenuOpen(false);
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
    } catch (error) {
      console.error("Download failed:", error);
      window.open(image.url, "_blank");
    }
  };

  const handleDownloadAll = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const response = await fetch(image.url);
        const blob = await response.blob();
        zip.file(image.filename, blob);
        setDownloadProgress(Math.round(((i + 1) / images.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const blobUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${albumName.replace(/\s+/g, "-")}-photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download all failed:", error);
      alert("Failed to download photos. Please try again.");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const getCurrentPageUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const getImageShareUrl = () => {
    return images[currentIndex]?.url || "";
  };

  const handleNativeShare = async (isAlbum = false) => {
    const url = isAlbum ? getCurrentPageUrl() : getImageShareUrl();
    const title = isAlbum ? `${albumName} - NOWLA 2025` : images[currentIndex]?.filename;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: isAlbum ? `Check out this photo album: ${albumName}` : `Check out this photo from ${albumName}`,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
    setShareMenuOpen(false);
    setAlbumShareMenuOpen(false);
  };

  const handleFacebookShare = (isAlbum = false) => {
    const url = isAlbum ? getCurrentPageUrl() : getImageShareUrl();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400"
    );
    setShareMenuOpen(false);
    setAlbumShareMenuOpen(false);
  };

  const handleXShare = (isAlbum = false) => {
    const url = isAlbum ? getCurrentPageUrl() : getImageShareUrl();
    const text = isAlbum ? `Check out this photo album: ${albumName}` : `Check out this photo from ${albumName}`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "width=600,height=400"
    );
    setShareMenuOpen(false);
    setAlbumShareMenuOpen(false);
  };

  const handleCopyLink = async (isAlbum = false) => {
    const url = isAlbum ? getCurrentPageUrl() : getImageShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      if (isAlbum) {
        setAlbumCopied(true);
        setTimeout(() => setAlbumCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Copy failed:", err);
    }
    setShareMenuOpen(false);
    setAlbumShareMenuOpen(false);
  };

  const handleEmailShare = (isAlbum = false) => {
    const url = isAlbum ? getCurrentPageUrl() : getImageShareUrl();
    const subject = isAlbum ? `Photo Album: ${albumName}` : `Photo from ${albumName}`;
    const body = isAlbum
      ? `Check out this photo album:\n\n${url}`
      : `Check out this photo:\n\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShareMenuOpen(false);
    setAlbumShareMenuOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case "Escape":
          if (shareMenuOpen) {
            setShareMenuOpen(false);
          } else {
            closeLightbox();
          }
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
  }, [lightboxOpen, shareMenuOpen, goToPrev, goToNext]);

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setAlbumShareMenuOpen(false);
    };
    if (albumShareMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [albumShareMenuOpen]);

  return (
    <>
      <style>{`
        .album-actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          position: relative;
        }

        .album-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 0.75rem 1.25rem;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .album-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .album-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .album-btn-download {
          background: rgba(0, 150, 136, 0.3);
          border-color: rgba(0, 150, 136, 0.5);
        }

        .album-btn-download:hover {
          background: rgba(0, 150, 136, 0.5);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }

        @media (min-width: 1200px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
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
          background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 40%);
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
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (min-width: 640px) {
          .lightbox-filename {
            max-width: 400px;
          }
        }

        .lightbox-actions {
          display: flex;
          gap: 0.75rem;
          position: relative;
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
          font-family: inherit;
        }

        .lightbox-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .lightbox-btn-share {
          background: rgba(59, 130, 246, 0.3);
        }

        .lightbox-btn-share:hover {
          background: rgba(59, 130, 246, 0.5);
        }

        .lightbox-btn-download {
          background: rgba(0, 150, 136, 0.3);
        }

        .lightbox-btn-download:hover {
          background: rgba(0, 150, 136, 0.5);
        }

        .lightbox-close {
          background: rgba(255, 100, 100, 0.2);
        }

        .lightbox-close:hover {
          background: rgba(255, 100, 100, 0.3);
        }

        .share-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 0.5rem;
          min-width: 200px;
          z-index: 1001;
          animation: slideDown 0.2s ease;
        }

        .share-menu-album {
          left: 0;
          right: auto;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .share-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 0.9rem;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
          font-family: inherit;
          text-align: left;
        }

        .share-option:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .share-option-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .share-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0.5rem 0;
        }

        .share-note {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
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
          font-family: inherit;
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
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }

          .lightbox-btn span.btn-text {
            display: none;
          }

          .album-btn span.btn-text {
            display: none;
          }

          .album-btn {
            padding: 0.6rem 1rem;
          }
        }
      `}</style>

      {/* Album Actions */}
      <div className="album-actions">
        <div style={{ position: "relative" }}>
          <button
            className="album-btn"
            onClick={(e) => {
              e.stopPropagation();
              setAlbumShareMenuOpen(!albumShareMenuOpen);
            }}
          >
            <span>↗</span>
            <span className="btn-text">Share Album</span>
          </button>
          {albumShareMenuOpen && (
            <div className="share-menu share-menu-album" onClick={(e) => e.stopPropagation()}>
              {typeof navigator !== "undefined" && navigator.share && (
                <>
                  <button className="share-option" onClick={() => handleNativeShare(true)}>
                    <span className="share-option-icon">📤</span>
                    Share via...
                  </button>
                  <div className="share-divider" />
                </>
              )}
              <button className="share-option" onClick={() => handleFacebookShare(true)}>
                <span className="share-option-icon">f</span>
                Facebook
              </button>
              <button className="share-option" onClick={() => handleXShare(true)}>
                <span className="share-option-icon">𝕏</span>
                X (Twitter)
              </button>
              <button className="share-option" onClick={() => handleEmailShare(true)}>
                <span className="share-option-icon">✉</span>
                Email
              </button>
              <div className="share-divider" />
              <button className="share-option" onClick={() => handleCopyLink(true)}>
                <span className="share-option-icon">{albumCopied ? "✓" : "🔗"}</span>
                {albumCopied ? "Copied!" : "Copy Link"}
              </button>
              <div className="share-note">
                Tip: For Instagram & TikTok, copy the link and share in the app
              </div>
            </div>
          )}
        </div>
        <button
          className="album-btn album-btn-download"
          onClick={handleDownloadAll}
          disabled={downloading}
        >
          <span>↓</span>
          <span className="btn-text">
            {downloading ? `Downloading ${downloadProgress}%` : "Download All"}
          </span>
          {downloading && <span>({downloadProgress}%)</span>}
        </button>
      </div>

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
              alt={image.filename}
              loading={index < 8 ? "eager" : "lazy"}
            />
            <div className="gallery-item-overlay">
              <span className="gallery-item-name">{image.filename}</span>
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
                {images[currentIndex].filename}
              </span>
            </div>
            <div className="lightbox-actions">
              <div style={{ position: "relative" }}>
                <button
                  className="lightbox-btn lightbox-btn-share"
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                >
                  <span>↗</span>
                  <span className="btn-text">Share</span>
                </button>
                {shareMenuOpen && (
                  <div className="share-menu">
                    {typeof navigator !== "undefined" && navigator.share && (
                      <>
                        <button className="share-option" onClick={() => handleNativeShare(false)}>
                          <span className="share-option-icon">📤</span>
                          Share via...
                        </button>
                        <div className="share-divider" />
                      </>
                    )}
                    <button className="share-option" onClick={() => handleFacebookShare(false)}>
                      <span className="share-option-icon">f</span>
                      Facebook
                    </button>
                    <button className="share-option" onClick={() => handleXShare(false)}>
                      <span className="share-option-icon">𝕏</span>
                      X (Twitter)
                    </button>
                    <button className="share-option" onClick={() => handleEmailShare(false)}>
                      <span className="share-option-icon">✉</span>
                      Email
                    </button>
                    <div className="share-divider" />
                    <button className="share-option" onClick={() => handleCopyLink(false)}>
                      <span className="share-option-icon">{copied ? "✓" : "🔗"}</span>
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <div className="share-note">
                      Tip: For Instagram & TikTok, copy the link and share in the app
                    </div>
                  </div>
                )}
              </div>
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
                alt={images[currentIndex].filename}
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
