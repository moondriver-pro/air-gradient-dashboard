import { html } from "../react-shim.js";

function formatEventDate(value) {
  if (!value) {
    return "Date to be announced";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function EventSlide({ event }) {
  const images = Array.isArray(event?.images) ? event.images.filter(Boolean) : [];
  const primaryImage = images[0] || "";
  const galleryImages = images.slice(1, 4);
  const hasImages = Boolean(primaryImage);

  return html`
    <div className="slide-event-shell">
      <div className=${`event-layout ${hasImages ? "" : "event-layout-no-image"}`}>
        <section className="event-copy-panel">
          <div className="event-pill-row">
            <span className="event-pill">Event Slide</span>
            <span className="event-date">${formatEventDate(event?.date)}</span>
          </div>

          <h1 className="event-title">${event?.title || "Upcoming Event"}</h1>

          ${event?.location
            ? html`<div className="event-location">${event.location}</div>`
            : null}

          <p className="event-description">
            ${event?.description || "Add the event title, date, description, and images from the admin panel."}
          </p>

          ${galleryImages.length
            ? html`
                <div className="event-gallery-strip">
                  ${galleryImages.map(
                    (imageSrc, index) => html`
                      <div key=${`${imageSrc}-${index}`} className="event-gallery-thumb">
                        <img src=${imageSrc} alt=${`${event?.title || "Event"} image ${index + 2}`} />
                      </div>
                    `,
                  )}
                </div>
              `
            : null}
        </section>

        ${hasImages
          ? html`
              <section className="event-image-panel">
                <img src=${primaryImage} alt=${event?.title || "Event"} />
              </section>
            `
          : null}
      </div>
    </div>
  `;
}
