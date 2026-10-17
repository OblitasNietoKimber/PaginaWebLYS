import { currentUser, readUsers } from '../../services/localAuth';
import { OperationsDialog } from './OperationsDialog';
import { useState } from "react";
import {
  useOperations,
  changeStatus,
  money,
  orderTotal,
  type Order,
} from "./operationsStore";
import { Badge, Empty, OrderDetail, Stats } from "./OperationsUI";
import { Icon } from "./OperationsVisuals";

export function DeliveryViews({
  notify,
}: {
  notify: (task: () => void) => void;
}) {
  const state = useOperations();
  const actor = currentUser();
  const couriers = readUsers().filter(user => user.active && user.role === 'delivery');
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [assignmentView, setAssignmentView] = useState('all');
  const [assignmentOrder, setAssignmentOrder] = useState<Order | null>(null);
  const [assignmentCourier, setAssignmentCourier] = useState('');
  const courierId = (order: Order) => assignments[order.id] ?? couriers.find(user => user.name === order.deliveryEstimate?.courier)?.id ?? '';
  const courierName = (order: Order) => couriers.find(user => user.id === courierId(order))?.name || order.deliveryEstimate?.courier || 'Sin asignar';
  const [filter, setFilter] = useState("Pendientes");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [selected, setSelected] = useState("");
  const [mapOrder, setMapOrder] = useState("");
  const deliveries = state.orders.filter(
    (o) => !o.draft && o.channel === "Delivery",
  );
  const today = new Date().toLocaleDateString();
  const rows = deliveries.filter(
    (o) =>
      (assignmentView === 'all' || (assignmentView === 'mine' ? courierId(o) === actor?.id : !courierId(o))) &&
      (filter === "Completadas"
        ? o.status === "Entregado"
        : filter === "En camino"
          ? o.status === "En camino"
          : o.status === "Listo") &&
      `${o.id} ${o.customer} ${o.address}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  const destination = rows.find((o) => o.id === selected) || rows[0];
  const route = (order: Order) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address || "Leñas y Sabores Carabayllo Lima")}`;
  return (
    <>
      <Stats
        entries={[
          {
            label: "Listos para recoger",
            value: deliveries.filter((o) => o.status === "Listo").length,
            icon: "bag",
            tone: "green",
            hint: "Pendientes de salida",
          },
          {
            label: "En camino",
            value: deliveries.filter((o) => o.status === "En camino").length,
            icon: "scooter",
            tone: "blue",
            hint: "Entregas en curso",
          },
          {
            label: "Entregados hoy",
            value: deliveries.filter(
              (o) =>
                o.status === "Entregado" &&
                o.delivered &&
                new Date(o.delivered).toLocaleDateString() === today,
            ).length,
            icon: "flag",
            tone: "gold",
            hint: "Entregas completadas",
          },
        ]}
      />
      <div className="prototype-assignment-toolbar"><label>Entregas asignadas<select value={assignmentView} onChange={event => setAssignmentView(event.target.value)}><option value="all">Todas las entregas</option><option value="mine">Mis entregas</option><option value="unassigned">Sin asignar</option></select></label><p className="prototype-ops-caption">Asignaciones en vista previa · selecciona un repartidor para organizar el reparto.</p></div>
      <div className="ops-delivery-toolbar">
        <div className="ops-reference-tabs">
          {["Pendientes", "En camino", "Completadas"].map((value) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === "Pendientes"
                ? "Por recoger"
                : value === "Completadas"
                  ? "Entregados"
                  : value}{" "}
              <span>
                (
                {
                  deliveries.filter((o) =>
                    value === "Completadas"
                      ? o.status === "Entregado"
                      : value === "En camino"
                        ? o.status === "En camino"
                        : o.status === "Listo",
                  ).length
                }
                )
              </span>
            </button>
          ))}
        </div>
        <label className="ops-delivery-search">
          <Icon name="search" />
          <input
            aria-label="Buscar entrega"
            placeholder="Buscar pedido, cliente o dirección"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button className="ops-primary" onClick={()=>{setSearch("");setFilter("Pendientes");setSelected("");setAssignmentView("all");}}>Eliminar filtros</button>
      </div>
      <div className="ops-delivery-layout">
        <div className="ops-delivery-list">
          {rows.map((order) => (
            <article
              className="ops-delivery-card"
              key={order.id}
              data-selected={destination?.id === order.id}
            >
              <header>
                <button
                  className="ops-delivery-id"
                  onClick={() => setDetail(order)}
                >
                  #{order.id}
                </button>
                <Badge
                  value={
                    order.status === "Listo"
                      ? "Listo para recoger"
                      : order.status
                  }
                />
                <time dateTime={order.created}>
                  {new Date(order.created).toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </header>
              <div className="ops-delivery-customer">
                <div>
                  <strong>
                    <Icon name="user" />
                    {order.customer || "Cliente"}
                  </strong>
                  <p>
                    <Icon name="pin" />
                    {order.address || "Dirección por confirmar"}
                  </p>
                </div>
                <div className="ops-delivery-total">
                  <strong>{money(orderTotal(order))}</strong>
                  <small>
                    {order.paid ? "Pagado" : "Por cobrar"}
                    {order.method ? ` · ${order.method}` : ""}
                  </small>
                </div>
              </div>
              {order.status === "En camino" && order.address && (
                <div className="anchor-delivery-inline-map">
                  {mapOrder === order.id ? (
                    <iframe
                      title={`Mapa de destino del pedido ${order.id}`}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(order.address)}&output=embed`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <button
                      type="button"
                      className="ops-map-load"
                      onClick={() => setMapOrder(order.id)}
                    >
                      <Icon name="pin" />
                      <strong>Ver mapa del destino</strong>
                      <span>{order.address}</span>
                    </button>
                  )}
                </div>
              )}
              <dl className="anchor-delivery-estimate">
                <div>
                  <dt>
                    <Icon name="pin" />
                    Distancia estimada
                  </dt>
                  <dd>
                    {order.deliveryEstimate
                      ? `${order.deliveryEstimate.distanceKm} km`
                      : "Por calcular"}
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="clock" />
                    Tiempo estimado
                  </dt>
                  <dd>
                    {order.deliveryEstimate
                      ? `${order.deliveryEstimate.minutes} min`
                      : "Por calcular"}
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="user" />
                    Repartidor asignado
                  </dt>
                  <dd>{courierName(order)}{assignments[order.id] && <small className="prototype-assignment-preview">Vista previa</small>}</dd>
                </div>
              </dl>
              <div className="ops-reference-line-items">
                {order.items.map((line) => (
                  <div key={line.product.id}>
                    <img src={line.product.image} alt="" />
                    <div>
                      <strong>
                        {line.count} × {line.product.name}
                      </strong>
                    </div>
                    <b>{money(line.count * line.product.price)}</b>
                  </div>
                ))}
              </div>
              {order.notes && (
                <p className="ops-delivery-note">
                  <Icon name="clipboard" />
                  {order.notes}
                </p>
              )}
              <footer>
                {actor?.role === 'administrador' ? <button type="button" className="ops-outline" onClick={() => { setAssignmentOrder(order); setAssignmentCourier(courierId(order)); }}><Icon name="user" />Asignar repartidor</button> : actor?.role === 'delivery' && !courierId(order) ? <button type="button" className="ops-outline" onClick={() => setAssignments(previous => ({ ...previous, [order.id]: actor.id }))}><Icon name="user" />Asignarme · vista previa</button> : null}
                <button
                  className="ops-outline"
                  onClick={() => {
                    setSelected(order.id);
                    setDetail(order);
                  }}
                >
                  <Icon name="eye" />
                  Ver detalle
                </button>
                {order.address && (
                  <a
                    className="ops-outline"
                    href={route(order)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setSelected(order.id)}
                  >
                    <Icon name="pin" />
                    Ver ruta
                  </a>
                )}
                {order.phone && (
                  <a
                    className="ops-outline"
                    href={`tel:${order.phone.replace(/[^+0-9]/g, "")}`}
                  >
                    <Icon name="phone" />
                    <span>Llamar</span>
                  </a>
                )}
                {order.status !== "Entregado" && (
                  <button
                    className="ops-primary"
                    onClick={() =>
                      notify(() => {
                        changeStatus(
                          order.id,
                          order.status === "Listo" ? "En camino" : "Entregado",
                        );
                        setFilter(order.status === "Listo" ? "En camino" : "Completadas");
                        setSelected(order.id);
                      })
                    }
                  >
                    <Icon
                      name={order.status === "Listo" ? "scooter" : "check"}
                    />
                    {order.status === "Listo"
                      ? "Iniciar entrega"
                      : "Marcar como entregado"}
                  </button>
                )}
              </footer>
            </article>
          ))}
          {!rows.length && (
            <Empty>
              {search
                ? "No hay entregas que coincidan con la búsqueda."
                : "No hay entregas en este estado."}
            </Empty>
          )}
        </div>
        {destination && (
          <aside className="ops-delivery-map">
            <header>
              <Icon name="pin" />
              <h2>Ruta de entrega</h2>
            </header>
            <label>
              Pedido
              <select
                aria-label="Pedido para ver en el mapa"
                value={destination.id}
                onChange={(e) => setSelected(e.target.value)}
              >
                {rows.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.id} · {o.customer}
                  </option>
                ))}
              </select>
            </label>
            {destination.address ? (
              <>
                {mapOrder !== destination.id ? (
                  <button
                    className="ops-map-load"
                    onClick={() => setMapOrder(destination.id)}
                  >
                    <Icon name="pin" />
                    <strong>Consultar destino en Google Maps</strong>
                    <span>{destination.address}</span>
                  </button>
                ) : (
                  <iframe
                    key={destination.id}
                    title={`Mapa de destino del pedido ${destination.id}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(destination.address)}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
                <p>{destination.address}</p>
                <a
                  className="ops-primary"
                  href={route(destination)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="pin" />
                  Abrir indicaciones
                </a>
              </>
            ) : (
              <Empty>
                Agrega una dirección al pedido para consultar la ruta.
              </Empty>
            )}
          </aside>
        )}
      </div>
      {assignmentOrder && <OperationsDialog title="Asignar repartidor" icon="user" onClose={() => setAssignmentOrder(null)}><p>Pedido #{assignmentOrder.id} · {assignmentOrder.customer}</p><form className="ops-form" onSubmit={event => { event.preventDefault(); setAssignments(previous => ({ ...previous, [assignmentOrder.id]: assignmentCourier })); setAssignmentOrder(null); }}><label>Repartidor<select aria-label="Repartidor" required value={assignmentCourier} onChange={event => setAssignmentCourier(event.target.value)}><option value="">Selecciona un repartidor</option>{couriers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>{!couriers.length && <p>No hay repartidores activos para seleccionar.</p>}<p className="prototype-ops-preview">Vista previa de asignación. No modifica el pedido registrado.</p><div className="prototype-ops-actions"><button type="button" className="ops-outline" onClick={() => setAssignmentOrder(null)}>Volver</button><button className="ops-primary" type="submit" disabled={!assignmentCourier}>Aplicar vista previa</button></div></form></OperationsDialog>}
      {detail && (
        <OrderDetail
          order={state.orders.find((o) => o.id === detail.id) || detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
