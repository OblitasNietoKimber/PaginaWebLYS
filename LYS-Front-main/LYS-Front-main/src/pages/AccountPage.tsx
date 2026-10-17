import { lazy, Suspense, useState } from "react";
import { logoutLocal, useSession } from "../services/localAuth";
import { displayFirstName } from "../services/displayName";
import { Icon } from "../components/Icon";
import { useCarta } from "../features/carta/useCarta";
import { cartProducts } from "../features/carta/cartStore";
import { ProductDetail } from "../features/carta/CartaDialogs";
import type { Product } from "../features/carta/catalog";
import { AccountDashboard } from "../features/account/AccountDashboard";
import { OrderList } from "../features/account/OrderList";
import { AccountDialog } from "../features/account/AccountShared";
import { AccountNavigation } from "../features/account/AccountNavigation";
import {
  accountSections,
  accountPath,
} from "../features/account/accountSections";
import { AccountFavorites } from "../features/account/AccountFavorites";
import "../styles/account.css";
const AccountAddresses = lazy(() =>
  import("../features/account/AccountAddresses").then((m) => ({
    default: m.AccountAddresses,
  })),
);
const AccountProfileForm = lazy(() =>
  import("../features/account/AccountProfileForm").then((m) => ({
    default: m.AccountProfileForm,
  })),
);
const AccountPayments = lazy(() =>
  import("../features/account/AccountPayments").then((m) => ({
    default: m.AccountPayments,
  })),
);
const AccountNotifications = lazy(() =>
  import("../features/account/AccountNotifications").then((m) => ({
    default: m.AccountNotifications,
  })),
);
export function AccountPage({
  route,
  onNavigate,
}: {
  route: string;
  onNavigate: (path: string) => void;
  onAction: (action: string) => void;
}) {
  const user = useSession();
  const section =
    accountSections.find((s) => accountPath(s.slug) === route) ||
    accountSections[0];
  const carta = useCarta();
  const [detail, setDetail] = useState<Product | null>(null);
  const [leaving, setLeaving] = useState(false);
  const products = cartProducts.filter((p) => carta.favorites.includes(p.id));
  const actions = {
    products,
    onFavorite: carta.favorite,
    onAdd: carta.add,
    onDetail: setDetail,
  };
  function requestLogout() {
    onNavigate(accountPath("cerrar-sesion"));
    setLeaving(true);
  }
  return (
    <>
      <main
        id="contenido"
        className={`account-page account-section-${section.slug || "inicio"}`}
      >
        <div className="account-container">
          <nav className="account-breadcrumb" aria-label="Ruta actual">
            <button
              onClick={() => onNavigate("/")}
              className="account-breadcrumb-home"
            >
              Inicio
            </button>
            <span className="account-breadcrumb-home">›</span>
            <button onClick={() => onNavigate("/mi-cuenta")}>Mi cuenta</button>
            <span>›</span>
            <span aria-current="page">{section.label}</span>
          </nav>
          <div className="account-layout">
            <AccountNavigation
              slug={section.slug}
              onNavigate={onNavigate}
              onLogout={requestLogout}
            />
            <div className="account-content">
              {section.slug !== "datos" && (
                <header className="account-page-heading">
                  <h1>
                    {section.slug === ""
                      ? `Hola, ${displayFirstName(user?.name || "")}`
                      : section.slug === "favoritos"
                        ? "Mis favoritos"
                        : section.label}
                  </h1>
                  <p>{section.description}</p>
                </header>
              )}
              <Suspense fallback={<p role="status">Cargando sección…</p>}>
                {section.slug === "" ? (
                  <AccountDashboard {...actions} onNavigate={onNavigate} />
                ) : section.slug === "pedidos" ? (
                  <OrderList onNavigate={onNavigate} />
                ) : section.slug === "direcciones" ? (
                  <AccountAddresses />
                ) : section.slug === "datos" ? (
                  <AccountProfileForm onNavigate={onNavigate} />
                ) : section.slug === "metodos-pago" ? (
                  <AccountPayments />
                ) : section.slug === "notificaciones" ? (
                  <AccountNotifications onNavigate={onNavigate} />
                ) : section.slug === "favoritos" ? (
                  <AccountFavorites {...actions} onNavigate={onNavigate} />
                ) : (
                  <section className="info-card account-logout-page">
                    <Icon name="logout" />
                    <h2>Salir de tu cuenta</h2>
                    <p>
                      Podrás volver a ingresar cuando lo necesites. Tus pedidos,
                      direcciones y preferencias permanecerán guardados.
                    </p>
                    <button
                      className="primary-button"
                      onClick={() => setLeaving(true)}
                    >
                      Cerrar sesión
                    </button>
                  </section>
                )}
              </Suspense>
            </div>
          </div>
        </div>
        <div className="sr-only" role="status">
          {carta.announcement}
        </div>
      </main>
      <ProductDetail
        product={detail}
        onClose={() => setDetail(null)}
        onAdd={carta.add}
      />
      {leaving && (
        <AccountDialog title="Cerrar sesión" onClose={() => setLeaving(false)}>
          <div className="account-logout-confirm">
            <span className="account-logout-symbol">
              <Icon name="logout" />
            </span>
            <h3>¿Deseas cerrar tu sesión?</h3>
            <p>Podrás volver a ingresar cuando lo necesites.</p>
            <div className="account-dialog-actions">
              <button className="info-button" onClick={() => setLeaving(false)}>
                Cancelar
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setLeaving(false);
                  logoutLocal();
                  onNavigate("/iniciar-sesion");
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </AccountDialog>
      )}
    </>
  );
}
