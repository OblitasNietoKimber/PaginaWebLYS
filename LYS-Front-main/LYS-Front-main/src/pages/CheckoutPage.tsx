import { useSession } from '../services/localAuth';
import { useEffect } from 'react';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { useCarta } from '../features/carta/useCarta';
import { useCheckout } from '../features/checkout/useCheckout';
import { CartProducts, CartRecommendations } from '../features/checkout/CartProducts';
import { OrderSummary } from '../features/checkout/OrderSummary';
import { DeliveryStep } from '../features/checkout/DeliveryStep';
import { PaymentStep } from '../features/checkout/PaymentStep';
import { ConfirmationStep, OrderResult } from '../features/checkout/ConfirmationStep';
import '../styles/checkout.css';
import '../styles/checkout-responsive.css';

const paths = ['/carrito', '/checkout/entrega', '/checkout/pago', '/checkout/confirmacion'];
const steps = ['Carrito', 'Dirección y entrega', 'Método de pago', 'Confirmación'];
export function CheckoutPage({ route, onNavigate, onAction }: { route: string; onNavigate: (path: string) => void; onAction: (section: string) => void }) {
  const user=useSession();
  const cart = useCarta();
  const checkout = useCheckout(cart.cartItems);
  const step = Math.max(0, paths.indexOf(route));
  const result = route === '/pedido-confirmado' || route === '/mi-pedido';
  useEffect(() => {
    if (result) { if (!checkout.receipt) onNavigate('/carrito'); return; }
    if (step > 0 && !cart.count) onNavigate('/carrito');
    else if (step > 1 && !checkout.deliveryReady) onNavigate('/checkout/entrega');
    else if (step > 2 && !checkout.paymentReady) onNavigate('/checkout/pago');
  }, [step, result, cart.count, checkout.deliveryReady, checkout.paymentReady, checkout.receipt, onNavigate]);
  function forward() {
    if (step === 0 && cart.count) onNavigate(paths[1]);
    else if (step === 1 && checkout.deliveryReady) onNavigate(paths[2]);
    else if (step === 2) { checkout.setPaymentReady(true); onNavigate(paths[3]); }
    else if(step===3&&!user){localStorage.setItem('lys-return-after-login','/carrito');onNavigate('/iniciar-sesion');return;}
    else if (step === 3 && checkout.finish(cart.clearCart)) onNavigate('/pedido-confirmado');
  }
  const labels = ['Continuar compra', 'Continuar al pago', 'Revisar pedido', 'Confirmar pedido'];
  return <><Header activeSection="" onSection={section => section === 'Pedir ahora' ? onNavigate('/carrito') : onAction(section)} carta={{ query: cart.query, onSearch: query => onNavigate(`/carta?buscar=${encodeURIComponent(query)}`), count: cart.count, onCart: () => onNavigate('/carrito'), searchHref: '/carta#carta-search' }} />
    <main id="contenido" className={`checkout-page${result ? ' checkout-result-page' : ''}`}>
      {result && checkout.receipt ? <div className="checkout-container"><OrderResult receipt={checkout.receipt} tracking={route === '/mi-pedido'} onHome={() => onNavigate('/')} onTrack={() => onNavigate('/mi-pedido')} /></div> : <>
        {step === 0 ? <section className="checkout-hero"><picture><source media="(max-width: 650px)" srcSet="/images/checkout/hero-mobile.webp" /><img src="/images/checkout/hero-desktop.webp" alt="Pollo a la brasa con papas fritas" width="1920" height="360" /></picture><div><h1>Tu <span>carrito</span></h1><p>Los mejores sabores a la brasa,<br />ahora más cerca de ti.</p></div><p className="checkout-hero-note">El auténtico sabor<br />de nuestras brasas</p></section> : <nav className="checkout-progress checkout-container" aria-label="Pasos de compra"><ol>{steps.map((label, index) => <li key={label} data-complete={step > index} aria-current={step === index ? 'step' : undefined}><button type="button" disabled={index > step} onClick={() => onNavigate(paths[index])}><span>{step > index ? <Icon name="check" /> : index + 1}</span><strong>{index + 1}. {label}</strong></button></li>)}</ol></nav>}
        <div className="checkout-container"><p className="checkout-demo-banner">Modo local · tus pedidos se comparten con los paneles de cocina y caja. Los pagos son simulados.</p>{checkout.couponMessage&&step>0&&<p className="checkout-form-error" role="status">{checkout.couponMessage}</p>}<div className="checkout-layout"><div className="checkout-main-column">
          {step === 0 ? <CartProducts cart={cart} onBrowse={() => onAction('Carta')} /> : step === 1 ? <DeliveryStep value={checkout.delivery} onChange={checkout.setDelivery} onContinue={forward} /> : step === 2 ? <PaymentStep method={checkout.method} onMethod={checkout.selectPayment} total={checkout.total} onContinue={forward} /> : <ConfirmationStep checkout={checkout} items={cart.cartItems} onEdit={value => onNavigate(value === 'delivery' ? paths[1] : paths[2])} />}
          {step > 0 && <button type="button" className="checkout-outline checkout-back" onClick={() => onNavigate(paths[step - 1])}>← Volver</button>}
        </div><OrderSummary checkout={checkout} items={cart.cartItems} cartStep={step === 0} onEdit={() => onNavigate('/carrito')}>
          {step === 3 && <p className="checkout-payment-note">Tu pedido de demostración se registrará con el método de pago elegido.</p>}
          <button className="primary-button checkout-continue" type={step === 1 || step === 2 ? 'submit' : 'button'} form={step === 1 ? 'delivery-form' : step === 2 ? 'payment-form' : undefined} disabled={!cart.count || checkout.busy} onClick={step === 0 || step === 3 ? forward : undefined}>{labels[step]} <Icon name="arrow" /></button>
        </OrderSummary></div>{step === 0 && <CartRecommendations onAdd={cart.add} onBrowse={() => onAction('Carta')} />}</div>
      </>}
    </main><p className="sr-only" role="status">{cart.announcement}</p></>;
}
