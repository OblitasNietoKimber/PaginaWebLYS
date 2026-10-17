import { useState } from "react";
import { useOperations, orderTotal, money } from "./operationsStore";
import { Panel, Stats, LineChart, Donut, Bars, Empty } from "./OperationsUI";
import { OperationsTable } from "./OperationsTable";
import { localDateKey, dateText, downloadExcel } from "./operationsFiles";
import { Icon } from "./OperationsVisuals";

type Filters = { from: string; to: string; product: string; channel: string };
function recent(days: number): Filters {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days + 1);
  return {
    from: localDateKey(from.toISOString()),
    to: localDateKey(to.toISOString()),
    product: "",
    channel: "",
  };
}
export function SalesReports() {
  const data = useOperations();
  const [draft, setDraft] = useState<Filters>(() => recent(30));
  const [applied, setApplied] = useState(draft);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const rows = data.orders.filter(
    (order) =>
      !order.draft &&
      order.status !== "Cancelado" &&
      (!applied.from || localDateKey(order.created) >= applied.from) &&
      (!applied.to || localDateKey(order.created) <= applied.to) &&
      (!applied.product ||
        order.items.some((line) => line.product.id === applied.product)) &&
      (!applied.channel || order.channel === applied.channel),
  );
  const payments = data.payments.filter(
    (payment) =>
      !payment.refunded &&
      (!applied.from || localDateKey(payment.date) >= applied.from) &&
      (!applied.to || localDateKey(payment.date) <= applied.to) &&
      rows.some((order) => order.id === payment.orderId),
  );
  const sales = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalsByDate = new Map<string, number>();
  for (const payment of payments) {
    const date = localDateKey(payment.date);
    totalsByDate.set(date, (totalsByDate.get(date) || 0) + payment.amount);
  }
  const startDate = new Date(
    (applied.from ||
      [...totalsByDate.keys()].sort()[0] ||
      localDateKey(new Date().toISOString())) + "T12:00:00",
  );
  const endDate = new Date(
    (applied.to || localDateKey(new Date().toISOString())) + "T12:00:00",
  );
  const dayCount = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1,
  );
  const stride = Math.max(1, Math.ceil(dayCount / 30));
  const daily = Array.from(
    { length: Math.ceil(dayCount / stride) },
    (_, index) => {
      const start = new Date(startDate);
      start.setDate(start.getDate() + index * stride);
      const end = new Date(start);
      end.setDate(end.getDate() + stride);
      const from = localDateKey(start.toISOString());
      const to = localDateKey(end.toISOString());
      return {
        label: start.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "short",
        }),
        value: [...totalsByDate]
          .filter(([date]) => date >= from && date < to)
          .reduce((sum, [, value]) => sum + value, 0),
      };
    },
  );
  const visiblePage = Math.min(page, Math.max(1, Math.ceil(rows.length / 10)));
  const patch = (key: keyof Filters, value: string) =>
    setDraft((previous) => ({ ...previous, [key]: value }));
  return (
    <div className="prototype-operations">
      <Panel title="Filtros del reporte">
        <form
          className="prototype-report-filters"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.from && draft.to && draft.from > draft.to) {
              setError("La fecha inicial debe ser anterior a la fecha final.");
              return;
            }
            setError("");
            setApplied(draft);
            setPage(1);
          }}
        >
          <label>
            Desde
            <input
              type="date"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(event) => patch("from", event.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(event) => patch("to", event.target.value)}
            />
          </label>
          <label>
            Producto
            <select
              aria-label="Producto"
              value={draft.product}
              onChange={(event) => patch("product", event.target.value)}
            >
              <option value="">Todos los productos</option>
              {data.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Modalidad
            <select
              aria-label="Modalidad"
              value={draft.channel}
              onChange={(event) => patch("channel", event.target.value)}
            >
              <option value="">Todas las modalidades</option>
              {["Salón", "Delivery", "Recojo"].map((channel) => (
                <option key={channel}>{channel}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="ops-primary">
            <Icon name="filter" />
            Aplicar filtros
          </button>
          <button
            type="button"
            className="ops-outline"
            onClick={() => {
              const next = recent(30);
              setDraft(next);
              setApplied(next);
              setPage(1);
              setError("");
            }}
          >
            Restablecer
          </button>
        </form>
        {error && (
          <p role="alert" className="ops-message error">
            {error}
          </p>
        )}
        <div className="prototype-report-presets">
          {[7, 30, 90].map((days) => (
            <button
              type="button"
              className="ops-outline"
              key={days}
              onClick={() => {
                const next = recent(days);
                setDraft(next);
                setApplied(next);
                setPage(1);
                setError("");
              }}
            >
              Últimos {days} días
            </button>
          ))}
        </div>
      </Panel>
      <p className="prototype-ops-caption" role="status">
        {rows.length} pedidos · {applied.from || "Desde el inicio"} —{" "}
        {applied.to || "Hasta hoy"}
        {applied.product &&
          ` · ${data.products.find((product) => product.id === applied.product)?.name}`}
        {applied.channel && ` · ${applied.channel}`}
      </p>
      <Stats
        entries={[
          {
            label: "Ventas totales",
            value: money(sales),
            icon: "chart",
            tone: "green",
            hint: "Cobros de los pedidos filtrados",
          },
          {
            label: "Pedidos realizados",
            value: rows.length,
            icon: "cart",
            tone: "red",
          },
          {
            label: "Ticket promedio",
            value: money(
              payments.length
                ? sales /
                    new Set(payments.map((payment) => payment.orderId)).size
                : 0,
            ),
            icon: "tag",
            tone: "blue",
          },
        ]}
      />
      <div className="ops-split">
        <Panel title="Ventas por periodo">
          {daily.length ? (
            <LineChart values={daily} />
          ) : (
            <Empty>No hay cobros para los filtros seleccionados.</Empty>
          )}
        </Panel>
        <Panel title="Ventas por modalidad">
          <Donut
            values={["Salón", "Delivery", "Recojo"].map((label) => ({
              label,
              value: payments
                .filter((payment) =>
                  rows.some(
                    (order) =>
                      order.id === payment.orderId && order.channel === label,
                  ),
                )
                .reduce((sum, payment) => sum + payment.amount, 0),
            }))}
          />
        </Panel>
      </div>
      <div className="ops-split">
        <Panel title="Métodos de pago">
          <Bars
            values={data.settings.methods.map((label) => ({
              label,
              value: payments
                .filter((payment) => payment.method === label)
                .reduce((sum, payment) => sum + payment.amount, 0),
            }))}
          />
        </Panel>
        <Panel title="Productos más vendidos">
          <Bars
            values={data.products
              .filter(
                (product) => !applied.product || product.id === applied.product,
              )
              .map((product) => ({
                label: product.name,
                image: product.image,
                value: rows
                  .flatMap((order) => order.items)
                  .filter((line) => line.product.id === product.id)
                  .reduce((sum, line) => sum + line.count, 0),
              }))
              .filter((item) => item.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)}
          />
          {!rows.length && (
            <Empty>No hay productos vendidos en este periodo.</Empty>
          )}
        </Panel>
      </div>
      <Panel
        title="Detalle de resultados"
        action={
          <button
            type="button"
            className="ops-outline"
            disabled={!rows.length}
            onClick={() =>
              downloadExcel(
                "reporte-ventas",
                ["Pedido", "Fecha", "Cliente", "Modalidad", "Total", "Estado"],
                rows.map((order) => [
                  order.id,
                  dateText(order.created),
                  order.customer,
                  order.channel,
                  orderTotal(order),
                  order.status,
                ]),
              )
            }
          >
            <Icon name="download" />
            Exportar reporte
          </button>
        }
      >
        <div className="ops-table-wrap">
          <OperationsTable>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Modalidad</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .slice((visiblePage - 1) * 10, visiblePage * 10)
                .map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{dateText(order.created)}</td>
                    <td>{order.customer}</td>
                    <td>{order.channel}</td>
                    <td>{money(orderTotal(order))}</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
            </tbody>
          </OperationsTable>
        </div>
        {!rows.length && <Empty>No hay resultados con estos filtros.</Empty>}
        <div className="prototype-ops-actions">
          <span>
            Página {visiblePage} de {Math.max(1, Math.ceil(rows.length / 10))}
          </span>
          <button
            type="button"
            className="ops-outline"
            disabled={visiblePage <= 1}
            onClick={() => setPage(visiblePage - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            className="ops-outline"
            disabled={visiblePage * 10 >= rows.length}
            onClick={() => setPage(visiblePage + 1)}
          >
            Siguiente
          </button>
        </div>
      </Panel>
    </div>
  );
}
