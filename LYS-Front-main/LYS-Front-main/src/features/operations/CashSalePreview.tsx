import { useState } from "react";
import { categories, normalize } from "../carta/catalog";
import { useOperations, money } from "./operationsStore";
import { Icon, PaymentMark } from "./OperationsVisuals";
import { Panel, Empty } from "./OperationsUI";
import { OperationsDialog } from "./OperationsDialog";

export function CashSalePreview() {
  const state = useOperations();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [method, setMethod] = useState(state.settings.methods[0] || "Efectivo");
  const [customer, setCustomer] = useState("");
  const [channel, setChannel] = useState("Salón");
  const [review, setReview] = useState(false);
  const [feedback, setFeedback] = useState("");
  const products = state.products.filter(
    (product) =>
      product.active &&
      (product.stock ?? 0) > 0 &&
      (category === "todos" || product.category === category) &&
      normalize(`${product.name} ${product.description}`).includes(
        normalize(query),
      ),
  );
  const lines = state.products
    .filter((product) => cart[product.id])
    .map((product) => ({ product, count: cart[product.id] }));
  const total = lines.reduce(
    (sum, line) => sum + line.product.price * line.count,
    0,
  );
  function quantity(id: string, delta: number) {
    setFeedback("");
    setCart((previous) => {
      const next = { ...previous };
      const amount = Math.min(99, (next[id] || 0) + delta);
      if (amount < 1) delete next[id];
      else next[id] = amount;
      return next;
    });
  }
  return (
    <div className="prototype-operations">
      <p className="prototype-ops-preview">
        Vista previa de venta directa · arma un pedido y revisa su resumen.
      </p>
      {feedback && (
        <p className="ops-message" role="status">
          {feedback}
        </p>
      )}
      <div className="prototype-sale-layout">
        <Panel title="Productos">
          <div className="prototype-sale-filters">
            <label>
              Buscar producto
              <input
                type="search"
                placeholder="Buscar por nombre…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              Categoría
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="todos">Todas las categorías</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="prototype-sale-products">
            {products.map((product) => (
              <article key={product.id}>
                <img src={product.image} alt={product.name} loading="lazy" />
                <div>
                  <h3>{product.name}</h3>
                  <strong>{money(product.price)}</strong>
                </div>
                <button
                  className="ops-outline"
                  type="button"
                  aria-label={`Agregar ${product.name}`}
                  onClick={() => quantity(product.id, 1)}
                >
                  <Icon name="plus" />
                  Agregar
                </button>
              </article>
            ))}
            {!products.length && (
              <Empty>No hay productos con estos filtros.</Empty>
            )}
          </div>
        </Panel>
        <Panel
          title="Pedido actual"
          action={
            <button
              type="button"
              className="ops-outline"
              disabled={!lines.length}
              onClick={() => {
                setCart({});
                setFeedback("");
              }}
            >
              Vaciar
            </button>
          }
        >
          <div className="prototype-sale-order">
            <div className="prototype-sale-filters">
              <label>
                Cliente
                <input
                  placeholder="Consumidor final"
                  maxLength={100}
                  value={customer}
                  onChange={(event) => setCustomer(event.target.value)}
                />
              </label>
              <label>
                Modalidad
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                >
                  {["Salón", "Recojo", "Delivery"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            {lines.length ? (
              <ul className="prototype-sale-lines">
                {lines.map(({ product, count }) => (
                  <li key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <small>{money(product.price)} por unidad</small>
                    </div>
                    <div className="prototype-ops-quantity">
                      <button
                        type="button"
                        aria-label={`Reducir ${product.name}`}
                        onClick={() => quantity(product.id, -1)}
                      >
                        −
                      </button>
                      <output>{count}</output>
                      <button
                        type="button"
                        disabled={count === 99}
                        aria-label={`Aumentar ${product.name}`}
                        onClick={() => quantity(product.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <b>{money(product.price * count)}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Agrega productos para comenzar la venta.</Empty>
            )}
            <fieldset className="prototype-sale-methods">
              <legend>Método de pago</legend>
              <div>
                {state.settings.methods.map((item) => (
                  <label key={item} data-selected={method === item}>
                    <input
                      type="radio"
                      name="sale-payment"
                      value={item}
                      checked={method === item}
                      onChange={() => setMethod(item)}
                    />
                    <PaymentMark name={item} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="prototype-sale-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <button
              type="button"
              className="ops-primary prototype-sale-submit"
              disabled={
                !lines.length || !state.settings.methods.includes(method)
              }
              onClick={() => setReview(true)}
            >
              <Icon name="receipt" />
              Registrar venta
            </button>
          </div>
        </Panel>
      </div>
      {review && (
        <OperationsDialog
          title="Revisar venta"
          icon="receipt"
          onClose={() => setReview(false)}
        >
          <p className="prototype-ops-preview">
            Vista previa · no se realizará un cobro ni se registrará una venta.
          </p>
          <p>
            <strong>{customer.trim() || "Consumidor final"}</strong> · {channel}{" "}
            · {method}
          </p>
          <ul className="prototype-sale-lines">
            {lines.map((line) => (
              <li key={line.product.id}>
                <span>
                  {line.count} × {line.product.name}
                </span>
                <b>{money(line.count * line.product.price)}</b>
              </li>
            ))}
          </ul>
          <div className="prototype-sale-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <div className="prototype-ops-actions">
            <button
              className="ops-outline"
              type="button"
              onClick={() => setReview(false)}
            >
              Seguir editando
            </button>
            <button
              className="ops-primary"
              type="button"
              onClick={() => {
                setReview(false);
                setFeedback(
                  "Resumen de venta preparado para revisión · vista previa.",
                );
              }}
            >
              Finalizar vista previa
            </button>
          </div>
        </OperationsDialog>
      )}
    </div>
  );
}
