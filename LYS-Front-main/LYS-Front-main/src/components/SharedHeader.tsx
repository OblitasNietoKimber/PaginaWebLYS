import { Header } from './Header';
import { useCartStore } from '../features/carta/cartStore';

export function SharedHeader({ onSection, activeSection, onSearch }: { onSection: (section: string) => void; activeSection: string; onSearch: (query: string) => void }) {
  const { cart } = useCartStore();
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  return <>
    <Header activeSection={activeSection} onSection={section => section === 'Pedir ahora' ? onSection('Carrito') : onSection(section)} carta={{ query: new URLSearchParams(location.search).get('buscar') || '', onSearch, count, onCart: () => onSection('Carrito'), searchHref: '/carta#carta-search' }} />

  </>;
}
