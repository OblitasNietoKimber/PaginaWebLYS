import type { MenuProduct } from "./operationsStore";
import type { IconName } from "./OperationsVisuals";

export const productSku = (product: MenuProduct) => product.sku?.trim() || (product.id.length <= 16 ? product.id.toUpperCase() : `PRD-${product.id.slice(0,8).toUpperCase()}`);

export const categoryIcon = (category: string): IconName => ({ pollo:"chicken", parrillas:"grill", combos:"bag", chaufas:"rice", saltados:"bowl", acompanamientos:"fries", bebidas:"drink", salsas:"leaf" }[category] as IconName || "box");
