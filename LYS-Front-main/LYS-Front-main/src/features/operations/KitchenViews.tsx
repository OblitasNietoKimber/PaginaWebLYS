import { KitchenBoard } from "./KitchenBoard";
import { KitchenIncoming } from "./KitchenIncoming";
import { KitchenHistory } from "./KitchenHistory";
import { KitchenTimes } from "./KitchenTimes";
import { useState } from "react";
import {
  changeStatus,
  getOperations,
  minutes,
  seedKitchenPreview,
  useOperations,
  type Order,
  type Status,
} from "./operationsStore";
import { OrderDetail, Stats } from "./OperationsUI";
export function KitchenViews({
  section,
  notify,
  navigate,
}: {
  section: string;
  notify: (task: () => void) => void;
  navigate: (path: string) => void;
}) {
  const state = useOperations();
  const [detail, setDetail] = useState<Order | null>(null);
  const orders = state.orders.filter((o) => !o.draft);
  const current = orders.filter(
    (o) => !["Entregado", "Cancelado", "En camino"].includes(o.status),
  );
  const completed = orders.filter((o) => o.ready && o.accepted);
  const average = completed.length
    ? Math.round(
        completed.reduce(
          (sum, o) =>
            sum + (Date.parse(o.ready!) - Date.parse(o.accepted!)) / 60000,
          0,
        ) / completed.length,
      )
    : 0;
  const late = current.filter(
    (order) =>
      order.status !== "Listo" &&
      minutes(order.accepted || order.created) > state.settings.target,
  );
  const advance = (id: string, status: Status) =>
    notify(() => changeStatus(id, status));
  return (
    <>
      <div
        className={`anchor-kitchen-metrics anchor-kitchen-metrics-${section || "board"}`}
      >
        <Stats
          entries={
            section === "historial"
              ? [
                  {
                    label: "Preparados hoy",
                    value: orders.filter(
                      (o) =>
                        o.ready &&
                        new Date(o.created).toDateString() ===
                          new Date().toDateString(),
                    ).length,
                    icon: "clipboard",
                    tone: "green",
                  },
                  {
                    label: "Cancelados",
                    value: orders.filter((o) => o.status === "Cancelado")
                      .length,
                    icon: "close",
                    tone: "red",
                  },
                  {
                    label: "Tiempo promedio de preparación",
                    value: `${average} min`,
                    icon: "clock",
                    tone: "blue",
                  },
                  {
                    label: "% nivel de entrega",
                    value: `${orders.length ? Math.round((orders.filter((o) => o.status === "Entregado").length / orders.length) * 100) : 0}%`,
                    icon: "percent",
                    tone: "gold",
                  },
                ]
              : section === "tiempos"
                ? [
                    {
                      label: "Tiempo promedio",
                      value: `${average} min`,
                      icon: "clock",
                      tone: "red",
                      hint: "Desde inicio del turno",
                    },
                    {
                      label: "Dentro de meta",
                      value: `${completed.length ? Math.round((completed.filter((o) => (Date.parse(o.ready!) - Date.parse(o.accepted!)) / 60000 <= state.settings.target).length / completed.length) * 100) : 0}%`,
                      icon: "target",
                      tone: "green",
                      hint: "Pedidos a tiempo",
                    },
                    {
                      label: "Pedidos demorados",
                      value: late.length,
                      icon: "bell",
                      tone: "gold",
                      hint: "Requieren atención",
                    },
                    {
                      label: "Meta de preparación",
                      value: `${state.settings.target} min`,
                      icon: "clipboard",
                      tone: "blue",
                      hint: "Tiempo objetivo por pedido",
                    },
                  ]
                : section === "pedidos"
                  ? [
                      {
                        label: "Pedidos en espera",
                        value: orders.filter((o) => o.status === "Recibido")
                          .length,
                        icon: "receipt",
                        tone: "red",
                      },
                      {
                        label: "Tiempo en espera",
                        value: `${Math.round(current.filter((o) => o.status === "Recibido").reduce((s, o) => s + minutes(o.created), 0) / Math.max(1, current.filter((o) => o.status === "Recibido").length))} min`,
                        icon: "clock",
                        tone: "gold",
                      },
                      {
                        label: "En preparación",
                        value: orders.filter(
                          (o) => o.status === "En preparación",
                        ).length,
                        icon: "chef",
                        tone: "blue",
                      },
                      {
                        label: "Listos",
                        value: orders.filter((o) => o.status === "Listo")
                          .length,
                        icon: "check",
                        tone: "green",
                      },
                    ]
                  : [
                      {
                        label: "Nuevos",
                        value: orders.filter((o) => o.status === "Recibido")
                          .length,
                        icon: "receipt",
                        hint: "Pedidos por aceptar",
                      },
                      {
                        label: "En preparación",
                        value: orders.filter(
                          (o) => o.status === "En preparación",
                        ).length,
                        icon: "chef",
                        tone: "gold",
                        hint: "Pedidos en cocina",
                      },
                      {
                        label: "Listos",
                        value: orders.filter((o) =>
                          ["Listo", "En camino"].includes(o.status),
                        ).length,
                        icon: "check",
                        tone: "green",
                        hint: "Pedidos para entregar",
                      },
                      {
                        label: "Tiempo promedio",
                        value: `${average} min`,
                        icon: "clock",
                        tone: "blue",
                        hint: "Desde la aceptación",
                      },
                    ]
          }
        />
      </div>
      {section === "" ? (
        <KitchenBoard
          orders={orders}
          target={state.settings.target}
          onDetail={setDetail}
          onStatus={advance}
          navigate={navigate}
        />
      ) : section === "pedidos" ? (
        <KitchenIncoming
          orders={orders}
          target={state.settings.target}
          onDetail={setDetail}
          onStatus={advance}
        />
      ) : section === "historial" ? (
        <KitchenHistory orders={orders} onDetail={setDetail} />
      ) : (
        <KitchenTimes
          orders={orders}
          target={state.settings.target}
          onDetail={setDetail}
          onStatus={advance}
        />
      )}
      {section &&
        !orders.some((order) => order.customerId === "kitchen-preview") && (
          <div className="kr-demo">
            <button
              className="ops-outline"
              onClick={() => notify(seedKitchenPreview)}
            >
              Cargar muestra de cocina
            </button>
            <small>Pedidos de demostración guardados en este navegador.</small>
          </div>
        )}
      {detail && (
        <OrderDetail
          order={
            getOperations().orders.find((o) => o.id === detail.id) || detail
          }
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
