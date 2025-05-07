import { useMap } from "react-leaflet";
import { useEffect } from "react";

interface Props {
  lat: number;
  lon: number;
}

export default function FlyToLocation({ lat, lon }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lon)) {
      map.setView([lat, lon], 10);
    }
  }, [lat, lon, map]);

  return null;
}
