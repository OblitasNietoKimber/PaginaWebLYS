import { getOperations, subscribeOperations } from '../operations/operationsStore';
import { useSyncExternalStore } from 'react';
import { products } from './catalog';
import { promotions } from '../promotions/catalog';

export const cartProducts = [...products, ...promotions];
type Cart = Record<string, number>;
const ids = new Set(cartProducts.map(product => product.id));
const listeners = new Set<() => void>();
let snapshot: Cart | undefined;
function valid(value: unknown): value is Cart {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.entries(value).every(([id, count]) => ids.has(id) && Number.isInteger(count) && count > 0 && count <= 99);
}
function read(): Cart {
  try { const value: unknown = JSON.parse(localStorage.getItem('lys-carta-cart') || '{}'); return valid(value) ? value : {}; } catch { return {}; }
}
function getSnapshot() { snapshot ??= read(); return snapshot; }
function setCart(update: Cart | ((previous: Cart) => Cart)) {
  const next = typeof update === 'function' ? update(getSnapshot()) : update;
  if (!valid(next)) return;
  snapshot = next;
  try { localStorage.setItem('lys-carta-cart', JSON.stringify(next)); } catch { /* El pedido permanece disponible en memoria. */ }
  listeners.forEach(listener => listener());
}
function storageChanged(event: StorageEvent) {
  if (event.storageArea === localStorage && (event.key === 'lys-carta-cart' || event.key === null)) {
    snapshot = read(); listeners.forEach(listener => listener());
  }
}
function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener('storage', storageChanged);
  listeners.add(listener);
  return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener('storage', storageChanged); };
}
export function useCartStore() {
  const cart = useSyncExternalStore(subscribe, getSnapshot);
  return { cart, setCart, clearCart: () => setCart({}), remove: (id: string) => setCart(previous => { const next = { ...previous }; delete next[id]; return next; }) };
}

subscribeOperations(()=>{cartProducts.splice(0,cartProducts.length,...getOperations().products,...promotions);ids.clear();cartProducts.forEach(p=>ids.add(p.id));snapshot={...getSnapshot()};listeners.forEach(listener=>listener());});
