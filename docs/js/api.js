import { AIR4THAI_PROXIES, API_URL, TOKEN } from "./constants.js";
import { get24hWindow, getHourlyWindow } from "./utils.js";

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function normalizeSeries(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function hasAnyHourlyMetric(points) {
  return points.some(
    (point) =>
      point?.pm02_corrected != null ||
      point?.pm10_corrected != null ||
      point?.rco2_corrected != null ||
      point?.tvoc != null ||
      point?.atmp_corrected != null ||
      point?.rhum != null,
  );
}

export async function fetchAirGradientData() {
  const currentPayload = await fetchJson(API_URL);
  const sensors = normalizeSeries(currentPayload);
  const hourlyWindow = getHourlyWindow();
  const avgWindow = get24hWindow();

  const [hourlyResults, avgResults] = await Promise.all([
    Promise.allSettled(
      sensors.map((sensor) =>
        fetchJson(
          `https://api.airgradient.com/public/api/v1/locations/${sensor.locationId}/measures/past?token=${TOKEN}&from=${hourlyWindow.from}&to=${hourlyWindow.to}`,
        ),
      ),
    ),
    Promise.allSettled(
      sensors.map((sensor) =>
        fetchJson(
          `https://api.airgradient.com/public/api/v1/locations/${sensor.locationId}/measures/past?token=${TOKEN}&from=${avgWindow.from}&to=${avgWindow.to}`,
        ),
      ),
    ),
  ]);

  return sensors.map((sensor, index) => {
    const hourlyPointsRaw =
      hourlyResults[index].status === "fulfilled" ? normalizeSeries(hourlyResults[index].value) : [];
    const avgPointsRaw = avgResults[index].status === "fulfilled" ? normalizeSeries(avgResults[index].value) : [];

    // Resilience after network outages:
    // if past-hour data is temporarily empty, show latest current reading
    // so hourly cards do not stay blank.
    const hourlyPoints = hasAnyHourlyMetric(hourlyPointsRaw) ? hourlyPointsRaw : [sensor];

    return {
      ...sensor,
      hourlyPoints,
      avgPoints: avgPointsRaw,
    };
  });
}

export async function fetchAir4ThaiData() {
  for (const url of AIR4THAI_PROXIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const data = await fetchJson(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return data;
    } catch (error) {
      console.warn("Air4Thai proxy failed:", url, error.message);
    }
  }

  return null;
}
