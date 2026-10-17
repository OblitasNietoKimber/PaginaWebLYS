import { useRef, useState } from "react";
import { changeLocalPassword } from "../../services/localAuth";
import { profilePhoto } from "../../services/profilePhoto";
import { Icon } from "../../components/Icon";
import { resetAccount, updateAccount, useAccount } from "./accountStore";
import { AccountDialog } from "./AccountShared";
export function AccountProfileForm({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const account = useAccount();
  const [draft, setDraft] = useState(account.profile);
  const [first, setFirst] = useState(
    account.profile.name.split(/\s+/)[0] || "",
  );
  const [last, setLast] = useState(
    account.profile.name.split(/\s+/).slice(1).join(" "),
  );
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState("");
  const [previous, setPrevious] = useState("");
  const [next, setNext] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  function cancel() {
    setDraft(account.profile);
    setFirst(account.profile.name.split(/\s+/)[0] || "");
    setLast(account.profile.name.split(/\s+/).slice(1).join(" "));
    setMessage("Cambios descartados.");
  }
  return (
    <>
      <form
        className="account-form info-card account-profile-fields"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            updateAccount({
              profile: {
                ...draft,
                name: `${first.trim()} ${last.trim()}`.trim(),
              },
            });
            setMessage("Datos guardados en este navegador.");
          } catch (err) {
            setMessage(
              err instanceof Error ? err.message : "No se pudo guardar.",
            );
          }
        }}
      >
        <div className="account-photo-editor">
          <div>
            <h1>Mis datos</h1>
            <p>Actualiza tu información personal.</p>
          </div>
          <h3>Foto de perfil</h3>
          <div className="account-photo-controls">
            <span className="account-avatar">
              {draft.photo ? (
                <img src={draft.photo} alt="Foto de perfil" />
              ) : (
                first[0]?.toUpperCase() || <Icon name="user" />
              )}
            </span>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              aria-label="Foto de perfil"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file)
                  void profilePhoto(file)
                    .then((photo) => setDraft((d) => ({ ...d, photo })))
                    .catch((err) => setMessage(err.message));
              }}
            />
            <button
              className="info-button"
              type="button"
              onClick={() => fileInput.current?.click()}
            >
              <Icon name="camera" />
              Cambiar foto
            </button>
          </div>
        </div>
        <h3>Información personal</h3>
        <div className="info-form-grid account-personal-grid">
          <label>
            Nombre
            <input
              required
              minLength={2}
              maxLength={60}
              autoComplete="given-name"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </label>
          <label>
            Apellidos
            <input
              maxLength={80}
              autoComplete="family-name"
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </label>
          <label className="account-email-field">
            Correo electrónico
            <input
              required
              type="email"
              maxLength={120}
              autoComplete="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </label>
          <label className="account-phone-field">
            Celular
            <input
              type="tel"
              inputMode="numeric"
              required
              pattern="9[0-9]{8}"
              maxLength={9}
              autoComplete="tel-national"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </label>
          <label>
            Tipo de documento
            <select
              value={draft.documentType}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  documentType: e.target.value,
                  document: "",
                })
              }
            >
              <option>DNI</option>
              <option>CE</option>
              <option>Pasaporte</option>
            </select>
          </label>
          <label>
            Número de documento
            <input
              inputMode={draft.documentType === "DNI" ? "numeric" : "text"}
              pattern={
                draft.documentType === "DNI" ? "[0-9]{8}" : "[A-Za-z0-9]{6,12}"
              }
              maxLength={12}
              value={draft.document}
              onChange={(e) => setDraft({ ...draft, document: e.target.value })}
            />
          </label>
        </div>
        <div className="account-form-actions">
          <button className="primary-button" type="submit">
            Guardar cambios
          </button>
          <button className="info-button danger" type="button" onClick={cancel}>
            Cancelar
          </button>
        </div>
        <details className="account-additional">
          <summary>Información adicional (opcional)</summary>
          <div className="info-form-grid">
            <label>
              Fecha de nacimiento
              <input
                type="date"
                max={new Date().toLocaleDateString("en-CA")}
                value={draft.birthday}
                onChange={(e) =>
                  setDraft({ ...draft, birthday: e.target.value })
                }
              />
            </label>
            <label>
              Género
              <select
                value={draft.gender}
                onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
              >
                <option value="">Prefiero no indicarlo</option>
                <option>Femenino</option>
                <option>Masculino</option>
                <option>Otro</option>
              </select>
            </label>
          </div>
          <label>
            Observaciones
            <textarea
              rows={3}
              maxLength={500}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </label>
          <button
            className="account-text-button"
            type="button"
            onClick={() => onNavigate("/mi-cuenta/notificaciones")}
          >
            Preferencias de comunicación
          </button>
          <button
            className="account-text-button danger"
            type="button"
            onClick={() => setDialog("Restablecer datos")}
          >
            Restablecer datos locales
          </button>
        </details>
      </form>
      <section className="info-card account-security">
        <h2>Seguridad</h2>
        <div>
          <label>
            Contraseña
            <input
              type="password"
              value="**********"
              readOnly
              aria-label="Contraseña guardada"
            />
          </label>
          <button
            className="info-button danger"
            onClick={() => {
              setDialog("Cambiar contraseña");
              setMessage("");
            }}
          >
            Cambiar contraseña
          </button>
        </div>
      </section>
      {message && <p role="status">{message}</p>}
      {dialog && (
        <AccountDialog title={dialog} onClose={() => setDialog("")}>
          {dialog === "Cambiar contraseña" ? (
            <form
              className="account-form"
              onSubmit={(e) => {
                e.preventDefault();
                void changeLocalPassword(previous, next)
                  .then(() => {
                    setDialog("");
                    setPrevious("");
                    setNext("");
                    setMessage("Contraseña actualizada.");
                  })
                  .catch((err) => setMessage(err.message));
              }}
            >
              <label>
                Contraseña actual
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={previous}
                  onChange={(e) => setPrevious(e.target.value)}
                />
              </label>
              <label>
                Nueva contraseña
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                />
              </label>
              <button className="primary-button" type="submit">
                Guardar contraseña
              </button>
              {message && <p role="alert">{message}</p>}
            </form>
          ) : (
            <>
              <p>
                Se eliminarán el perfil, las direcciones y las preferencias
                guardadas en este navegador. El carrito y los favoritos se
                conservan.
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  resetAccount();
                  onNavigate("/mi-cuenta");
                }}
              >
                Restablecer datos
              </button>
            </>
          )}
        </AccountDialog>
      )}
    </>
  );
}
