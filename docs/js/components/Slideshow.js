import { html, useEffect, useRef, useState } from "../react-shim.js";
import { DashboardSlide } from "./DashboardSlide.js?v=20260408cf";
import { EventSlide } from "./EventSlide.js?v=20260408cf";
// To switch back to the previous dashboard layout later, import
// DashboardSlideLegacy from "./DashboardSlideLegacy.js" and use it below instead.

function MediaSlide({ slide, isActive, videoRef, onEnded }) {
  if (slide.type === "image") {
    return html`
      <div className=${`slide slide-img ${isActive ? "active" : ""}`}>
        <div
          className="slide-media-frame slide-media-frame-image"
          style=${{
            backgroundImage: `url('${slide.src}')`,
          }}
        ></div>
      </div>
    `;
  }

  if (slide.type === "video") {
    return html`
      <div className=${`slide slide-video ${isActive ? "active" : ""}`}>
        <div className="slide-media-frame">
          <video muted playsInline preload="metadata" ref=${videoRef} onEnded=${onEnded}>
            <source src=${slide.src} type="video/mp4" />
          </video>
        </div>
      </div>
    `;
  }

  return null;
}

export function Slideshow({ slides, sensors, air4thaiData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef({});
  const timeoutRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!slides.length) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex((index) => (index + 1) % slides.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex((index) => (index - 1 + slides.length) % slides.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  useEffect(() => {
    const currentSlide = slides[currentIndex];

    Object.entries(videoRefs.current).forEach(([key, video]) => {
      if (video && key !== currentSlide.key) {
        video.pause();
        video.currentTime = 0;
      }
    });

    let durationSec = currentSlide.duration;
    const currentVideo = videoRefs.current[currentSlide.key];
    if (currentSlide.type === "video" && currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(() => {});
      if (Number.isFinite(currentVideo.duration) && currentVideo.duration > 0) {
        durationSec = currentVideo.duration;
      }
    }

    const startedAt = performance.now();
    setProgress(0);

    const tick = (now) => {
      const nextProgress = Math.min(100, ((now - startedAt) / (durationSec * 1000)) * 100);
      setProgress(nextProgress);
      if (nextProgress < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, durationSec * 1000);

    return () => {
      clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [currentIndex, slides]);

  const currentSlide = slides[currentIndex];
  const isDashboardSlide = currentSlide?.type === "dashboard";

  return html`
    <div id="slideshow">
      ${slides.map((slide, index) => {
        if (slide.type === "dashboard") {
          return html`
            <div key=${slide.key} className=${`slide ${index === currentIndex ? "active" : ""}`}>
              <${DashboardSlide} sensors=${sensors} air4thaiData=${air4thaiData} />
            </div>
          `;
        }

        if (slide.type === "event") {
          return html`
            <div key=${slide.key} className=${`slide ${index === currentIndex ? "active" : ""}`}>
              <${EventSlide} event=${slide.event} />
            </div>
          `;
        }

        return html`
          <${MediaSlide}
            key=${slide.key}
            slide=${slide}
            isActive=${index === currentIndex}
            videoRef=${(node) => {
              if (node) {
                videoRefs.current[slide.key] = node;
              } else {
                delete videoRefs.current[slide.key];
              }
            }}
            onEnded=${() => {
              if (index === currentIndex) {
                setCurrentIndex((current) => (current + 1) % slides.length);
              }
            }}
          />
        `;
      })}

      <div id="slide-indicators">
        ${slides.map(
          (slide, index) => html`
            <span
              key=${slide.key}
              className=${`dot ${index === currentIndex ? "active" : ""}`}
              title=${slide.title}
              onClick=${() => setCurrentIndex(index)}
            ></span>
          `,
        )}
      </div>

      ${!isDashboardSlide
        ? html`
            <div id="progress-bar-wrap">
              <div
                id="progress-bar"
                style=${{
                  width: `${progress}%`,
                  background: slides[currentIndex].color,
                }}
              ></div>
            </div>
          `
        : null}
    </div>
  `;
}
