import { OperationsDialog } from "./OperationsDialog";
import { OperationsTable } from "./OperationsTable";
import { Icon, ProductSummary } from "./OperationsVisuals";
import { dateText, printLocal } from "./operationsFiles";
import { useState } from "react";
import { currentUser } from "../../services/localAuth";
import { categories } from "../carta/catalog";
import {
  createOrder,
  money,
  orderTotal,
  minutes,
  updateTable,
  useOperations,
  changeStatus,
  sendDraft,
  type Line,
  type Order,
} from "./operationsStore";
import {
  Badge,
  Empty,
  OrderDetail,
  Panel,
  Stats,
  Tabs,
  Bars,
} from "./OperationsUI";
export function TableMap({
  selected,
  onSelect,
  zone = "Todas",
  query = "",
  filter = "Todos",
  list = false,
}: {
  selected: number;
  onSelect: (id: number) => void;
  zone?: string;
  query?: string;
  filter?: string;
  list?: boolean;
}) {
  const state = useOperations();
  const tableQuery = query.trim().toLowerCase().replace(/^(mesa|m)\s*/, "");
  return (
    <div
      className={`ops-floor ${list ? "list" : ""}`}
      aria-label="Plano de mesas"
    >
      {state.tables
        .filter(
          (t) =>
            (zone === "Todas" || t.zone === zone) &&
            (!tableQuery || String(t.id).includes(tableQuery)) &&
            (filter === "Todos" || t.status === filter),
        )
        .map((t) => (
          <button
            key={t.id}
            className={`ops-table-seat ${selected === t.id ? "selected" : ""}`}
            data-status={t.status}
            aria-label={`Mesa ${t.id}, ${t.status}, ${t.seats} personas`}
            aria-pressed={selected === t.id}
            onClick={() => onSelect(t.id)}
          >
            <i className="ops-chair-left" aria-hidden="true" />
            <i className="ops-chair-right" aria-hidden="true" />
            <Icon name="dining" />
            <strong>M{t.id}</strong>
            <Badge value={t.status} />
            <small>{t.seats} personas</small>
          </button>
        ))}
    </div>
  );
}
export function NewOrder({
  notify,
  navigate,
}: {
  notify: (task: () => void) => void;
  navigate: (path: string) => void;
}) {
  const state = useOperations();
  const [table, setTable] = useState(
    Number(new URLSearchParams(location.search).get("mesa")) || 1,
  );
  const [category, setCategory] = useState("todos");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [notes, setNotes] = useState("");
  const [customer, setCustomer] = useState("");
  const [tab, setTab] = useState("Productos");
  const change = (id: string, delta: number) =>
    setLines((old) =>
      old
        .map((l) =>
          l.product.id === id
            ? { ...l, count: Math.min(99, l.count + delta) }
            : l,
        )
        .filter((l) => l.count > 0),
    );
  const submit = (draft: boolean) =>
    notify(() => {
      createOrder({
        customerId: currentUser()!.id,
        customer: customer || `Mesa ${table}`,
        phone: "",
        email: "",
        address: "",
        channel: "Salón",
        table,
        items: lines,
        notes,
        discount: 0,
        shipping: 0,
        method: "",
        draft,
      });
      setLines([]);
      navigate("/mesera/pedidos");
    });
  return (
    <>
      <div className="anchor-order-context">
        <label>
          <Icon name="table" />
          <select
            aria-label="Mesa del nuevo pedido"
            value={table}
            onChange={(e) => setTable(Number(e.target.value))}
          >
            {state.tables.map((t) => (
              <option key={t.id} value={t.id}>
                Mesa {String(t.id).padStart(2, "0")} · {t.status}
              </option>
            ))}
          </select>
        </label>
        <span>
          <Icon name="users" />
          <strong>
            {state.tables.find((t) => t.id === table)?.seats || 0}
          </strong>{" "}
          personas
        </span>
      </div>
      <div className="ops-two-main">
        <Panel title="Elige del menú">
          <div className="ops-toolbar">
            <nav
              className="anchor-menu-categories"
              aria-label="Categorías del pedido"
            >
              {[{ id: "todos", name: "Todos" }, ...categories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </nav>
            <input
              aria-label="Buscar productos del pedido"
              placeholder="Buscar productos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="ops-product-grid">
            {state.products
              .filter(
                (p) =>
                  p.active &&
                  (p.stock ?? 0) > 0 &&
                  (category === "todos" || p.category === category) &&
                  p.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((p) => (
                <article key={p.id}>
                  <img src={p.image} alt={p.name} />
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div>
                    <strong>{money(p.price)}</strong>
                    <button
                      className="ops-primary"
                      aria-label={`Agregar ${p.name}`}
                      onClick={() =>
                        setLines((old) =>
                          old.some((l) => l.product.id === p.id)
                            ? old.map((l) =>
                                l.product.id === p.id
                                  ? { ...l, count: Math.min(99, l.count + 1) }
                                  : l,
                              )
                            : [...old, { product: p, count: 1 }],
                        )
                      }
                    >
                      <Icon name="plus" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </Panel>
        <Panel title={`Pedido de Mesa ${table}`}>
          <Tabs
            options={["Productos", "Cliente", "Notas"]}
            value={tab}
            onChange={setTab}
          />
          {tab === "Cliente" ? (
            <label>
              Nombre del cliente (opcional)
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </label>
          ) : tab === "Notas" ? (
            <label>
              Notas para cocina
              <textarea
                value={notes}
                maxLength={500}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          ) : (
            <>
              {lines.map((l) => (
                <div className="ops-cart-line" key={l.product.id}>
                  <div className="ops-quantity">
                    <button
                      aria-label={`Quitar uno ${l.product.name}`}
                      onClick={() => change(l.product.id, -1)}
                    >
                      −
                    </button>
                    <span>{l.count}</span>
                    <button
                      aria-label={`Agregar uno ${l.product.name}`}
                      onClick={() => change(l.product.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="anchor-cart-product">
                    <img src={l.product.image} alt="" />
                    {l.product.name}
                  </span>
                  <strong>{money(l.count * l.product.price)}</strong>
                  <button
                    aria-label={`Eliminar ${l.product.name}`}
                    onClick={() =>
                      setLines((old) =>
                        old.filter((line) => line.product.id !== l.product.id),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              {!lines.length && <Empty>Agrega productos al pedido.</Empty>}
              <label>
                Notas para cocina
                <textarea
                  value={notes}
                  maxLength={500}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </>
          )}
          <h3 className="ops-total">
            Total{" "}
            <strong>
              {money(
                lines.reduce((sum, l) => sum + l.product.price * l.count, 0),
              )}
            </strong>
          </h3>
          <div className="ops-card-actions">
            <button
              className="ops-outline"
              disabled={!lines.length}
              onClick={() => submit(true)}
            >
              <Icon name="save" /> Guardar como pendiente
            </button>
            <button
              className="ops-primary"
              disabled={!lines.length}
              onClick={() => submit(false)}
            >
              <Icon name="send" /> Enviar a cocina
            </button>
          </div>
        </Panel>
      </div>
    </>
  );
}
export function WaiterViews({
  section,
  notify,
  navigate,
}: {
  section: string;
  notify: (task: () => void) => void;
  navigate: (path: string) => void;
}) {
  const state = useOperations();
  const [selected, setSelected] = useState(
    () =>
      Number(new URLSearchParams(location.search).get("mesa")) ||
      state.orders.find(
        (o) => o.channel === "Salón" && !o.paid && o.status !== "Cancelado",
      )?.table ||
      1,
  );
  const [tableOpen, setTableOpen] = useState(false);
  const [zone, setZone] = useState("Todas");
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [list, setList] = useState(false);
  const [tab, setTab] = useState("Pedido actual");
  const [detail, setDetail] = useState<Order | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const orders = state.orders.filter((o) => o.channel === "Salón");
  const table = state.tables.find((t) => t.id === selected)!;
  const active = orders.filter(
    (o) => o.table === selected && !o.paid && o.status !== "Cancelado",
  );
  const stats: Parameters<typeof Stats>[0]["entries"] =
    section === "pedidos"
      ? [
          {
            label: "Total de pedidos",
            value: orders.length,
            icon: "receipt",
            tone: "red",
          },
          {
            label: "Nuevos",
            value: orders.filter((o) => o.status === "Recibido").length,
            icon: "clock",
            tone: "gold",
            hint: "En espera de atención",
          },
          {
            label: "En preparación",
            value: orders.filter((o) => o.status === "En preparación").length,
            icon: "chef",
            tone: "blue",
            hint: "Pedidos en cocina",
          },
          {
            label: "Listos",
            value: orders.filter((o) => o.status === "Listo").length,
            icon: "check",
            tone: "green",
            hint: "Listos para entregar",
          },
        ]
      : [
          {
            label: "Mesas libres",
            value: state.tables.filter((t) => t.status === "Libre").length,
            icon: "table",
            tone: "green",
            hint: `de ${state.tables.length} mesas`,
          },
          {
            label: "Mesas ocupadas",
            value: state.tables.filter((t) => t.status === "Ocupada").length,
            icon: "table",
            tone: section === "mesas" ? "gold" : "red",
            hint: `de ${state.tables.length} mesas`,
          },
          {
            label: "Solicitan cuenta",
            value: state.tables.filter((t) => t.status === "Solicita cuenta")
              .length,
            icon: "receipt",
            tone: section === "mesas" ? "blue" : "gold",
            hint: "Listas para el cobro",
          },
          section === "mesas"
            ? {
                label: "Mesas reservadas",
                value: state.tables.filter((t) => t.status === "Reservada")
                  .length,
                icon: "lock",
                tone: "gray",
                hint: `de ${state.tables.length} mesas`,
              }
            : {
                label: "Pedidos activos",
                value: orders.filter(
                  (o) => !["Entregado", "Cancelado"].includes(o.status),
                ).length,
                icon: "clipboard",
                tone: "blue",
                hint: "Pedidos en proceso",
              },
        ];
  if (section === "nuevo-pedido")
    return <NewOrder notify={notify} navigate={navigate} />;
  const tableDetail = tableOpen && (
    <OperationsDialog
      title={`Mesa ${selected}`}
      onClose={() => setTableOpen(false)}
    >
      <Badge value={table.status} />
      <p>{table.seats} personas</p>
      <Tabs
        options={["Pedido actual", "Historial", "Notas"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Notas" ? (
        <>
          <label>
            Notas de la mesa
            <textarea
              value={note ?? table.notes}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            className="ops-primary"
            onClick={() =>
              notify(() =>
                updateTable(selected, { notes: note ?? table.notes }),
              )
            }
          >
            <Icon name="save" /> Guardar notas
          </button>
        </>
      ) : tab === "Historial" ? (
        orders
          .filter((o) => o.table === selected)
          .map((o) => (
            <button
              className="ops-priority"
              key={o.id}
              onClick={() => setDetail(o)}
            >
              #{o.id} · {o.status} · {money(orderTotal(o))}
            </button>
          ))
      ) : (
        <>
          {active.map((o) => (
            <div key={o.id}>
              <h3>
                #{o.id} <Badge value={o.status} />
              </h3>
              {o.items.map((l) => (
                <p key={l.product.id}>
                  {l.count} {l.product.name}{" "}
                  <strong>{money(l.product.price * l.count)}</strong>
                </p>
              ))}
              {o.status === "Listo" && (
                <button
                  className="ops-primary"
                  onClick={() => notify(() => changeStatus(o.id, "Entregado"))}
                >
                  <Icon name="serve" /> Entregar pedido
                </button>
              )}
            </div>
          ))}
          {!active.length && <Empty>La mesa no tiene consumo pendiente.</Empty>}
          <h3 className="ops-total">
            Total{" "}
            <strong>
              {money(active.reduce((sum, o) => sum + orderTotal(o), 0))}
            </strong>
          </h3>
        </>
      )}
      <div className="ops-stack-actions">
        <button
          className="ops-primary"
          onClick={() => navigate(`/mesera/nuevo-pedido?mesa=${selected}`)}
        >
          <Icon name="plus" /> Agregar pedido
        </button>
        <button
          className="ops-blue"
          disabled={!active.length}
          onClick={() =>
            notify(() => updateTable(selected, { status: "Solicita cuenta" }))
          }
        >
          <Icon name="receipt" /> Solicitar cuenta
        </button>
        <button
          className="ops-green"
          onClick={() =>
            notify(() => updateTable(selected, { status: "Libre" }))
          }
        >
          <Icon name="table" /> Liberar mesa
        </button>
        <button
          className="ops-outline"
          onClick={() =>
            notify(() =>
              updateTable(selected, {
                status: table.status === "Reservada" ? "Libre" : "Reservada",
              }),
            )
          }
        >
          {table.status === "Reservada" ? "Cancelar reserva" : "Reservar mesa"}
        </button>
      </div>
    </OperationsDialog>
  );
  return (
    <>
      {section !== "cierre-mesa" && <Stats entries={stats} />}
      {tableDetail}
      {section === "" ? (
        <div className="ops-salon-dashboard">
          <Panel title="Plano de mesas del salón">
            <TableMap
              selected={selected}
              onSelect={(id) => {
                setSelected(id);
                setTableOpen(true);
                setNote(null);
              }}
            />
          </Panel>
          <Panel
            title="Pedidos recientes del salón"
            action={
              <button
                className="ops-outline"
                onClick={() => navigate("/mesera/pedidos")}
              >
                <Icon name="arrow" /> Ver todos
              </button>
            }
          >
            <div className="ops-table-wrap">
              <OperationsTable>
                <thead>
                  <tr>
                    <th>Mesa</th>
                    <th>Productos</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td>M{o.table}</td>
                      <td>
                        <ProductSummary order={o} />
                      </td>
                      <td>
                        <time dateTime={o.created} title={dateText(o.created)}>
                          {new Date(o.created).toLocaleTimeString("es-PE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </td>
                      <td>
                        <Badge value={o.status} />
                      </td>
                      <td>
                        <button
                          className="ops-outline"
                          onClick={() => setDetail(o)}
                        >
                          <Icon name="eye" /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </OperationsTable>
            </div>
            {!orders.length && <Empty />}
            <button
              className="ops-primary"
              onClick={() => navigate("/mesera/nuevo-pedido")}
            >
              <Icon name="plus" /> Nuevo pedido
            </button>
          </Panel>
          <Panel title="Tareas del turno">
            <div className="ops-three">
              <button onClick={() => navigate("/mesera/cierre-mesa")}>
                <strong>Solicitar cuentas</strong>
                <span>
                  {
                    state.tables.filter((t) => t.status === "Solicita cuenta")
                      .length
                  }{" "}
                  mesas esperan el cobro
                </span>
              </button>
              <button onClick={() => navigate("/mesera/pedidos")}>
                <strong>Entregar pedidos</strong>
                <span>
                  {orders.filter((o) => o.status === "Listo").length} listos
                  para servir
                </span>
              </button>
              <button onClick={() => navigate("/mesera/mesas")}>
                <strong>Liberar mesas</strong>
                <span>
                  {
                    state.tables.filter(
                      (t) =>
                        t.status !== "Libre" &&
                        orders.some((o) => o.table === t.id) &&
                        !orders.some(
                          (o) =>
                            o.table === t.id &&
                            !o.paid &&
                            o.status !== "Cancelado",
                        ),
                    ).length
                  }{" "}
                  mesas con todos sus pedidos cobrados
                </span>
              </button>
            </div>
          </Panel>
        </div>
      ) : section === "mesas" ? (
        <>
          <div className="ops-toolbar">
            <Tabs
              options={["Todas", "Salón principal", "Terraza", "Zona parrilla"]}
              value={zone}
              onChange={setZone}
            />
            <input
              aria-label="Buscar mesa"
              placeholder="Buscar mesa (ej. M5)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Estado de mesas"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {[
                "Todos",
                "Libre",
                "Ocupada",
                "Reservada",
                "Solicita cuenta",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="ops-primary" onClick={()=>{setZone("Todas");setFilter("Todos");setSearch("");}}>Eliminar filtros</button>
            <button className="ops-outline" onClick={() => setList(!list)}>
              {list ? "Vista de plano" : "Vista de lista"}
            </button>
          </div>
          <div className="ops-table-workspace">
            <TableMap
              selected={selected}
              onSelect={(id) => {
                setSelected(id);
                setNote(null);
              }}
              zone={zone}
              query={search}
              filter={filter}
              list={list}
            />
            <div className="ops-table-selection">
              <Panel
                title={`Mesa ${selected}`}
                action={<Badge value={table.status} />}
              >
                <div className="ops-table-detail-meta">
                  <Icon name="users" />
                  <small>
                    {table.seats} personas · {table.zone}
                  </small>
                </div>
                <h3>Pedido actual</h3>
                {active.length ? (
                  <div className="ops-reference-line-items">
                    {active.flatMap((o) =>
                      o.items.map((line) => (
                        <div key={`${o.id}-${line.product.id}`}>
                          <img src={line.product.image} alt="" />
                          <div>
                            <strong>
                              {line.count} × {line.product.name}
                            </strong>
                            <small>
                              #{o.id} · {o.status}
                            </small>
                          </div>
                          <b>{money(line.count * line.product.price)}</b>
                        </div>
                      )),
                    )}
                  </div>
                ) : (
                  <Empty>Esta mesa no tiene pedidos pendientes.</Empty>
                )}
                <p className="ops-total">
                  Total{" "}
                  <strong>
                    {money(active.reduce((sum, o) => sum + orderTotal(o), 0))}
                  </strong>
                </p>
                <div className="ops-stack-actions">
                  <button
                    className="ops-primary"
                    onClick={() =>
                      navigate(`/mesera/nuevo-pedido?mesa=${selected}`)
                    }
                  >
                    <Icon name="plus" />
                    Agregar pedido
                  </button>
                  <button
                    className="ops-outline"
                    onClick={() => setTableOpen(true)}
                  >
                    <Icon name="eye" />
                    Ver mesa
                  </button>
                </div>
              </Panel>
            </div>
          </div>
        </>
      ) : section === "cierre-mesa" ? (
        <div className="anchor-table-close">
          <div className="anchor-table-close-meta">
            <label>
              <Icon name="table" />
              <span>
                Mesa
                <select
                  aria-label="Mesa para cerrar"
                  value={selected}
                  onChange={(e) => setSelected(Number(e.target.value))}
                >
                  {state.tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      Mesa {String(t.id).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <small>{table.zone}</small>
              </span>
            </label>
            <div>
              <Icon name="receipt" />
              <span>
                Pedido
                <strong>
                  {active.map((o) => `#${o.id}`).join(", ") || "Sin pedidos"}
                </strong>
                <small>{active[0] ? dateText(active[0].created) : "—"}</small>
              </span>
            </div>
            <div>
              <Icon name="users" />
              <span>
                Personas<strong>{table.seats}</strong>
                <small>comensales</small>
              </span>
            </div>
            <div>
              <span>
                Estado del pedido
                <Badge value={active[0]?.status || table.status} />
              </span>
              <span>
                Estado de pago
                <Badge
                  value={
                    active.length ? "Pago pendiente" : "Sin saldo pendiente"
                  }
                />
              </span>
            </div>
          </div>
          <Panel title="Consumo de la mesa">
            <div className="ops-table-wrap">
              <OperationsTable>
                <thead>
                  <tr>
                    {[
                      "Producto",
                      "Cantidad",
                      "Precio unitario",
                      "Subtotal",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.flatMap((o) =>
                    o.items.map((line) => (
                      <tr key={`${o.id}-${line.product.id}`}>
                        <td>
                          <div className="ops-product-cell">
                            <img src={line.product.image} alt="" />
                            <div>
                              <strong>{line.product.name}</strong>
                              <small>{line.product.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>{line.count}</td>
                        <td>{money(line.product.price)}</td>
                        <td>{money(line.product.price * line.count)}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </OperationsTable>
            </div>
            {!active.length && (
              <Empty>La mesa no tiene consumos pendientes.</Empty>
            )}
            <div className="ops-total anchor-table-close-total">
              <strong>Total a pagar</strong>
              <strong>
                {money(active.reduce((sum, o) => sum + orderTotal(o), 0))}
              </strong>
            </div>
          </Panel>
          <p className="anchor-table-close-note">
            <Icon name="info" />
            La mesa se liberará cuando se confirme el pago.
          </p>
          <div className="anchor-table-close-actions">
            <button
              className="ops-outline"
              onClick={() => navigate("/mesera/mesas")}
            >
              <Icon name="arrow" />
              Volver a mesas
            </button>
            <button
              className="ops-primary"
              disabled={!active.length}
              onClick={() =>
                notify(() =>
                  updateTable(selected, {
                    status: "Solicita cuenta",
                    notes: note ?? table.notes,
                  }),
                )
              }
            >
              <Icon name="receipt" />
              Solicitar cuenta
            </button>
          </div>
          <details className="anchor-table-close-extra">
            <summary>Otras acciones</summary>
            <label>
              Nota de cierre
              <textarea
                value={note ?? table.notes}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div>
              <button
                className="ops-outline"
                onClick={() =>
                  notify(() =>
                    printLocal(
                      `Cuenta Mesa ${selected}`,
                      active.flatMap((o) =>
                        o.items.map(
                          (l) =>
                            `${l.count} ${l.product.name} ${money(l.product.price * l.count)}`,
                        ),
                      ),
                    ),
                  )
                }
              >
                <Icon name="print" />
                Imprimir cuenta
              </button>
              <button
                className="ops-outline"
                onClick={() =>
                  navigate(`/mesera/nuevo-pedido?mesa=${selected}`)
                }
              >
                <Icon name="plus" />
                Agregar producto
              </button>
              <button
                className="ops-outline"
                onClick={() =>
                  notify(() => updateTable(selected, { status: "Libre" }))
                }
              >
                <Icon name="table" />
                Liberar mesa
              </button>
            </div>
          </details>
        </div>
      ) : (
        <>
          <div className="ops-toolbar">
            <Tabs
              options={[
                "Todos",
                "Recibido",
                "En preparación",
                "Listo",
                "Entregado",
                "Borradores",
              ]}
              value={filter}
              onChange={setFilter}
            />
            <input
              aria-label="Buscar pedidos de salón"
              placeholder="Buscar mesa, producto o pedido…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="ops-primary" onClick={()=>{setSearch("");setFilter("Todos");}}>Eliminar filtros</button>
            <button
              className="ops-primary"
              onClick={() => navigate("/mesera/nuevo-pedido")}
            >
              <Icon name="plus" /> Nuevo pedido
            </button>
          </div>
          <div className="ops-two-main">
            <Panel title="Pedidos de salón">
              <div className="ops-table-wrap">
                <OperationsTable>
                  <thead>
                    <tr>
                      <th>N° pedido</th>
                      <th>Mesa</th>
                      <th>Productos</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Tiempo</th>
                      <th>Hora</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(
                        (o) =>
                          (filter === "Todos" ||
                            (filter === "Borradores"
                              ? o.draft
                              : o.status === filter && !o.draft)) &&
                          `${o.id} ${o.table} ${o.items.map((l) => l.product.name).join(" ")}`
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                      )
                      .map((o) => (
                        <tr key={o.id}>
                          <td>
                            <strong>#{o.id}</strong>
                          </td>
                          <td>Mesa {o.table}</td>
                          <td>
                            <ProductSummary order={o} />
                          </td>
                          <td>{money(orderTotal(o))}</td>
                          <td>
                            <Badge value={o.draft ? "Borrador" : o.status} />
                          </td>
                          <td>
                            {o.status === "En preparación"
                              ? `${minutes(o.accepted || o.created)} min`
                              : "—"}
                          </td>
                          <td>
                            <time dateTime={o.created}>
                              {new Date(o.created).toLocaleTimeString("es-PE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </time>
                          </td>
                          <td>
                            <div className="ops-stack-actions ops-salon-order-actions">
                              <button
                                title="Ver detalle"
                                className="ops-outline"
                                onClick={() => setDetail(o)}
                              >
                                <Icon name="eye" />
                                <span className="ops-action-caption">
                                  Ver detalle
                                </span>
                              </button>
                              {o.draft ? (
                                <button
                                  title="Enviar a cocina"
                                  className="ops-primary"
                                  onClick={() => notify(() => sendDraft(o.id))}
                                >
                                  <Icon name="send" />
                                  <span className="ops-action-caption">
                                    Enviar a cocina
                                  </span>
                                </button>
                              ) : o.status === "Listo" ? (
                                <button
                                  title="Entregar"
                                  className="ops-green"
                                  onClick={() =>
                                    notify(() =>
                                      changeStatus(o.id, "Entregado"),
                                    )
                                  }
                                >
                                  <Icon name="serve" />
                                  <span className="ops-action-caption">
                                    Entregar
                                  </span>
                                </button>
                              ) : null}
                              <button
                                title="Agregar producto"
                                className="ops-outline"
                                onClick={() =>
                                  navigate(
                                    `/mesera/nuevo-pedido?mesa=${o.table}`,
                                  )
                                }
                              >
                                <Icon name="plus" />
                                <span className="ops-action-caption">
                                  Agregar producto
                                </span>
                              </button>
                              <button
                                title="Solicitar cuenta"
                                className="ops-outline"
                                onClick={() =>
                                  notify(() =>
                                    updateTable(o.table!, {
                                      status: "Solicita cuenta",
                                    }),
                                  )
                                }
                              >
                                <Icon name="receipt" />
                                <span className="ops-action-caption">
                                  Solicitar cuenta
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </OperationsTable>
              </div>
              {!orders.length && <Empty />}
            </Panel>
            <div>
              <Panel title="Pedidos por estado">
                <Bars
                  values={[
                    "Recibido",
                    "En preparación",
                    "Listo",
                    "Entregado",
                  ].map((label) => ({
                    label,
                    value: orders.filter((o) => o.status === label).length,
                  }))}
                />
              </Panel>
              <aside className="ops-service-banner">
                <strong>
                  Buen servicio,
                  <br />
                  grandes momentos
                </strong>
                <p>Leñas y Sabores</p>
              </aside>
            </div>
          </div>
        </>
      )}
      {detail && (
        <OrderDetail
          order={state.orders.find((o) => o.id === detail.id) || detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
