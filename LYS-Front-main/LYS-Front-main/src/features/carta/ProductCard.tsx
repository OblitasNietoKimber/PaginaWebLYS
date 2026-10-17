import { Icon } from '../../components/Icon';
import { soles, type Product } from './catalog';
import { FavoriteButton } from './FavoriteButton';

export function ProductCard({ product, favorite, onFavorite, onAdd, onDetail }: { product: Product; favorite: boolean; onFavorite: () => void; onAdd: () => void; onDetail: () => void }) {
  return <article className="product-card">
    <svg className="product-border-trace" aria-hidden="true" focusable="false"><rect x="1" y="1" rx="11" pathLength="100" /></svg>
    <div className={`product-photo${product.category === 'bebidas' ? ' product-photo-beverage' : ''}`}><button type="button" className="product-open" onClick={onDetail} aria-label={`Ver ${product.name}`}>
      {product.category === 'bebidas' && <img className="beverage-backdrop" src={product.image} alt="" aria-hidden="true" width="640" height="480" loading="lazy" decoding="async" />}
      <img className="product-image" src={product.image} alt={product.description} width="640" height="480" loading="lazy" decoding="async" /></button>
      <FavoriteButton selected={favorite} productName={product.name} onToggle={onFavorite} />
    </div>
    <div className="product-info"><button className="product-name" type="button" onClick={onDetail}><h3>{product.name}</h3></button><p>{product.description}</p><div className="product-purchase"><strong>{soles(product.price)}</strong>
      <button type="button" className="product-add" aria-label={`Agregar ${product.name}`} onClick={onAdd}><Icon name="cart" /><span>Agregar</span></button>
    </div></div>
  </article>;
}
