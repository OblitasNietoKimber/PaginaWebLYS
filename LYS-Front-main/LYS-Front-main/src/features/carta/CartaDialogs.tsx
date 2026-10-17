import { useEffect, useRef } from 'react';
import { Icon } from '../../components/Icon';
import { soles, type Product } from './catalog';

export function ProductDetail({ product, onClose, onAdd }: { product: Product | null; onClose: () => void; onAdd: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (product) ref.current?.showModal(); else ref.current?.close(); }, [product]);
  return <dialog ref={ref} className="carta-dialog product-detail" aria-labelledby="product-detail-title" onClose={onClose}>
    <button type="button" className="dialog-close" aria-label="Cerrar detalle" onClick={onClose}><Icon name="close" /></button>
    {product && <><img src={product.image} alt={product.description} width="640" height="400" /><div><h2 id="product-detail-title">{product.name}</h2><p>{product.description}</p><strong>{soles(product.price)}</strong><button type="button" className="primary-button" onClick={() => { onAdd(product.id); onClose(); }}><Icon name="cart" />Agregar a mi pedido</button></div></>}
  </dialog>;
}
