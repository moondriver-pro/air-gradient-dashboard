import { A4T_COLOR, AQI_LEGEND, METRICS, THAILAND_GUIDELINES, WHO_GUIDELINES } from "../constants.js";
import { html, useEffect, useMemo, useState } from "../react-shim.js";
import { calculateAQI, formatNumber, getAQILevel, getState } from "../utils.js";

const tempMetric = METRICS.find((metric) => metric.key === "atmp_corrected");
const pm25Metric = METRICS.find((metric) => metric.key === "pm02_corrected");
const pm10Metric = METRICS.find((metric) => metric.key === "pm10_corrected");

const QUALITY_COPY = {
  blue: "Air is very clean and comfortable for most activity.",
  green: "Air quality is satisfactory for normal daily activity.",
  yellow: "Air is acceptable, but sensitive groups should be careful.",
  orange: "Sensitive groups should reduce prolonged outdoor activity.",
  red: "Air quality is unhealthy and should be monitored closely.",
  gray: "Waiting for live sensor data.",
};

const REFERENCE_COPY = {
  blue: "Excellent",
  green: "Satisfactory",
  yellow: "Moderate",
  orange: "Unhealthy",
  red: "Very Unhealthy",
  gray: "Unavailable",
};

function averageMetric(points, key, dec) {
  const values = (points || []).map((point) => point[key]).filter((value) => value != null).map(Number);
  if (!values.length) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildSensorSummary(sensor) {
  if (!sensor) {
    return {
      title: "Loading Sensor",
      subtitle: "Connecting to AirGradient",
      stats: [],
      supportStats: [],
      aqi: "--",
      qualityColor: "gray",
      qualityLabel: "Waiting",
      qualityCopy: QUALITY_COPY.gray,
      avgStats: [],
    };
  }

  const pm25 = sensor.pm02_corrected != null ? Number(sensor.pm02_corrected) : null;
  const pm10 = sensor.pm10_corrected != null ? Number(sensor.pm10_corrected) : null;
  const temp = sensor.atmp_corrected != null ? Number(sensor.atmp_corrected) : null;
  const aqi = calculateAQI(pm25);
  const aqiLevel = getAQILevel(aqi);
  const pm25State = getState(pm25Metric, pm25);
  const pm10State = getState(pm10Metric, pm10);
  const tempState = getState(tempMetric, temp);
  const avgPm25 = averageMetric(sensor.avgPoints, "pm02_corrected", 1);
  const avgPm10 = averageMetric(sensor.avgPoints, "pm10_corrected", 0);
  const avgPm25State = getState(pm25Metric, avgPm25);
  const avgPm10State = getState(pm10Metric, avgPm10);

  return {
    title: sensor.locationName,
    subtitle: `${sensor.model} | S/N: ${sensor.serialno}`,
    stats: [
      {
        key: "pm25",
        label: "PM2.5",
        value: pm25 != null ? formatNumber(pm25, 1) : "\u2014",
        unit: "\u00b5g/m\u00b3",
        accent: pm25State.color,
      },
      {
        key: "pm10",
        label: "PM10",
        value: pm10 != null ? formatNumber(pm10, 0) : "\u2014",
        unit: "\u00b5g/m\u00b3",
        accent: pm10State.color,
      },
      {
        key: "temp",
        label: "Temp",
        value: temp != null ? formatNumber(temp, 1) : "\u2014",
        unit: "\u00b0C",
        accent: tempState.color,
      },
    ],
    supportStats: [
      { key: "co2", label: "CO2", value: sensor.rco2_corrected != null ? formatNumber(sensor.rco2_corrected, 0) : "\u2014", unit: "ppm" },
      { key: "tvoc", label: "TVOC", value: sensor.tvoc != null ? formatNumber(sensor.tvoc, 0) : "\u2014", unit: "ppb" },
      { key: "humidity", label: "Humidity", value: sensor.rhum != null ? formatNumber(sensor.rhum, 0) : "\u2014", unit: "%" },
    ],
    aqi: aqi != null ? String(aqi) : "--",
    qualityColor: aqiLevel.color,
    qualityLabel: aqiLevel.label,
    qualityCopy: QUALITY_COPY[aqiLevel.color] || QUALITY_COPY.gray,
    avgStats: [
      {
        key: "avg-pm25",
        label: "24H Avg PM2.5",
        value: avgPm25 != null ? formatNumber(avgPm25, 1) : "\u2014",
        unit: "\u00b5g/m\u00b3",
        accent: avgPm25State.color,
      },
      {
        key: "avg-pm10",
        label: "24H Avg PM10",
        value: avgPm10 != null ? formatNumber(avgPm10, 0) : "\u2014",
        unit: "\u00b5g/m\u00b3",
        accent: avgPm10State.color,
      },
    ],
  };
}

function ThermometerIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z"></path>
    </svg>
  `;
}

function CloudIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 18a4 4 0 0 1-.45-7.97A6.5 6.5 0 0 1 18.4 8.2 4.5 4.5 0 1 1 18.5 18H6Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
      <path d="M8 5.5v-2M4.9 6.9 3.5 5.5M11.1 6.9l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
    </svg>
  `;
}

function HomeIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 10.5 12 3l9 7.5M5.5 9.5V20h5.5v-5h2v5H18.5V9.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </svg>
  `;
}

function PinIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
      <circle cx="12" cy="10" r="2.5" fill="currentColor"></circle>
    </svg>
  `;
}

function HeroCard({ variant, heading, strapline, icon, summary }) {
  return html`
    <section className=${`hero-card hero-card-${variant}`}>
      <div className="hero-card-header">
        <div className="hero-card-icon">${icon}</div>
        <div className="hero-card-titles">
          <div className="hero-card-heading">${heading}</div>
          <div className="hero-card-subtitle">${strapline}</div>
          <div className="hero-card-meta">${summary.subtitle}</div>
        </div>
      </div>

      <div className="hero-stat-grid">
        ${summary.stats.map(
          (stat) => html`
            <div key=${stat.key} className=${`hero-stat-card ${stat.accent ? `hero-stat-${stat.accent}` : ""}`}>
              <div className="hero-stat-label">${stat.label}</div>
              <div className="hero-stat-value">${stat.value}</div>
              <div className="hero-stat-unit">${stat.unit}</div>
              ${stat.key === "temp" ? html`<div className="hero-stat-icon"><${ThermometerIcon} /></div>` : null}
            </div>
          `,
        )}
      </div>

      <div className="hero-support-grid">
        ${summary.supportStats.map(
          (stat) => html`
            <div key=${stat.key} className="hero-support-chip">
              <span className="hero-support-label">${stat.label}</span>
              <span className="hero-support-value">${stat.value}</span>
              <span className="hero-support-unit">${stat.unit}</span>
            </div>
          `,
        )}
      </div>

      <div className=${`hero-status hero-status-${summary.qualityColor}`}>
        <div className="hero-status-aqi">
          <span className="hero-status-aqi-label">AQI</span>
          <strong>${summary.aqi}</strong>
        </div>
        <div className="hero-status-copy">
          <div className="hero-status-title">24-Hour Average</div>
          <div className="hero-status-card-row">
            ${summary.avgStats.map(
              (stat) => html`
                <div key=${stat.key} className=${`hero-stat-card hero-status-stat-card hero-stat-${stat.accent}`}>
                  <div className="hero-stat-label">${stat.label}</div>
                  <div className="hero-stat-value">${stat.value}</div>
                  <div className="hero-stat-unit">${stat.unit}</div>
                </div>
              `,
            )}
          </div>
        </div>
      </div>
    </section>
  `;
}

function ReferenceCard({ data }) {
  const last = data?.AQILast;
  const tempValue = last?.TEMP?.value ?? last?.temperature?.value ?? last?.TEMP;
  const tempNumber = tempValue != null && !Number.isNaN(Number(tempValue)) ? Number(tempValue) : null;
  const tempState = getState(tempMetric, tempNumber);
  const pm25Color = A4T_COLOR[last?.PM25?.color_id] || "gray";
  const pm10State = pm10Metric && last?.PM10?.value != null ? getState(pm10Metric, Number(last.PM10.value)) : { color: "gray" };
  const aqiValue = last?.AQI?.aqi != null ? String(last.AQI.aqi) : "--";
  const aqiLevel = getAQILevel(Number(last?.AQI?.aqi));

  return html`
    <section className="reference-card">
      <div className="reference-card-header">
        <div className="hero-card-icon"><${PinIcon} /></div>
        <div className="hero-card-titles">
          <div className="hero-card-heading">Rangsit Region</div>
          <div className="hero-card-subtitle">Reference Station (Air4Thai)</div>
          <div className="hero-card-meta">Live public monitoring feed</div>
        </div>
      </div>

      <div className="reference-stack">
        <div className="reference-row">
          <div className=${`reference-metric-card reference-metric-card-${pm25Color}`}>
            <div className="hero-stat-label">PM2.5</div>
            <div className="reference-metric-value">${last?.PM25?.value != null ? formatNumber(last.PM25.value, 1) : "\u2014"}</div>
            <div className="hero-stat-unit">\u00b5g/m\u00b3</div>
          </div>
          <div className=${`reference-badge reference-badge-${aqiLevel.color}`}>
            <div className="reference-badge-label">AQI</div>
            <div className="reference-badge-value">${aqiValue}</div>
            <div className="reference-badge-text">${aqiLevel.label}</div>
          </div>
        </div>

        <div className="reference-row">
          <div className=${`reference-metric-card reference-metric-card-${pm10State.color}`}>
            <div className="hero-stat-label">PM10</div>
            <div className="reference-metric-value">${last?.PM10?.value != null ? formatNumber(last.PM10.value, 0) : "\u2014"}</div>
            <div className="hero-stat-unit">\u00b5g/m\u00b3</div>
          </div>
          <div className=${`reference-badge reference-badge-${pm10State.color}`}>
            <div className="reference-badge-label">Level</div>
            <div className="reference-badge-value">${REFERENCE_COPY[pm10State.color] || "Unavailable"}</div>
          </div>
        </div>

        <div className="reference-temp-row">
          <div className="reference-temp-main">
            <div className="hero-stat-label">Temp</div>
            <div className="reference-metric-value">${tempNumber != null ? formatNumber(tempNumber, 1) : "\u2014"}<span>\u00b0C</span></div>
          </div>
          <div className="reference-temp-status">
            <span className=${`reference-temp-icon reference-temp-${tempState.color}`}><${ThermometerIcon} /></span>
            <span>${tempState.level}</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function GuidelinePanel({ theme, title, subtitle, items }) {
  return html`
    <section className=${`standards-panel standards-panel-${theme}`}>
      <div className="standards-panel-header">
        <div className="standards-panel-title">${title}</div>
        <div className="standards-panel-subtitle">${subtitle}</div>
      </div>
      <div className="standards-grid">
        ${items.map(
          (item) => html`
            <div key=${item.metric} className="standards-item">
              <div className="standards-item-label" dangerouslySetInnerHTML=${{ __html: item.metric }}></div>
              <div className="standards-item-value" dangerouslySetInnerHTML=${{ __html: item.value }}></div>
              <div className="standards-item-unit" dangerouslySetInnerHTML=${{ __html: item.unit }}></div>
            </div>
          `,
        )}
      </div>
    </section>
  `;
}

export function DashboardSlide({ sensors, air4thaiData }) {
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
  const outdoorSummary = useMemo(() => buildSensorSummary(sensors[0] || null), [sensors]);
  const indoorSummary = useMemo(() => buildSensorSummary(sensors[1] || null), [sensors]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return html`
    <div className="slide-dashboard">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-title-block">
            <h1 className="dashboard-title">Air Quality Dashboard</h1>
            <div className="dashboard-subtitle-line">AIT & Rangsit Region, Thailand</div>
          </div>
          <div className="dashboard-time-note">
            Current date and time: ${currentDateTime.toLocaleString()}
          </div>
        </div>

        <div className="dashboard-panels">
          <${HeroCard}
            variant="outdoor"
            heading="Outdoor Air Quality"
            strapline="AIT Outdoor"
            icon=${html`<${CloudIcon} />`}
            summary=${outdoorSummary}
          />
          <${HeroCard}
            variant="indoor"
            heading="Indoor Air Quality"
            strapline="AIT Indoor (2nd Floor)"
            icon=${html`<${HomeIcon} />`}
            summary=${indoorSummary}
          />
          <${ReferenceCard} data=${air4thaiData} />
        </div>

        <div className="dashboard-scale-shell">
          <div className="dashboard-section-heading dashboard-section-heading-small">
            AQI Scale Color Level
          </div>
          <div className="dashboard-scale-note">Same color codes used for PM2.5, PM10, and AQI values</div>
          <div className="dashboard-scale-grid">
            ${AQI_LEGEND.map(
              (item) => html`
                <div key=${item.label} className=${`dashboard-scale-item ${item.className}`}>
                  <strong>${item.range}</strong>
                  <span>${item.label}</span>
                </div>
              `,
            )}
          </div>
        </div>

        <div className="dashboard-standards-shell">
          <div className="dashboard-section-heading">WHO Guidelines & Thailand National Standards</div>
          <div className="dashboard-standards-grid">
            <${GuidelinePanel}
              theme="who"
              title="WHO Guidelines"
              subtitle="Recommended Safe Levels"
              items=${WHO_GUIDELINES}
            />
            <${GuidelinePanel}
              theme="thai"
              title="Thailand National Guidelines (PCD)"
              subtitle="National Reference Limits"
              items=${THAILAND_GUIDELINES}
            />
          </div>
        </div>
      </div>
    </div>
  `;
}
