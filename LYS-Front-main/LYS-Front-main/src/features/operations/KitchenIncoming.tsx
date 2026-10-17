import { useState } from "react";
import { Icon } from "./OperationsVisuals";
import { Empty } from "./OperationsUI";
import { minutes, type Order, type Status } from "./operationsStore";
import { KitchenChannel } from "./KitchenReferenceUI";
import { kitchenSearch, kitchenUrgent } from "./kitchenHelpers";

export function KitchenIncoming({
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
  const [sort, setSort] = useState("antiguos");

  const [status, setStatus] = useState("Todos");
  const active = orders.filter(
    (o) => !["Entregado", "Cancelado", "En camino"].includes(o.status),
  );
  const matchChannel = (o: Order, value: string) =>
    value === "Todos" ||
    (value === "Urgentes" ? kitchenUrgent(o, target) : o.channel === value);
  const matches = active
    .filter(
      (o) =>
        matchChannel(o, channel) &&
        (status === "Todos" || o.status === status) &&
        kitchenSearch(o, search),
    )
    .sort((a, b) =>
      sort === "recientes"
        ? b.created.localeCompare(a.created)
        : a.created.localeCompare(b.created),
    );
  return (
    <div className="kr-incoming-layout ops-reference-incoming">
      <div className="kr-incoming-main">
        <div className="kr-toolbar">
          <div className="kr-tabs">
            {["Todos", "Salón", "Delivery", "Recojo"].map((value) => (
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
                      : value === "Salón"
                        ? "table"
                        : value === "Delivery"
                          ? "scooter"
                          : "bag"
                  }
                />
                {value} ({active.filter((o) => matchChannel(o, value)).length})
              </button>
            ))}
          </div>
          <select
            aria-label="Orden de pedidos entrantes"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="antiguos">Más antiguos primero</option>
            <option value="recientes">Más recientes primero</option>
          </select>
          <button className="ops-primary" onClick={() => { setStatus("Todos"); setSearch(""); setChannel("Todos"); setSort("antiguos"); }}>
            <Icon name="filter" />
            Eliminar filtros
          </button>
        </div>
        <div className="ops-incoming-search">
          <label>
            <Icon name="search" />
            <input
              aria-label="Buscar pedidos entrantes"
              placeholder="Buscar pedido, cliente o producto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        {(
          <div className="kr-toolbar">
            <select
              aria-label="Estado de pedidos entrantes"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["Todos", "Recibido", "En preparación", "Listo"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

          </div>
        )}
        <div className="kr-incoming-grid">
          {matches.map((order) => (
            <article className="kr-incoming-card" key={order.id}>
              <div className="ops-incoming-reference">
                <strong>#{order.id}</strong>
                <KitchenChannel order={order} />
                <small>
                  <Icon name="clock" />
                  Hace {minutes(order.created)} min
                </small>
                <time>
                  {new Date(order.created).toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </time>
              </div>
              <div className="ops-incoming-products">
                {order.items.map((line, i) => (
                  <div key={`${line.product.id}-${i}`}>
                    <img src={line.product.image} alt="" />
                    <div>
                      <strong>
                        {line.count} × {line.product.name}
                      </strong>
                      <small>{line.product.description}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ops-incoming-actions">
                {order.notes && (
                  <p>
                    <Icon name="receipt" />
                    <span>
                      <strong>Nota del cliente</strong>
                      {order.notes}
                    </span>
                  </p>
                )}
                <button onClick={() => onDetail(order)}>
                  <Icon name="eye" />
                  Ver detalle
                </button>
                {order.status === "Recibido" ? (
                  <button
                    className="ops-primary"
                    onClick={() => onStatus(order.id, "En preparación")}
                  >
                    <Icon name="check" />
                    Aceptar pedido
                  </button>
                ) : order.status === "En preparación" ? (
                  <button
                    className="ops-primary"
                    aria-label="Marcar listo"
                    onClick={() => onStatus(order.id, "Listo")}
                  >
                    <Icon name="check" />
                    Marcar listo
                  </button>
                ) : (
                  <span className="ops-badge green"><Icon name="check"/>Listo para entregar</span>
                )}
              </div>
            </article>
          ))}
        </div>
        {!matches.length && (
          <Empty>No hay pedidos que coincidan con los filtros.</Empty>
        )}
      </div>
    </div>
  );
}
