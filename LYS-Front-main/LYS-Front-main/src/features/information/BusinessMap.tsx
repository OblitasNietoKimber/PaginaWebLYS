import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { business } from './business';
export function BusinessMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([-11.85, -77.02], 12);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    tiles.on('tileerror', () => setFailed(true));
    map.zoomControl.setPosition('topright');
    const observer = new ResizeObserver(() => map.invalidateSize()); observer.observe(ref.current);
    return () => { observer.disconnect(); map.remove(); };
  }, []);
  return <div className="business-map"><div ref={ref} className="business-map-canvas" role="region" aria-label="Mapa de la zona de Carabayllo" /><div className="business-map-caption"><strong>Los Palomares · Carabayllo</strong><span>{failed ? 'No pudimos cargar el mapa. Puedes abrir la búsqueda.' : 'Mapa de la zona. Punto exacto del local pendiente de confirmar.'}</span><a href={business.mapSearch} target="_blank" rel="noopener noreferrer">Buscar la dirección en OpenStreetMap ↗</a></div></div>;
}
