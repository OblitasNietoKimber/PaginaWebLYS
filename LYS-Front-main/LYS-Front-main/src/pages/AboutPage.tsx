import { Icon } from '../components/Icon';
import '../styles/about-principles.css';
import { InformationNavigation } from '../features/information/InformationShared';

export function AboutPage({ onAction }: { onAction: (action: string) => void }) {
  return <><main id="contenido" className="information-page about-page">
    <section className="about-brand-hero info-container" aria-labelledby="about-brand-title">
      <div className="about-brand-copy"><div className="about-brand-heading"><p className="info-eyebrow">Nuestra historia</p>
        <h1 id="about-brand-title"><img className="about-brand-title-image" src="/images/information/about-title.png" width="2178" height="722" alt="Más que una pollería, somos tradición" fetchPriority="high" /></h1>
      </div>
      <img className="about-brand-image" src="/images/information/about-restaurant-selected.png" width="1774" height="887" alt="Pollo a la leña con papas y cremas frente al interior de Leñas y Sabores" fetchPriority="high" />
      <div className="about-brand-description">
        <p>En Leñas y Sabores nacimos con una pasión: compartir el auténtico sabor del pollo a la leña y nuestras parrillas, en un ambiente cálido, familiar y con el mejor servicio.</p>
        <p>Cada plato que servimos refleja nuestro compromiso con la calidad, la buena comida y las reuniones que unen a las personas.</p>
      </div></div>
    </section>
    <section className="about-principles" aria-label="Misión, visión y valores">
      <div className="info-container">
        <div className="about-principles-grid">
          <article className="about-principle-card">
            <span className="about-principle-icon"><Icon name="target" /></span>
            <h2><img className="about-principle-title" src="/images/information/title-mision.png" alt="Misión" /></h2><p>Brindar sabor, calidad<br />y calidez en cada visita.</p>
          </article>
          <article className="about-principle-card">
            <span className="about-principle-icon"><Icon name="eye" /></span>
            <h2><img className="about-principle-title" src="/images/information/title-vision.png" alt="Visión" /></h2><p>Ser la pollería favorita<br />de las familias de la región.</p>
          </article>
          <article className="about-principle-card">
            <span className="about-principle-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M3 8 7 3h10l4 5-9 14ZM3 8h18M7 3l5 19 5-19M7 8l5-5 5 5" /></svg></span>
            <h2><img className="about-principle-title" src="/images/information/title-valores.png" alt="Valores" /></h2><ul className="about-principle-values"><li>Calidad</li><li>Cercanía</li><li>Honestidad</li><li>Pasión</li></ul>
          </article>
        </div>
      </div>
    </section>
  </main><InformationNavigation active="Nosotros" onAction={onAction} /></>;
}
