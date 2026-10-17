import type { IconName } from "./OperationsVisuals";
export function iconFor(label: string): IconName {
  const value = label.toLowerCase();
  const rules: [RegExp, IconName][] = [
    [/^top /, "trophy"],
    [/ventas de la semana/, "chart"],
    [/alerta|notificacion/, "bell"],
    [/^nuevo |^nueva |^crear/, "plus"],
    [/lista de|^todos$/, "list"],
    [/terraza|datos del negocio/, "store"],
    [/zona parrilla|parrillas/, "flame"],
    [/pollo/, "chicken"],
    [/combos/, "bowl"],
    [/bebidas/, "drink"],
    [/seguridad|permisos/, "shield"],
    [/pedido actual/, "cutlery"],
    [/cocina|preparación/, "chef"],
    [/mesa|salón/, "table"],
    [/delivery/, "scooter"],
    [/listo|servir|entregar/, "serve"],
    [/inactivo|cancelado/, "close"],
    [/complet|activo|eficiencia|entregado/, "check"],
    [/tiempo|hora|historial/, "clock"],
    [/efectivo|fondo/, "cash"],
    [/venta|cobrado|saldo|ticket|gasto|reembolso/, "coins"],
    [/pago|cobro/, "card"],
    [/stock bajo/, "bell"],
    [/producto|insumo|inventario|stock/, "box"],
    [/categoría/, "grid"],
    [/cliente|equipo/, "users"],
    [/usuario/, "user"],
    [/promo|descuento|cupón/, "tag"],
    [/rendimiento|reporte|meta/, "chart"],
    [/proveedor/, "users"],
    [/visión/, "eye"],
    [/pedido|comprobante|cuenta/, "receipt"],
  ];
  return rules.find(([pattern]) => pattern.test(value))?.[1] || "receipt";
}
