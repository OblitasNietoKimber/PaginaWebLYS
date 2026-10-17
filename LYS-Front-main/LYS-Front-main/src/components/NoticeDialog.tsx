import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

export type Notice = { title: string; message: string };

export function NoticeDialog({ notice, onClose }: { notice: Notice | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (notice) ref.current?.showModal();
    else ref.current?.close();
  }, [notice]);

  return <dialog className="notice-dialog" ref={ref} aria-labelledby="notice-title" aria-describedby="notice-description" onClose={onClose}>
    <button className="dialog-close" type="button" aria-label="Cerrar" onClick={onClose}><Icon name="close" /></button>
    <h2 id="notice-title">{notice?.title}</h2>
    <p id="notice-description">{notice?.message}</p>
    <button type="button" className="primary-button" onClick={onClose}>Entendido</button>
  </dialog>;
}
