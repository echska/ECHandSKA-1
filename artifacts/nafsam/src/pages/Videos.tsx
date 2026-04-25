import { useCallback, useEffect, useState } from "react";
import { type Translations } from "@/i18n/translations";
import { videosData } from "@/data/videosData";

interface Props {
  t: Translations;
}

function buildSrc(file: string) {
  return `/api/private/media/${encodeURIComponent(file)}`;
}

function buildPoster(file: string) {
  const base = file.replace(/\.[^/.]+$/, "");
  return `/api/private/posters/${encodeURIComponent(base)}.jpg`;
}

function Thumb({ file }: { file: string }) {
  return (
    <div className="v-thumb">
      <img
        src={buildPoster(file)}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <div className="v-play">▶</div>
    </div>
  );
}

export default function Videos({ t }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openModal = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closeModal = useCallback(() => setActiveIndex(null), []);

  const prevVideo = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + videosData.length) % videosData.length
    );
  }, []);

  const nextVideo = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i + 1) % videosData.length
    );
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") prevVideo();
      else if (e.key === "ArrowRight") nextVideo();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, closeModal, prevVideo, nextVideo]);

  const active = activeIndex !== null ? videosData[activeIndex] : null;

  return (
    <div className="videos-page">
      <section className="v-hero" dir="rtl">
        <h1 className="v-hero-title">الذكريات التي ما زالت تتنفس</h1>
        <p className="v-hero-sub">كل مشهد يعيدني إليكِ، ثم يتركني وحدي من جديد</p>
        <div className="v-hero-line" />
      </section>

      <section className="v-stats" dir="rtl">
        <div className="v-stat">
          <div className="v-stat-label">ذكرى</div>
          <div className="v-stat-value">{videosData.length}</div>
        </div>
      </section>

      <div className="v-gallery">
        {videosData.map((item, index) => (
          <article
            key={item.file}
            className="v-card"
            onClick={() => openModal(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openModal(index);
              }
            }}
          >
            <Thumb file={item.file} />
            <div className="v-card-body">
              <div className="v-date">
                {t.video_memory_label} {index + 1}
              </div>
              <div className="v-title">{item.title}</div>
              <div className="v-quote">{item.quote}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="v-footer">ECH SKA</div>

      {active && (
        <div
          className="v-modal active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="v-modal-box">
            <div className="v-modal-top">
              <div className="v-modal-head">
                <div className="v-modal-date">
                  {t.video_memory_label} {(activeIndex ?? 0) + 1}
                </div>
                <div className="v-modal-title">{active.title}</div>
              </div>
              <button
                type="button"
                className="v-close-btn"
                onClick={closeModal}
                aria-label="close"
              >
                ✕
              </button>
            </div>

            <div className="v-modal-video-wrap">
              <video
                key={active.file}
                className="v-modal-video"
                src={buildSrc(active.file)}
                controls
                autoPlay
                playsInline
              />
            </div>

            <div className="v-modal-bottom">
              <div className="v-modal-file">{active.quote}</div>
              <div className="v-modal-actions">
                <button
                  type="button"
                  className="v-btn v-btn-accent"
                  onClick={prevVideo}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="v-btn v-btn-accent"
                  onClick={nextVideo}
                >
                  ›
                </button>
                <button type="button" className="v-btn" onClick={closeModal}>
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
