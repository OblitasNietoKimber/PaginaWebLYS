import type { IconName } from '../../components/Icon';
import type { Sort } from './useCarta';

export const sorting: { id: Sort; name: string; icon: IconName; description: string }[] = [
  { id: 'popular', name: 'Más populares', icon: 'flame', description: 'Los favoritos de la casa' },
  { id: 'price', name: 'Precio', icon: 'sort', description: 'De menor a mayor' },
  { id: 'new', name: 'Nuevos', icon: 'star', description: 'Descubre las novedades' },
  { id: 'promo', name: 'Promo', icon: 'tag', description: 'Productos en promoción' },
];
