import { useOperations } from "../operations/operationsStore";
import { useState } from "react";
import { Icon } from "../../components/Icon";
import { soles } from "../carta/catalog";
import { useCartStore } from "../carta/cartStore";
import { paymentNames } from "../checkout/useCheckout";
import {
  accountOrders,
  exampleOrders,
  orderActive,
  type AccountOrder,
} from "./orders";
import { AccountDialog, AccountEmpty } from "./AccountShared";
export function OrderStatus({ order }: { order: AccountOrder }) {
  return (
    <span
      className={`account-status status-${order.status === "Entregado" ? "green" : order.status === "Cancelado" ? "red" : "amber"}`}
    >
      <Icon
        name={
          order.status === "Entregado"
            ? "check"
            : order.status === "Cancelado"
              ? "close"
              : "clock"
        }
      />
      {order.status}
      {order.example ? " · ejemplo" : ""}
    </span>
  );
}
export function OrderProgress({ order }: { order: AccountOrder }) {
  const stage =
    order.status === "Entregado"
      ? 3
      : order.status === "En camino"
        ? 2
        : ["En preparación", "Listo"].includes(order.status)
          ? 1
          : 0;
  return (
    <ol
      className="account-order-progress"
      aria-label={`Estado: ${order.status}`}
    >
      {["Confirmado", "Preparando", "En camino", "Entregado"].map(
        (label, index) => (
          <li
            className={index <= stage ? "done" : ""}
            key={label}
            aria-current={index === stage ? "step" : undefined}
          >
            <span>{index < stage ? <Icon name="check" /> : null}</span>
            <small>{label}</small>
          </li>
        ),
      )}
    </ol>
  );
}
export function OrderDetail({
  order,
  onClose,
  onNavigate,
}: {
  order: AccountOrder;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const { setCart } = useCartStore();
  function reorder() {
    setCart((previous) => {
      const next = { ...previous };
      order.items.forEach((item) => {
        next[item.product.id] = Math.min(
          99,
          (next[item.product.id] || 0) + item.count,
        );
      });
      return next;
    });
    onClose();
    onNavigate("/carrito");
  }
  return (
    <AccountDialog title={`Pedido #${order.code}`} onClose={onClose}>
      <p className="account-demo-hint">
        {order.example
          ? "Pedido de ejemplo para explorar la interfaz."
          : "Pedido guardado en este navegador."}
      </p>
      <OrderStatus order={order} />
      {orderActive(order) && <OrderProgress order={order} />}
      <p>
        {paymentNames[order.method]} ·{" "}
        {order.delivery.mode === "pickup" ? "Recojo" : "Delivery"}
      </p>
      <div className="account-detail-items">
        {order.items.map((item) => (
          <div key={item.product.id}>
            <img src={item.product.image} alt="" />
            <span>
              {item.count} × {item.product.name}
            </span>
            <strong>{soles(item.count * item.product.price)}</strong>
          </div>
        ))}
      </div>
      <p>
        {order.delivery.address} {order.delivery.district}
      </p>
      <p>{order.delivery.reference}</p>
      <dl className="account-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{soles(order.subtotal)}</dd>
        </div>
        <div>
          <dt>Envío</dt>
          <dd>{soles(order.shipping)}</dd>
        </div>
        <div>
          <dt>Descuento</dt>
          <dd>− {soles(order.discount)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{soles(order.total)}</dd>
        </div>
      </dl>
      <button className="primary-button" onClick={reorder}>
        Volver a pedir <Icon name="cart" />
      </button>
    </AccountDialog>
  );
}
export function OrderList({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate: (path: string) => void;
}) {
  useOperations();
  const [examples, setExamples] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AccountOrder | null>(null);
  const { setCart } = useCartStore();
  const orders = examples ? exampleOrders() : accountOrders();
  const matches = (o: AccountOrder, value: string) =>
    value === "Todos" ||
    (value === "En curso"
      ? orderActive(o)
      : value === "Entregados"
        ? o.status === "Entregado"
        : o.status === "Cancelado");
  const shown = orders
    .filter(
      (o) =>
        matches(o, filter) &&
        o.code.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  function reorder(order: AccountOrder) {
    setCart((previous) => {
      const next = { ...previous };
      order.items.forEach((item) => {
        next[item.product.id] = Math.min(
          99,
          (next[item.product.id] || 0) + item.count,
        );
      });
      return next;
    });
    onNavigate("/carrito");
  }
  return (
    <section
      className={compact ? "info-card account-recent" : "account-orders"}
    >
      {compact ? (
        <div className="account-row-heading">
          <h2>Mis pedidos recientes</h2>
          <button
            className="account-text-button"
            onClick={() => onNavigate("/mi-cuenta/pedidos")}
          >
            Ver todos <Icon name="arrow" />
          </button>
        </div>
      ) : (
        <>
          <label className="account-order-search">
            <Icon name="search" />
            <input
              type="search"
              aria-label="Buscar por número de pedido"
              placeholder="Buscar por número de pedido…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="account-filter-tabs" aria-label="Filtrar pedidos">
            {["Todos", "En curso", "Entregados", "Cancelados"].map((value) => (
              <button
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value} ({orders.filter((o) => matches(o, value)).length})
              </button>
            ))}
          </div>
        </>
      )}
      {!shown.length ? (
        <AccountEmpty
          title={
            filter === "Todos" && !query
              ? "Tu historia con nosotros comienza aquí"
              : "No hay pedidos con este filtro"
          }
          description="Los pedidos que realices aparecerán en tu cuenta."
          action="Ver nuestra carta"
          onAction={() => onNavigate("/carta")}
        />
      ) : (
        <div className="account-order-list">
          {shown.slice(0, compact ? 2 : 50).map((order) => (
            <article className="info-card account-order" key={order.code}>
              <div className="account-order-description">
                <h3>#{order.code}</h3>
                <p>
                  {new Intl.DateTimeFormat("es-PE", {
                    dateStyle: "long",
                  }).format(new Date(order.date))}
                </p>
                {!compact && (
                  <p>
                    {order.delivery.mode === "pickup" ? "Recojo" : "Delivery"}
                  </p>
                )}
              </div>
              <OrderStatus order={order} />
              <img
                className="account-order-photo"
                src={order.items[0]?.product.image}
                alt={order.items[0]?.product.name || "Pedido"}
                loading="lazy"
              />
              <div className="account-order-products">
                <h3>{order.items[0]?.product.name}</h3>
                {order.items.map((item) => (
                  <p key={item.product.id}>
                    {item.count} × {item.product.name}
                  </p>
                ))}
              </div>
              <div className="account-order-total">
                <small>Total</small>
                <strong>{soles(order.total)}</strong>
              </div>
              <div className="account-order-actions">
                {!compact && orderActive(order) && (
                  <button
                    className="primary-button"
                    onClick={() => setSelected(order)}
                  >
                    <Icon name="truck" />
                    Seguir pedido
                  </button>
                )}
                <button
                  className="info-button account-view-detail"
                  onClick={() => setSelected(order)}
                >
                  <Icon name="eye" />
                  Ver detalle
                </button>
                {!compact && order.status === "Entregado" && (
                  <button
                    className="info-button account-reorder"
                    onClick={() => reorder(order)}
                  >
                    <Icon name="clock" />
                    Volver a pedir
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {!compact && (
        <label className="account-example-switch">
          <input
            type="checkbox"
            checked={examples}
            onChange={(e) => setExamples(e.target.checked)}
          />
          Ver pedidos de ejemplo para explorar la interfaz
        </label>
      )}
      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onNavigate={onNavigate}
        />
      )}
    </section>
  );
}
