import { Icon } from '../../components/Icon';
import '../../styles/membership.css';

const ranks = [
  { name: 'Chispa', key: 'chispa', description: 'Empieza tu historia.' },
  { name: 'Brasa', key: 'brasa', description: 'Más beneficios en cada visita.' },
  { name: 'Fuego', key: 'fuego', description: 'La experiencia más especial.' },
];

export function HomeMembership({ onAction }: { onAction: (section: string) => void }) {
  return <section className="home-membership" aria-labelledby="membership-title">
    <div className="home-container membership-inner">
      <div className="membership-copy">
        <p className="membership-label">Círculo de la Brasa</p>
        <h2 id="membership-title">Volver tiene su<span className="home-script">recompensa</span></h2>
        <p className="membership-description">Afíliate y sube de rango con cada pedido.</p>
        <button className="home-button membership-join" type="button" onClick={() => onAction('Afiliarme')}>Quiero ser parte <Icon name="arrow" /><span className="order-glare" aria-hidden="true" /></button>
        <span className="membership-coming">Membresía próximamente</span>
      </div>
      <div className="membership-showcase">
        {ranks.map(rank => <div key={rank.key} className={`membership-pass pass-${rank.key}`} tabIndex={0} aria-label={`Credencial ${rank.name}`}>
          <img src="/images/logo.webp" alt="Leñas y Sabores" width="2048" height="682" loading="lazy" />
          <span className="pass-circle" aria-hidden="true"><Icon name="flame" /></span>
          <div className="pass-rank"><span>CÍRCULO DE LA BRASA</span><strong>{rank.name}</strong></div>
          <div className="pass-bottom">EL SABOR NOS UNE</div>
        </div>)}
      </div>
      <div className="membership-journey">
        <ul className="membership-ranks" aria-label="Rangos de la membresía">{ranks.map(rank => <li key={rank.key} className={`rank-${rank.key}`}><Icon name="flame" /><div><h3>{rank.name}</h3><p>{rank.description}</p></div></li>)}</ul>
        <p className="membership-explainer">Más pedidos, más cerca del siguiente rango.</p>
      </div>
    </div>
  </section>;
}
