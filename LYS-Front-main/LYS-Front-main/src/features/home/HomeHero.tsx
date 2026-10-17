import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from '../../components/Icon';

const slides = [
  { first: 'Sabor peruano', second: 'en cada brasa', description: 'Auténtico pollo a la brasa, con el sabor de nuestra tierra y la tradición de siempre.', image: 'hero', alt: 'Pollo a la brasa con papas, ensalada, cremas e Inca Kola' },
  { first: 'Comparte el fuego', second: 'de nuestra cocina', description: 'Crujiente por fuera, jugoso por dentro y listo para disfrutar en cada momento.', image: 'hero-compartir', alt: 'Parrilla para compartir con papas, ensalada, cremas e Inca Kola' },
  { first: 'Sabores peruanos', second: 'en cada momento', description: 'Platos tradicionales, ingredientes frescos y el auténtico sabor a la brasa.', image: 'hero-tradicion', alt: 'Lomo saltado con papas, arroz chaufa, wantanes, cremas e Inca Kola' },
];
const AUTO_ADVANCE_MS = 10000;
export function HomeHero({ onAction }: { onAction: (section: string) => void }) {
  const [current, setCurrent] = useState(0);
  const [touching, setTouching] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [restart, setRestart] = useState(0);
  const startX = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const slide = slides[current];
  const easing = [.25, .1, .25, 1] as const;
  const paused = touching || !visible || !!reduce;
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => setCurrent(index => (index + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [current, paused, restart]);
  useEffect(() => {
    const size = window.innerWidth * window.devicePixelRatio > 1080 ? '2172' : '1080';
    const mobile = window.matchMedia('(max-width: 650px)').matches;
    const tablet = window.matchMedia('(max-width: 1100px)').matches;
    const sources = [mobile ? 'hero-mobile' : `hero-${size}`, mobile ? 'hero-compartir-mobile' : tablet ? 'hero-compartir-tablet' : `hero-compartir-${size}`, mobile ? 'hero-tradicion-mobile' : `hero-tradicion-${size}`, 'title', 'title-compartir', 'title-tradicion'];
    sources.forEach(source => {
      const image = new Image();
      image.src = `/images/home/${source}.webp`;
      void image.decode().catch(() => {});
    });
  }, []);
  function move(delta: number) { setCurrent(index => (index + delta + slides.length) % slides.length); setRestart(value => value + 1); }
  function select(index: number) { setCurrent(index); setRestart(value => value + 1); }
  return <section className={`home-hero${current === 1 ? ' home-hero-sharing' : current === 2 ? ' home-hero-traditional' : ''}`} aria-roledescription="carrusel" aria-label="Sabores de nuestra cocina" onKeyDown={event => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight') move(1);
    if (event.key === 'ArrowLeft') move(-1);
  }} tabIndex={0} onTouchStart={event => { setTouching(true); startX.current = event.touches[0].clientX; }} onTouchCancel={() => { setTouching(false); startX.current = null; }} onTouchEnd={event => {
    setTouching(false);
    if (startX.current === null) return;
    const distance = event.changedTouches[0].clientX - startX.current;
    if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
    startX.current = null;
  }}>
    <svg className="sr-only" aria-hidden="true" focusable="false">
      <defs>
        <filter id="sharing-title-red" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.844 0 0 0 0  0 0.5 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="traditional-title-red" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1.1344 0 0 0 0  0 0.5 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
    <AnimatePresence initial={false}>
      <motion.picture key={slide.image} className={`home-hero-picture slide-${slide.image}`} initial={{ opacity: 0, scale: reduce ? 1 : 1.025, zIndex: 2 }} animate={{ opacity: 1, scale: 1, zIndex: 2 }} exit={{ opacity: .999, scale: 1, zIndex: 1 }} transition={{ duration: reduce ? 0 : .85, ease: easing }}>
        {current === 0 && <source media="(max-width: 650px)" srcSet="/images/home/hero-mobile.webp" />}
        {current === 1 && <source media="(max-width: 650px)" srcSet="/images/home/hero-compartir-mobile.webp" />}
        {current === 1 && <source media="(max-width: 1100px)" srcSet="/images/home/hero-compartir-tablet.webp" />}
        {current === 2 && <source media="(max-width: 650px)" srcSet="/images/home/hero-tradicion-mobile.webp" />}
        <img src={`/images/home/${slide.image}-2172.webp`} srcSet={`/images/home/${slide.image}-1080.webp 1080w, /images/home/${slide.image}-2172.webp 2172w`} sizes="100vw" alt={slide.alt} width="2172" height="724" fetchPriority="high" />
      </motion.picture>
    </AnimatePresence>
    <div className="home-hero-inner home-container">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={current} className="home-hero-copy" initial={{ opacity: 0, y: reduce ? 0 : 5 }} animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0 : .5, ease: easing } }} exit={{ opacity: 0, y: 0, transition: { duration: reduce ? 0 : .18 } }}>
          <h1><span className="sr-only">{slide.first} {slide.second}</span><img className="home-hero-title" src={`/images/home/${['title', 'title-compartir', 'title-tradicion'][current]}.webp`} alt="" width="1400" height={[519, 468, 520][current]} /></h1>
          <p>{current === 0 ? <><span className="hero-description-line">Auténtico pollo a la brasa, con el sabor de nuestra tierra</span>{' '}<span className="hero-description-line">y la tradición de siempre.</span></> : current === 1 ? <><span className="hero-sharing-line">Crujiente por fuera, jugoso</span>{' '}<span className="hero-sharing-line">por dentro y listo para disfrutar</span>{' '}<span className="hero-sharing-line">en cada momento.</span></> : <><span className="hero-sharing-line">Platos tradicionales, ingredientes</span>{' '}<span className="hero-sharing-line">frescos y el auténtico sabor</span>{' '}<span className="hero-sharing-line">a la brasa.</span></>}</p>
        </motion.div>
      </AnimatePresence>
      <div className="home-hero-actions">
        <motion.button type="button" className="home-button" whileHover={{ scale: 1.015 }} whileTap={{ scale: .98 }} onClick={() => onAction('Pedir ahora')}><span className="order-glare" aria-hidden="true" /><Icon name="truck" />Pedir ahora<Icon name="arrow" /></motion.button>
        <motion.button type="button" className="home-button home-button-outline" whileHover={{ scale: 1.015 }} whileTap={{ scale: .98 }} onClick={() => onAction('Carta')}><Icon name="cutlery" />{current === 1 ? 'Descubre combos' : current === 2 ? 'Ver nuestro menú' : 'Ver carta'}</motion.button>
      </div>
    </div>
    <button className="carousel-arrow previous" type="button" aria-label="Diapositiva anterior" onClick={() => move(-1)}><Icon name="arrow" /></button>
    <button className="carousel-arrow next" type="button" aria-label="Diapositiva siguiente" onClick={() => move(1)}><Icon name="arrow" /></button>
    <div className="carousel-dots" aria-label="Elegir diapositiva">{slides.map((item, index) => <button type="button" key={item.image} aria-label={`Ver diapositiva ${index + 1}`} aria-pressed={current === index} onClick={() => select(index)}><span /></button>)}</div>
    <p className="sr-only" role="status" aria-live={paused ? 'polite' : 'off'}>Diapositiva {current + 1} de {slides.length}: {slide.first} {slide.second}</p>
  </section>;
}
