import { Icon } from '../../components/Icon';
import { soles } from '../carta/catalog';
import type { CartItem, Checkout } from './useCheckout';

export function OrderItems({ items }: { items: CartItem[] }) {
  return <ul className="checkout-summary-items">{items.map(({ product, count }) => <li key={product.id}><img src={product.image} alt="" width="88" height="72" /><div><strong>{product.name}</strong><small>{count} × {soles(product.price)}</small></div><b>{soles(product.price * count)}</b></li>)}</ul>;
}
export function OrderTotals({ subtotal, shipping, discount, total, final = false }: { subtotal: number; shipping: number; discount: number; total: number; final?: boolean }) {
  return <div className="checkout-totals"><p><span>Subtotal</span><strong>{soles(subtotal)}</strong></p><p><span>Costo de envío</span><strong>{soles(shipping)}</strong></p><p><span>Descuento</span><strong className="discount-value">− {soles(discount)}</strong></p><p className="checkout-total"><b>{final ? 'Total del pedido' : 'Total'}</b><strong>{soles(total)}</strong></p></div>;
}
export function OrderSummary({ checkout, items, cartStep = false, onEdit, children }: { checkout: Checkout; items: CartItem[]; cartStep?: boolean; onEdit: () => void; children?: React.ReactNode }) {
  return <aside className="checkout-panel checkout-summary" aria-labelledby="order-summary-title"><div className="checkout-panel-heading"><h2 id="order-summary-title"><Icon name="receipt" />Resumen del pedido</h2>{!cartStep && <button className="checkout-text-button" type="button" onClick={onEdit}>Editar carrito</button>}</div>
    {!cartStep && <OrderItems items={items} />}
    {cartStep && <div className="checkout-coupon"><label htmlFor="order-coupon"><Icon name="tag" />¿Tienes un cupón de descuento?</label><div><input id="order-coupon" placeholder="Ingresa tu código" value={checkout.coupon} onChange={event => checkout.setCoupon(event.target.value)} /><button type="button" className="checkout-outline" onClick={checkout.applyCoupon} disabled={!checkout.coupon.trim() || !items.length}>Aplicar</button></div><p role="status">{checkout.couponMessage}</p></div>}
    <OrderTotals {...checkout} />{children}<p className="checkout-safe"><Icon name="lock" />Modo demostración · sin cobros reales</p>
  </aside>;
}
