import { html } from "../react-shim.js";

export function MetricCard({ label, value, unit, color = "gray", className = "", style = null }) {
  const classes = ["metric", color, className].filter(Boolean).join(" ");

  return html`
    <div className=${classes} style=${style || undefined}>
      <div className="metric-label" dangerouslySetInnerHTML=${{ __html: label }}></div>
      <div className="metric-value">${value}</div>
      <div className="metric-unit" dangerouslySetInnerHTML=${{ __html: unit || "" }}></div>
    </div>
  `;
}

export function MetricCardList({ cards, emptyLabel = "No data" }) {
  if (!cards.length) {
    return html`<div className="panel-msg">${emptyLabel}</div>`;
  }

  return cards.map(
    (card) => html`
      <${MetricCard}
        key=${card.key}
        label=${card.label}
        value=${card.value}
        unit=${card.unit}
        color=${card.color}
        className=${card.className}
        style=${card.style}
      />
    `,
  );
}
