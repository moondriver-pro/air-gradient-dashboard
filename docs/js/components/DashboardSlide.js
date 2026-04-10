import { A4T_COLOR, AQI_LEGEND, METRICS } from "../constants.js";
import { html, useEffect, useMemo, useState } from "../react-shim.js";
import { calculateAQI, formatNumber, getAQILevel, getState } from "../utils.js";

const pm25Metric = METRICS.find((metric) => metric.key === "pm02_corrected");
const pm10Metric = METRICS.find((metric) => metric.key === "pm10_corrected");

const WHO_TITLE = "WHO Global Air Quality Guidelines, 24-h";
const THAI_TITLE = "Thailand NAAQS, 24-h";

function averageMetric(points, key) {
  const values = (points || []).map((point) => point[key]).filter((value) => value != null).map(Number);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function parseDisplayNumber(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || text === "-" || text === "--" || text === "—") return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function getMetricLabelHtml(key) {
  if (key.includes("pm25")) return "PM<sub>2.5</sub>";
  if (key.includes("pm10")) return "PM<sub>10</sub>";
  if (key.includes("co2")) return "CO<sub>2</sub>";
  if (key.includes("tvoc")) return "TVOC";
  if (key.includes("humidity")) return "RH";
  if (key.includes("temp")) return "TEMP";
  if (key.includes("aqi")) return "AQI";
  return key.toUpperCase();
}

function buildSensorSummary(sensor, options = {}) {
  const { include24hAqi = false } = options;

  if (!sensor) {
    return {
      hourly: [
        { key: "pm25", value: "—", unit: "µg/m³", fill: "neutral" },
        { key: "pm10", value: "—", unit: "µg/m³", fill: "neutral" },
        { key: "co2", value: "—", unit: "ppm", fill: "neutral" },
        { key: "tvoc", value: "—", unit: "ppb", fill: "neutral" },
        { key: "temp", value: "—", unit: "°C", fill: "neutral" },
        { key: "humidity", value: "—", unit: "%", fill: "neutral" },
      ],
      average: [
        { key: "avg-pm25", value: "—", unit: "µg/m³", fill: "gray" },
        { key: "avg-pm10", value: "—", unit: "µg/m³", fill: "gray" },
        ...(include24hAqi ? [{ key: "avg-aqi", value: "—", unit: "", fill: "gray" }] : []),
      ],
    };
  }

  const hourlyPm25 = averageMetric(sensor.hourlyPoints, "pm02_corrected");
  const hourlyPm10 = averageMetric(sensor.hourlyPoints, "pm10_corrected");
  const hourlyCo2 = averageMetric(sensor.hourlyPoints, "rco2_corrected");
  const hourlyTvoc = averageMetric(sensor.hourlyPoints, "tvoc");
  const hourlyTemp = averageMetric(sensor.hourlyPoints, "atmp_corrected");
  const hourlyHumidity = averageMetric(sensor.hourlyPoints, "rhum");

  const avgPm25 = averageMetric(sensor.avgPoints, "pm02_corrected");
  const avgPm10 = averageMetric(sensor.avgPoints, "pm10_corrected");
  const avgAqi = calculateAQI(avgPm25);

  return {
    hourly: [
      { key: "pm25", value: hourlyPm25 != null ? formatNumber(hourlyPm25, 1) : "—", unit: "µg/m³", fill: "neutral" },
      { key: "pm10", value: hourlyPm10 != null ? formatNumber(hourlyPm10, 0) : "—", unit: "µg/m³", fill: "neutral" },
      { key: "co2", value: hourlyCo2 != null ? formatNumber(hourlyCo2, 0) : "—", unit: "ppm", fill: "neutral" },
      { key: "tvoc", value: hourlyTvoc != null ? formatNumber(hourlyTvoc, 0) : "—", unit: "ppb", fill: "neutral" },
      { key: "temp", value: hourlyTemp != null ? formatNumber(hourlyTemp, 1) : "—", unit: "°C", fill: "neutral" },
      { key: "humidity", value: hourlyHumidity != null ? formatNumber(hourlyHumidity, 0) : "—", unit: "%", fill: "neutral" },
    ],
    average: [
      {
        key: "avg-pm25",
        value: avgPm25 != null ? formatNumber(avgPm25, 1) : "—",
        unit: "µg/m³",
        fill: getState(pm25Metric, avgPm25).color,
      },
      {
        key: "avg-pm10",
        value: avgPm10 != null ? formatNumber(avgPm10, 0) : "—",
        unit: "µg/m³",
        fill: getState(pm10Metric, avgPm10).color,
      },
      ...(include24hAqi
        ? [
            {
              key: "avg-aqi",
              value: avgAqi != null ? String(avgAqi) : "—",
              unit: "",
              fill: getAQILevel(avgAqi).color,
            },
          ]
        : []),
    ],
  };
}

function buildReferenceSummary(data) {
  const last = data?.AQILast;
  const pm25Number = parseDisplayNumber(last?.PM25?.value);
  const pm10Number = parseDisplayNumber(last?.PM10?.value);
  const aqiNumber = parseDisplayNumber(last?.AQI?.aqi);

  return [
    {
      key: "ref-pm25",
      value: pm25Number != null ? formatNumber(pm25Number, 1) : "—",
      unit: "µg/m³",
      fill: pm25Number != null ? A4T_COLOR[last?.PM25?.color_id] || "gray" : "gray",
    },
    {
      key: "ref-pm10",
      value: pm10Number != null ? formatNumber(pm10Number, 0) : "—",
      unit: "µg/m³",
      fill: pm10Number != null ? A4T_COLOR[last?.PM10?.color_id] || "gray" : "gray",
    },
    {
      key: "ref-aqi",
      value: aqiNumber != null ? String(Math.round(aqiNumber)) : "—",
      unit: "",
      fill: aqiNumber != null ? A4T_COLOR[last?.AQI?.color_id] || getAQILevel(aqiNumber).color : "gray",
    },
  ];
}

function OutdoorIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 18a4 4 0 0 0 0-8 5.02 5.02 0 0 0-9.7-1.33A3.5 3.5 0 0 0 7.5 18H17Z"></path>
      <path d="M12 2v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  `;
}

function IndoorIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 10 9-7 9 7"></path>
      <path d="M5 9.5V20h14V9.5"></path>
      <path d="M9 20v-6h6v6"></path>
    </svg>
  `;
}

function WhoBadge() {
  return html`
    <div className="f2-guideline-logo f2-guideline-logo-who">
      <img src="images/WHO.png" alt="WHO logo" loading="lazy" />
    </div>
  `;
}

function ThailandBadge() {
  return html`
    <div className="f2-guideline-logo f2-guideline-logo-flag">
      <span className="f2-flag-line flag-red"></span>
      <span className="f2-flag-line flag-white"></span>
      <span className="f2-flag-line flag-blue"></span>
      <span className="f2-flag-line flag-white"></span>
      <span className="f2-flag-line flag-red"></span>
    </div>
  `;
}

function findMetricByKey(items, keyPart) {
  return items.find((item) => item.key.includes(keyPart));
}

function getHourlyUpdateTimestamp() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now;
}

function getToneClass(fill) {
  switch (fill) {
    case "blue":
      return "f2-tone-blue";
    case "green":
      return "f2-tone-green";
    case "yellow":
      return "f2-tone-yellow";
    case "orange":
      return "f2-tone-orange";
    case "red":
      return "f2-tone-red";
    default:
      return "f2-tone-neutral";
  }
}

function Final2MetricChip({ item, showValue = false }) {
  return html`
    <div className=${`f2-metric-chip ${getToneClass(item?.fill)}`}>
      <div className="f2-chip-label" dangerouslySetInnerHTML=${{ __html: getMetricLabelHtml(item?.key || "") }}></div>
      ${showValue
        ? html`
            <div className="f2-chip-reading">
              <span className="f2-chip-value">${item?.value ?? "—"}</span>
              ${item?.unit ? html`<span className="f2-chip-unit">${item.unit}</span>` : null}
            </div>
          `
        : null}
    </div>
  `;
}

function Final2HourlyChip({ item }) {
  return html`
    <div className="f2-hourly-chip">
      <div className="f2-hourly-chip-label" dangerouslySetInnerHTML=${{ __html: getMetricLabelHtml(item?.key || "") }}></div>
      <div className="f2-hourly-chip-reading">
        <span className="f2-hourly-chip-value">${item?.value ?? "—"}</span>
        ${item?.unit ? html`<span className="f2-hourly-chip-unit">${item.unit}</span>` : null}
      </div>
    </div>
  `;
}

export function DashboardSlide({ sensors, air4thaiData }) {
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => getHourlyUpdateTimestamp());

  const outdoorSummary = useMemo(() => buildSensorSummary(sensors[0] || null, { include24hAqi: true }), [sensors]);
  const indoorSummary = useMemo(() => buildSensorSummary(sensors[1] || null, { include24hAqi: false }), [sensors]);
  const referenceItems = useMemo(() => buildReferenceSummary(air4thaiData), [air4thaiData]);

  const outdoorHourly = useMemo(
    () =>
      ["pm25", "pm10", "co2", "tvoc", "temp", "humidity"]
        .map((key) => findMetricByKey(outdoorSummary.hourly, key))
        .filter(Boolean),
    [outdoorSummary],
  );

  const indoorHourly = useMemo(
    () =>
      ["pm25", "pm10", "co2", "tvoc", "temp", "humidity"]
        .map((key) => findMetricByKey(indoorSummary.hourly, key))
        .filter(Boolean),
    [indoorSummary],
  );

  const outdoorAmbient = useMemo(
    () => [
      findMetricByKey(outdoorSummary.average, "pm25") || { key: "avg-pm25", value: "—", unit: "µg/m³", fill: "gray" },
      findMetricByKey(outdoorSummary.average, "pm10") || { key: "avg-pm10", value: "—", unit: "µg/m³", fill: "gray" },
      findMetricByKey(outdoorSummary.average, "aqi") || { key: "avg-aqi", value: "—", unit: "", fill: "gray" },
    ],
    [outdoorSummary],
  );

  const referenceAmbient = useMemo(
    () => [
      referenceItems[0] || { key: "ref-pm25", value: "—", unit: "µg/m³", fill: "gray" },
      referenceItems[1] || { key: "ref-pm10", value: "—", unit: "µg/m³", fill: "gray" },
      referenceItems[2] || { key: "ref-aqi", value: "—", unit: "", fill: "gray" },
    ],
    [referenceItems],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdatedTime(getHourlyUpdateTimestamp());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return html`
    <div className="slide-dashboard f2-dashboard-slide">
      <div className="f2-dashboard-shell">
        <header className="f2-topbar">
          <div className="f2-topbar-side f2-topbar-side-left">
            <div className="f2-top-photo f2-top-photo-left">
              <img src="images/Outdoor.jpeg" alt="Outdoor sensor" loading="lazy" />
            </div>
          </div>
          <h1 className="f2-main-title">Air Quality Today</h1>
          <div className="f2-topbar-side f2-topbar-side-right">
            <div className="f2-top-photo f2-top-photo-right">
              <img src="images/Indoor.jpeg" alt="Indoor sensor" loading="lazy" />
            </div>
          </div>
        </header>

        <section className="f2-hourly-row">
          <article className="f2-hourly-panel f2-hourly-panel-outdoor">
            <div className="f2-hourly-panel-head">
              <span className="f2-hourly-icon"><${OutdoorIcon} /></span>
              <span className="f2-hourly-title">OUTDOOR AIR (GIC), Hourly</span>
            </div>
            <div className="f2-panel-divider"></div>
            <div className="f2-hourly-grid">
              ${outdoorHourly.map((item) => html`<${Final2HourlyChip} key=${`f2-out-hour-${item.key}`} item=${item} />`)}
            </div>
          </article>

          <article className="f2-hourly-panel f2-hourly-panel-indoor">
            <div className="f2-hourly-panel-head">
              <span className="f2-hourly-icon"><${IndoorIcon} /></span>
              <span className="f2-hourly-title">INDOOR AIR (2<sup>nd</sup> Floor), Hourly</span>
            </div>
            <div className="f2-panel-divider"></div>
            <div className="f2-hourly-grid">
              ${indoorHourly.map((item) => html`<${Final2HourlyChip} key=${`f2-in-hour-${item.key}`} item=${item} />`)}
            </div>
          </article>
        </section>

        <div className="f2-main-divider"></div>

        <section className="f2-ambient-section">
          <h2 className="f2-section-title">24-h Ambient Air Quality</h2>
          <div className="f2-ambient-row">
            <article className="f2-ambient-group">
              <h3 className="f2-ambient-subtitle">Last 24-h Outdoor (GIC)</h3>
              <div className="f2-ambient-cards">
                ${outdoorAmbient.map((item) => html`<${Final2MetricChip} showValue=${true} key=${`f2-out-24-${item.key}`} item=${item} />`)}
              </div>
            </article>

            <article className="f2-ambient-group">
              <h3 className="f2-ambient-subtitle">24-h Reference Station (RANGSIT)</h3>
              <div className="f2-ambient-cards">
                ${referenceAmbient.map((item) => html`<${Final2MetricChip} showValue=${true} key=${`f2-ref-24-${item.key}`} item=${item} />`)}
              </div>
            </article>
          </div>
        </section>

        <section className="f2-scale-section">
          <div className="f2-scale-divider" aria-hidden="true"></div>
          <div className="f2-scale-label-row">
            ${AQI_LEGEND.map((item) => html`<div key=${`${item.label}-f2-label`} className="f2-scale-label">${item.label}</div>`)}
          </div>
          <div className="f2-scale-bar">
            ${AQI_LEGEND.map(
              (item) => html`<div key=${`${item.label}-f2-range`} className=${`f2-scale-segment ${item.className}`}>${item.range}</div>`,
            )}
          </div>
        </section>

        <section className="f2-guidelines">
          <h2 className="f2-section-title f2-guidelines-title">Air Quality Guidelines & Standards</h2>
          <div className="f2-guideline-row">
            <article className="f2-guideline-panel">
              <div className="f2-guideline-header">
                <${WhoBadge} />
                <div className="f2-guideline-header-title">${WHO_TITLE}</div>
              </div>
              <div className="f2-guideline-cards">
                <${Final2MetricChip} showValue=${true} item=${{ key: "who-pm25", value: "≤ 15", unit: "µg/m³", fill: "neutral" }} />
                <${Final2MetricChip} showValue=${true} item=${{ key: "who-pm10", value: "≤ 45", unit: "µg/m³", fill: "neutral" }} />
              </div>
            </article>

            <article className="f2-guideline-panel">
              <div className="f2-guideline-header">
                <${ThailandBadge} />
                <div className="f2-guideline-header-title">${THAI_TITLE}</div>
              </div>
              <div className="f2-guideline-cards">
                <${Final2MetricChip} showValue=${true} item=${{ key: "thai-pm25", value: "37.5", unit: "µg/m³", fill: "neutral" }} />
                <${Final2MetricChip} showValue=${true} item=${{ key: "thai-pm10", value: "120", unit: "µg/m³", fill: "neutral" }} />
              </div>
            </article>
          </div>
        </section>

        <div className="f2-last-updated">
          Last updated:
          ${lastUpdatedTime.toLocaleString(undefined, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      </div>
    </div>
  `;
}
