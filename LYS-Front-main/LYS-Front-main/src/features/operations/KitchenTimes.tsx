import { useState } from "react";
import { OperationsTable } from "./OperationsTable";
import { Icon, ProductSummary } from "./OperationsVisuals";
import { Empty, Panel } from "./OperationsUI";
import { minutes, type Order, type Status } from "./operationsStore";
import { KitchenChannel, KitchenChart } from "./KitchenReferenceUI";
import { kitchenDay, kitchenDuration, kitchenSearch } from "./kitchenHelpers";

export function KitchenTimes({
  orders,
  target,
  onDetail,
  onStatus,
}: {
  orders: Order[];
  target: number;
  onDetail: (order: Order) => void;
  onStatus: (id: string, status: Status) => void;
}) {
  const [channel, setChannel] = useState("Todos");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("Hoy");
  const [allAlerts, setAllAlerts] = useState(false);
  const complete = orders.filter(
    (order) =>
      order.ready &&
      order.accepted &&
      (period === "Todos" ||
        kitchenDay(order.created) === kitchenDay(new Date().toISOString())),
  );
  const active = orders.filter((order) =>
    ["Recibido", "En preparación", "Listo"].includes(order.status),
  );
  const late = active.filter(
    (order) =>
      order.status !== "Listo" &&
      minutes(order.accepted || order.created) > target,
  );
  const ready = active.filter((order) => order.status === "Listo");
  const alerts = [...late, ...ready];
  const filtered = active.filter(
    (order) =>
      (channel === "Todos" || order.channel === channel) &&
      kitchenSearch(order, search),
  );
  const periodOrders = orders.filter(
    (o) =>
      o.status !== "Cancelado" &&
      Boolean(o.accepted) &&
      (period === "Todos" ||
        kitchenDay(o.created) === kitchenDay(new Date().toISOString())),
  );
  const lastHour = periodOrders.length
    ? Math.max(...periodOrders.map((o) => new Date(o.created).getHours()))
    : 21;
  const firstHour = Math.max(0, lastHour - 11);
  const hourly = Array.from({ length: 12 }, (_, index) => ({
    label: `${firstHour + index}h`,
    value: periodOrders.filter(
      (o) => new Date(o.created).getHours() === firstHour + index,
    ).length,
    preparing: periodOrders.filter(
      (o) => new Date(o.created).getHours() === firstHour + index && !o.ready,
    ).length,
  }));
  const productTimes = new Map<
    string,
    { label: string; image:string; total: number; count: number }
  >();
  complete.forEach((order) =>
    order.items.forEach((line) => {
      const entry = productTimes.get(line.product.id) || {
        label: line.product.name,
        image: line.product.image,
        total: 0,
        count: 0,
      };
      entry.total += kitchenDuration(order);
      entry.count++;
      productTimes.set(line.product.id, entry);
    }),
  );
  const categories = [...productTimes.values()]
    .map((p) => ({ label: p.label, image:p.image, value: Math.round(p.total / p.count) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  return (
    <div className="kr-times-layout">
      <div className="kr-time-panels">
        <Panel
          title="Pedidos por hora"
          action={
            <select
              aria-label="Periodo de los gráficos"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>Hoy</option>
              <option>Todos</option>
            </select>
          }
        >
          <div className="anchor-chart-key">
            <span>Completados</span>
            <span>En preparación</span>
          </div>
          <KitchenChart values={hourly} label="Pedidos procesados por hora" />
        </Panel>
        <Panel title="Tiempo por producto">
          <div
            className="ops-product-time-bars"
            aria-label="Tiempo promedio de preparación por producto"
          >
            {categories.map((p) => (
              <div key={p.label}>
                <span><img src={p.image} alt=""/>{p.label}</span>
                <progress
                  max={Math.max(target, ...categories.map((c) => c.value))}
                  value={p.value}
                  aria-label={p.label}
                  data-tone={
                    p.value > target
                      ? "red"
                      : p.value > target * 0.7
                        ? "orange"
                        : "green"
                  }
                />
                <strong>{p.value} min</strong>
              </div>
            ))}
            {!categories.length && (
              <Empty>
                Los tiempos aparecerán al completar la preparación de pedidos.
              </Empty>
            )}
          </div>
        </Panel>
        <Panel
          title="Pedidos con demora"
          action={
            <button
              className="ops-outline"
              onClick={() => setAllAlerts(!allAlerts)}
            >
              {allAlerts ? "Ver menos" : "Ver todas"}
              <Icon name="arrow" />
            </button>
          }
        >
          <div className="ops-delay-cards">
            {(allAlerts ? alerts : alerts.slice(0, 2)).map((order) => (
              <button
                className={`kr-alert ${order.status === "Listo" ? "blue" : minutes(order.accepted || order.created) > target * 1.5 ? "red" : "orange"}`}
                key={order.id}
                onClick={() => onDetail(order)}
              >
                <Icon name={order.status === "Listo" ? "serve" : "bell"} />
                <span>
                  <strong>
                    {order.status === "Listo"
                      ? `Pedido #${order.id} listo para entrega`
                      : order.table
                        ? `Mesa ${order.table} supera tiempo estimado`
                        : `Pedido #${order.id} retrasado`}
                  </strong>
                  <small>
                    {order.status === "Listo"
                      ? "Tiempo de preparación completado"
                      : `${minutes(order.accepted || order.created)} min transcurridos (est. ${target} min)`}
                  </small>
                </span>
                <b>
                  {order.status === "Listo"
                    ? `${minutes(order.ready || order.created)} min`
                    : `+${minutes(order.accepted || order.created) - target} min`}
                </b>
              </button>
            ))}
            {!alerts.length && (
              <Empty>Todos los pedidos están dentro de la meta.</Empty>
            )}
          </div>
        </Panel>
      </div>
      <Panel
        title="Pedidos en curso"
        action={
          <label className="kr-search">
            <Icon name="search" />
            <input
              aria-label="Buscar pedidos en curso"
              placeholder="Buscar pedido o producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        }
      >
        <div className="ops-time-filter-row">
        <div className="kr-tabs">
          {["Todos", "Delivery", "Salón", "Recojo"].map((value) => (
            <button
              key={value}
              aria-pressed={channel === value}
              className={channel === value ? "selected" : ""}
              onClick={() => setChannel(value)}
            >
              <Icon
                name={
                  value === "Todos"
                    ? "list"
                    : value === "Delivery"
                      ? "scooter"
                      : value === "Salón"
                        ? "table"
                        : "bag"
                }
              />
              {value} (
              {
                active.filter(
                  (order) => value === "Todos" || order.channel === value,
                ).length
              }
              )
            </button>
          ))}
        </div>
        <button className="ops-primary" onClick={()=>{setChannel("Todos");setSearch("");setPeriod("Hoy");}}>Eliminar filtros</button>
        </div>
        <div className="ops-table-wrap">
          <OperationsTable>
            <thead>
              <tr>
                {[
                  "N° pedido",
                  "Tipo",
                  "Mesa / Cliente",
                  "Producto",
                  "Tiempo transcurrido",
                  "Estado",
                  "Acciones",
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const elapsed = minutes(order.accepted || order.created);
                const ratio = Math.min(
                  100,
                  Math.round((elapsed / Math.max(1, target)) * 100),
                );
                const tone =
                  elapsed > target ? "red" : ratio >= 80 ? "orange" : "green";
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>
                      <KitchenChannel order={order} />
                    </td>
                    <td>
                      {order.table
                        ? `Mesa ${String(order.table).padStart(2, "0")}`
                        : order.customer}
                    </td>
                    <td>
                      <ProductSummary order={order} />
                    </td>
                    <td className={tone === "red" ? "kr-late" : ""}>
                      {elapsed} min
                    </td>
                    <td>
                      <span
                        className={`kr-status ${order.status === "Listo" ? "blue" : tone}`}
                      >
                        <Icon name={order.status === "Listo" ? "check" : tone === "red" ? "bell" : "clock"}/>
                        {order.status === "Listo"
                          ? "Listo"
                          : tone === "red"
                            ? "Retrasado"
                            : tone === "orange"
                              ? "Por vencer"
                              : "En tiempo"}
                      </span>
                    </td>
                    <td>
                      <div className="anchor-kitchen-time-actions">
                        <button
                          aria-label={order.status === "Listo" ? "Entregar" : order.status === "Recibido" ? "Aceptar pedido" : "Marcar listo"}
                          title={order.status === "Listo" ? "Entregar" : order.status === "Recibido" ? "Aceptar pedido" : "Marcar listo"}
                          className={
                            order.status === "Listo"
                              ? "ops-outline"
                              : "ops-green"
                          }
                          onClick={() =>
                            onStatus(
                              order.id,
                              order.status === "Listo"
                                ? "Entregado"
                                : order.status === "Recibido"
                                  ? "En preparación"
                                  : "Listo",
                            )
                          }
                        >
                          <Icon
                            name="check"
                          />
                          <span className="ops-time-action-label">{order.status === "Listo"
                            ? "Entregar"
                            : order.status === "Recibido"
                              ? "Aceptar pedido"
                              : "Marcar listo"}</span>
                        </button>
                        <button
                          className="ops-outline"
                          aria-label={`Ver pedido ${order.id}`}
                          onClick={() => onDetail(order)}
                        >
                          <Icon name="eye" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </OperationsTable>
        </div>
        {!filtered.length && <Empty>No hay pedidos para estos filtros.</Empty>}
      </Panel>
    </div>
  );
}
