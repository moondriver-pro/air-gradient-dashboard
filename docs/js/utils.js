import { A4T_COLOR, COLORED_METRICS, METRICS, PM25_AQI_BREAKPOINTS } from "./constants.js";

export function getState(metric, value) {
  if (value === null || value === undefined) return { color: "gray", level: "\u2014" };
  if (!COLORED_METRICS.has(metric.key)) return { color: "gray", level: metric.defaultLabel };

  let color = metric.defaultColor;
  let level = metric.defaultLabel;
  for (const step of metric.thresholds) {
    if (value >= step.value) {
      color = step.color;
      level = step.label;
    }
  }
  return { color, level };
}

export function formatNumber(value, dec) {
  return parseFloat(value) >= 0 ? Number(value).toFixed(dec) : "\u2014";
}

function getAverage(points, key) {
  const values = (points || []).map((point) => point[key]).filter((value) => value != null).map(Number);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function get24hWindow() {
  const offsetMs = 7 * 3600000;
  const bkNow = new Date(Date.now() + offsetMs);
  const bkHour = bkNow.getUTCHours();
  const midnightUtc = Date.UTC(
    bkNow.getUTCFullYear(),
    bkNow.getUTCMonth(),
    bkHour >= 7 ? bkNow.getUTCDate() : bkNow.getUTCDate() - 1,
  );

  return {
    from: new Date(midnightUtc - 86400000).toISOString().slice(0, 19),
    to: new Date(midnightUtc).toISOString().slice(0, 19),
  };
}

export function getHourlyWindow() {
  const offsetMs = 7 * 3600000;
  const bkNow = new Date(Date.now() + offsetMs);
  const currentHourStartUtc = Date.UTC(
    bkNow.getUTCFullYear(),
    bkNow.getUTCMonth(),
    bkNow.getUTCDate(),
    bkNow.getUTCHours(),
    0,
    0,
  );
  const prevHourStartUtc = currentHourStartUtc - 3600000;
  const prevHourEndUtc = currentHourStartUtc - 1000;

  return {
    from: new Date(prevHourStartUtc).toISOString().slice(0, 19),
    to: new Date(prevHourEndUtc).toISOString().slice(0, 19),
  };
}

export function calculateAQI(value, breakpoints = PM25_AQI_BREAKPOINTS) {
  if (value == null || Number.isNaN(value)) return null;
  for (const breakpoint of breakpoints) {
    if (value >= breakpoint.cLow && value <= breakpoint.cHigh) {
      return Math.round(
        ((breakpoint.iHigh - breakpoint.iLow) / (breakpoint.cHigh - breakpoint.cLow)) *
          (value - breakpoint.cLow) +
          breakpoint.iLow,
      );
    }
  }
  return null;
}

export function getAQILevel(aqi) {
  if (aqi == null) return { color: "gray", label: "--" };
  if (aqi <= 25) return { color: "blue", label: "Excellent" };
  if (aqi <= 50) return { color: "green", label: "Satisfactory" };
  if (aqi <= 100) return { color: "yellow", label: "Moderate" };
  if (aqi <= 200) return { color: "orange", label: "Unhealthy" };
  return { color: "red", label: "Very Unhealthy" };
}

export function buildMetricCards(points, options = {}) {
  if (!points || !points.length) return [];

  const { is24h = false, neutral24h = false, show24hAqi = true } = options;
  const metricsToRender = is24h
    ? METRICS.filter((metric) => metric.key === "pm02_corrected" || metric.key === "pm10_corrected")
    : METRICS;

  const cards = metricsToRender.map((metric) => {
    const average = getAverage(points, metric.key);
    const { color } = getState(metric, average);
    return {
      key: metric.key,
      label: metric.label,
      value: average != null ? average.toFixed(metric.dec) : "\u2014",
      unit: metric.unit,
      color: is24h && neutral24h ? "gray" : color,
      className: `${metric.key === "rhum" ? "humidity" : ""} ${is24h ? "metric-24h" : ""}`.trim(),
      style: is24h ? { gridColumn: "span 2" } : undefined,
    };
  });

  if (is24h && show24hAqi) {
    const avg25 = getAverage(points, "pm02_corrected");
    const aqi = calculateAQI(avg25);
    cards.push({
      key: "aqi",
      label: "AQI",
      value: aqi != null ? String(aqi) : "--",
      unit: "",
      color: getAQILevel(aqi).color,
      className: "metric-24h",
      style: { gridColumn: "span 2" },
    });
  }

  return cards;
}

export function buildReferenceCards(last) {
  if (!last) return [];

  return [
    {
      key: "pm25",
      label: "PM<sub>2.5</sub>",
      value: formatNumber(last.PM25.value, 1),
      unit: "\u00b5g/m\u00b3",
      color: A4T_COLOR[last.PM25.color_id] || "gray",
    },
    {
      key: "pm10",
      label: "PM<sub>10</sub>",
      value: formatNumber(last.PM10.value, 0),
      unit: "\u00b5g/m\u00b3",
      color: A4T_COLOR[last.PM10.color_id] || "gray",
    },
    {
      key: "aqi",
      label: "AQI",
      value: parseInt(last.AQI.aqi, 10) >= 0 ? last.AQI.aqi : "\u2014",
      unit: "",
      color: A4T_COLOR[last.AQI.color_id] || "gray",
    },
  ];
}
