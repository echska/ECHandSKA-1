import { useState } from "react";
import { type Translations, type Lang } from "@/i18n/translations";
import Footer from "@/components/Footer";
import usePageAudio from "@/hooks/usePageAudio";
import { privateImage } from "@/lib/privateAssets";
import { usePrivateContent, pickLangPages } from "@/hooks/usePrivateContent";

interface Props {
  t: Translations;
  lang: Lang;
}

export default function Photos({ t, lang }: Props) {
  usePageAudio("song2.mp3");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const data = usePrivateContent();
  const p = pickLangPages(data, lang);
  const langKey: "ar" | "tr" = lang === "ar" ? "ar" : "tr";
  const captions = data?.captions?.[langKey] ?? [];
  const allPhotos = data?.photos ?? [];

  const specialPhotos = [
    { src: privateImage("photo1.jpg"), text: p.photo1_text },
    { src: privateImage("photo2.png"), text: p.photo2_text },
    { src: privateImage("photo3.png"), text: p.photo3_text },
    { src: privateImage("photo4.jpg"), text: p.photo4_text },
    { src: privateImage("photo5.jpg"), text: p.photo5_text },
    { src: privateImage("photo6.jpg"), text: p.photo6_text },
  ];

  const albumPhotos = allPhotos.map((name, i) => {
    const story = i < captions.length ? captions[i] : null;
    return {
      src: privateImage(`all_photos/${name}`),
      title: story?.title ?? null,
      text: story?.text ?? t.photos_fallback_caption,
    };
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{t.photos_title}</h1>
        {p.photos_header_sub && <p className="photos-header-sub">{p.photos_header_sub}</p>}
      </div>

      <div className="photo-grid">
        {specialPhotos.map((ph, i) => (
          <div key={`s-${i}`} className="photo-card glass">
            <img
              src={ph.src}
              alt=""
              className="photo-img"
              onClick={() => setLightbox(ph.src)}
              style={{ cursor: "pointer" }}
            />
            {ph.text && <p className="photo-caption">{ph.text}</p>}
          </div>
        ))}

        <div className="photo-card glass photo-card-featured">
          <img
            src={privateImage("photo7.jpg")}
            alt=""
            className="photo-img"
            onClick={() => setLightbox(privateImage("photo7.jpg"))}
            style={{ cursor: "pointer" }}
          />
          <div className="photo-caption-featured">
            {p.photo7_text && <p className="featured-quote">{p.photo7_text}</p>}
            {p.photo7_sub && <p className="featured-sub">{p.photo7_sub}</p>}
          </div>
        </div>
      </div>

      <div className="album-divider">
        <span className="album-divider-line" />
        <span className="album-divider-text">{t.photos_title}</span>
        <span className="album-divider-line" />
      </div>

      <div className="photo-grid album-grid">
        {albumPhotos.map((ph, i) => (
          <div key={`a-${i}`} className="photo-card glass">
            <img
              src={ph.src}
              alt=""
              className="photo-img"
              onClick={() => setLightbox(ph.src)}
              style={{ cursor: "pointer" }}
            />
            <div className="album-caption-block">
              {ph.title && <span className="album-caption-title">{ph.title}</span>}
              <p className="album-caption-text">{ph.text}</p>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button
            className="lightbox-close"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            aria-label="Close"
          >
            &times;
          </button>
          <img src={lightbox} alt="" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {p.photos_footer && <Footer text={p.photos_footer} />}
    </div>
  );
}
