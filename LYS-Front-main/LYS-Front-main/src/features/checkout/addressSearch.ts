import { validPoint, type DeliveryPoint } from './location';

export type AddressSuggestion = { id: string; title: string; context: string; point: DeliveryPoint };
const endpoint = import.meta.env.VITE_ADDRESS_SEARCH_URL || 'https://photon.komoot.io/api/';
const cache = new Map<string, AddressSuggestion[]>();
export async function searchAddress(query: string, district: string, signal: AbortSignal): Promise<AddressSuggestion[]> {
  const term = [query.trim(), district, 'Lima'].filter(Boolean).join(', ');
  if (cache.has(term)) return cache.get(term)!;
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set('q', term); url.searchParams.set('limit', '6'); url.searchParams.set('countrycode', 'PE');
  url.searchParams.set('bbox', '-77.25,-12.25,-76.75,-11.55');
  url.searchParams.set('lat', '-11.94'); url.searchParams.set('lon', '-77.07');
  url.searchParams.append('layer', 'street'); url.searchParams.append('layer', 'house');
  const response = await fetch(url, { signal, credentials: 'omit' });
  if (!response.ok) throw new Error('ADDRESS_SEARCH_UNAVAILABLE');
  const data = await response.json();
  const results: AddressSuggestion[] = [];
  for (const feature of Array.isArray(data.features) ? data.features : []) {
    const props = feature?.properties; const coordinates = feature?.geometry?.coordinates;
    if (!props || !Array.isArray(coordinates) || typeof props.countrycode !== 'string' || props.countrycode.toUpperCase() !== 'PE') continue;
    const point = { lat: coordinates[1], lng: coordinates[0] };
    if (!validPoint(point)) continue;
    const title = [props.street || props.name, props.housenumber].filter(text => typeof text === 'string').join(' ');
    if (!title) continue;
    const context = [...new Set([props.district, props.locality, props.city, props.state].filter((text): text is string => typeof text === 'string' && !!text))].join(', ');
    const id = `${title}:${context}`;
    if (!results.some(item => item.id === id)) results.push({ id, title, context, point });
  }
  if (cache.size >= 40) cache.delete(cache.keys().next().value!);
  cache.set(term, results);
  return results;
}
