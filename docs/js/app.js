import { fetchAir4ThaiData, fetchAirGradientData } from "./api.js";
import { buildPlaylist } from "./constants.js?v=20260410f43";
import { html, useEffect, useMemo, useState } from "./react-shim.js";
import { Slideshow } from "./components/Slideshow.js?v=20260410f43";

export function App() {
  const [sensors, setSensors] = useState([]);
  const [air4thaiData, setAir4ThaiData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      const [airGradientResult, air4thaiResult] = await Promise.allSettled([
        fetchAirGradientData(),
        fetchAir4ThaiData(),
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

    };

    refresh();
    const intervalId = setInterval(refresh, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const slides = useMemo(() => buildPlaylist(), []);

  return html`<${Slideshow} slides=${slides} sensors=${sensors} air4thaiData=${air4thaiData} />`;
}
