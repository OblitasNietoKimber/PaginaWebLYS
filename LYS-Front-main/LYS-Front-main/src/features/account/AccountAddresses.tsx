import { lazy, Suspense, useState } from "react";
import { Icon } from "../../components/Icon";
import { AddressAutocomplete } from "../checkout/AddressAutocomplete";
import { DistrictSelect } from "../checkout/DistrictSelect";
import { AddressLocation } from "./AddressLocation";
import { updateAccount, useAccount, type AccountAddress } from "./accountStore";
import { AccountDialog, AccountEmpty } from "./AccountShared";
import "../../styles/delivery-map.css";
const DeliveryMap = lazy(() =>
  import("../checkout/DeliveryMap").then((module) => ({
    default: module.DeliveryMap,
  })),
);
function AddressEditor({
  address,
  onClose,
}: {
  address: AccountAddress;
  onClose: () => void;
}) {
  const account = useAccount();
  const [draft, setDraft] = useState(address);
  return (
    <AccountDialog
      title={
        account.addresses.some((item) => item.id === address.id)
          ? "Editar dirección"
          : "Agregar dirección"
      }
      onClose={onClose}
    >
      <form
        className="account-form"
        onSubmit={(event) => {
          event.preventDefault();
          const first = !account.addresses.length;
          let addresses = account.addresses.filter(
            (item) => item.id !== draft.id,
          );
          if (draft.primary || first)
            addresses = addresses.map((item) => ({ ...item, primary: false }));
          addresses.push({ ...draft, primary: draft.primary || first });
          updateAccount({ addresses });
          onClose();
        }}
      >
        <div className="info-form-grid">
          <label>
            Nombre de la dirección
            <input
              required
              maxLength={40}
              value={draft.label}
              placeholder="Casa, Trabajo…"
              onChange={(event) =>
                setDraft({ ...draft, label: event.target.value })
              }
            />
          </label>
          <DistrictSelect
            value={draft.district}
            onChange={(district) =>
              setDraft({ ...draft, district, point: null })
            }
          />
        </div>
        <AddressAutocomplete
          label="Calle y número"
          value={draft.street}
          district={draft.district}
          onChange={(street) => setDraft({ ...draft, street, point: null })}
          onSelect={(result) =>
            setDraft({ ...draft, street: result.title, point: result.point })
          }
        />
        <label>
          Referencia
          <input
            required
            minLength={3}
            maxLength={200}
            value={draft.reference}
            placeholder="Frente al parque, puerta color…"
            onChange={(event) =>
              setDraft({ ...draft, reference: event.target.value })
            }
          />
        </label>
        <p>
          Selecciona el punto de entrega en el mapa. También puedes escribir la
          dirección manualmente.
        </p>
        <Suspense fallback={<p>Cargando mapa…</p>}>
          <DeliveryMap
            point={draft.point}
            onChange={(point) => setDraft({ ...draft, point })}
          />
        </Suspense>
        <label className="account-check">
          <input
            type="checkbox"
            checked={draft.primary}
            onChange={(event) =>
              setDraft({ ...draft, primary: event.target.checked })
            }
          />
          Usar como dirección principal
        </label>
        <button className="primary-button" type="submit">
          Guardar dirección <Icon name="check" />
        </button>
      </form>
    </AccountDialog>
  );
}
export function AccountAddresses() {
  const account = useAccount();
  const [editing, setEditing] = useState<AccountAddress | null>(null);
  const [deleting, setDeleting] = useState<AccountAddress | null>(null);
  function remove(address: AccountAddress) {
    const remaining = account.addresses.filter(
      (item) => item.id !== address.id,
    );
    if (address.primary && remaining[0])
      remaining[0] = { ...remaining[0], primary: true };
    updateAccount({ addresses: remaining });
    setDeleting(null);
  }
  return (
    <>
      <div className="account-actions-heading">
        <button
          className="primary-button"
          type="button"
          disabled={account.addresses.length >= 20}
          onClick={() =>
            setEditing({
              id: crypto.randomUUID(),
              label: "Casa",
              street: "",
              district: "Carabayllo",
              reference: "",
              primary: !account.addresses.length,
              point: null,
            })
          }
        >
          + Nueva dirección
        </button>
      </div>
      {!account.addresses.length && (
        <AccountEmpty
          title="Guarda tu primera dirección"
          description="Elige tu calle y ubica el punto de entrega para agilizar tus pedidos."
        />
      )}
      {account.addresses.map((address) => (
        <article className="info-card account-address" key={address.id}>
          <span className="info-icon-circle tone-blue">
            <Icon name="pin" />
          </span>
          <div className="account-address-copy">
            <h2>
              {address.label}{" "}
              {address.primary && (
                <span className="account-badge">Principal</span>
              )}
            </h2>
            <p>
              <Icon name="user" />
              {account.profile.name}
            </p>
            <p>
              <Icon name="home" />
              {address.street}, {address.district}
            </p>
            <p>
              <Icon name="receipt" />
              Referencia: {address.reference}
            </p>
            <p>
              <Icon name="phone" />
              {account.profile.phone || "Sin teléfono guardado"}
            </p>
            <div className="account-address-actions">
              {!address.primary && (
                <button
                  type="button"
                  className="info-button account-primary-address"
                  onClick={() =>
                    updateAccount({
                      addresses: account.addresses.map((item) => ({
                        ...item,
                        primary: item.id === address.id,
                      })),
                    })
                  }
                >
                  Establecer principal
                </button>
              )}
              <button
                type="button"
                className="info-button account-edit"
                onClick={() => setEditing(address)}
              >
                <Icon name="edit" />
                Editar
              </button>
              <button
                type="button"
                className="info-button danger"
                onClick={() => setDeleting(address)}
              >
                <Icon name="trash" />
                Eliminar
              </button>
            </div>
          </div>
          <AddressLocation address={address} />
        </article>
      ))}
      {editing && (
        <AddressEditor address={editing} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <AccountDialog
          title="Eliminar dirección"
          onClose={() => setDeleting(null)}
        >
          <p>¿Quieres eliminar la dirección {deleting.label}?</p>
          <div className="account-dialog-actions">
            <button
              type="button"
              className="info-button"
              onClick={() => setDeleting(null)}
            >
              Conservar dirección
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => remove(deleting)}
            >
              Eliminar dirección
            </button>
          </div>
        </AccountDialog>
      )}
    </>
  );
}
