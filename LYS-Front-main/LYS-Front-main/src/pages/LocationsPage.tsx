import { useState } from 'react';
import { Icon } from '../components/Icon';
import { InformationNavigation } from '../features/information/InformationShared';
import { business } from '../features/information/business';
import '../styles/locations-reference.css';

const photos = [
  { src: '/images/information/local-selected-exterior.webp', alt: 'Vista exterior referencial de Leñas y Sabores' },
  { src: '/images/information/local-selected-dining.webp', alt: 'Vista interior referencial del salón principal y la cocina' },
  { src: '/images/information/local-selected-window.webp', alt: 'Vista interior referencial del salón y el segundo nivel' },
];
const googleMaps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${business.name}, ${business.address}, ${business.reference}, ${business.district}`);

export function LocationsPage({ onAction }: { onAction: (action: string) => void }) {
  const [selected, setSelected] = useState(0);
  const move = (direction: number) => setSelected(current => (current + direction + photos.length) % photos.length);

  return <>
    <main id="contenido" className="information-page locations-page">
      <div className="info-container">
        <section className="local-visit-layout" aria-label="Conoce nuestro local">
          <div className="local-introduction">
            <header className="local-visit-heading">
              <h1><img className="local-title-image" src="/images/information/local-title-v3.png" alt="Nuestro local" width="1642" height="949" /></h1>
              <p>Te esperamos para disfrutar de nuestro auténtico sabor en un ambiente acogedor.</p>
            </header>
            <div className="local-benefits">
              <div><span className="local-visit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="3" /><path d="M6 21v-3c0-6 12-6 12 0v3H6Z M5 4a3 3 0 0 0 0 6 M19 4a3 3 0 0 1 0 6 M4 13c-3 1-3 4-3 7h2 M20 13c3 1 3 4 3 7h-2" /></svg></span><div><h2>Ambiente familiar</h2><p>Ideal para compartir</p></div></div>
              <div><span className="local-visit-icon"><Icon name="cutlery" /></span><div><h2>Deliciosos platos</h2><p>Pollos, parrillas y más</p></div></div>
              <div><span className="local-visit-icon local-parking" aria-hidden="true">P</span><div><h2>Estacionamiento</h2><p>Para tu comodidad</p></div></div>
            </div>
          </div>
          <div className="local-gallery" role="region" aria-roledescription="carrusel" aria-label="Imágenes del local" onKeyDown={event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              move(event.key === 'ArrowLeft' ? -1 : 1);
            }
          }}>
            <div className="local-gallery-frame">
              <img src={photos[selected].src} alt={photos[selected].alt} width="1672" height="941" />
              <button className="local-gallery-arrow local-gallery-previous" aria-label="Imagen anterior" onClick={() => move(-1)}><Icon name="chevron" /></button>
              <button className="local-gallery-arrow local-gallery-next" aria-label="Imagen siguiente" onClick={() => move(1)}><Icon name="chevron" /></button>
              <span className="local-photo-counter" aria-hidden="true">{selected + 1} / {photos.length}</span>
            </div>
            <div className="local-gallery-dots" aria-label="Seleccionar imagen">
              {photos.map((photo, index) => <button key={photo.src} aria-label={`Ver imagen ${index + 1}`} aria-current={selected === index ? 'true' : undefined} onClick={() => setSelected(index)}><img src={photo.src} alt="" width="1672" height="941" /></button>)}
            </div>
            <p className="sr-only" aria-live="polite">Imagen {selected + 1} de 3 · Ilustraciones referenciales del local</p>
          </div>
          <aside className="local-visit-panel" aria-label="Información para visitarnos">
            <div className="local-visit-detail local-address"><div className="local-detail-heading"><span className="local-visit-icon"><Icon name="pin" /></span><h2>Nuestra ubicación</h2></div><p>{business.address}<br />{business.reference}<br />{business.district}</p><a className="local-maps-button" href={googleMaps} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="m2 5 6-3 8 3 6-3v17l-6 3-8-3-6 3V5Z M8 2v17 M16 5v17" /></svg><span>Ver en Google Maps</span></a></div>
            <div className="local-visit-detail local-hours"><div className="local-detail-heading"><span className="local-visit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l5 3" /></svg></span><h2>Horario de atención</h2></div><div className="local-hours-copy"><p>{business.hours}</p><p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 5h16v17H4Z M8 2v6 M16 2v6 M4 10h16 M8 14h1 M15 14h1 M8 18h1 M15 18h1" /></svg>Todos los días</p></div></div>
            <div className="local-welcome"><svg viewBox="0 0 48 64" fill="currentColor" aria-hidden="true"><path d="M26 1C8 14 26 22 14 35c-4-8-1-12-1-12C-7 45 3 63 24 63c24 0 31-25 13-45 2 14-4 18-7 13C20 17 33 12 26 1Z" /><path d="M26 37c-11 9-3 12-9 19 0 0 1-4-2-6-6 10 4 13 9 13 9 0 15-8 7-18 0 7-4 5-5-8Z" fill="white" /></svg><div><h2>¡Te esperamos!</h2><p>Un lugar perfecto para disfrutar en familia y con amigos.</p></div></div>
            <a className="local-phone" href="tel:+51947540597"><Icon name="phone" />+51 {business.phone}</a>
          </aside>
        </section>
      </div>
    </main>
    <InformationNavigation active="Locales" onAction={onAction} />
  </>;
}
