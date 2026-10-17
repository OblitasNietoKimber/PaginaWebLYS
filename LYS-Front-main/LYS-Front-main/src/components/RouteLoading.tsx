import { useEffect, useState } from 'react';
import '../styles/loading.css';
import { EmberTrail } from './EmberTrail';

export function RouteLoading() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  return <div className="route-loading" id="contenido">
    <EmberTrail />
    {visible && <div className="loading-scene" role="status" aria-live="polite">
      <img className="loading-brand" src="/images/logo.webp" alt="Leñas y Sabores" width="2048" height="682" />
      <div className="loading-dots" aria-hidden="true"><span /><span /><span /></div>
      <p className="loading-title">Preparando tu experiencia<span aria-hidden="true">…</span></p>
    </div>}
  </div>;
}
