import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from '../../components/Icon';
export function AccountDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="account-dialog" aria-labelledby="account-dialog-title" onClose={onClose}><button className="dialog-close" type="button" aria-label="Cerrar" onClick={onClose}><Icon name="close" /></button><h2 id="account-dialog-title">{title}</h2>{children}</dialog>;
}
export function AccountEmpty({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="account-empty info-card"><span className="info-icon-circle"><Icon name="flame" /></span><h2>{title}</h2><p>{description}</p>{action && <button type="button" className="primary-button" onClick={onAction}>{action}<Icon name="arrow" /></button>}</div>;
}
export function AccountPromo({ onAction }: { onAction: (action: string) => void }) {
  return <aside className="account-promo"><img src="/images/carta/products/pollo-01.webp" alt="Pollo a la brasa" loading="lazy" /><div><h3>¿Antojo de un nuevo pedido?</h3><p>Tu próximo momento para compartir empieza aquí.</p><button type="button" className="primary-button" onClick={() => onAction('Carta')}>Ver nuestra carta <Icon name="arrow" /></button></div></aside>;
}
