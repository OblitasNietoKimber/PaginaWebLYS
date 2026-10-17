import { iconFor } from "./operationsVisualNames";
import { dateText } from "./operationsFiles";
import type { ReactNode } from "react";
import { Icon, PaymentMark, type IconName } from "./OperationsVisuals";
import { OperationsDialog } from "./OperationsDialog";
import {
  money,
  minutes,
  orderTotal,
  type Order,
  type Status,
} from "./operationsStore";

export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const count = title.match(/\((\d+)\)$/)?.[1];
  const label = count ? title.replace(/\s*\(\d+\)$/, "") : title;
  const captions: Record<string, string> = {
    Nuevos: "Pedidos por confirmar",
    "En preparación": "Pedidos en cocina",
    "Listos para entregar": "Pedidos listos en pase",
    Completados: "Pedidos entregados",
    "Mapa del salón": "Estado en tiempo real de todas las mesas",
    "Pedidos recientes": "Últimos pedidos registrados en el sistema",
    "Lista de productos": "Gestiona los productos de tu carta.",
    "Roles y permisos":
      "Cada rol tiene permisos específicos dentro del sistema.",
    "Rendimiento de hoy": "Pedidos por hora en cocina",
    "Alertas de cocina": "Pedidos que requieren atención inmediata.",
    "Resumen del turno": "Información general del turno de caja",
    "Emitir comprobante": "Genera un comprobante desde un pedido.",
  };
  return (
    <section className="ops-panel" data-panel={label}>
      <header>
        <div className="ops-panel-title">
          <span className="ops-panel-icon">
            <Icon name={iconFor(label)} />
          </span>
          <div>
            <h2 aria-label={title}>{label}</h2>
            {captions[label] && <p>{captions[label]}</p>}
          </div>
        </div>
        {count && <span className="ops-panel-count">{count}</span>}
        {action}
      </header>
      {children}
    </section>
  );
}
export function Stats({
  entries,
}: {
  entries: {
    label: string;
    value: string | number;
    icon?: IconName;
    mobileIcon?: IconName;
    tone?: string;
    hint?: string;
  }[];
}) {
  return (
    <div className="ops-stats">
      {entries.map((item) => (
        <div className={`ops-stat ${item.tone || ""}`} key={item.label}>
          <span className="ops-stat-icon">
            <Icon name={item.icon || iconFor(item.label)} className={item.mobileIcon ? "ops-stat-desktop-icon" : undefined} />
            {item.mobileIcon && <Icon name={item.mobileIcon} className="ops-stat-mobile-icon" />}
          </span>
          <div>
            <p>{item.label}</p>
            <strong className={String(item.value).startsWith("S/") ? "ops-stat-money" : undefined}>{item.value}</strong>
            {item.hint && <small>{item.hint}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}
export function Badge({ value }: { value: string }) {
  const badgeIcon: IconName =
    value.startsWith("Mesa") || value === "Salón"
      ? "table"
      : value === "Delivery"
        ? "scooter"
        : [
              "Caja",
              "Administración",
              "Salón",
              "Cocina",
              "Delivery",
              "Combo",
              "Descuento",
              "Cupón",
            ].includes(value)
          ? iconFor(value)
          : "check";
  return (
    <span
      data-status={value} className={`ops-badge ${["Entregado", "Pagado", "Libre", "Activo", "En stock", "Emitido", "Coincide", "Cuadrado", "Caja abierta", "Entrada"].includes(value) ? "green" : ["En preparación", "Reservada", "Por vencer", "Pendiente", "Salida"].includes(value) || value.startsWith("Mesa") ? "gold" : ["Listo", "En camino", "Solicita cuenta", "Recibido"].includes(value) ? "blue" : ["Stock bajo", "Retrasado", "Error", "Reembolsado"].includes(value) ? "red" : "gray"}`}
    >
      {value.startsWith("Mesa") ||
      [
        "Delivery",
        "Salón",
        "Cocina",
        "Administración",
        "Caja",
        "Combo",
        "Descuento",
        "Cupón",
      ].includes(value) ? (
        <Icon name={badgeIcon} />
      ) : (
        <i className="ops-status-dot" />
      )}
      <span>{value}</span>
    </span>
  );
}
export function Empty({ children }: { children?: ReactNode }) {
  return (
    <p className="ops-empty">
      {children || "No hay registros para los filtros seleccionados."}
    </p>
  );
}
export function Tabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ops-tabs">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          className={value === option ? "selected" : ""}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {["Efectivo", "Yape", "Plin", "Tarjeta", "Transferencia"].includes(
            option,
          ) ? (
            <PaymentMark name={option} />
          ) : (
            <Icon name={iconFor(option)} />
          )}
          <span>{option}</span>
        </button>
      ))}
    </div>
  );
}
export function OrderCard({
  order,
  onDetail,
  onStatus,
  compact = false,
  target = 20,
}: {
  order: Order;
  onDetail: (order: Order) => void;
  onStatus?: (id: string, status: Status) => void;
  compact?: boolean;
  target?: number;
}) {
  const next =
    order.status === "Recibido"
      ? "En preparación"
      : order.status === "En preparación"
        ? "Listo"
        : order.status === "Listo" && order.channel === "Delivery"
          ? "En camino"
          : "Entregado";
  if (compact && order.status === "Entregado")
    return (
      <button className="ops-completed-row" onClick={() => onDetail(order)}>
        <span className="ops-completed-check">
          <Icon name="check" />
        </span>
        <span>
          <strong>#{order.id}</strong>
          <small>
            Entregado:{" "}
            {new Date(order.delivered || order.created).toLocaleTimeString(
              "es-PE",
              { hour: "2-digit", minute: "2-digit" },
            )}
          </small>
        </span>
        <span>
          <Badge value={order.table ? `Mesa ${order.table}` : order.channel} />
          <small>
            <Icon name="clock" />
            {order.accepted && order.ready
              ? Math.round(
                  (Date.parse(order.ready) - Date.parse(order.accepted)) /
                    60000,
                )
              : minutes(order.created)}{" "}
            min
          </small>
        </span>
        <Icon name="chevron" />
      </button>
    );
  return (
    <article
      className={`ops-order-card ${compact ? "compact" : ""}`}
      data-status={order.status}
    >
      <header>
        <strong>#{order.id}</strong>
        <Badge value={order.table ? `Mesa ${order.table}` : order.channel} />
      </header>
      <div className="ops-order-time">
        <span>
          <Icon name="clock" />
          {compact
            ? order.status === "Recibido"
              ? `Hace ${minutes(order.created)} min.`
              : `${order.status === "Listo" ? "Listo" : "Iniciado"}: ${new Date(order.status === "Listo" ? order.ready || order.created : order.accepted || order.created).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`
            : dateText(order.created)}
        </span>
        <strong>
          <Icon name="clock" />
          {minutes(order.accepted || order.created)} min
        </strong>
      </div>
      <div className="ops-order-products">
        <img src={order.items[0]?.product.image} alt="" />
        <div>
          {order.items.slice(0, 4).map((line) => (
            <p key={line.product.id}>
              {line.count} {line.product.name}
            </p>
          ))}
        </div>
      </div>
      {order.status === "En preparación" && (
        <div className="ops-order-progress">
          <progress
            max={100}
            value={Math.min(
              100,
              (minutes(order.accepted || order.created) / target) * 100,
            )}
          />
          <small>En preparación…</small>
        </div>
      )}
      <p className={order.notes ? "ops-order-note" : "ops-order-note neutral"}>
        <Icon name="receipt" />
        {order.notes || "Sin observaciones"}
      </p>
      <div className="ops-card-actions">
        {onStatus && !["Entregado", "Cancelado"].includes(order.status) && (
          <button
            className="ops-primary"
            onClick={() => onStatus(order.id, next)}
          >
            <Icon name={order.status === "Recibido" ? "check" : "serve"} />
            {order.status === "Recibido"
              ? "Aceptar pedido"
              : order.status === "En preparación"
                ? "Marcar listo"
                : order.status === "Listo" && order.channel === "Delivery"
                  ? "Iniciar entrega"
                  : "Marcar entregado"}
          </button>
        )}
        <button className="ops-outline" onClick={() => onDetail(order)}>
          <Icon name="receipt" /> Ver detalle
        </button>
      </div>
    </article>
  );
}
export function OrderDetail({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <OperationsDialog title={`Pedido #${order.id}`} onClose={onClose}>
      <Badge value={order.status} />
      <p>
        {order.customer} · {order.table ? `Mesa ${order.table}` : order.channel}
      </p>
      {order.address && <p>{order.address}</p>}
      <div className="ops-detail-lines">
        {order.items.map((line) => (
          <div key={line.product.id}>
            <img src={line.product.image} alt="" />
            <span>
              {line.count} {line.product.name}
            </span>
            <strong>{money(line.product.price * line.count)}</strong>
          </div>
        ))}
      </div>
      <p>{order.notes || "Sin observaciones"}</p>
      <h3>Total: {money(orderTotal(order))}</h3>
      <h3>Historial del pedido</h3>
      <ol>
        {order.history.map((event, index) => (
          <li key={index}>
            {event.status} · {dateText(event.date)}
          </li>
        ))}
      </ol>
    </OperationsDialog>
  );
}
export function Bars({
  values,
}: {
  values: { label: string; value: number; image?: string }[];
}) {
  const maximum = Math.max(1, ...values.map((v) => v.value));
  return (
    <div className="ops-bars">
      {values.map((item) => (
        <div key={item.label}>
          <span className="ops-bar-label">
            {item.image && <img src={item.image} alt="" />}
            {item.label}
          </span>
          <div>
            <i style={{ width: `${(item.value / maximum) * 100}%` }} />
          </div>
          <strong>{item.value.toFixed(0)}</strong>
        </div>
      ))}
    </div>
  );
}
export function LineChart({
  values,
}: {
  values: { label: string; value: number }[];
}) {
  const peak = Math.max(1, ...values.map((v) => v.value));
  const unit = 10 ** Math.floor(Math.log10(peak));
  const max = Math.ceil(peak / unit) * unit;
  const points = values
    .map(
      (v, i) =>
        `${75 + (i * 500) / Math.max(1, values.length - 1)},${180 - (v.value / max) * 150}`,
    )
    .join(" ");
  return (
    <div className="ops-chart">
      <svg
        viewBox="0 0 600 220"
        role="img"
        aria-label="Evolución de resultados"
      >
        <path d="M75 25V180H575" fill="none" stroke="#d9dfe8" />
        {[0, 1, 2, 3].map((step) => (
          <g key={step}>
            <path d={`M75 ${180 - step * 50}H575`} stroke="#e9edf3" />
            <text x="65" y={184 - step * 50} textAnchor="end" fontSize="11" fill="#526585">
              {`S/ ${new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(max * step / 3)}`}
            </text>
          </g>
        ))}
        <polygon points={`75,180 ${points} 575,180`} fill="#ff000011" />
        <polyline
          points={points}
          fill="none"
          stroke="#eb0017"
          strokeWidth="3"
        />
        {values.map((v, i) => (
          <g key={v.label}>
            <circle
              cx={75 + (i * 500) / Math.max(1, values.length - 1)}
              cy={180 - (v.value / max) * 150}
              r="4"
              fill="#fff"
              stroke="#eb0017"
              strokeWidth="2.5"
            />
            <text
              x={75 + (i * 500) / Math.max(1, values.length - 1)}
              y="207"
              textAnchor="middle"
              fontSize="11"
              fill="#63718c"
            >
              {values.length <= 10 ||
              i % Math.ceil(values.length / 8) === 0 ||
              i === values.length - 1
                ? v.label
                : ""}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
export function Donut({
  values,
}: {
  values: { label: string; value: number }[];
}) {
  const total = values.reduce((sum, v) => sum + v.value, 0);
  const colors = ["#bd1425", "#26394c", "#647584", "#8b672b", "#a5afb9"];
  return (
    <div className="ops-donut-layout">
      <div
        className="ops-donut"
        style={{
          background: `conic-gradient(${
            values
              .map((v, i) => {
                const start =
                  (values.slice(0, i).reduce((s, x) => s + x.value, 0) /
                    Math.max(1, total)) *
                  100;
                const end = start + (v.value / Math.max(1, total)) * 100;
                return `${colors[i % colors.length]} ${start}% ${end}%`;
              })
              .join(",") || "#eee 0% 100%"
          })`,
        }}
      >
        <div>
          <strong>{money(total)}</strong>
          <small>Total vendido</small>
        </div>
      </div>
      <div>
        {values.map((v, i) => (
          <p key={v.label}>
            <span style={{ color: colors[i % colors.length] }}>●</span>{" "}
            {v.label} <strong>{money(v.value)}</strong>
          </p>
        ))}
      </div>
    </div>
  );
}

export function ColumnChart({
  values,
}: {
  values: { label: string; value: number }[];
}) {
  const max = Math.max(
    4,
    Math.ceil(Math.max(0, ...values.map((v) => v.value)) / 4) * 4,
  );
  const step = 510 / Math.max(1, values.length);
  return (
    <div className="ops-chart ops-column-chart">
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label="Distribución por categoría u hora"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <path d={`M45 ${245 - i * 50}H580`} stroke="#e9edf3" />
            <text
              x="32"
              y={250 - i * 50}
              textAnchor="end"
              fontSize="14"
              fill="#74849e"
            >
              {Math.round((max * i) / 4)}
            </text>
          </g>
        ))}
        {values.map((v, i) => (
          <g
            key={
              values.length <= 12 || i % 2 === 0 || i === values.length - 1
                ? v.label
                : ""
            }
          >
            <rect
              x={52 + i * step}
              y={245 - (v.value / max) * 200}
              width={step * 0.65}
              height={(v.value / max) * 200}
              rx="3"
              fill={
                values.length > 5
                  ? "#c58721"
                  : ["#d79b25", "#ed0017", "#9b8b80", "#78859a"][i % 4]
              }
            />
            <text
              x={52 + i * step + step * 0.325}
              y="274"
              fontSize="13"
              textAnchor="middle"
              fill="#6a7b96"
            >
              {v.label}
            </text>
            {values.length <= 5 && (
              <text
                x={52 + i * step + step * 0.325}
                y={232 - (v.value / max) * 200}
                fontSize="15"
                textAnchor="middle"
                fill="#102044"
              >
                {Math.round(v.value)} min
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
