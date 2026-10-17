import { useState } from 'react';
import { Icon } from '../../components/Icon';

export function FavoriteButton({ selected, productName, onToggle }: { selected: boolean; productName: string; onToggle: () => void }) {
  const [feedback, setFeedback] = useState<'save' | 'remove' | null>(null);
  function toggle() {
    setFeedback(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : selected ? 'remove' : 'save');
    onToggle();
  }
  return <button type="button" className="product-favorite" aria-pressed={selected}
    aria-label={`${selected ? 'Quitar' : 'Guardar'} ${productName} ${selected ? 'de' : 'en'} favoritos`}
    data-feedback={feedback || undefined} onClick={toggle}
    onAnimationEnd={event => { if (event.animationName === 'favorite-wiggle' || event.animationName === 'favorite-release') setFeedback(null); }}>
    <span className="favorite-symbol" aria-hidden="true"><Icon name="heart" /></span>
  </button>;
}
