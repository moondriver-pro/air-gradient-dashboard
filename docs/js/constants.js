export const BASE_PLAYLIST = [
  { key: "slide-img-1", type: "image", src: "images/1.png", duration: 10, color: "#9ca3af", title: "Image 1" },
  { key: "slide-img-2", type: "image", src: "images/2.png", duration: 10, color: "#9ca3af", title: "Image 2" },
  { key: "slide-img-3", type: "image", src: "images/3.png", duration: 10, color: "#9ca3af", title: "Image 3" },
  { key: "slide-img-scope", type: "image", src: "images/scope.png", duration: 10, color: "#9ca3af", title: "Scope Image" },
  { key: "slide-video-4", type: "video", src: "images/4.mp4", duration: 30, color: "#9ca3af", title: "Video 4" },
  { key: "slide-video-5", type: "video", src: "images/5.mp4", duration: 30, color: "#9ca3af", title: "Video 5" },
  { key: "slide-dashboard-a", type: "dashboard", duration: 120, color: "#2563eb", title: "Dashboard" },
  { key: "slide-img-6", type: "image", src: "images/6.png", duration: 10, color: "#9ca3af", title: "Image 6" },
  { key: "slide-img-7", type: "image", src: "images/7.png", duration: 10, color: "#9ca3af", title: "Image 7" },
  { key: "slide-video-8", type: "video", src: "images/8.mp4", duration: 30, color: "#9ca3af", title: "Video 8" },
  { key: "slide-dashboard-b", type: "dashboard", duration: 120, color: "#2563eb", title: "Dashboard" },
];

export function buildPlaylist(eventPayload) {
  const activeEvents = Array.isArray(eventPayload?.events)
    ? eventPayload.events
        .filter((event) => event?.enabled)
        .map((event, index) => ({   
          key: `slide-event-${index + 1}`,
          type: "event",
          duration: Number(event.duration) > 0 ? Number(event.duration) : 20,
          color: "#f97316",
          title: event.title || `Event ${index + 1}`,
          event: {
            title: event.title || "Upcoming Event",
            date: event.date || "",
            location: event.location || "",
            description: event.description || "",
            images: Array.isArray(event.images) ? event.images.filter(Boolean) : [],
          },
        }))
    : [];

  if (!activeEvents.length) {
    return BASE_PLAYLIST;
  }

  const insertionIndex = BASE_PLAYLIST.findIndex((slide) => slide.key === "slide-video-5");

  if (insertionIndex === -1) {
    return [...BASE_PLAYLIST, ...activeEvents];
  }

  return [
    ...BASE_PLAYLIST.slice(0, insertionIndex + 1),
    ...activeEvents,
    ...BASE_PLAYLIST.slice(insertionIndex + 1),
  ];
}

export const TOKEN = "034709b8-1071-4f2f-b695-6af71c4281bf";
export const API_URL = `https://api.airgradient.com/public/api/v1/locations/measures/current?token=${TOKEN}`;

export const A4T_SOURCE = "http://air4thai.pcd.go.th/services/getNewAQI_JSON.php?stationID=20t";
export const AIR4THAI_PROXIES = [
  "https://api.allorigins.win/raw?url=" + encodeURIComponent(A4T_SOURCE),
  "https://corsproxy.io/?" + encodeURIComponent(A4T_SOURCE),
  "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(A4T_SOURCE),
];

export const A4T_COLOR = { "1": "blue", "2": "green", "3": "yellow", "4": "orange", "5": "red" };
export const COLORED_METRICS = new Set(["pm02_corrected", "pm10_corrected"]);

export const METRICS = [
  {
    key: "pm02_corrected",
    label: "PM<sub>2.5</sub>",
    unit: "\u00b5g/m\u00b3",
    dec: 1,
    thresholds: [
      { value: 15.1, color: "green", label: "Good" },
      { value: 25.1, color: "yellow", label: "Moderate" },
      { value: 37.6, color: "orange", label: "Unhealthy (Sens.)" },
      { value: 75.1, color: "red", label: "Unhealthy" },
    ],
    defaultColor: "blue",
    defaultLabel: "Very Good",
  },
  {
    key: "pm10_corrected",
    label: "PM<sub>10</sub>",
    unit: "\u00b5g/m\u00b3",
    dec: 0,
    thresholds: [
      { value: 51, color: "green", label: "Good" },
      { value: 81, color: "yellow", label: "Moderate" },
      { value: 121, color: "orange", label: "Unhealthy (Sens.)" },
      { value: 181, color: "red", label: "Unhealthy" },
    ],
    defaultColor: "blue",
    defaultLabel: "Very Good",
  },
  {
    key: "rco2_corrected",
    label: "CO<sub>2</sub>",
    unit: "ppm",
    dec: 0,
    thresholds: [
      { value: 800, color: "yellow", label: "Moderate" },
      { value: 1000, color: "orange", label: "Poor" },
      { value: 1500, color: "red", label: "Very Poor" },
    ],
    defaultColor: "green",
    defaultLabel: "Good",
  },
  {
    key: "tvoc",
    label: "TVOC",
    unit: "ppb",
    dec: 0,
    thresholds: [
      { value: 220, color: "yellow", label: "Moderate" },
      { value: 660, color: "orange", label: "Poor" },
      { value: 2200, color: "red", label: "Very Poor" },
    ],
    defaultColor: "green",
    defaultLabel: "Good",
  },
  {
    key: "atmp_corrected",
    label: "Temp",
    unit: "\u00b0C",
    dec: 1,
    thresholds: [
      { value: 18, color: "green", label: "Comfortable" },
      { value: 28, color: "yellow", label: "Warm" },
      { value: 35, color: "red", label: "Hot" },
    ],
    defaultColor: "blue",
    defaultLabel: "Cool",
  },
  {
    key: "rhum",
    label: "Humidity",
    unit: "%",
    dec: 0,
    thresholds: [
      { value: 30, color: "blue", label: "Dry" },
      { value: 40, color: "green", label: "Comfortable" },
      { value: 60, color: "yellow", label: "Humid" },
      { value: 75, color: "orange", label: "Very Humid" },
      { value: 85, color: "red", label: "Wet" },
    ],
    defaultColor: "blue",
    defaultLabel: "Dry",
  },
];

export const PM25_AQI_BREAKPOINTS = [
  { cLow: 0, cHigh: 15, iLow: 0, iHigh: 25 },
  { cLow: 15, cHigh: 25, iLow: 26, iHigh: 50 },
  { cLow: 25, cHigh: 37.5, iLow: 51, iHigh: 100 },
  { cLow: 37.5, cHigh: 75, iLow: 101, iHigh: 200 },
  { cLow: 75, cHigh: 500, iLow: 201, iHigh: 300 },
];

export const AQI_LEGEND = [
  { label: "Excellent", range: "0 - 25", className: "aqi-bg-blue" },
  { label: "Satisfactory", range: "26 - 50", className: "aqi-bg-green" },
  { label: "Moderate", range: "51 - 100", className: "aqi-bg-yellow" },
  { label: "Unhealthy", range: "101 - 200", className: "aqi-bg-orange" },
  { label: "Very Unhealthy", range: "201 Above", className: "aqi-bg-red" },
];

export const THAILAND_GUIDELINES = [
  { metric: "PM<sub>2.5</sub>", value: "37.5", unit: "&micro;g/m&sup3;" },
  { metric: "PM<sub>10</sub>", value: "120", unit: "&micro;g/m&sup3;" },
  { metric: "AQI", value: "&le; 100", unit: "index" },
  { metric: "CO<sub>2</sub>", value: "&lt;1000", unit: "ppm" },
  { metric: "TVOC", value: "&lt;300", unit: "ppb" },
];

export const WHO_GUIDELINES = [
  { metric: "PM<sub>2.5</sub>", value: "15", unit: "&micro;g/m&sup3;" },
  { metric: "PM<sub>10</sub>", value: "45", unit: "&micro;g/m&sup3;" },
  { metric: "CO<sub>2</sub>", value: "&lt;1000", unit: "ppm" },
  { metric: "TVOC", value: "&lt;300", unit: "ppb" },
  { metric: "Temp", value: "18&ndash;24", unit: "&deg;C" },
];
