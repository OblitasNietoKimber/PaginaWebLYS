import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { soles } from '../carta/catalog';
import type { Promotion } from './catalog';

export function PromotionCard({ promotion, onAdd }: { promotion: Promotion; onAdd: (id: string, count: number) => void }) {
  const [count, setCount] = useState(1);
  return <article className="promo-offer-card">
    <svg className="promo-offer-border-trace" aria-hidden="true" focusable="false"><rect x="1" y="1" rx="17" pathLength="100" /></svg>
    <div className={`promo-offer-photo${promotion.filters.includes('bebidas') ? ' promo-offer-photo-beverage' : ''}`}><img src={promotion.image} alt={promotion.description} width="960" height="430" loading="lazy" /><span className={`promo-offer-badge ${promotion.badgeTone}`}><Icon name={promotion.badgeIcon} />{promotion.badge}</span></div>
    <div className="promo-offer-info"><h2>{promotion.name}</h2><p className="promo-offer-description">{promotion.description}</p>
      <div className="promo-offer-price"><strong>{soles(promotion.price)}</strong><del aria-label={`Precio anterior ${soles(promotion.originalPrice)}`}>{soles(promotion.originalPrice)}</del><span>Ahorras {soles(promotion.originalPrice - promotion.price)}</span></div>
      <div className="promo-offer-actions"><div className="promo-offer-quantity" role="group" aria-label={`Cantidad de ${promotion.name}`}><button type="button" disabled={count === 1} aria-label={`Reducir cantidad de ${promotion.name}`} onClick={() => setCount(value => value - 1)}>−</button><output aria-label="Cantidad">{count}</output><button type="button" disabled={count === 99} aria-label={`Aumentar cantidad de ${promotion.name}`} onClick={() => setCount(value => value + 1)}>+</button></div>
        <button type="button" className="promo-offer-add" aria-label={`Agregar ${promotion.name}`} onClick={() => onAdd(promotion.id, count)}><Icon name="cart" /><span>Agregar</span></button></div>
    </div>
  </article>;
}
