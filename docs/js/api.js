import { AIR4THAI_PROXIES, API_URL, TOKEN } from "./constants.js";
import { get24hWindow, getHourlyWindow } from "./utils.js";

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function fetchAirGradientData() {
  const currentPayload = await fetchJson(API_URL);
  const sensors = Array.isArray(currentPayload) ? currentPayload : currentPayload.value || [];
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

  return sensors.map((sensor, index) => ({
    ...sensor,
    hourlyPoints: hourlyResults[index].status === "fulfilled" ? hourlyResults[index].value : [],
    avgPoints: avgResults[index].status === "fulfilled" ? avgResults[index].value : [],
  }));
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
