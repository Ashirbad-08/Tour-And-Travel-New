import { useState, useEffect } from "react";
import "./Gallery.css";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery?limit=100');
        const json = await res.json();
        const data = json?.data || [];
        // Flatten all imageUrls into individual gallery items
        const mapped = [];
        data.forEach((item) => {
          if (item.imageUrls && item.imageUrls.length > 0) {
            item.imageUrls.forEach((url) => {
              mapped.push({
                src: url,
                title: item.title || "Travel Photo",
              });
            });
          }
        });
        setImages(mapped);
      } catch (err) {
        console.error('Failed to fetch gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const close = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () =>
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      <section className="gallery-hero">
        <div className="gallery-overlay">
          <h1>GALLERY</h1>
          <p>Some pictures from our travels</p>
        </div>
        <div className="torn-edge"></div>
      </section>

      <section className="gallery-grid">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#888', gridColumn: '1 / -1' }}>Loading gallery...</p>
        ) : images.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#888', gridColumn: '1 / -1' }}>No gallery images found.</p>
        ) : (
          images.map((img, index) => (
            <div
              className="gallery-item"
              key={index}
              onClick={() => setActiveIndex(index)}
            >
              <img src={img.src} alt={img.title} />
              <div className="gallery-hover">
                <span>⤢</span>
                <p>{img.title}</p>
              </div>
            </div>
          ))
        )}
      </section>

      {activeIndex !== null && (
        <div className="lightbox" onClick={close}>
          <span className="close">×</span>

          <span
            className="nav left"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            ‹
          </span>

          <img
            src={images[activeIndex].src}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />

          <span
            className="nav right"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            ›
          </span>
        </div>
      )}
    </>
  );
}
