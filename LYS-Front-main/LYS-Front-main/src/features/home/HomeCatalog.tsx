import { motion, useReducedMotion } from 'motion/react';
import { Icon } from '../../components/Icon';
import { promotions, specialties } from './homeContent';

function FoodImage({ name, alt }: { name: string; alt: string }) {
  return <img src={`/images/home/${name}-1080.webp`} srcSet={`/images/home/${name}-640.webp 640w, /images/home/${name}-1080.webp 1080w`} sizes="(max-width: 650px) 94vw, (max-width: 1100px) 46vw, 31vw" alt={alt} width="1080" height="432" loading="lazy" decoding="async" />;
}
export function HomeCatalog({ onAction }: { onAction: (section: string) => void }) {
  const reducedMotion = useReducedMotion();
  return <>
    <section id="especialidades" className="home-specialties home-section">
      <div className="home-container">
        <div className="home-section-heading"><div><p className="home-eyebrow">Lo mejor de nuestra cocina</p><h2>Nuestras especialidades</h2></div><button className="home-more" onClick={() => onAction('Carta')}>Ver toda la carta<Icon name="arrow" /></button></div>
        <div className="specialty-grid">{specialties.map(item => <motion.button key={item.key} type="button" className="specialty-card" whileHover={reducedMotion ? undefined : { y: -7 }} whileTap={reducedMotion ? undefined : { scale: .985 }} transition={{ duration: .22, ease: [.16, 1, .3, 1] }} onClick={() => onAction(item.title)}>
          <FoodImage name={item.key} alt="" /><div className="specialty-copy"><h3>{item.title}</h3><p>{item.description}</p><span className="round-arrow"><Icon name="arrow" /></span></div>
        </motion.button>)}</div>
      </div>
    </section>
    <section id="promociones" className="home-promotions home-section"><div className="home-container">
      <div className="home-section-heading"><h2>Promociones que <span className="home-script">encienden el antojo</span></h2><button className="home-more" onClick={() => onAction('Todas las promociones')}>Ver todas las promociones<Icon name="arrow" /></button></div>
      <div className="promotion-grid">{promotions.map(item => <motion.button type="button" className={`promotion-card promotion-${item.key}`} key={item.key} whileHover={reducedMotion ? undefined : { y: -7 }} whileTap={reducedMotion ? undefined : { scale: .985 }} transition={{ duration: .22, ease: [.16, 1, .3, 1] }} onClick={() => onAction(item.label)} aria-label={`${item.label}: ${item.title}, ${item.items.join(', ')}, S/ ${item.price}.90`}>
        <FoodImage name={item.key} alt="" /><div className="promotion-copy"><span className="promotion-label">{item.label}</span><h3>{item.title}</h3><p>{item.items.map(line => <span key={line}>+ {line}</span>)}</p><div className="promotion-price"><span>S/</span> {item.price}<sup>.90</sup></div></div>
      </motion.button>)}</div>
    </div></section>
  </>;
}
