import { minutes, type Order } from "./operationsStore";

export const kitchenSearch = (order: Order, search: string) =>
  `${order.id} ${order.customer} ${order.address} ${order.table ? `Mesa ${order.table}` : ""} ${order.items.map((item) => item.product.name).join(" ")}`
    .toLowerCase()
    .includes(search.toLowerCase().trim());
export const kitchenUrgent = (order: Order, target: number) =>
  /urgente/i.test(order.notes) ||
  (order.status !== "Listo" &&
    minutes(order.accepted || order.created) > target);
export const kitchenDuration = (order: Order) =>
  order.accepted && order.ready
    ? Math.max(
        0,
        Math.round(
          (Date.parse(order.ready) - Date.parse(order.accepted)) / 60000,
        ),
      )
    : 0;
export const kitchenDay = (date: string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const kitchenTime = (date?: string) =>
  date
    ? new Date(date).toLocaleTimeString("es-PE", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";
