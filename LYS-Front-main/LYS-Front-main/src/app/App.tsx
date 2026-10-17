import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { RouteLoading } from '../components/RouteLoading';
import { SharedHeader } from '../components/SharedHeader';
import { NoticeDialog, type Notice } from '../components/NoticeDialog';
import { SignInPage } from '../pages/SignInPage';
import { HomeFooter } from '../features/home/HomeFooter';
import { useOperations } from '../features/operations/operationsStore';
import { useSession, roleHome } from '../services/localAuth';
import { AuthLayout } from '../components/AuthLayout';
const HomePage = lazy(() => import('../pages/HomePage').then(module => ({ default: module.HomePage })));
const CartaPage = lazy(() => import('../pages/CartaPage').then(module => ({ default: module.CartaPage })));
const PromotionsPage = lazy(() => import('../pages/PromotionsPage').then(module => ({ default: module.PromotionsPage })));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const AboutPage = lazy(() => import('../pages/AboutPage').then(module => ({ default: module.AboutPage })));
const LocationsPage = lazy(() => import('../pages/LocationsPage').then(module => ({ default: module.LocationsPage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then(module => ({ default: module.ContactPage })));
const AccountPage = lazy(() => import('../pages/AccountPage').then(module => ({ default: module.AccountPage })));
const RegisterCard = lazy(() => import('../features/auth/RegisterCard').then(module => ({ default: module.RegisterCard })));

const OperationsPage = lazy(() => import('../features/operations/OperationsPage').then(m => ({default:m.OperationsPage})));
export function App() {
  const user=useSession();useOperations();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [route, setRoute] = useState(window.location.pathname);
  const operational=/^\/(cocina|mesera|caja|administrador|delivery)(\/|$)/.test(route);
  const information = ['/nosotros', '/locales', '/contacto'].includes(route);
  const account = route === '/mi-cuenta' || route.startsWith('/mi-cuenta/');
  const registration = route === '/registro';
  const home = route === '/';
  const carta = route === '/carta';
  const promotions = route === '/promociones';
  const checkout = ['/carrito', '/checkout/entrega', '/checkout/pago', '/checkout/confirmacion', '/pedido-confirmado', '/mi-pedido'].includes(route);
  const navigateRoute = useCallback((path: string) => {
    window.history.pushState(null, '', path);
    setRoute(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('preview') === 'carga') { url.searchParams.delete('preview'); window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`); }
  }, []);
  useEffect(() => {
    const updateRoute = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', updateRoute);
    return () => window.removeEventListener('popstate', updateRoute);
  }, []);
  useEffect(()=>{const target=user&&['/iniciar-sesion','/registro'].includes(route)?(user.role==='cliente'&&localStorage.getItem('lys-return-after-login')==='/carrito'?'/carrito':roleHome(user.role)):!user&&(account||operational)?'/iniciar-sesion':null;if(!target)return;const timer=setTimeout(()=>{localStorage.removeItem('lys-return-after-login');navigateRoute(target);},0);return()=>clearTimeout(timer);},[user,route,account,operational,navigateRoute]);
  function navigate(toRegistration: boolean) {
    window.history.pushState(null, '', toRegistration ? '/registro' : '/iniciar-sesion');
    setRoute(toRegistration ? '/registro' : '/iniciar-sesion');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  useEffect(() => { if (operational) return; document.title = information ? `${{ '/nosotros': 'Nosotros', '/locales': 'Locales', '/contacto': 'Contacto' }[route]} | Leñas y Sabores` : account ? 'Mi cuenta | Leñas y Sabores' : checkout ? 'Tu pedido | Leñas y Sabores' : home ? 'Leñas y Sabores | Sabor peruano en cada brasa' : carta ? 'Nuestra carta | Leñas y Sabores' : promotions ? 'Promociones | Leñas y Sabores' : registration ? 'Registrarse | Leñas y Sabores' : 'Iniciar sesión | Leñas y Sabores'; }, [registration, home, carta, promotions, checkout, information, account, route, operational]);

  function openHelp(action: 'register' | 'recover') {
    if (action === 'register') navigate(true);
    else setNotice({ title: 'Recuperar contraseña', message: 'En esta simulación local puedes cambiar tu contraseña desde Mi cuenta → Mis datos. Si perdiste el acceso de prueba, usa otra cuenta de prueba o crea una nueva cuenta con otro correo.' });
  }

  function onSection(section: string) {
    const pageRoutes: Record<string, string> = { Nosotros: '/nosotros', Locales: '/locales', Contacto: '/contacto', 'Mi cuenta': user ? roleHome(user.role) : '/iniciar-sesion', 'Iniciar Session': '/iniciar-sesion' };
    if (pageRoutes[section]) { navigateRoute(pageRoutes[section]); return; }
    if (section === 'Carrito' || section === 'Pedir ahora') { navigateRoute('/carrito'); return; }
    const cartaTargets: Record<string, string> = { Carta: '', 'Pollo a la brasa': 'pollo', Parrillas: 'parrillas', Combos: 'combos', 'Bebidas y acompañamientos': 'bebidas', 'Descubre combos': 'combos', 'Ver nuestro menú': '' };
    if (section in cartaTargets) { window.history.pushState(null, '', `/carta${cartaTargets[section] ? `?categoria=${cartaTargets[section]}` : ''}`); setRoute('/carta'); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    if (section === 'Promociones' || section === 'Todas las promociones') { window.history.pushState(null, '', '/promociones'); setRoute('/promociones'); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    if (section === 'Afiliarme') { navigate(true); return; }
    const targets: Record<string, string> = { Inicio: 'contenido' };
    if (home && targets[section]) {
      document.getElementById(targets[section])?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }
    if (section === 'Inicio') { window.history.pushState(null, '', '/'); setRoute('/'); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    const message = section === 'Pedir ahora' ? 'Pronto podrás hacer tu pedido desde aquí.' : `La sección ${section.toLowerCase()} estará disponible pronto.`;
    setNotice({ title: section, message });
  }
  return <MotionConfig reducedMotion="user">
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    {!operational && !carta && !promotions && !checkout && <SharedHeader key={route} onSection={onSection} activeSection={home ? 'Inicio' : account ? 'Mi cuenta' : route === '/nosotros' ? 'Nosotros' : route === '/locales' ? 'Locales' : route === '/contacto' ? 'Contacto' : ''} onSearch={query => { window.history.pushState(null, '', `/carta?buscar=${encodeURIComponent(query)}`); setRoute('/carta'); window.scrollTo({ top: 0, behavior: 'instant' }); }} />}
    <Suspense fallback={<RouteLoading />}>{operational ? <OperationsPage route={route} navigate={navigateRoute}/> : account && user ? <AccountPage route={route} onNavigate={navigateRoute} onAction={onSection} /> : information ? (route === '/nosotros' ? <AboutPage onAction={onSection} /> : route === '/locales' ? <LocationsPage onAction={onSection} /> : <ContactPage onAction={onSection} />) : checkout ? <CheckoutPage route={route} onNavigate={navigateRoute} onAction={onSection} /> : carta ? <CartaPage onAction={onSection} /> : promotions ? <PromotionsPage onAction={onSection} /> : home ? <HomePage onAction={onSection} /> : registration ? <AuthLayout registration><RegisterCard onLogin={() => navigate(false)} onLegal={kind => setNotice({ title: kind === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad', message: 'Este sitio es una simulación local. Los datos se guardan en el navegador de este dispositivo; no se envían al restaurante. Usa información de prueba. Puedes editar tus datos y cerrar sesión desde Mi cuenta. Los pagos y comprobantes son simulados.' })} /></AuthLayout> : <SignInPage onHelp={openHelp} />}</Suspense>
    {(home || carta || promotions || checkout || information || account) && <HomeFooter onAction={onSection} />}
    <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
  </MotionConfig>;
}
