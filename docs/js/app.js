import { fetchAir4ThaiData, fetchAirGradientData, fetchEventData } from "./api.js";
import { buildPlaylist } from "./constants.js";
import { html, useEffect, useMemo, useState } from "./react-shim.js";
import { Slideshow } from "./components/Slideshow.js";

export function App() {
  const [sensors, setSensors] = useState([]);
  const [air4thaiData, setAir4ThaiData] = useState(null);
  const [eventData, setEventData] = useState({ events: [] });

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      const [airGradientResult, air4thaiResult, eventResult] = await Promise.allSettled([
        fetchAirGradientData(),
        fetchAir4ThaiData(),
        fetchEventData(),
      ]);

      if (!isMounted) return;

      if (airGradientResult.status === "fulfilled") {
        setSensors(airGradientResult.value);
      } else {
        console.error("AirGradient fetch failed:", airGradientResult.reason);
      }

      if (air4thaiResult.status === "fulfilled") {
        setAir4ThaiData(air4thaiResult.value);
      }

      if (eventResult.status === "fulfilled") {
        setEventData(eventResult.value);
      }
    };

    refresh();
    const intervalId = setInterval(refresh, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const slides = useMemo(() => buildPlaylist(eventData), [eventData]);

  return html`<${Slideshow} slides=${slides} sensors=${sensors} air4thaiData=${air4thaiData} />`;
}
