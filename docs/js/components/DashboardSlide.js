import { A4T_COLOR, AQI_LEGEND, METRICS } from "../constants.js";
import { html, useEffect, useMemo, useState } from "../react-shim.js";
import { calculateAQI, formatNumber, getAQILevel, getState } from "../utils.js";

const pm25Metric = METRICS.find((metric) => metric.key === "pm02_corrected");
const pm10Metric = METRICS.find((metric) => metric.key === "pm10_corrected");

const STANDARD_WHO_ITEMS = [
  { label: "PM2.5", value: "15", unit: "\u00b5g/m\u00b3", color: "green" },
  { label: "PM10", value: "45", unit: "\u00b5g/m\u00b3", color: "blue" },
  { label: "AQI", value: "\u2264 100", unit: "index", color: "yellow" },
];

const STANDARD_THAI_ITEMS = [
  { label: "PM2.5", value: "\u2264 37.5", unit: "\u00b5g/m\u00b3", color: "green" },
  { label: "PM10", value: "\u2264 120", unit: "\u00b5g/m\u00b3", color: "blue" },
  { label: "AQI", value: "\u2264 100", unit: "index", color: "yellow" },
];

function averageMetric(points, key) {
  const values = (points || []).map((point) => point[key]).filter((value) => value != null).map(Number);
  if (!values.length) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getFillClass(color) {
  switch (color) {
    case "blue":
      return "ppt-fill-blue";
    case "green":
      return "ppt-fill-green";
    case "yellow":
      return "ppt-fill-yellow";
    case "orange":
      return "ppt-fill-orange";
    case "red":
      return "ppt-fill-red";
    default:
      return "ppt-fill-neutral";
  }
}

function buildSensorSummary(sensor, options = {}) {
  const { include24hAqi = false } = options;

  if (!sensor) {
    return {
      hourly: [
        { key: "pm25", label: "PM2.5", value: "\u2014", unit: "\u00b5g/m\u00b3", fill: "green" },
        { key: "pm10", label: "PM10", value: "\u2014", unit: "\u00b5g/m\u00b3", fill: "blue" },
        { key: "temp", label: "TEMP", value: "\u2014", unit: "\u00b0C", fill: "neutral", icon: "temp" },
        { key: "co2", label: "CO2", value: "\u2014", unit: "ppm", fill: "neutral" },
        { key: "tvoc", label: "TVOC", value: "\u2014", unit: "ppb", fill: "neutral" },
        { key: "humidity", label: "HUMIDITY", value: "\u2014", unit: "%", fill: "neutral" },
      ],
      average: [
        { key: "avg-pm25", label: "PM2.5", value: "\u2014", unit: "\u00b5g/m\u00b3", fill: "green" },
        { key: "avg-pm10", label: "PM10", value: "\u2014", unit: "\u00b5g/m\u00b3", fill: "blue" },
        ...(include24hAqi ? [{ key: "avg-aqi", label: "AQI", value: "\u2014", unit: "", fill: "yellow" }] : []),
      ],
    };
  }

  const pm25 = sensor.pm02_corrected != null ? Number(sensor.pm02_corrected) : null;
  const pm10 = sensor.pm10_corrected != null ? Number(sensor.pm10_corrected) : null;
  const temp = sensor.atmp_corrected != null ? Number(sensor.atmp_corrected) : null;
  const avgPm25 = averageMetric(sensor.avgPoints, "pm02_corrected");
  const avgPm10 = averageMetric(sensor.avgPoints, "pm10_corrected");
  const avgAqi = calculateAQI(avgPm25);

  return {
    hourly: [
      {
        key: "pm25",
        label: "PM2.5",
        value: pm25 != null ? formatNumber(pm25, 1) : "\u2014",
        unit: "\u00b5g/m\u00b3",
        fill: getState(pm25Metric, pm25).color,
      },
      {
        key: "pm10",
        label: "PM10",
        value: pm10 != null ? formatNumber(pm10, 0) : "\u2014",
        unit: "\u00b5g/m\u00b3",
        fill: getState(pm10Metric, pm10).color,
      },
      {
        key: "temp",
        label: "TEMP",
        value: temp != null ? formatNumber(temp, 1) : "\u2014",
        unit: "\u00b0C",
        fill: "neutral",
        icon: "temp",
      },
      {
        key: "co2",
        label: "CO2",
        value: sensor.rco2_corrected != null ? formatNumber(sensor.rco2_corrected, 0) : "\u2014",
        unit: "ppm",
        fill: "neutral",
      },
      {
        key: "tvoc",
        label: "TVOC",
        value: sensor.tvoc != null ? formatNumber(sensor.tvoc, 0) : "\u2014",
        unit: "ppb",
        fill: "neutral",
      },
      {
        key: "humidity",
        label: "HUMIDITY",
        value: sensor.rhum != null ? formatNumber(sensor.rhum, 0) : "\u2014",
        unit: "%",
        fill: "neutral",
      },
    ],
    average: [
      {
        key: "avg-pm25",
        label: "PM2.5",
        value: avgPm25 != null ? formatNumber(avgPm25, 1) : "\u2014",
        unit: "\u00b5g/m\u00b3",
        fill: getState(pm25Metric, avgPm25).color,
      },
      {
        key: "avg-pm10",
        label: "PM10",
        value: avgPm10 != null ? formatNumber(avgPm10, 0) : "\u2014",
        unit: "\u00b5g/m\u00b3",
        fill: getState(pm10Metric, avgPm10).color,
      },
      ...(include24hAqi
        ? [
            {
              key: "avg-aqi",
              label: "AQI",
              value: avgAqi != null ? String(avgAqi) : "\u2014",
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
  const pm25Color = A4T_COLOR[last?.PM25?.color_id] || "green";
  const pm10Color = A4T_COLOR[last?.PM10?.color_id] || "blue";
  const aqiColor = A4T_COLOR[last?.AQI?.color_id] || getAQILevel(Number(last?.AQI?.aqi)).color;

  return [
    {
      key: "ref-pm25",
      label: "PM2.5",
      value: last?.PM25?.value != null ? formatNumber(last.PM25.value, 1) : "\u2014",
      unit: "\u00b5g/m\u00b3",
      fill: pm25Color,
    },
    {
      key: "ref-pm10",
      label: "PM10",
      value: last?.PM10?.value != null ? formatNumber(last.PM10.value, 0) : "\u2014",
      unit: "\u00b5g/m\u00b3",
      fill: pm10Color,
    },
    {
      key: "ref-aqi",
      label: "AQI",
      value: last?.AQI?.aqi != null ? String(last.AQI.aqi) : "\u2014",
      unit: "",
      fill: aqiColor,
    },
  ];
}

function ThermometerIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z"></path>
    </svg>
  `;
}

function OutdoorIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 18a4 4 0 0 1-.45-7.97A6.5 6.5 0 0 1 18.4 8.2 4.5 4.5 0 1 1 18.5 18H6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M10 4V2M5.7 5.7 4.2 4.2M14.3 5.7l1.5-1.5M3 10H1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
    </svg>
  `;
}

function IndoorIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h5.5v-5h2v5H18.5V9.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M8 20v-4h2v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
}

function PinIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
      <circle cx="12" cy="10" r="2.5" fill="currentColor"></circle>
    </svg>
  `;
}

function WhoBadge() {
  return html`<div className="ppt-guideline-badge ppt-guideline-badge-who">WHO</div>`;
}

function ThailandBadge() {
  return html`
    <div className="ppt-guideline-badge ppt-guideline-badge-flag">
      <span className="ppt-flag-line flag-red"></span>
      <span className="ppt-flag-line flag-white"></span>
      <span className="ppt-flag-line flag-blue"></span>
      <span className="ppt-flag-line flag-white"></span>
      <span className="ppt-flag-line flag-red"></span>
    </div>
  `;
}

function SectionMetricCard({ item, tall = false, wide = false }) {
  return html`
    <div
      className=${`ppt-metric-card ${getFillClass(item.fill)} ${tall ? "ppt-metric-card-tall" : ""} ${wide ? "ppt-metric-card-wide" : ""}`}
    >
      <div className="ppt-metric-label">${item.label}</div>
      <div className="ppt-metric-value">${item.value}</div>
      ${item.unit ? html`<div className="ppt-metric-unit">${item.unit}</div>` : null}
      ${item.icon === "temp" ? html`<div className="ppt-metric-icon"><${ThermometerIcon} /></div>` : null}
    </div>
  `;
}

function SensorPanel({ panelClass, title, subtitle, icon, summary, include24hAqi }) {
  return html`
    <section className=${`ppt-panel ${panelClass}`}>
      <div className="ppt-panel-header">
        <div className="ppt-panel-title-row">
          <div className="ppt-panel-icon">${icon}</div>
          <div className="ppt-panel-title-block">
            <div className="ppt-panel-title">${title}</div>
            <div className="ppt-panel-subtitle">${subtitle}</div>
          </div>
        </div>
      </div>

      <div className="ppt-panel-section-title">Hourly Air Quality</div>
      <div className="ppt-hourly-grid">
        ${summary.hourly.map(
          (item) => html`<${SectionMetricCard} key=${item.key} item=${item} />`,
        )}
      </div>

      <div className="ppt-panel-section-title">24 Hour Avg Air Quality</div>
      <div className=${`ppt-average-grid ${include24hAqi ? "ppt-average-grid-three" : "ppt-average-grid-two"}`}>
        ${summary.average.map(
          (item) => html`<${SectionMetricCard} key=${item.key} item=${item} tall=${true} />`,
        )}
      </div>
    </section>
  `;
}

function ReferencePanel({ items }) {
  return html`
    <section className="ppt-panel ppt-panel-reference">
      <div className="ppt-panel-header">
        <div className="ppt-panel-title-row">
          <div className="ppt-panel-icon"><${PinIcon} /></div>
          <div className="ppt-panel-title-block">
            <div className="ppt-panel-title">Rangsit Air Quality</div>
            <div className="ppt-panel-title ppt-panel-title-secondary">(Reference Station)</div>
          </div>
        </div>
      </div>

      <div className="ppt-panel-section-title">24 Hour Avg Air Quality</div>
      <div className="ppt-reference-stack">
        ${items.map(
          (item) => html`<${SectionMetricCard} key=${item.key} item=${item} wide=${true} />`,
        )}
      </div>
    </section>
  `;
}

function ScalePanel() {
  return html`
    <section className="ppt-scale-panel">
      <div className="ppt-scale-title">AQI Scale</div>
      <div className="ppt-scale-list">
        ${AQI_LEGEND.map(
          (item) => html`
            <div key=${item.label} className=${`ppt-scale-item ${item.className}`}>
              ${item.range}
            </div>
          `,
        )}
      </div>
    </section>
  `;
}

function GuidelinePanel({ theme, badge, title, items }) {
  return html`
    <section className="ppt-guideline-panel">
      <div className=${`ppt-guideline-header ppt-guideline-header-${theme}`}>
        ${badge}
        <div className="ppt-guideline-title">${title}</div>
      </div>
      <div className="ppt-panel-section-title ppt-panel-section-title-guideline">24 Hour Avg Air Quality</div>
      <div className="ppt-guideline-grid">
        ${items.map(
          (item) => html`
            <div key=${item.label} className=${`ppt-guideline-card ${getFillClass(item.color)}`}>
              <div className="ppt-metric-label">${item.label}</div>
              <div className="ppt-metric-value">${item.value}</div>
              <div className="ppt-metric-unit">${item.unit}</div>
            </div>
          `,
        )}
      </div>
    </section>
  `;
}

export function DashboardSlide({ sensors, air4thaiData }) {
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
  const indoorSummary = useMemo(() => buildSensorSummary(sensors[1] || null, { include24hAqi: false }), [sensors]);
  const outdoorSummary = useMemo(() => buildSensorSummary(sensors[0] || null, { include24hAqi: true }), [sensors]);
  const referenceItems = useMemo(() => buildReferenceSummary(air4thaiData), [air4thaiData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return html`
    <div className="slide-dashboard ppt-dashboard-slide">
      <div className="ppt-dashboard-shell">
        <div className="ppt-topbar">
          <div className="ppt-topbar-spacer"></div>
          <div className="ppt-title-wrap">
            <h1 className="ppt-dashboard-title">Air Quality Today</h1>
          </div>
          <div className="ppt-last-updated">Last updated: ${currentDateTime.toLocaleString()}</div>
        </div>

        <div className="ppt-top-grid">
          <${SensorPanel}
            panelClass="ppt-panel-indoor"
            title="Indoor Air Quality"
            subtitle="AIT, GIC Building (2nd Floor)"
            icon=${html`<${IndoorIcon} />`}
            summary=${indoorSummary}
            include24hAqi=${false}
          />
          <${SensorPanel}
            panelClass="ppt-panel-outdoor"
            title="Outdoor Air Quality"
            subtitle="AIT, GIC Building"
            icon=${html`<${OutdoorIcon} />`}
            summary=${outdoorSummary}
            include24hAqi=${true}
          />
          <${ReferencePanel} items=${referenceItems} />
          <${ScalePanel} />
        </div>

        <div className="ppt-bottom-grid">
          <${GuidelinePanel}
            theme="who"
            badge=${html`<${WhoBadge} />`}
            title="WHO Emission Guideline"
            items=${STANDARD_WHO_ITEMS}
          />
          <${GuidelinePanel}
            theme="thai"
            badge=${html`<${ThailandBadge} />`}
            title="National Ambient Air Quality Standards"
            items=${STANDARD_THAI_ITEMS}
          />
        </div>
      </div>
    </div>
  `;
}
