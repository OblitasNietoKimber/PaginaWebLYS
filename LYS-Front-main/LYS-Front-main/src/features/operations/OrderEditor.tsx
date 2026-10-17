import { useState } from "react";
import { OperationsDialog } from "./OperationsDialog";
import { editOrder, money, type Order } from "./operationsStore";

export function OrderEditor({
  order,
  onClose,
  notify,
}: {
  order: Order;
  onClose: () => void;
  notify: (task: () => void) => void;
}) {
  const [items, setItems] = useState(order.items.map((line) => ({ ...line })));
  const [notes, setNotes] = useState(order.notes);
  const [discount, setDiscount] = useState(order.discount);
  return (
    <OperationsDialog title={`Editar pedido #${order.id}`} onClose={onClose}>
      <form
        className="ops-form"
        onSubmit={(event) => {
          event.preventDefault();
          notify(() => {
            editOrder(
              order.id,
              items.filter((line) => line.count > 0),
              discount,
              notes,
            );
            onClose();
          });
        }}
      >
        <p>
          {order.customer} ·{" "}
          {order.table ? `Mesa ${order.table}` : order.channel}
        </p>
        {items.map((line) => (
          <label key={line.product.id}>
            {line.product.name} · {money(line.product.price)}
            <input
              type="number"
              min="0"
              max="99"
              step="1"
              required
              value={line.count}
              onChange={(event) =>
                setItems(
                  items.map((item) =>
                    item.product.id === line.product.id
                      ? { ...item, count: Number(event.target.value) }
                      : item,
                  ),
                )
              }
            />
          </label>
        ))}
        <label>
          Descuento (S/)
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={discount}
            onChange={(event) => setDiscount(Number(event.target.value))}
          />
        </label>
        <label>
          Notas para cocina
          <textarea
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <p className="ops-total">
          Total{" "}
          <strong>
            {money(
              items.reduce(
                (sum, line) => sum + line.count * line.product.price,
                0,
              ) -
                discount +
                order.shipping,
            )}
          </strong>
        </p>
        <footer className="ops-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="ops-primary">Guardar pedido</button>
        </footer>
      </form>
    </OperationsDialog>
  );
}
