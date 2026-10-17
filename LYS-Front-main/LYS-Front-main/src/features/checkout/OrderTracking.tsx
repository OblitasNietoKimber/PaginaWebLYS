import { useState } from "react";
import { Icon } from "../../components/Icon";
import { PreviewDialog } from "../../components/PreviewDialog";
import "../../styles/prototype-customer.css";

const stages = [
  "Recibido",
  "En preparación",
  "Listo",
  "En camino",
  "Entregado",
];
export function OrderTimeline({
  status,
  pickup = false,
}: {
  status: string;
  pickup?: boolean;
}) {
  const labels = pickup
    ? stages.filter((stage) => stage !== "En camino")
    : stages;
  const normalized = status === "Registrado" ? "Recibido" : status;
  const current = labels.indexOf(normalized);
  return (
    <ol
      className="prototype-order-timeline"
      style={{
        gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))`,
      }}
      aria-label={`Estado del pedido: ${normalized}`}
    >
      {labels.map((label, index) => (
        <li
          key={label}
          data-done={index <= current}
          aria-current={index === current ? "step" : undefined}
        >
          <span>{index < current ? <Icon name="check" /> : index + 1}</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>
  );
}
export function OrderTracking({
  status,
  code,
  history = [],
  pickup = false,
}: {
  status: string;
  code: string;
  history?: { status: string; date: string }[];
  pickup?: boolean;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [reason, setReason] = useState("");
  const normalized = status === "Registrado" ? "Recibido" : status;
  const notices = history.length ? history : [{ status: normalized, date: "" }];
  return (
    <section
      className="prototype-tracking"
      aria-label="Seguimiento de tu pedido"
    >
      <div className="prototype-section-heading">
        <div>
          <h2>Seguimiento de tu pedido</h2>
          <p>Pedido #{code}</p>
        </div>
        <Icon name="truck" />
      </div>
      <OrderTimeline status={status} pickup={pickup} />
      <div className="prototype-tracking-grid">
        <section>
          <h3>Estado actual</h3>
          <strong className="prototype-current-status">{normalized}</strong>
          <p>
            {normalized === "Recibido"
              ? "Recibimos tu pedido. Pronto comenzaremos a prepararlo."
              : normalized === "En preparación"
                ? "Estamos preparando tu pedido con todo el sabor de nuestras brasas."
                : normalized === "Listo"
                  ? pickup
                    ? "Tu pedido está listo para recoger en el local."
                    : "Tu pedido está listo y a la espera del reparto."
                  : normalized === "En camino"
                    ? "Tu pedido está en camino a tu dirección."
                    : normalized === "Cancelado"
                      ? "Este pedido fue cancelado."
                      : "¡Gracias por elegir Leñas y Sabores!"}
          </p>
        </section>
        <section>
          <h3>Notificaciones del pedido</h3>
          <ul className="prototype-tracking-notices">
            {[...notices].reverse().map((event, index) => (
              <li key={`${event.status}-${index}`}>
                <Icon name="check" />
                <div>
                  <strong>{event.status}</strong>
                  {event.date && (
                    <small>
                      {new Date(event.date).toLocaleString("es-PE", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {requested ? (
        <p className="prototype-preview-feedback" role="status">
          Solicitud de cancelación preparada · vista previa.
        </p>
      ) : ["Recibido", "Registrado"].includes(status) ? (
        <button
          type="button"
          className="checkout-outline prototype-cancel-order"
          onClick={() => setCancelOpen(true)}
        >
          Cancelar pedido
        </button>
      ) : null}
      {cancelOpen && (
        <PreviewDialog
          title="Cancelar pedido"
          onClose={() => setCancelOpen(false)}
        >
          <p>¿Deseas cancelar el pedido #{code}?</p>
          <label className="prototype-notes">
            Motivo (opcional)
            <textarea
              rows={3}
              maxLength={240}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Cuéntanos por qué deseas cancelar"
            />
          </label>
          <p className="prototype-preview-label">
            Vista previa de la solicitud. El pedido conservará su estado.
          </p>
          <div className="prototype-dialog-actions">
            <button
              type="button"
              className="checkout-outline"
              onClick={() => setCancelOpen(false)}
            >
              Conservar pedido
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setRequested(true);
                setCancelOpen(false);
              }}
            >
              Confirmar cancelación
            </button>
          </div>
        </PreviewDialog>
      )}
    </section>
  );
}
