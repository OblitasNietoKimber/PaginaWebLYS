import type { IconName } from '../../components/Icon';

export const specialties = [
  { key: 'pollo', title: 'Pollo a la brasa', description: 'El clásico que nos identifica' },
  { key: 'combos', title: 'Combos', description: 'La mejor combinación de sabor' },
  { key: 'parrillas', title: 'Parrillas', description: 'Carnes con el auténtico sabor a la leña' },
  { key: 'bebidas', title: 'Bebidas y acompañamientos', description: 'El complemento perfecto' },
];
export const promotions = [
  { key: 'familiar', label: 'Promo familiar', title: 'Pollo a la brasa', items: ['papas grandes', 'ensalada familiar', 'Inca Kola 1.5 L'], price: '69' },
  { key: 'parrillera', label: 'Promo parrillera', title: 'Parrilla familiar', items: ['papas + ensalada', 'Inca Kola 1.5 L'], price: '89' },
  { key: 'duo', label: 'Dúo de pollos', title: '2 pollos a la brasa', items: ['papas grandes', '2 Inca Kolas 1.5 L'], price: '119' },
];
export type Benefit = { icon: IconName; title: string; description: string };
export const serviceBenefits: Benefit[] = [
  { icon: 'truck', title: 'Delivery', description: 'Tu sabor favorito en casa' },
  { icon: 'store', title: 'Recojo en local', description: 'Rápido y sin esperas' },
  { icon: 'table', title: 'Consumo en mesa', description: 'Ven y vive la experiencia' },
  { icon: 'card', title: 'Pagos rápidos', description: 'Efectivo, tarjeta y Yape' },
  { icon: 'gift', title: 'Promociones exclusivas', description: 'Más sabor, más momentos' },
];
