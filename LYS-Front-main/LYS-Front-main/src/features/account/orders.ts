import { getOperations, orderTotal } from "../operations/operationsStore";
import { currentUser } from "../../services/localAuth";
import { cartProducts } from "../carta/cartStore";
import type { Receipt } from "../checkout/useCheckout";
import { savedReceipt, receiptHistory } from "../checkout/receiptStorage";
export type AccountOrder = Receipt & {
  status:
    | "Registrado"
    | "En preparación"
    | "Listo"
    | "En camino"
    | "Entregado"
    | "Cancelado";
  example?: boolean;
};
const statuses: AccountOrder["status"][] = [
  "Entregado",
  "En preparación",
  "Cancelado",
  "Entregado",
];
export function exampleOrders(): AccountOrder[] {
  return statuses.map((status, index) => {
    const product = cartProducts[index * 3];
    return {
      code: `EJEMPLO-${String(4 - index).padStart(4, "0")}`,
      date: new Date(2026, 9, 4 - index * 3, 19, 30).toISOString(),
      items: [{ product, count: 1 }],
      delivery: {
        mode: "delivery",
        address: "Dirección de ejemplo",
        district: "Carabayllo",
        label: "Casa",
        reference: "Referencia de ejemplo",
        instructions: "",
        name: "Cliente de ejemplo",
        phone: "",
        email: "",
        store: "Local principal",
      },
      method: ["card", "yape", "cash", "plin"][index] as Receipt["method"],
      subtotal: product.price,
      shipping: 7,
      discount: 0,
      total: product.price + 7,
      status,
      example: true,
    };
  });
}
export function accountOrders(): AccountOrder[] {
  const receipt = savedReceipt();
  const found = receiptHistory();
  if (receipt && !found.some((order) => order.code === receipt.code))
    found.unshift(receipt);
  return getOperations()
    .orders.filter((o) => o.customerId === currentUser()?.id && !o.draft)
    .map((o) => ({
      code: o.id,
      date: o.created,
      items: o.items,
      delivery: {
        mode: o.channel === "Recojo" ? "pickup" : "delivery",
        address: o.address,
        district: "",
        label: "",
        reference: "",
        instructions: o.notes,
        name: o.customer,
        phone: o.phone,
        email: o.email,
        store: "Local principal",
      },
      method:
        (
          {
            Tarjeta: "card",
            Yape: "yape",
            Plin: "plin",
            Efectivo: "cash",
          } as const
        )[o.method as "Tarjeta"] || "cash",
      subtotal: o.items.reduce((s, l) => s + l.count * l.product.price, 0),
      shipping: o.shipping,
      discount: o.discount,
      total: orderTotal(o),
      status: o.status === "Recibido" ? "Registrado" : o.status,
    }));
}

export const orderActive = (order: AccountOrder) =>
  !["Entregado", "Cancelado"].includes(order.status);
