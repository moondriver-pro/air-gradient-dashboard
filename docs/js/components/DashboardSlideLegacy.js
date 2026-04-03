import { AQI_LEGEND, THAILAND_GUIDELINES, WHO_GUIDELINES } from "../constants.js";
import { html, useMemo } from "../react-shim.js";
import { buildMetricCards, buildReferenceCards } from "../utils.js";
import { MetricCardList } from "./MetricCard.js";

function SensorPanel({ sensor }) {
  const cards = useMemo(() => buildMetricCards(sensor?.hourlyPoints || []), [sensor]);
  const title = sensor ? sensor.locationName : "Loading...";
  const subtitle = sensor ? `${sensor.model} | S/N: ${sensor.serialno}` : "Connecting to AirGradient";

  return html`
    <div className="sensor-panel">
      <div className="sensor-content">
        <div className="sensor-title">
          ${title}
          <span>${subtitle}</span>
        </div>
      </div>
      <div className="summary-section">
        <div className="summary-row">
          <div className="summary-title">Hourly Average</div>
          <div className="summary-grid">
            <${MetricCardList} cards=${cards} emptyLabel="Loading..." />
          </div>
        </div>
      </div>
    </div>
  `;
}

function Air4ThaiPanel({ data, sensors }) {
  const outdoorCards = useMemo(
    () => buildMetricCards(sensors[0]?.avgPoints || [], { is24h: true, show24hAqi: true }),
    [sensors],
  );
  const indoorCards = useMemo(
    () => buildMetricCards(sensors[1]?.avgPoints || [], { is24h: true, neutral24h: true, show24hAqi: false }),
    [sensors],
  );
  const referenceCards = useMemo(() => buildReferenceCards(data?.AQILast), [data]);

  return html`
    <div className="sensor-panel air4thai-panel">
      <div className="sensor-title">${data ? "" : html`Air4Thai (PCD)<span>Reference station unavailable</span>`}</div>
      <div className="air4thai-layout">
        <div className="air4thai-main">
          <div className="air4thai-main-layout">
            <div className="air4thai-group">
              <div className="air4thai-group-title">Outdoor 24-Hour Average</div>
              <div className="metrics">
                <${MetricCardList} cards=${outdoorCards} emptyLabel="No data" />
              </div>
            </div>
            <div className="air4thai-group centered">
              <div className="air4thai-group-title">Reference Station (Rangsit Region)</div>
              <div className="metrics">
                <${MetricCardList} cards=${referenceCards} emptyLabel="Unavailable" />
              </div>
            </div>
            <div className="air4thai-group">
              <div className="air4thai-group-title">Indoor 24-Hour Average</div>
              <div className="metrics">
                <${MetricCardList} cards=${indoorCards} emptyLabel="No data" />
              </div>
            </div>
          </div>
        </div>

        <div className="air4thai-scale">
          <div className="air4thai-scale-title">AQI Scale</div>
          <div className="aqi-bar-legend vertical">
            ${AQI_LEGEND.map(
              (item) => html`
                <div key=${item.label} className="aqi-legend-item">
                  <div className="aqi-legend-label">${item.label}</div>
                  <div className=${item.className}>${item.range}</div>
                </div>
              `,
            )}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function DashboardSlideLegacy({ sensors, air4thaiData }) {
  const sensorSlots = useMemo(() => [sensors[0] || null, sensors[1] || null], [sensors]);

  return html`
    <div className="slide-dashboard">
      <header>
        <h1>Air Quality Today</h1>
      </header>

      <div className="grid dashboard-grid">
        ${sensorSlots.map((sensor, index) => html`<${SensorPanel} key=${index} sensor=${sensor} />`)}
        <${Air4ThaiPanel} data=${air4thaiData} sensors=${sensorSlots} />
      </div>

      <div className="who-reference">
        <div className="who-heading" style=${{ marginTop: "4px" }}>Thailand National Guidelines</div>
        <div className="who-items" style=${{ marginBottom: "8px" }}>
          ${THAILAND_GUIDELINES.map(
            (item) => html`
              <div key=${item.metric} className="who-item">
                <div className="who-metric" dangerouslySetInnerHTML=${{ __html: item.metric }}></div>
                <div className="who-value" dangerouslySetInnerHTML=${{ __html: item.value }}></div>
                <div className="who-unit" dangerouslySetInnerHTML=${{ __html: item.unit }}></div>
              </div>
            `,
          )}
        </div>

        <div className="who-heading">WHO Guidelines</div>
        <div className="who-items">
          ${WHO_GUIDELINES.map(
            (item) => html`
              <div key=${item.metric} className="who-item">
                <div className="who-metric" dangerouslySetInnerHTML=${{ __html: item.metric }}></div>
                <div className="who-value" dangerouslySetInnerHTML=${{ __html: item.value }}></div>
                <div className="who-unit" dangerouslySetInnerHTML=${{ __html: item.unit }}></div>
              </div>
            `,
          )}
        </div>
      </div>

      <footer>
        Auto-refreshes every 60 seconds &nbsp;|&nbsp; Sensors: AirGradient &nbsp;|&nbsp; Reference Station
        (Bangkok University, Rangsit Campus)
      </footer>
    </div>
  `;
}
