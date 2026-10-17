import { getOperations, subscribeOperations } from '../operations/operationsStore';
import { products, type Product } from '../carta/catalog';
import type { IconName } from '../../components/Icon';

export type Promotion = Product & { originalPrice: number; badge: string; badgeIcon: IconName; badgeTone: 'orange' | 'red'; filters: string[] };
export const promotionCategories: { id: string; label: string; icon: IconName }[] = [
  { id: 'todas', label: 'Todas', icon: 'grid' }, { id: 'combos', label: 'Combos', icon: 'chicken' },
  { id: 'familiares', label: 'Familiares', icon: 'users' }, { id: 'individuales', label: 'Individuales', icon: 'user' },
  { id: 'bebidas', label: 'Bebidas', icon: 'drink' }, { id: 'acompanamientos', label: 'Acompañamientos', icon: 'fries' },
];
// Datos de presentación de temporada; la disponibilidad definitiva se validará al conectar pedidos.
const featuredPromotions: Promotion[] = [
  { id: 'promo-terror-familiar', category: 'promociones', name: 'Combo Familiar del Terror', description: '1 pollo a la brasa + papas grandes + ensalada familiar + 1 Coca-Cola de 1.5 L + salsas de la casa', price: 64.90, originalPrice: 89.90, size: 'familiar', popular: 3, isNew: false, promo: true, image: '/images/promotions/familiar.webp', badge: 'EDICIÓN HALLOWEEN', badgeIcon: 'pumpkin', badgeTone: 'orange', filters: ['combos', 'familiares'] },
  { id: 'promo-parrilla-embrujada', category: 'promociones', name: 'Combo Parrilla Embrujada', description: '1/2 pollo a la brasa + anticuchos + chorizo + papas grandes + ensalada + salsas de la casa', price: 49.90, originalPrice: 69.90, size: 'compartir', popular: 2, isNew: false, promo: true, image: '/images/promotions/parrilla.webp', badge: 'LA MÁS PEDIDA', badgeIcon: 'flame', badgeTone: 'red', filters: ['combos', 'familiares'] },
  { id: 'promo-terror-duo', category: 'promociones', name: 'Terror Dúo', description: '2 cuartos de pollo a la brasa + papas medianas + ensalada + 2 Coca-Cola personales + salsas de la casa', price: 34.90, originalPrice: 52.90, size: 'compartir', popular: 1, isNew: false, promo: true, image: '/images/promotions/duo.webp', badge: 'SOLO POR TEMPORADA', badgeIcon: 'clock', badgeTone: 'orange', filters: ['combos'] },
];

function seasonalOffer(sourceId: string, name: string, price: number, originalPrice: number, filters: string[]): Promotion {
  const product = products.find(item => item.id === sourceId);
  if (!product) throw new Error(`Producto de promoción inexistente: ${sourceId}`);
  return { ...product, id: `promo-${sourceId}`, category: 'promociones', name, price, originalPrice, filters, promo: true, badge: 'PRECIO DE TEMPORADA', badgeIcon: 'clock', badgeTone: 'orange' };
}

const seasonalPromotions: Promotion[] = [
  ...featuredPromotions,
  seasonalOffer('combos-08', 'Doble Brasa de Medianoche', 99.90, 129.90, ['combos', 'familiares']),
  seasonalOffer('combos-12', 'Banquete de la Noche', 74.90, 94.90, ['combos', 'familiares']),
  seasonalOffer('combos-04', 'Combo Brasa y Chaufa Encantado', 22.90, 29.90, ['combos']),
  seasonalOffer('pollo-02', 'Cuarto de Brasa del Terror', 14.90, 18.90, ['individuales']),
  seasonalOffer('pollo-06', 'Pechuga Hechizada', 19.90, 25.90, ['individuales']),
  seasonalOffer('pollo-04', 'Alitas BBQ Embrujadas', 20.90, 26.90, ['individuales']),
  seasonalOffer('bebidas-02', 'Inca Kola para Compartir', 8.90, 12.90, ['bebidas']),
  seasonalOffer('bebidas-04', 'Coca-Cola de Temporada', 8.90, 12.90, ['bebidas']),
  seasonalOffer('bebidas-06', 'Chicha Morada de Medianoche', 9.90, 14.90, ['bebidas']),
  seasonalOffer('acompanamientos-04', 'Papas para la Noche', 9.90, 15.90, ['acompanamientos']),
  seasonalOffer('acompanamientos-12', 'Wantanes Encantados (12u)', 15.90, 21.90, ['acompanamientos']),
  seasonalOffer('acompanamientos-11', 'Salchipapas del Terror', 21.90, 29.90, ['acompanamientos']),
];


export const promotionLabels = [
  { id: 'halloween', name: 'EDICIÓN HALLOWEEN', icon: 'pumpkin' as const, tone: 'orange' as const },
  { id: 'popular', name: 'LA MÁS PEDIDA', icon: 'flame' as const, tone: 'red' as const },
  { id: 'seasonal', name: 'SOLO POR TEMPORADA', icon: 'clock' as const, tone: 'orange' as const },
];
export const promotions: Promotion[] = seasonalPromotions.map((promotion, index) => {
  const label = promotionLabels[index % promotionLabels.length];
  return { ...promotion, badge: label.name, badgeIcon: label.icon, badgeTone: label.tone };
});

function updateOffers(){const state=getOperations();const today=new Date().toISOString().slice(0,10);const created:Promotion[]=state.offers.filter(o=>o.active&&o.type!=='Cupón'&&o.start<=today&&o.end>=today&&o.used<o.limit).flatMap(o=>{const p=state.products.find(p=>p.id===o.productId&&p.active&&(p.stock??0)>0);return p?[{...p,id:'offer-'+o.id,name:o.name,originalPrice:p.price,price:Math.round(p.price*(1-o.percent/100)*100)/100,badge:'-'+o.percent+'%',badgeIcon:'tag',badgeTone:'red',filters:[p.category,o.type==='Combo'?'combos':'individuales']} as Promotion]:[];});promotions.splice(0,promotions.length,...created,...seasonalPromotions.map((p,i)=>({...p,badge:promotionLabels[i%promotionLabels.length].name,badgeIcon:promotionLabels[i%promotionLabels.length].icon,badgeTone:promotionLabels[i%promotionLabels.length].tone})));}
updateOffers();subscribeOperations(updateOffers);
