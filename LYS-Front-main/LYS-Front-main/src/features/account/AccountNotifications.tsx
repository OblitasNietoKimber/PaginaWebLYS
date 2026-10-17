import { useOperations } from "../operations/operationsStore";
import { useState } from "react";
import { Icon, type IconName } from "../../components/Icon";
import { accountOrders } from "./orders";
import { updateAccount, useAccount } from "./accountStore";
import { AccountEmpty } from "./AccountShared";
type Notification = {
  id: string;
  category: string;
  title: string;
  message: string;
  icon: IconName;
  route: string;
  date: string;
};
const preferences = [
  {
    key: "orders",
    label: "Estado de pedidos",
    description:
      "Recibe notificaciones sobre la confirmación, preparación, envío y entrega de tus pedidos.",
    icon: "receipt",
  },
  {
    key: "promotions",
    label: "Promociones",
    description: "Recibe ofertas, descuentos y novedades especiales.",
    icon: "tag",
  },
  {
    key: "email",
    label: "Correo electrónico",
    description:
      "Preferencia de recibir también tus notificaciones por correo electrónico.",
    icon: "mail",
  },
  {
    key: "favorites",
    label: "Productos favoritos",
    description: "Alertas sobre los productos que guardaste.",
    icon: "heart",
  },
  {
    key: "account",
    label: "Novedades de la cuenta",
    description: "Cambios en tus datos y seguridad.",
    icon: "user",
  },
] as const;
export function AccountNotifications({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  useOperations();
  const account = useAccount();
  const [filter, setFilter] = useState("Todas");
  const notifications: Notification[] = accountOrders().map((order) => ({
    id: order.code + order.status,
    category: "Pedidos",
    title:
      order.status === "Entregado"
        ? "Tu pedido fue entregado"
        : `Tu pedido ${order.status === "Registrado" ? "está confirmado" : "está " + order.status.toLowerCase()}`,
    message: `Pedido #${order.code}. Consulta su estado actualizado.`,
    icon: order.status === "Entregado" ? "truck" : "receipt",
    route: "/mi-cuenta/pedidos",
    date: order.date,
  }));
  const unread = notifications.filter(
    (n) => !account.readNotifications.includes(n.id),
  ).length;
  return (
    <>
      <section className="info-card account-notifications-panel">
        <div className="account-notifications-toolbar">
          <div
            className="account-filter-tabs"
            aria-label="Filtrar notificaciones"
          >
            {["Todas", "Pedidos", "Promociones"].map((category) => (
              <button
                key={category}
                aria-pressed={filter === category}
                onClick={() => setFilter(category)}
              >
                {category}
                {category === "Todas" && unread > 0 && (
                  <span className="account-count">{unread}</span>
                )}
              </button>
            ))}
          </div>
          <button
            className="account-text-button danger"
            onClick={() =>
              updateAccount({
                readNotifications: [
                  ...new Set([
                    ...account.readNotifications,
                    ...notifications.map((n) => n.id),
                  ]),
                ],
              })
            }
          >
            <Icon name="check" />
            Marcar todas como leídas
          </button>
        </div>
        {!notifications.filter(
          (n) => filter === "Todas" || filter === n.category,
        ).length && (
          <AccountEmpty
            title="Estás al día"
            description="Aquí podrás consultar las novedades de tus pedidos."
          />
        )}
        {notifications
          .filter((n) => filter === "Todas" || filter === n.category)
          .map((item) => (
            <button
              className="account-notification"
              key={item.id}
              onClick={() => {
                updateAccount({
                  readNotifications: [
                    ...new Set([...account.readNotifications, item.id]),
                  ],
                });
                onNavigate(item.route);
              }}
            >
              <span
                className={
                  account.readNotifications.includes(item.id)
                    ? "notification-dot read"
                    : "notification-dot"
                }
                aria-label={
                  account.readNotifications.includes(item.id)
                    ? "Leída"
                    : "Sin leer"
                }
              />
              <span className="info-icon-circle tone-blue">
                <Icon name={item.icon} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.message}</small>
              </span>
              <time dateTime={item.date}>
                {new Intl.DateTimeFormat("es-PE", {
                  dateStyle: "medium",
                }).format(new Date(item.date))}
              </time>
              <span className="account-notification-link">
                Ver pedido <Icon name="arrow" />
              </span>
            </button>
          ))}
      </section>
      <section className="info-card account-notification-settings">
        <h2>Preferencias de notificación</h2>
        <p>Elige sobre qué deseas recibir notificaciones.</p>
        {preferences.map((pref) => (
          <div key={pref.key}>
            <Icon name={pref.icon} />
            <span>
              <strong>{pref.label}</strong>
              <small>{pref.description}</small>
            </span>
            <button
              className="account-switch"
              role="switch"
              aria-checked={account.preferences[pref.key] || false}
              aria-label={pref.label}
              onClick={() =>
                updateAccount({
                  preferences: {
                    ...account.preferences,
                    [pref.key]: !account.preferences[pref.key],
                  },
                })
              }
            >
              <span />
            </button>
          </div>
        ))}
        <p className="account-local-note">
          Las preferencias se guardan en este navegador. El envío de correo
          estará disponible al conectar el servicio.
        </p>
      </section>
    </>
  );
}
