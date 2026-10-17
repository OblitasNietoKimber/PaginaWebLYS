import { useOperations, money } from "./operationsStore";
import { Panel, LineChart, Empty } from "./OperationsUI";

export function HourlySales() {
  const data = useOperations();
  const today = new Date().toLocaleDateString("es-PE");
  const payments = data.payments.filter(
    (payment) =>
      !payment.refunded &&
      new Date(payment.date).toLocaleDateString("es-PE") === today,
  );
  const orders = data.orders.filter(
    (order) =>
      !order.draft &&
      order.status !== "Cancelado" &&
      new Date(order.created).toLocaleDateString("es-PE") === today,
  );
  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    value: payments
      .filter((payment) => new Date(payment.date).getHours() === hour)
      .reduce((sum, payment) => sum + payment.amount, 0),
  }));
  const peak = hourly
    .map((item, hour) => ({
      ...item,
      count: orders.filter(
        (order) => new Date(order.created).getHours() === hour,
      ).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  return (
    <div className="ops-split prototype-hourly">
      <Panel title="Ventas por hora">
        <LineChart values={hourly} />
        {!payments.length && (
          <p className="prototype-ops-caption">
            Todavía no hay cobros registrados hoy.
          </p>
        )}
      </Panel>
      <Panel title="Horas pico">
        {peak.length ? (
          <ol className="prototype-peak-list">
            {peak.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>
                  {item.count} {item.count === 1 ? "pedido" : "pedidos"}
                </span>
                <b>{money(item.value)}</b>
              </li>
            ))}
          </ol>
        ) : (
          <Empty>Las horas con más pedidos aparecerán aquí.</Empty>
        )}
        <p className="prototype-ops-caption">
          Actividad del día · ordenada por cantidad de pedidos.
        </p>
      </Panel>
    </div>
  );
}
