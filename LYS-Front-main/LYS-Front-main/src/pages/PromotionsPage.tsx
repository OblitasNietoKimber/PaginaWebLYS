import { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { EmberTrail } from '../components/EmberTrail';
import { Icon } from '../components/Icon';
import { useCarta } from '../features/carta/useCarta';
import { normalize } from '../features/carta/catalog';
import { promotions, promotionCategories, promotionLabels } from '../features/promotions/catalog';
import { CartaSort } from '../features/carta/CartaSort';
import { CartaCategories } from '../features/carta/CartaCategories';
import { PromotionCard } from '../features/promotions/PromotionCard';
import '../styles/carta.css';
import '../styles/promotions.css';

export function PromotionsPage({ onAction }: { onAction: (section: string) => void }) {
  const cart = useCarta();
  const [labelOrder, setLabelOrder] = useState('halloween');
  const [category, setCategory] = useState('todas');
  const [pagination, setPagination] = useState({ category: 'todas', query: '', limit: 6 });
  const limit = pagination.category === category && pagination.query === cart.query ? pagination.limit : 6;
  function search(query: string) { cart.setQuery(query); setPagination({ category, query, limit: 6 }); }
  function selectCategory(value: string) { setCategory(value); setPagination({ category: value, query: cart.query, limit: 6 }); }
  const filtered = promotions.filter(promotion => (category === 'todas' || promotion.filters.includes(category)) && normalize(`${promotion.name} ${promotion.description}`).includes(normalize(cart.query))).sort((a, b) => Number(b.badge === promotionLabels.find(label => label.id === labelOrder)?.name) - Number(a.badge === promotionLabels.find(label => label.id === labelOrder)?.name));
  function action(section: string) {
    if (section === 'Pedir ahora') onAction('Carrito');
    else if (section === 'Promociones') window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    else onAction(section);
  }
  return <>
    <Header onSection={action} activeSection="Promociones" carta={{ query: cart.query, onSearch: search, count: cart.count, onCart: () => onAction('Carrito') }} />
    <main className="promotions-page" id="contenido"><EmberTrail />
      <section className="promotions-hero" aria-labelledby="promotions-title"><picture className="promotions-hero-background"><source media="(max-width: 650px)" srcSet="/images/promotions/hero-mobile-v2.webp" /><img src="/images/promotions/hero-desktop-v3.webp" alt="Pollo a la brasa y papas en una edición de Halloween" width="1920" height="360" fetchPriority="high" /></picture>
        <div className="promotions-hero-copy"><h1 id="promotions-title"><span className="sr-only">Promociones que dan susto</span><img src="/images/promotions/title.webp" alt="" width="1200" height="420" /></h1><p>Sabores de temporada, por tiempo limitado</p></div>
        <p className="promotions-hero-note">El buen<br />pollo <span>también<br />da miedo…</span><br />de lo rico<br />que es</p>
      </section>
      <div className="promotions-container"><label className="carta-mobile-search" id="carta-search"><Icon name="search" /><input type="search" aria-label="Buscar promociones" placeholder="Buscar promociones…" value={cart.query} onChange={event => search(event.target.value)} /></label>
        <div className="carta-toolbar"><CartaCategories value={category} onChange={selectCategory} label="Categorías de promociones" tabs={promotionCategories.map(item => ({ id: item.id, name: item.label, icon: item.icon, image: `/images/carta/categories/${item.id === 'bebidas' ? 'bebidas' : item.id === 'acompanamientos' ? 'acompanamientos' : item.id === 'combos' || item.id === 'familiares' ? 'combos' : 'pollo'}.webp` }))} /><CartaSort value={labelOrder} onChange={value => { setLabelOrder(value); setPagination({ category, query: cart.query, limit: 6 }); }} label="Ordenar promociones por etiqueta" options={promotionLabels.map(label => ({ id: label.id, name: label.name === 'EDICIÓN HALLOWEEN' ? 'Edición Halloween' : label.name === 'LA MÁS PEDIDA' ? 'La más pedida' : 'Solo por temporada', icon: label.icon, description: 'Mostrar primero esta etiqueta' }))} /></div>
        <section aria-label="Ofertas de temporada"><p className="sr-only" role="status">{filtered.length} promociones disponibles</p>{filtered.length ? <><div className="promo-offer-grid">{filtered.slice(0, limit).map(promotion => <PromotionCard key={promotion.id} promotion={promotion} onAdd={cart.add} />)}</div>{limit < filtered.length && <button type="button" className="carta-load-more" onClick={() => setPagination({ category, query: cart.query, limit: limit + 6 })}>Ver más productos <Icon name="arrow" /></button>}</> : <div className="carta-no-results"><Icon name="search" /><h2>No encontramos esa promoción</h2><p>Prueba otro nombre o cambia la categoría.</p><button type="button" onClick={() => { cart.setQuery(''); setCategory('todas'); setPagination({ category: 'todas', query: '', limit: 6 }); }}>Ver todas las promociones</button></div>}</section>
      </div>
    </main>
    <BottomNavigation active="Promociones" onAction={action} />
    <p className="sr-only" role="status">{cart.announcement}</p>

  </>;
}
