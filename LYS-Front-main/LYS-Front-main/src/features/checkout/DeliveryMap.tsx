import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/delivery-map.css';
import { Icon } from '../../components/Icon';
import { validPoint, type DeliveryPoint } from './location';

const defaultCenter: L.LatLngTuple = [-11.94, -77.07];
const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const pin = L.divIcon({
  className: 'delivery-map-pin', iconSize: [32, 42], iconAnchor: [16, 42],
  html: '<svg viewBox="0 0 32 42" aria-hidden="true"><path fill="#ed0008" stroke="#fff" stroke-width="2" d="M16 1C7 1 1 7 1 16c0 11 15 24 15 24s15-13 15-24C31 7 25 1 16 1Z"/><circle fill="white" cx="16" cy="16" r="5"/></svg>',
});

export function DeliveryMap({ point, onChange }: { point?: DeliveryPoint | null; onChange: (point: DeliveryPoint | null) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  const accuracyArea = useRef<L.Circle | null>(null);
  const select = useRef(onChange);
  const active = useRef(false);
  const geoRequest = useRef(0);
  const [locating, setLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState('');
  const [tileStatus, setTileStatus] = useState('loading');
  useEffect(() => { select.current = onChange; }, [onChange]);

  function selectManually(next: DeliveryPoint | null) {
    geoRequest.current += 1;
    setLocating(false);
    setGeoMessage('');
    select.current(next);
  }

  useEffect(() => {
    if (!container.current) return;
    active.current = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const instance = L.map(container.current, { scrollWheelZoom: false, zoomAnimation: !reduced, fadeAnimation: !reduced, markerZoomAnimation: !reduced }).setView(defaultCenter, 13);
    map.current = instance;
    instance.zoomControl.setPosition('topright');
    instance.zoomControl.getContainer()?.querySelector('a.leaflet-control-zoom-in')?.setAttribute('aria-label', 'Acercar mapa');
    instance.zoomControl.getContainer()?.querySelector('a.leaflet-control-zoom-out')?.setAttribute('aria-label', 'Alejar mapa');
    const layer = L.tileLayer(tileUrl, { maxZoom: 19, attribution, keepBuffer: 1 }).addTo(instance);
    tiles.current = layer;
    const timeout = window.setTimeout(() => { if (active.current) setTileStatus('error'); }, 12000);
    layer.on('tileload', () => { window.clearTimeout(timeout); if (active.current) setTileStatus(previous => previous === 'error' ? 'error' : 'ready'); });
    layer.on('tileerror', () => { if (active.current) setTileStatus('error'); });
    instance.on('click', (event: L.LeafletMouseEvent) => selectManually({ lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.wrap().lng.toFixed(6)) }));
    const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
    observer.observe(container.current);
    return () => {
      active.current = false;
      geoRequest.current += 1;
      window.clearTimeout(timeout);
      observer.disconnect();
      instance.remove(); map.current = null; marker.current = null; tiles.current = null; accuracyArea.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    if (!validPoint(point)) { marker.current?.remove(); marker.current = null; return; }
    if (!marker.current) {
      const placed = L.marker([point.lat, point.lng], { icon: pin, draggable: true, title: 'Punto de entrega: arrastra para ajustar', alt: 'Punto de entrega seleccionado' }).addTo(instance);
      placed.on('dragend', () => { const position = placed.getLatLng().wrap(); selectManually({ lat: Number(position.lat.toFixed(6)), lng: Number(position.lng.toFixed(6)) }); });
      marker.current = placed;
    } else marker.current.setLatLng([point.lat, point.lng]);
    instance.setView([point.lat, point.lng], Math.max(instance.getZoom(), 18), { animate: false });
  }, [point]);

  function locate() {
    if (!navigator.geolocation) { setGeoMessage('Tu navegador no permite obtener la ubicación. Puedes marcar el punto en el mapa.'); return; }
    setLocating(true); setGeoMessage('Buscando tu ubicación…');
    const request = ++geoRequest.current;
    navigator.geolocation.getCurrentPosition(position => {
      if (!active.current || request !== geoRequest.current) return;
      const next = { lat: position.coords.latitude, lng: position.coords.longitude };
      setLocating(false);
      if (!validPoint(next)) { setGeoMessage('No pudimos obtener una ubicación válida. Marca el punto en el mapa.'); return; }
      map.current?.invalidateSize({ pan: false });
      map.current?.setView([next.lat, next.lng], 18, { animate: false });
      accuracyArea.current?.remove();
      if (map.current && Number.isFinite(position.coords.accuracy)) accuracyArea.current = L.circle([next.lat, next.lng], { radius: position.coords.accuracy, color: '#2563eb', weight: 1, fillOpacity: 0.08, interactive: false }).addTo(map.current);
      select.current({ lat: Number(next.lat.toFixed(6)), lng: Number(next.lng.toFixed(6)) });
      setGeoMessage(`Ubicación encontrada (precisión aproximada: ${Math.round(position.coords.accuracy)} m). ${position.coords.accuracy > 150 ? 'Tu dispositivo dio una ubicación aproximada; mueve el marcador hasta tu domicilio.' : 'Ajusta el marcador hasta la entrada de tu domicilio.'}`);
    }, error => {
      if (!active.current || request !== geoRequest.current) return;
      setLocating(false);
      setGeoMessage(error.code === 1 ? 'No se autorizó el acceso a tu ubicación. Puedes seleccionar el punto en el mapa.' : 'No pudimos obtener tu ubicación. Inténtalo de nuevo o marca el punto en el mapa.');
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }

  return <section className="delivery-map-picker" aria-labelledby="delivery-map-title">
    <div className="delivery-map-heading"><h2 id="delivery-map-title">Ubicación de entrega</h2><button type="button" className="checkout-outline" onClick={locate} disabled={locating}><Icon name="pin" />{locating ? 'Ubicando…' : 'Usar mi ubicación'}</button></div>
    <p id="delivery-map-instructions">Toca el mapa para marcar la entrada de tu domicilio o arrastra el marcador. Completa también la calle, el número y el distrito.</p>
    <div className="delivery-map-canvas" ref={container} role="region" aria-label="Mapa para seleccionar la ubicación de entrega" aria-describedby="delivery-map-instructions" />
    <div className="delivery-map-actions"><button type="button" className="checkout-text-button" onClick={() => { const center = map.current?.getCenter().wrap(); if (center) selectManually({ lat: Number(center.lat.toFixed(6)), lng: Number(center.lng.toFixed(6)) }); }}>Marcar el centro del mapa</button>{validPoint(point) && <button type="button" className="checkout-text-button" onClick={() => selectManually(null)}>Quitar ubicación</button>}</div>
    <p role="status" className="delivery-map-selection"><Icon name="pin" />{validPoint(point) ? `Punto seleccionado: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}` : 'Todavía no seleccionaste un punto en el mapa.'}</p>
    {geoMessage && <p className="delivery-map-message" role="status">{geoMessage}</p>}
    {tileStatus === 'loading' && <p className="delivery-map-message" role="status">Cargando mapa…</p>}
    {tileStatus === 'error' && <p className="delivery-map-message" role="status">No pudimos cargar parte del mapa. Revisa tu conexión; puedes continuar con la dirección escrita. <button type="button" className="checkout-text-button" onClick={() => { setTileStatus('loading'); tiles.current?.redraw(); }}>Reintentar</button></p>}
  </section>;
}
