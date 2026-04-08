import { A4T_COLOR, AQI_LEGEND, METRICS } from "../constants.js";
import { html, useEffect, useMemo, useState } from "../react-shim.js";
import { calculateAQI, formatNumber, getAQILevel, getState } from "../utils.js";

const pm25Metric = METRICS.find((metric) => metric.key === "pm02_corrected");
const pm10Metric = METRICS.find((metric) => metric.key === "pm10_corrected");

const WHO_TITLE = "WHO Global Air Quality Guidelines (2021)";
const THAI_TITLE = "Thailand National Ambient Air Quality Standards";
const PM24H_DECISION_TABLES = [
  {
    key: "pm25",
    title: "PM<sub>2.5</sub> (Average 24h)",
    rows: [
      { range: "0 - 15.0", className: "aqi-bg-blue" },
      { range: "15.1 - 25.0", className: "aqi-bg-green" },
      { range: "25.1 - 37.5", className: "aqi-bg-yellow" },
      { range: "37.6 - 75.0", className: "aqi-bg-orange" },
      { range: "75.1 Above", className: "aqi-bg-red" },
    ],
  },
  {
    key: "pm10",
    title: "PM<sub>10</sub> (Average 24h)",
    rows: [
      { range: "0 - 50", className: "aqi-bg-blue" },
      { range: "51 - 80", className: "aqi-bg-green" },
      { range: "81 - 120", className: "aqi-bg-yellow" },
      { range: "121 - 180", className: "aqi-bg-orange" },
      { range: "181 Above", className: "aqi-bg-red" },
    ],
  },
];

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

function getFillClass(color) {
  switch (color) {
    case "blue":
      return "final-fill-blue";
    case "green":
      return "final-fill-green";
    case "yellow":
      return "final-fill-yellow";
    case "orange":
      return "final-fill-orange";
    case "red":
      return "final-fill-red";
    default:
      return "final-fill-neutral";
  }
}

function getMetricLabelHtml(key) {
  if (key.includes("pm25")) return "PM<sub>2.5</sub>";
  if (key.includes("pm10")) return "PM<sub>10</sub>";
  if (key.includes("co2")) return "CO<sub>2</sub>";
  if (key.includes("tvoc")) return "TVOC";
  if (key.includes("humidity")) return "HUMIDITY";
  if (key.includes("temp")) return "TEMP";
  if (key.includes("aqi")) return "AQI";
  return key.toUpperCase();
}

function buildSensorSummary(sensor, options = {}) {
  const { include24hAqi = false } = options;

  if (!sensor) {
    return {
      hourly: [
        { key: "pm25", label: "PM2.5", value: "—", unit: "µg/m³", fill: "neutral" },
        { key: "pm10", label: "PM10", value: "—", unit: "µg/m³", fill: "neutral" },
        { key: "co2", label: "CO2", value: "—", unit: "ppm", fill: "neutral" },
        { key: "tvoc", label: "TVOC", value: "—", unit: "ppb", fill: "neutral" },
        { key: "temp", label: "TEMP", value: "—", unit: "°C", fill: "neutral" },
        { key: "humidity", label: "HUMIDITY", value: "—", unit: "%", fill: "neutral" },
      ],
      average: [
        { key: "avg-pm25", label: "PM2.5", value: "—", unit: "µg/m³", fill: "gray" },
        { key: "avg-pm10", label: "PM10", value: "—", unit: "µg/m³", fill: "gray" },
        ...(include24hAqi ? [{ key: "avg-aqi", label: "AQI", value: "—", unit: "", fill: "gray" }] : []),
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
      { key: "pm25", label: "PM2.5", value: hourlyPm25 != null ? formatNumber(hourlyPm25, 1) : "—", unit: "µg/m³", fill: "neutral" },
      { key: "pm10", label: "PM10", value: hourlyPm10 != null ? formatNumber(hourlyPm10, 0) : "—", unit: "µg/m³", fill: "neutral" },
      { key: "co2", label: "CO2", value: hourlyCo2 != null ? formatNumber(hourlyCo2, 0) : "—", unit: "ppm", fill: "neutral" },
      { key: "tvoc", label: "TVOC", value: hourlyTvoc != null ? formatNumber(hourlyTvoc, 0) : "—", unit: "ppb", fill: "neutral" },
      { key: "temp", label: "TEMP", value: hourlyTemp != null ? formatNumber(hourlyTemp, 1) : "—", unit: "°C", fill: "neutral" },
      { key: "humidity", label: "HUMIDITY", value: hourlyHumidity != null ? formatNumber(hourlyHumidity, 0) : "—", unit: "%", fill: "neutral" },
    ],
    average: [
      {
        key: "avg-pm25",
        label: "PM2.5",
        value: avgPm25 != null ? formatNumber(avgPm25, 1) : "—",
        unit: "µg/m³",
        fill: getState(pm25Metric, avgPm25).color,
      },
      {
        key: "avg-pm10",
        label: "PM10",
        value: avgPm10 != null ? formatNumber(avgPm10, 0) : "—",
        unit: "µg/m³",
        fill: getState(pm10Metric, avgPm10).color,
      },
      ...(include24hAqi
        ? [
            {
              key: "avg-aqi",
              label: "AQI",
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
      label: "PM2.5",
      value: pm25Number != null ? formatNumber(pm25Number, 1) : "—",
      unit: "µg/m³",
      fill: pm25Number != null ? A4T_COLOR[last?.PM25?.color_id] || "gray" : "gray",
    },
    {
      key: "ref-pm10",
      label: "PM10",
      value: pm10Number != null ? formatNumber(pm10Number, 0) : "—",
      unit: "µg/m³",
      fill: pm10Number != null ? A4T_COLOR[last?.PM10?.color_id] || "gray" : "gray",
    },
    {
      key: "ref-aqi",
      label: "AQI",
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
    <div className="final-guideline-logo final-guideline-logo-who">
      <img src="images/WHO.png" alt="WHO logo" loading="lazy" />
    </div>
  `;
}

function ThailandBadge() {
  return html`
    <div className="final-guideline-logo final-guideline-logo-flag">
      <span className="final-flag-line flag-red"></span>
      <span className="final-flag-line flag-white"></span>
      <span className="final-flag-line flag-blue"></span>
      <span className="final-flag-line flag-white"></span>
      <span className="final-flag-line flag-red"></span>
    </div>
  `;
}

function findMetricByKey(items, keyPart) {
  return items.find((item) => item.key.includes(keyPart));
}

function FinalCard({ item, compact = false, wide = false, variant = "metric" }) {
  return html`
    <div
      className=${`final-card final-card-${variant} ${getFillClass(item.fill)} ${compact ? "final-card-compact" : ""} ${wide ? "final-card-wide" : ""}`}
    >
      <div className="final-card-label" dangerouslySetInnerHTML=${{ __html: getMetricLabelHtml(item.key) }}></div>
      <div className="final-card-value">${item.value}</div>
      ${item.unit ? html`<div className="final-card-unit">${item.unit}</div>` : null}
    </div>
  `;
}

function HourlyLabelCard({ item }) {
  return html`
    <div className="final-hourly-chip">
      <div className="final-hourly-label" dangerouslySetInnerHTML=${{ __html: getMetricLabelHtml(item.key) }}></div>
      <div className="final-hourly-reading">
        <span className="final-hourly-value">${item.value}</span>
        ${item.unit ? html`<span className="final-hourly-unit">${item.unit}</span>` : null}
      </div>
    </div>
  `;
}

function HeadingBlock({ title, subtitle, icon }) {
  return html`
    <div className="final-heading-block">
      <div className="final-heading-title-row">
        <div className="final-heading-icon">${icon}</div>
        <div className="final-heading-title">${title}</div>
      </div>
      <div className="final-heading-subtitle">${subtitle}</div>
    </div>
  `;
}

function DecisionColorTable({ table }) {
  const alignClass = table.key === "pm10" ? "final-decision-table-right" : "final-decision-table-left";
  const isRightTable = table.key === "pm10";
  return html`
    <aside className=${`final-decision-table ${alignClass}`} aria-label=${`${table.key} 24-hour decision color table`}>
      <div className="final-decision-title" dangerouslySetInnerHTML=${{ __html: table.title }}></div>
      <div className="final-decision-rows">
        ${table.rows.map(
          (row) => html`
            <div key=${`${table.key}-${row.range}`} className=${`final-decision-row ${isRightTable ? "final-decision-row-right" : "final-decision-row-left"}`}>
              ${isRightTable
                ? html`
                    <span className="final-decision-range">${row.range}</span>
                    <span className=${`final-decision-dot ${row.className}`}></span>
                  `
                : html`
                    <span className=${`final-decision-dot ${row.className}`}></span>
                    <span className="final-decision-range">${row.range}</span>
                  `}
            </div>
          `,
        )}
      </div>
    </aside>
  `;
}

function getHourlyUpdateTimestamp() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now;
}

function withNeutralFill(item) {
  if (!item) return item;
  return { ...item, fill: "neutral" };
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

  const outdoorAvg = useMemo(
    () =>
      ["pm25", "pm10", "aqi"]
        .map((key) => findMetricByKey(outdoorSummary.average, key))
        .filter(Boolean),
    [outdoorSummary],
  );

  const indoorAvg = useMemo(
    () =>
      ["pm25", "pm10"]
        .map((key) => findMetricByKey(indoorSummary.average, key))
        .filter(Boolean),
    [indoorSummary],
  );

  const outdoorAvgNeutral = useMemo(() => outdoorAvg.map(withNeutralFill), [outdoorAvg]);
  const indoorAvgNeutral = useMemo(() => indoorAvg.map(withNeutralFill), [indoorAvg]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdatedTime(getHourlyUpdateTimestamp());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return html`
    <div className="slide-dashboard final-dashboard-slide">
      <div className="final-dashboard-shell">
        <div className="final-topbar">
          <h1 className="final-main-title">Air Quality Today</h1>
          <div className="final-last-updated">
            Last updated: ${lastUpdatedTime.toLocaleString(undefined, {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>

        <div className="final-headings-row">
          <${HeadingBlock}
            title="Outdoor Air Quality"
            subtitle="AIT, GIC Building"
            icon=${html`<${OutdoorIcon} />`}
          />
          <${HeadingBlock}
            title="Indoor Air Quality"
            subtitle="AIT, GIC Building (2nd Floor)"
            icon=${html`<${IndoorIcon} />`}
          />
        </div>

        <div className="final-content">
          <section className="final-block final-block-hourly">
            <div className="final-divider"></div>
            <div className="final-section-title">Hourly Air Quality</div>
        <div className="final-hourly-row">
          <div className="final-hourly-grid final-hourly-grid-left">
            ${outdoorHourly.map((item) => html`<${HourlyLabelCard} key=${`out-${item.key}`} item=${item} />`)}
          </div>
          <div className="final-hourly-grid final-hourly-grid-right">
            ${indoorHourly.map((item) => html`<${HourlyLabelCard} key=${`in-${item.key}`} item=${item} />`)}
          </div>
        </div>
          </section>

          <section className="final-block final-block-avg">
            <div className="final-divider"></div>
            <div className="final-section-title">24 Hour Avg Air Quality</div>
          <div className="final-avg-row">
            <div className="final-avg-grid final-avg-grid-three final-avg-grid-left">
              ${outdoorAvgNeutral.map(
                (item) => html`<${FinalCard} key=${`out-avg-${item.key}`} item=${item} compact=${true} variant="primary" />`,
              )}
            </div>
            <div className="final-avg-grid final-avg-grid-two final-avg-grid-right">
              ${indoorAvgNeutral.map(
                (item) => html`<${FinalCard} key=${`in-avg-${item.key}`} item=${item} compact=${true} variant="primary" />`,
              )}
              </div>
            </div>
          </section>

          <section className="final-block final-block-middle">
            <div className="final-divider"></div>
            <div className="final-middle-wrap">
              <div className="final-middle-side final-middle-side-left">
                <${DecisionColorTable} table=${PM24H_DECISION_TABLES[0]} />
              </div>
              <div className="final-middle-row">
              <div className="final-middle-block final-middle-block-left">
                <div className="final-middle-title">Outdoor AQI, 24-Hour</div>
                <div className="final-middle-grid-top">
                  ${outdoorAvg
                    .slice(0, 2)
                    .map(
                      (item) =>
                        html`<${FinalCard} key=${`out-mid-${item.key}`} item=${item} compact=${true} variant="primary" />`,
                    )}
                </div>
                <div className="final-middle-grid-bottom">
                  ${outdoorAvg[2]
                    ? html`<${FinalCard} item=${outdoorAvg[2]} wide=${true} variant="primary" />`
                    : html`<${FinalCard} item=${{ key: "avg-aqi", value: "—", unit: "", fill: "gray" }} wide=${true} variant="primary" />`}
                </div>
              </div>

              <div className="final-middle-block final-middle-block-right">
                <div className="final-middle-title">REFERENCE STATION (RANGSIT), 24-Hour</div>
                <div className="final-middle-grid-top">
                  ${referenceItems
                    .slice(0, 2)
                    .map(
                      (item) =>
                        html`<${FinalCard} key=${`ref-mid-${item.key}`} item=${item} compact=${true} variant="primary" />`,
                    )}
                </div>
                <div className="final-middle-grid-bottom">
                  <${FinalCard}
                    item=${referenceItems[2] || { key: "ref-aqi", value: "—", unit: "", fill: "gray" }}
                    wide=${true}
                    variant="primary"
                  />
                </div>
              </div>
              </div>
              <div className="final-middle-side final-middle-side-right">
                <${DecisionColorTable} table=${PM24H_DECISION_TABLES[1]} />
              </div>
            </div>
          </section>

          <section className="final-block final-block-scale">
            <div className="final-scale-wrap">
              <div className="final-scale-label-row">
                ${AQI_LEGEND.map(
                  (item) => html`<div key=${`${item.label}-label`} className="final-scale-label">${item.label}</div>`,
                )}
              </div>
              <div className="final-scale-bar">
                ${AQI_LEGEND.map(
                  (item) => html`
                    <div key=${item.label} className=${`final-scale-segment ${item.className}`}>
                      ${item.range}
                    </div>
                  `,
                )}
              </div>
            </div>
          </section>

          <section className="final-block final-block-guidelines">
            <div className="final-guidelines-title">Air Quality Guidelines & Standards</div>
            <div className="final-guidelines-row">
              <section className="final-guideline-panel final-guideline-panel-who">
                <div className="final-guideline-header">
                  <${WhoBadge} />
                  <div className="final-guideline-header-title">${WHO_TITLE}</div>
                </div>
                <div className="final-guideline-subtitle">24 Hour Avg Air Quality</div>
                <div className="final-guideline-cards final-guideline-cards-who">
                  <${FinalCard}
                    item=${{ key: "who-pm25", value: "≤ 15", unit: "µg/m³", fill: "neutral" }}
                    compact=${true}
                    variant="guideline"
                  />
                  <${FinalCard}
                    item=${{ key: "who-pm10", value: "≤ 45", unit: "µg/m³", fill: "neutral" }}
                    compact=${true}
                    variant="guideline"
                  />
                </div>
              </section>

              <section className="final-guideline-panel final-guideline-panel-thai">
                <div className="final-guideline-header">
                  <${ThailandBadge} />
                  <div className="final-guideline-header-title final-guideline-header-title-thai">${THAI_TITLE}</div>
                </div>
                <div className="final-guideline-subtitle">24 Hour Avg Air Quality</div>
                <div className="final-guideline-cards final-guideline-cards-thai">
                  <${FinalCard}
                    item=${{ key: "thai-pm25", value: "37.5", unit: "µg/m³", fill: "neutral" }}
                    compact=${true}
                    variant="guideline"
                  />
                  <${FinalCard}
                    item=${{ key: "thai-pm10", value: "120", unit: "µg/m³", fill: "neutral" }}
                    compact=${true}
                    variant="guideline"
                  />
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;
}
