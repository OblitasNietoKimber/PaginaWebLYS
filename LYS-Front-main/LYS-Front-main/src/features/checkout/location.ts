export type DeliveryPoint = { lat: number; lng: number };

export function validPoint(value: unknown): value is DeliveryPoint {
  if (!value || typeof value !== 'object') return false;
  const point = value as DeliveryPoint;
  return Number.isFinite(point.lat) && Math.abs(point.lat) <= 85 && Number.isFinite(point.lng) && Math.abs(point.lng) <= 180;
}

export function mapLink(point: DeliveryPoint) {
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=18/${point.lat}/${point.lng}`;
}
