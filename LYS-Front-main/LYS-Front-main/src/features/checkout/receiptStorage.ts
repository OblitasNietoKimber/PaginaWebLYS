import { currentUser } from '../../services/localAuth';
import { createOrder } from '../operations/operationsStore';
const userKey=(key:string)=>key+'-'+(currentUser()?.id||'guest');
import { cartProducts } from '../carta/cartStore';
import { validPoint } from './location';
import type { CartItem, DeliveryDraft, Receipt } from './useCheckout';
const fields = ['address', 'district', 'label', 'reference', 'instructions', 'name', 'phone', 'email', 'store'] as const;
function parseReceipt(value: unknown): Receipt | null {
  if (!value || typeof value !== 'object') return null;
  const order = value as Receipt;
  if (typeof order.code !== 'string' || !order.code.startsWith('LYS-DEMO-') || typeof order.date !== 'string' || !Number.isFinite(Date.parse(order.date)) || !Array.isArray(order.items) || !order.delivery || !fields.every(field => typeof order.delivery[field] === 'string') || !['card', 'yape', 'plin', 'cash'].includes(order.method) || !['delivery', 'pickup'].includes(order.delivery.mode) || ![order.total, order.subtotal, order.shipping, order.discount].every(amount => Number.isFinite(amount) && amount >= 0)) return null;
  const items: CartItem[] = order.items.slice(0, 120).flatMap(item => { const product = cartProducts.find(product => product.id === item?.product?.id); return product && Number.isInteger(item.count) && item.count > 0 && item.count <= 99 ? [{ product, count: item.count }] : []; });
  if (!items.length || items.length !== order.items.length) return null;
  const delivery: DeliveryDraft = { mode: order.delivery.mode, address: '', district: '', label: '', reference: '', instructions: '', name: '', phone: '', email: '', store: '' };
  for (const field of fields) delivery[field] = order.delivery[field].slice(0, 500);
  delivery.location = validPoint(order.delivery.location) ? order.delivery.location : null;
  return { code: order.code.slice(0, 50), date: order.date, items, delivery, method: order.method, subtotal: order.subtotal, shipping: order.shipping, discount: order.discount, total: order.total };
}
export function savedReceipt(): Receipt | null {
  try { return parseReceipt(JSON.parse(localStorage.getItem(userKey('lys-demo-order')) || 'null')); } catch { return null; }
}
export function receiptHistory(): Receipt[] {
  try { const values: unknown = JSON.parse(localStorage.getItem(userKey('lys-demo-order-history')) || '[]'); return Array.isArray(values) ? values.slice(0, 50).flatMap(value => { const order = parseReceipt(value); return order ? [order] : []; }) : []; } catch { return []; }
}
export function saveReceipt(order: Receipt) {
  const user=currentUser();if(!user)throw new Error('Inicia sesión para confirmar tu pedido.');
  createOrder({id:order.code,created:order.date,customerId:user.id,customer:order.delivery.name,phone:order.delivery.phone,email:order.delivery.email,address:order.delivery.address+' '+order.delivery.district,channel:order.delivery.mode==='pickup'?'Recojo':'Delivery',table:null,items:order.items,notes:order.delivery.instructions,discount:order.discount,shipping:order.shipping,couponCode:order.couponCode,method:({card:'Tarjeta',yape:'Yape',plin:'Plin',cash:'Efectivo'})[order.method]});
  const previous = receiptHistory().filter(item => item.code !== order.code);
  const latest = savedReceipt();
  if (latest && latest.code !== order.code && !previous.some(item => item.code === latest.code)) previous.unshift(latest);
  // Comprobantes de demostración en la pestaña, sin tarjetas ni códigos de aprobación.
  try { localStorage.setItem(userKey('lys-demo-order'), JSON.stringify(order)); localStorage.setItem(userKey('lys-demo-order-history'), JSON.stringify([order, ...previous].slice(0, 50))); } catch { /* El checkout también conserva el comprobante en memoria. */ }
}
