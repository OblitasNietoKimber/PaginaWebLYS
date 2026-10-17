import { useState } from "react";
import { Icon } from "../../components/Icon";
import { useOperations } from "../operations/operationsStore";
import { soles } from "../carta/catalog";
import { useAccount } from "./accountStore";
import { accountOrders, orderActive, type AccountOrder } from "./orders";
import {
  OrderList,
  OrderStatus,
  OrderProgress,
  OrderDetail,
} from "./OrderList";
import { AccountProduct, type FavoriteActions } from "./AccountFavorites";
import { AccountEmpty } from "./AccountShared";
export function AccountDashboard(
  props: FavoriteActions & { onNavigate: (path: string) => void },
) {
  useOperations();
  const account = useAccount();
  const [selected, setSelected] = useState<AccountOrder | null>(null);
  const orders = accountOrders();
  const active = orders.find(orderActive);
  const address =
    account.addresses.find((a) => a.primary) || account.addresses[0];
  const stats = [
    {
      value: orders.length,
      label: "Pedidos",
      icon: "receipt",
      route: "pedidos",
      color: "red",
    },
    {
      value: account.addresses.length,
      label: "Direcciones",
      icon: "pin",
      route: "direcciones",
      color: "blue",
    },
    {
      value: props.products.length,
      label: "Favoritos",
      icon: "heart",
      route: "favoritos",
      color: "orange",
    },
    {
      value: orders.filter(
        (o) => !account.readNotifications.includes(o.code + o.status),
      ).length,
      label: "Notificaciones",
      icon: "bell",
      route: "notificaciones",
      color: "purple",
    },
  ] as const;
  return (
    <div className="account-dashboard">
      <div className="account-stats">
        {stats.map((stat) => (
          <button
            className="info-card"
            key={stat.label}
            onClick={() => props.onNavigate(`/mi-cuenta/${stat.route}`)}
          >
            <span className={`info-icon-circle tone-${stat.color}`}>
              <Icon name={stat.icon} />
            </span>
            <span>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </span>
            <Icon name="arrow" />
          </button>
        ))}
      </div>
      <div className="account-dashboard-top">
        <section className="info-card account-active-order">
          <div className="account-row-heading">
            <h2>Pedido activo</h2>
            <button
              className="account-text-button"
              aria-label="Ver todos mis pedidos"
              onClick={() => props.onNavigate("/mi-cuenta/pedidos")}
            >
              Ver todos <Icon name="arrow" />
            </button>
          </div>
          {active ? (
            <div className="account-active-body">
              <div className="account-active-meta">
                <h3>#{active.code}</h3>
                <OrderStatus order={active} />
              </div>
              <OrderProgress order={active} />
              <div className="account-active-product">
                <img src={active.items[0]?.product.image} alt="" />
                <div>
                  <h3>{active.items[0]?.product.name}</h3>
                  {active.items.map((item) => (
                    <p key={item.product.id}>
                      {item.count} × {item.product.name}
                    </p>
                  ))}
                </div>
                <strong>{soles(active.total)}</strong>
              </div>
              <button
                className="primary-button"
                onClick={() => setSelected(active)}
              >
                <Icon name="truck" />
                Seguir pedido
              </button>
            </div>
          ) : (
            <AccountEmpty
              title="No tienes pedidos en curso"
              description="Tu próximo pedido aparecerá aquí."
              action="Ver carta"
              onAction={() => props.onNavigate("/carta")}
            />
          )}
        </section>
        <section className="info-card account-main-address">
          <div className="account-row-heading">
            <h2>Dirección principal</h2>
            <button
              className="account-text-button"
              onClick={() => props.onNavigate("/mi-cuenta/direcciones")}
              aria-label="Ver todas mis direcciones"
            >
              Ver todas <Icon name="arrow" />
            </button>
          </div>
          {address ? (
            <>
              <div className="account-dashboard-detail">
                <span className="info-icon-circle">
                  <Icon name="home" />
                </span>
                <div>
                  <h3>{address.label}</h3>
                  <p>{address.street}</p>
                  <p>{address.district}, Lima</p>
                </div>
                <button
                  className="info-button"
                  onClick={() => props.onNavigate("/mi-cuenta/direcciones")}
                >
                  <Icon name="edit" />
                  Editar
                </button>
              </div>
              <button
                className="account-use-address"
                onClick={() => {
                  props.onNavigate("/carrito");
                }}
              >
                <Icon name="pin" />
                Usar esta dirección
              </button>
            </>
          ) : (
            <AccountEmpty
              title="Agrega tu dirección"
              description="Guárdala para tus próximos pedidos."
              action="Nueva dirección"
              onAction={() => props.onNavigate("/mi-cuenta/direcciones")}
            />
          )}
        </section>
      </div>
      <div className="account-dashboard-bottom">
        <OrderList compact onNavigate={props.onNavigate} />
        <section className="info-card account-favorite-preview">
          <div className="account-row-heading">
            <h2>Mis favoritos</h2>
            <button
              className="account-text-button"
              onClick={() => props.onNavigate("/mi-cuenta/favoritos")}
            >
              Ver todos <Icon name="arrow" />
            </button>
          </div>
          {props.products.length ? (
            <div className="account-preview-products">
              {props.products.slice(0, 2).map((product) => (
                <AccountProduct key={product.id} product={product} {...props} />
              ))}
            </div>
          ) : (
            <AccountEmpty
              title="Guarda tus favoritos"
              description="Toca el corazón de un producto en la carta."
              action="Ver la carta"
              onAction={() => props.onNavigate("/carta")}
            />
          )}
        </section>
      </div>
      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onNavigate={props.onNavigate}
        />
      )}
    </div>
  );
}
