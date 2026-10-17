import { getOperations, subscribeOperations } from '../operations/operationsStore';
import catalog from './catalog.json';

export type CategoryId = 'pollo' | 'parrillas' | 'combos' | 'chaufas' | 'saltados' | 'acompanamientos' | 'bebidas' | 'salsas';
export type Product = { id: string; category: string; name: string; description: string; price: number; size: string; popular: number; isNew: boolean; promo: boolean; image: string };
export const categories = catalog.categories;
export const products: Product[] = [...getOperations().products];
subscribeOperations(()=>products.splice(0,products.length,...getOperations().products));
export const soles = (value: number) => `S/ ${value.toFixed(2)}`;
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
