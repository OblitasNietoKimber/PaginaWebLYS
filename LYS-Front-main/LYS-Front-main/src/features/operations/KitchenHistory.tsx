import { useState } from "react";
import { OperationsTable } from "./OperationsTable";
import { Icon, ProductSummary } from "./OperationsVisuals";
import { Empty, Badge } from "./OperationsUI";
import { downloadExcel } from "./operationsFiles";
import type { Order } from "./operationsStore";
import { KitchenChannel } from "./KitchenReferenceUI";
import {
  kitchenDay,
  kitchenDuration,
  kitchenSearch,
  kitchenTime,
} from "./kitchenHelpers";
export function KitchenHistory({
  orders,
  onDetail,
}: {
  orders: Order[];
  onDetail: (order: Order) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [channel, setChannel] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [search, setSearch] = useState("");
  const history = orders.filter((o) =>
    ["Entregado", "Cancelado"].includes(o.status),
  );
  const filtered = history
    .filter(
      (o) =>
        (!from || kitchenDay(o.created) >= from) &&
        (!to || kitchenDay(o.created) <= to) &&
        (channel === "Todos" || o.channel === channel) &&
        (status === "Todos" || o.status === status) &&
        kitchenSearch(o, search),
    )
    .sort((a, b) => b.created.localeCompare(a.created));
  const exportHistory = () =>
    downloadExcel(
      "historial-cocina",
      [
        "Pedido",
        "Canal",
        "Cliente",
        "Productos",
        "Recibido",
        "Listo",
        "Tiempo",
        "Estado",
      ],
      filtered.map((o) => [
        o.id,
        o.channel,
        o.customer,
        o.items.map((i) => `${i.count} ${i.product.name}`).join(" + "),
        o.created,
        o.ready || "",
        kitchenDuration(o),
        o.status,
      ]),
    );
  return (
    <div className="anchor-kitchen-history">
      <div className="ops-admin-filter-bar">
        <div className="ops-admin-search">
          <Icon name="search" />
          <input
            aria-label="Buscar historial"
            placeholder="Buscar por número de pedido, cliente o producto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label>
          Fecha desde
          <input
            aria-label="Desde fecha del historial"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Fecha hasta
          <input
            aria-label="Hasta fecha del historial"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label>
          Canal
          <select
            aria-label="Tipo o estado del historial"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            {["Todos", "Delivery", "Salón", "Recojo"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            aria-label="Estado del historial"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["Todos", "Entregado", "Cancelado"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button type="button" className="ops-btn-export" onClick={exportHistory} aria-label="Exportar historial">
          <Icon name="download" data-ops-action="export"/>
          Exportar
        </button>
        <button
          type="button"
          className="ops-btn-clear-filters"
          onClick={() => {
            setSearch("");
            setFrom("");
            setTo("");
            setChannel("Todos");
            setStatus("Todos");
          }}
        >
          <Icon name="trash" />
          Eliminar filtros
        </button>
      </div>
      <nav
        className="anchor-history-tabs"
        aria-label="Estado de pedidos del historial"
      >
        {[
          ["Todos", "Todos"],
          ["Entregado", "Entregados"],
          ["Cancelado", "Cancelados"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
          >
            {label} (
            {value === "Todos"
              ? history.length
              : history.filter((o) => o.status === value).length}
            )
          </button>
        ))}
      </nav>
      <div className="ops-table-wrap anchor-history-table">
        <OperationsTable>
          <thead>
            <tr>
              {[
                "N° pedido",
                "Canal",
                "Producto",
                "Recibido",
                "Listo",
                "Tiempo",
                "Estado",
                "Acciones",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>
                  <strong>#{o.id}</strong>
                </td>
                <td>
                  <KitchenChannel order={o} />
                </td>
                <td>
                  <ProductSummary order={o} />
                </td>
                <td>
                  {kitchenTime(o.created)}
                  <small>{kitchenDay(o.created)}</small>
                </td>
                <td>{kitchenTime(o.ready)}</td>
                <td>
                  {o.ready && o.accepted ? `${kitchenDuration(o)} min` : "—"}
                </td>
                <td>
                  <Badge value={o.status} />
                </td>
                <td>
                  <button
                    className="ops-outline anchor-view-button"
                    aria-label={`Ver detalle de pedido #${o.id}`}
                    onClick={() => onDetail(o)}
                  >
                    <Icon name="eye" />
                    <span>Ver</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </OperationsTable>
      </div>
      <div className="anchor-history-mobile">
        {filtered.map((o) => (
          <article key={o.id}>
            <header>
              <strong>#{o.id}</strong>
              <KitchenChannel order={o} />
              <Badge value={o.status} />
            </header>
            <div className="anchor-history-lines">
              {o.items.map((i) => (
                <p key={i.product.id}>
                  {i.count} × {i.product.name}
                </p>
              ))}
            </div>
            <footer>
              <span>
                Recibido <b>{kitchenTime(o.created)}</b>
              </span>
              <span>
                Listo <b>{kitchenTime(o.ready)}</b>
              </span>
              <span>
                Tiempo{" "}
                <b>
                  {o.ready && o.accepted ? `${kitchenDuration(o)} min` : "—"}
                </b>
              </span>
              <button className="ops-outline" onClick={() => onDetail(o)}>
                <Icon name="eye" />
                Ver
              </button>
            </footer>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty>No hay pedidos para este rango y filtros.</Empty>
      )}
      <p className="anchor-record-count">
        Mostrando {filtered.length} de {history.length} pedidos
      </p>
    </div>
  );
}
