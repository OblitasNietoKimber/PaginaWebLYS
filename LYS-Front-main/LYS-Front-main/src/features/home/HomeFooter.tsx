import { useOperations } from '../operations/operationsStore';
import { Icon } from '../../components/Icon';
import { SocialIcon, type SocialNetwork } from '../../components/SocialIcon';

const socialNetworks: SocialNetwork[] = ['Facebook', 'Instagram', 'TikTok', 'YouTube'];

export function HomeFooter({ onAction }: { onAction: (section: string) => void }) {
  const {settings}=useOperations();
  return <footer className="home-footer" id="contacto"><div className="home-container">
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs><filter id="footer-logo-color" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1 -1 0 0 0 1 -1 0 0 0 1 0 0 0 1 0" /></filter></defs></svg>
    <div className="footer-main"><a className="footer-logo" href="/" aria-label="Leñas y Sabores, inicio"><img src="/images/logo.webp" alt="Leñas y Sabores — Pollos & Parrillas" width="2048" height="682" loading="lazy" /></a>
      <nav aria-label="Enlaces rápidos"><h3>Enlaces rápidos</h3><div>{['Inicio', 'Carta', 'Promociones', 'Nosotros', 'Locales', 'Contacto'].map(section => <button type="button" key={section} onClick={() => onAction(section)}>{section}</button>)}</div></nav>
      <div className="footer-contact"><h3>Contáctanos</h3><button type="button" onClick={() => onAction('Contacto')}><Icon name="phone" />{settings.phone}</button><button type="button" onClick={() => onAction('Locales')}><Icon name="pin" />Lima, Perú</button></div>
      <div className="footer-social"><h3>Síguenos</h3><div>{socialNetworks.map(name => <button type="button" key={name} onClick={() => onAction(name)} aria-label={name}><SocialIcon name={name} /></button>)}</div></div>
      <p className="footer-phrase home-script">Más que una comida,<br />una tradición peruana</p>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} Leñas y Sabores. Todos los derechos reservados.</span><span>Sabor peruano, en cada brasa. <span className="peru-flag" aria-label="Perú" role="img" /></span></div>
  </div></footer>;
}
