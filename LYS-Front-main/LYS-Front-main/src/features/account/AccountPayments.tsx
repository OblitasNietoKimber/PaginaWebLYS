import { useState } from "react";
import { Icon } from "../../components/Icon";
import { updateAccount, useAccount, type SavedCard } from "./accountStore";
import { AccountDialog } from "./AccountShared";
import { paymentNames, type PaymentMethod } from "../checkout/useCheckout";
const methods: { id: PaymentMethod; image?: string }[] = [
  { id: "cash" },
  { id: "yape", image: "/images/checkout/yape.webp" },
  { id: "plin", image: "/images/checkout/plin.webp" },
];
export function AccountPayments() {
  const account = useAccount();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<SavedCard | null>(null);
  const [draft, setDraft] = useState({
    brand: "Visa",
    last4: "",
    holder: account.profile.name,
    expiry: "",
  });
  const [message, setMessage] = useState("");
  function save() {
    try {
      updateAccount({
        cards: [
          ...account.cards,
          { ...draft, id: crypto.randomUUID(), primary: !account.cards.length },
        ],
      });
      setAdding(false);
      setMessage("Referencia de tarjeta guardada.");
    } catch {
      setMessage(
        "No se pudo guardar la referencia. Revisa el espacio del navegador.",
      );
    }
  }
  return (
    <>
      <div className="account-actions-heading">
        <button
          className="primary-button"
          disabled={account.cards.length >= 10}
          onClick={() => {
            setDraft({
              brand: "Visa",
              last4: "",
              holder: account.profile.name,
              expiry: "",
            });
            setAdding(true);
          }}
        >
          + Agregar tarjeta
        </button>
      </div>
      <section className="account-saved-cards">
        <h2>Tarjetas guardadas</h2>
        {!account.cards.length && (
          <p>No tienes referencias de tarjeta guardadas.</p>
        )}
        {account.cards.map((card) => (
          <article className="info-card account-saved-card" key={card.id}>
            <span className="account-card-brand">
              {card.brand === "Visa" ? "VISA" : card.brand}
            </span>
            <div>
              <h3>
                {card.brand} terminada en {card.last4}
              </h3>
              <p>Titular: {card.holder}</p>
              <p>Vence: {card.expiry}</p>
              {card.primary && (
                <span className="account-badge">
                  <Icon name="star" />
                  Predeterminada
                </span>
              )}
            </div>
            <div className="account-card-actions">
              <button
                className="account-text-button danger"
                onClick={() => setRemoving(card)}
              >
                <Icon name="trash" />
                Eliminar
              </button>
              <button
                className="info-button"
                disabled={card.primary}
                onClick={() =>
                  updateAccount({
                    cards: account.cards.map((c) => ({
                      ...c,
                      primary: c.id === card.id,
                    })),
                    preferredPayment: "card",
                  })
                }
              >
                <Icon name="star" />
                Establecer predeterminada
              </button>
            </div>
          </article>
        ))}
      </section>
      <section className="account-other-payments">
        <h2>Otros métodos disponibles</h2>
        <p>Se eligen al confirmar tu pedido.</p>
        <div className="account-payment-options">
          {methods.map((method) => (
            <button
              className="info-card"
              key={method.id}
              aria-pressed={account.preferredPayment === method.id}
              onClick={() => {
                updateAccount({ preferredPayment: method.id });
                setMessage("Preferencia guardada.");
              }}
            >
              {method.image ? (
                <img src={method.image} alt="" />
              ) : (
                <Icon name="cash" />
              )}
              <span>
                <strong>{paymentNames[method.id]}</strong>
                <small>
                  {method.id === "cash"
                    ? "Paga en efectivo al recibir tu pedido."
                    : `Paga desde tu app ${paymentNames[method.id]}.`}
                </small>
              </span>
            </button>
          ))}
        </div>
      </section>
      <div className="account-payment-safety">
        <Icon name="lock" />
        <div>
          <strong>Tu información de pago</strong>
          <p>
            Solo guardamos la marca y los últimos cuatro dígitos. No ingreses el
            número completo, CVV ni códigos de pago.
          </p>
        </div>
      </div>
      {message && <p role="status">{message}</p>}
      {adding && (
        <AccountDialog title="Agregar tarjeta" onClose={() => setAdding(false)}>
          <form
            className="account-form"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <p>
              Guarda una referencia para identificarla. Esta aplicación no
              procesa ni almacena tarjetas bancarias.
            </p>
            <label>
              Marca
              <select
                value={draft.brand}
                onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
              >
                <option>Visa</option>
                <option>Mastercard</option>
                <option>Otra</option>
              </select>
            </label>
            <label>
              Titular
              <input
                required
                maxLength={100}
                value={draft.holder}
                onChange={(e) => setDraft({ ...draft, holder: e.target.value })}
              />
            </label>
            <div className="info-form-grid">
              <label>
                Últimos cuatro dígitos
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  value={draft.last4}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      last4: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </label>
              <label>
                Vencimiento (MM/AA)
                <input
                  required
                  pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                  placeholder="08/28"
                  maxLength={5}
                  value={draft.expiry}
                  onChange={(e) =>
                    setDraft({ ...draft, expiry: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="account-dialog-actions">
              <button
                className="info-button"
                type="button"
                onClick={() => setAdding(false)}
              >
                Cancelar
              </button>
              <button className="primary-button" type="submit">
                Guardar tarjeta
              </button>
            </div>
          </form>
        </AccountDialog>
      )}
      {removing && (
        <AccountDialog
          title="Eliminar tarjeta"
          onClose={() => setRemoving(null)}
        >
          <p>¿Eliminar la referencia terminada en {removing.last4}?</p>
          <div className="account-dialog-actions">
            <button className="info-button" onClick={() => setRemoving(null)}>
              Cancelar
            </button>
            <button
              className="primary-button"
              onClick={() => {
                const cards = account.cards.filter((c) => c.id !== removing.id);
                if (removing.primary && cards[0])
                  cards[0] = { ...cards[0], primary: true };
                updateAccount({ cards });
                setRemoving(null);
              }}
            >
              Eliminar
            </button>
          </div>
        </AccountDialog>
      )}
    </>
  );
}
