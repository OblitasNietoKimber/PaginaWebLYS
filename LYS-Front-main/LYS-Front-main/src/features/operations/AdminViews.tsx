import { AdminSettings } from "./AdminSettings";
import { OrderEditor } from "./OrderEditor";
import { categories } from "../carta/catalog";
import { categoryIcon } from "./productHelpers";
import { OperationsTable } from "./OperationsTable";
import {
  Icon,
  type IconName,
} from "./OperationsVisuals";
import { dateText, localDateKey, downloadExcel, printLocal } from "./operationsFiles";
import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OperationsPageActions } from "./operationsPageContext";
import {
  useOperations,
  money,
  orderTotal,
  statuses,
  paymentMethods,
  changeStatus,
  type Order,
} from "./operationsStore";
import {
  Panel,
  Stats,
  Badge,
  Empty,
  Bars,
  LineChart,
  Donut,
  OrderDetail,
} from "./OperationsUI";
import {
  ProductManager,
  PromotionManager,
  UserManager,
  InventoryManager,
} from "./AdminManagers";

export function CategoryBadge({ category }: { category: string }) {
  const norm = category.toLowerCase().trim();
  const item = categories.find((c) => c.id === norm || c.name.toLowerCase() === norm);
  const id = item?.id || norm;
  return (
    <span className={`ops-category-badge ${id}`}>
      <Icon name={categoryIcon(id)} />
      {item?.name || category}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: string }) {
  const norm = channel.toLowerCase();
  const kind =
    norm.includes("salón") || norm.includes("salon")
      ? "salon"
      : norm.includes("delivery")
        ? "delivery"
        : "recojo";
  const label =
    kind === "salon"
      ? "Salón"
      : kind === "delivery"
        ? "Delivery"
        : "Recojo";
  const icon: IconName =
    kind === "salon"
      ? "table"
      : kind === "delivery"
        ? "scooter"
        : "bag";
  return (
    <span className={`ops-channel-badge ${kind}`}>
      <Icon name={icon} />
      {label}
    </span>
  );
}

export function InitialsAvatar({ name }: { name: string }) {
  const words = name.trim().split(/\s+/);
  const initials = (words[0]?.[0] || "") + (words[1]?.[0] || "");
  const tones = ["", "blue", "purple", "amber", "green"];
  const code = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const tone = tones[code % tones.length];
  return <span className={`ops-initials-avatar ${tone}`}>{initials.toUpperCase() || "U"}</span>;
}

export function RoleBadge({ role }: { role: string }) {
  const norm = role.toLowerCase();
  const kind = norm.includes("admin")
    ? "admin"
    : norm.includes("cocina")
      ? "cocina"
      : norm.includes("caja")
        ? "caja"
        : norm.includes("mesera")
          ? "mesera"
          : "delivery";
  const label =
    kind === "admin"
      ? "Administrador"
      : kind === "cocina"
        ? "Cocina"
        : kind === "caja"
          ? "Caja"
          : kind === "mesera"
            ? "Mesera"
            : "Delivery";
  const icon: IconName =
    kind === "admin"
      ? "shield"
      : kind === "cocina"
        ? "chef"
        : kind === "caja"
          ? "store"
          : kind === "mesera"
            ? "serve"
            : "scooter";
  return (
    <span className={`ops-role-badge ${kind}`}>
      <Icon name={icon} />
      {label}
    </span>
  );
}

export function AdminViews({
  section,
  notify,
  navigate,
}: {
  section: string;
  notify: (task: () => void) => void;
  navigate: (path: string) => void;
}) {
  const actionHost = useContext(OperationsPageActions);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const data = useOperations();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [detail, setDetail] = useState<Order | null>(null);
  const [editingOrder,setEditingOrder] = useState<Order|null>(null);
  const [selection,setSelection] = useState<string[]>([]);
  const [period, setPeriod] = useState("30");
  const [salesDays,setSalesDays] = useState("7");
  const [from,setFrom] = useState("");
  const [to,setTo] = useState("");
  const [orderPage,setOrderPage] = useState(1);
  const orders = data.orders.filter((o) => !o.draft);
  const activePayments = data.payments.filter((p) => !p.refunded);
  const today = new Date().toLocaleDateString();
  const sales = activePayments.reduce((s, p) => s + p.amount, 0);
  const daily = Array.from({ length: Number(salesDays) }, (_, i) => {
    const day = new Date(now - (Number(salesDays) - 1 - i) * 86400000);
    return {
      label: day.toLocaleDateString("es-PE", {
        day: "numeric",
        month: "short",
      }),
      value: activePayments
        .filter(
          (p) =>
            new Date(p.date).toLocaleDateString() === day.toLocaleDateString(),
        )
        .reduce((s, p) => s + p.amount, 0),
    };
  });
  const best = data.products
    .map((p) => ({
      label: p.name,
      category: p.category,
      image: p.image,
      revenue: orders.filter(o=>o.paid && o.status!=="Cancelado").flatMap(o=>o.items).filter(line=>line.product.id===p.id).reduce((sum,line)=>sum+line.product.price*line.count,0),
      value: orders
        .filter((o) => o.status !== "Cancelado")
        .flatMap((o) => o.items)
        .filter((l) => l.product.id === p.id)
        .reduce((s, l) => s + l.count, 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  if (section === "productos") return <ProductManager notify={notify} />;
  if (section === "promociones") return <PromotionManager notify={notify} />;
  if (section === "usuarios" || section === "clientes")
    return <UserManager clients={section === "clientes"} notify={notify} />;
  if (section === "inventario") return <InventoryManager notify={notify} />;
  if (section === "configuracion") return <AdminSettings notify={notify}/>;
  if (section === "pedidos") {
    const action = (
      <button className="ops-primary" onClick={() => navigate("/mesera/nuevo-pedido")}>
        <Icon name="circle-plus" />
        Nuevo pedido
      </button>
    );
    const newCount = orders.filter((o) => o.status === "Recibido").length;
    const prepCount = orders.filter((o) => o.status === "En preparación").length;
    const readyCount = orders.filter((o) => o.status === "Listo").length;
    const deliveredCount = orders.filter((o) => o.status === "Entregado").length;
    const filtered = orders.filter(
      (o) =>
        (!from || localDateKey(o.created)>=from) && (!to || localDateKey(o.created)<=to) &&
        (filter === "Todos" ||
          o.channel === filter ||
          (filter === "Cancelados" && o.status === "Cancelado")) &&
        (status === "Todos" || o.status === status) &&
        `${o.id} ${o.customer}`.toLowerCase().includes(search.toLowerCase().trim()),
    );
    const visibleOrderPage = Math.min(orderPage, Math.max(1, Math.ceil(filtered.length / 10)));

    return (
      <>
        {actionHost && createPortal(action, actionHost)}
        <Stats
          entries={[
            {
              label: "Nuevos",
              value: newCount,
              icon: "receipt",
              tone: "red",
              hint: "Pedidos pendientes",
            },
            {
              label: "En preparación",
              value: prepCount,
              icon: "chef",
              tone: "gold",
              hint: "Pedidos en cocina",
            },
            {
              label: "Listos",
              value: readyCount,
              icon: "serve",
              tone: "blue",
              hint: "Pedidos listos para entregar",
            },
            {
              label: "Entregados",
              value: deliveredCount,
              icon: "check",
              tone: "green",
              hint: "Pedidos completados",
            },
          ]}
        />
        <div className="ops-admin-filter-bar" aria-label="Filtros de pedidos">
          <div className="ops-admin-search">
            <Icon name="search" />
            <input
              aria-label="Buscar número o cliente"
              placeholder="Buscar por número de pedido o cliente…"
              value={search}
              onChange={e => { setSearch(e.target.value); setOrderPage(1); setSelection([]); }}
            />
          </div>
          <div className="ops-admin-filter-group">
            <label htmlFor="canal-filter">Canal</label>
            <select
              id="canal-filter"
              aria-label="Canal"
              value={filter}
              onChange={e => { setFilter(e.target.value); setOrderPage(1); setSelection([]); }}
            >
              {["Todos", "Salón", "Delivery", "Recojo"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="ops-admin-filter-group">
            <label htmlFor="estado-filter">Estado</label>
            <select
              id="estado-filter"
              aria-label="Filtrar resultados"
              value={status}
              onChange={e => { setStatus(e.target.value); setOrderPage(1); setSelection([]); }}
            >
              <option value="Todos">Todos</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="ops-admin-filter-group">
            <label htmlFor="desde-filter">Fecha desde</label>
            <input
              id="desde-filter"
              type="date"
              aria-label="Fecha desde"
              value={from}
              onChange={e=>{setFrom(e.target.value);setOrderPage(1);setSelection([]);}}
            />
          </div>
          <div className="ops-admin-filter-group">
            <label htmlFor="hasta-filter">Fecha hasta</label>
            <input
              id="hasta-filter"
              type="date"
              aria-label="Fecha hasta"
              value={to}
              onChange={e=>{setTo(e.target.value);setOrderPage(1);setSelection([]);}}
            />
          </div>
          <button className="ops-btn-export" onClick={()=>downloadExcel("pedidos",["Pedido","Fecha","Cliente","Canal","Total","Estado"],filtered.filter(o=>!selection.length || selection.includes(o.id)).map(o=>[o.id,dateText(o.created),o.customer,o.channel,orderTotal(o),o.status]))}>
            <Icon name="download" data-ops-action="export"/> Exportar
          </button>
          <button
            className="ops-btn-clear-filters ops-clear-order-filters"
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("Todos");
              setStatus("Todos");
              setFrom("");
              setTo("");
              setOrderPage(1);
              setSelection([]);
            }}
          >
            <Icon name="trash" /> Eliminar filtros
          </button>
        </div>
        <div className="ops-table-wrap">
          <OperationsTable>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" aria-label="Seleccionar todos los pedidos" checked={filtered.length>0 && filtered.every(o=>selection.includes(o.id))} onChange={e=>setSelection(e.target.checked ? filtered.map(o=>o.id):[])}/>
                </th>
                <th># Pedido</th>
                <th>Cliente</th>
                <th>Canal</th>
                <th>Total</th>
                <th>Hora</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((visibleOrderPage-1)*10,visibleOrderPage*10).map((o) => (
                <tr key={o.id} className={o.id === detail?.id ? "selected-row" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar pedido ${o.id}`}
                      checked={selection.includes(o.id)}
                      onChange={e=>setSelection(old=>e.target.checked ? [...old,o.id]:old.filter(id=>id!==o.id))}
                    />
                  </td>
                  <td>
                    <strong>#{o.id}</strong>
                  </td>
                  <td>
                    <div className="ops-person-cell">
                      <div>
                        <strong>{o.customer}</strong>
                        <small>{o.phone || "Sin teléfono"}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <ChannelBadge channel={o.channel} />
                  </td>
                  <td>
                    <strong>{money(orderTotal(o))}</strong>
                  </td>
                  <td>
                    <time dateTime={o.created}>
                      {new Date(o.created).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </time>
                  </td>
                  <td>
                    {new Date(o.created).toLocaleDateString("es-PE")}
                  </td>
                  <td>
                    <Badge value={o.status} />
                  </td>
                  <td>
                    <div className="ops-table-actions">
                      <button
                        className="btn-view"
                        title="Ver detalle"
                        aria-label={`Ver pedido #${o.id}`}
                        onClick={() => {
                          setDetail(o);
                        }}
                      >
                        <Icon name="eye" />
                      </button>
                      <button
                        className="btn-edit"
                        title="Editar pedido"
                        aria-label={`Editar pedido #${o.id}`}
                        disabled={o.paid || (o.status!=="Recibido" && !o.draft)}
                        onClick={() => setEditingOrder(o)}
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        className="btn-delete"
                        title="Cancelar pedido"
                        aria-label={`Cancelar pedido #${o.id}`}
                        onClick={() =>
                          notify(() => changeStatus(o.id, "Cancelado"))
                        }
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </OperationsTable>
          {!filtered.length && (
            <Empty>No se encontraron pedidos con los filtros seleccionados.</Empty>
          )}
        </div>
        <div className="ops-pagination">
          <span>
            Mostrando {filtered.length ? (visibleOrderPage-1)*10+1 : 0} a {Math.min(visibleOrderPage*10, filtered.length)} de {filtered.length} pedidos
          </span>
          <button disabled={visibleOrderPage===1} onClick={()=>setOrderPage(visibleOrderPage-1)} aria-label="Página anterior">
            <Icon name="chevron" />
          </button>
          <span aria-current="page">{visibleOrderPage}</span>
          <button
            disabled={visibleOrderPage*10>=filtered.length}
            onClick={()=>setOrderPage(visibleOrderPage+1)}
            aria-label="Página siguiente"
          >
            <Icon name="chevron" />
          </button>
        </div>
        {editingOrder && <OrderEditor order={editingOrder} onClose={()=>setEditingOrder(null)} notify={notify}/>}
        {detail && (
          <OrderDetail
            order={data.orders.find((o) => o.id === detail.id) || detail}
            onClose={() => setDetail(null)}
          />
        )}
      </>
    );
  }
  if (section === "reportes") {
    const reportOrders = orders.filter(
      (o) => Date.parse(o.created) >= now - Number(period) * 86400000,
    );
    const reportSales = activePayments
      .filter((p) => Date.parse(p.date) >= now - Number(period) * 86400000)
      .reduce((s, p) => s + p.amount, 0);
    const reportPayments = activePayments.filter(
      (p) => Date.parse(p.date) >= now - Number(period) * 86400000,
    );
    const reportMethods = paymentMethods.map((label) => ({
      label,
      value: reportPayments
        .filter((p) => p.method === label)
        .reduce((sum, p) => sum + p.amount, 0),
    }));
    const reportBest = data.products
      .map((product) => ({
        label: product.name,
        category: product.category,
        revenue: reportOrders.filter(o=>o.status!=="Cancelado").flatMap(o=>o.items).filter(l=>l.product.id===product.id).reduce((sum,l)=>sum+l.count*l.product.price,0),
        value: reportOrders
          .filter((o) => o.status !== "Cancelado")
          .flatMap((o) => o.items)
          .filter((line) => line.product.id === product.id)
          .reduce((sum, line) => sum + line.count, 0),
        image: product.image,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const reportDaily = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * 86400000);
      return {
        label: date.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "short",
        }),
        value: reportPayments
          .filter(
            (p) =>
              new Date(p.date).toLocaleDateString() ===
              date.toLocaleDateString(),
          )
          .reduce((sum, p) => sum + p.amount, 0),
      };
    });

    const headerAction = (
      <div className="ops-header-actions">
        <div className="ops-header-date-pill">
          <Icon name="calendar" />
          <select aria-label="Periodo del reporte" value={period} onChange={e=>setPeriod(e.target.value)}>{["7","30","90"].map(n=><option key={n} value={n}>Últimos {n} días</option>)}</select>
          <Icon name="chevron" />
        </div>
        <button
          className="ops-primary"
          onClick={() =>
            downloadExcel(
              "reporte",
              ["Pedido", "Fecha", "Cliente", "Total", "Estado"],
              reportOrders.map((o) => [
                o.id,
                dateText(o.created),
                o.customer,
                orderTotal(o),
                o.status,
              ]),
            )
          }
        >
          <Icon name="download" data-ops-action="export"/> Exportar reporte
        </button>
      </div>
    );

    return (
      <>
        {actionHost && createPortal(headerAction, actionHost)}
        <div className="ops-toolbar" style={{ display: "none" }}>
          <select aria-label="Filtrar resultados" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {["7", "30", "90"].map((n) => (
              <option key={n} value={n}>
                Últimos {n} días
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              notify(() =>
                printLocal("Reportes y analítica", [
                  `Últimos ${period} días`,
                  `Ventas: ${money(reportSales)}`,
                  `Pedidos: ${reportOrders.length}`,
                  ...reportOrders.map(
                    (o) =>
                      `${o.id} · ${o.customer} · ${money(orderTotal(o))} · ${o.status}`,
                  ),
                ]),
              )
            }
          >
            Imprimir
          </button>
        </div>
        <Stats
          entries={[
            {
              label: "Ventas totales",
              value: money(reportSales),
              icon: "chart",
              tone: "green",
              hint: "Según los registros del periodo",
            },
            {
              label: "Pedidos realizados",
              value: reportOrders.length,
              icon: "cart",
              tone: "red",
              hint: "Según los registros del periodo",
            },
            {
              label: "Ticket promedio",
              value: money(
                reportOrders.length ? reportSales / reportOrders.length : 0,
              ),
              icon: "tag",
              tone: "blue",
              hint: "Según los registros del periodo",
            },
          ]}
        />
        <div className="ops-split">
          <Panel title="Ventas diarias">
            <LineChart values={reportDaily} />
          </Panel>
          <Panel title="Ventas por canal">
            <Donut
              values={["Salón","Delivery","Recojo"].map(label=>({label,value:reportPayments.filter(p=>reportOrders.some(o=>o.id===p.orderId && o.channel===label)).reduce((sum,p)=>sum+p.amount,0)}))}
            />
          </Panel>
        </div>
        <div className="ops-split">
          <Panel title="Métodos de pago">
            <Bars values={reportMethods} />
          </Panel>
          <Panel title="Productos más vendidos">
            <div className="ops-table-wrap">
              <OperationsTable>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Unidades</th>
                    <th>Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {reportBest.map((item, index) => (
                    <tr key={item.label}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="ops-product-cell">
                          <img src={item.image} alt="" />
                          <span>{item.label}</span>
                        </div>
                      </td>
                      <td>
                        <CategoryBadge category={item.category} />
                      </td>
                      <td>{item.value}</td>
                      <td>{money(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </OperationsTable>
            </div>
          </Panel>
        </div>
      </>
    );
  }

  const headerAction = (
    <div className="ops-header-date-pill">
      <Icon name="calendar" />
      <span>{new Date(now).toLocaleDateString("es-PE", {day:"numeric",month:"long",year:"numeric"})}</span>
      <Icon name="chevron" />
    </div>
  );

  return (
    <>
      {actionHost && createPortal(headerAction, actionHost)}
      <div className="reference-dashboard">
      <Stats
        entries={[
          {
            label: "Ventas de hoy",
            value: money(
              activePayments
                .filter((p) => new Date(p.date).toLocaleDateString() === today)
                .reduce((s, p) => s + p.amount, 0),
            ),
            icon: "store",
            mobileIcon: "cart",
            tone: "red",
            hint: "Total cobrado hoy",
          },
          {
            label: "Pedidos de hoy",
            value: orders.filter(o=>new Date(o.created).toLocaleDateString()===today).length,
            icon: "receipt",
            tone: "gold",
            hint: "Recibidos hoy",
          },
          {
            label: "Ticket promedio",
            value: money(orders.length ? sales / orders.length : 0),
            icon: "cart",
            mobileIcon: "chart",
            tone: "blue",
            hint: "Importe por pedido",
          },
          {
            label: "Pedidos activos",
            value:
              orders.filter(
                (o) => !["Entregado", "Cancelado"].includes(o.status),
              ).length,
            icon: "clock",
            tone: "green",
            hint: "En preparación",
          },
        ]}
      />
      <div className="ops-split">
        <Panel
          title="Ventas de la semana"
          action={
            <div className="ops-select-wrap">
              <select
                aria-label="Rango de ventas"
                className="ops-sales-select"
                value={salesDays}
                onChange={(e) => setSalesDays(e.target.value)}
              >
                <option value="7">Últimos 7 días</option>
                <option value="15">Últimos 15 días</option>
                <option value="30">Últimos 30 días</option>
              </select>
              <Icon name="chevron" className="ops-select-chevron" />
            </div>
          }
        >
          <LineChart values={daily} />
        </Panel>
        <Panel
          title="Top 5 productos más vendidos"
          action={
            <button
              className="ops-outline"
              onClick={() => navigate("/administrador/productos")}
            >
              <span className="dashboard-desktop-copy">Ver todos los productos</span><span className="dashboard-mobile-copy">Ver todos</span> <Icon name="chevron" />
            </button>
          }
        >
          <div className="ops-table-wrap">
            <OperationsTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th className="ops-col-center">Categoría</th>
                  <th>Cantidad</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {best.map((item, index) => (
                  <tr key={item.label}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="ops-product-cell">
                        <img src={item.image} alt="" />
                        <div><strong>{item.label}</strong><small className="dashboard-product-category">{categories.find(c => c.id === item.category)?.name || item.category}</small></div>
                      </div>
                    </td>
                    <td className="ops-col-center">
                      <CategoryBadge category={item.category} />
                    </td>
                    <td><strong>{item.value}</strong><span className="dashboard-mobile-copy"> vendidos</span></td>
                    <td>{money(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </OperationsTable>
          </div>
        </Panel>
      </div>
      <Panel
        title="Pedidos recientes"
        action={
            <button
              className="ops-outline"
              onClick={() => navigate("/administrador/pedidos")}
            >
              <span className="dashboard-desktop-copy">Ver todos los pedidos</span><span className="dashboard-mobile-copy">Ver todos</span> <Icon name="chevron" />
            </button>
        }
      >
        <div className="ops-table-wrap">
          <OperationsTable>
            <thead>
              <tr>
                <th># Pedido</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>#{o.id}</strong>
                  </td>
                  <td>
                    <time dateTime={o.created}>
                      {new Date(o.created).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </time>
                  </td>
                  <td>{o.customer}</td>
                  <td>
                    <ChannelBadge channel={o.channel} />
                  </td>
                  <td>
                    {o.items[0]?.count || 1} {o.items[0]?.product.name || "Pollo a la Brasa"}
                    {o.items.length > 1 ? `, +${o.items.length - 1} más` : ""}
                  </td>
                  <td>
                    <strong>{money(orderTotal(o))}</strong>
                  </td>
                  <td>
                    <Badge value={o.status} />
                  </td>
                  <td>
                    <div className="ops-table-actions">
                      <button
                        className="btn-view"
                        title="Ver detalle"
                        aria-label={`Ver pedido #${o.id}`}
                        onClick={() => {
                          setDetail(o);
                        }}
                      >
                        <Icon name="eye" />
                      </button>
                      <button
                        className="btn-edit"
                        title="Editar pedido"
                        aria-label={`Editar pedido #${o.id}`}
                        disabled={o.paid || (o.status!=="Recibido" && !o.draft)}
                        onClick={() => setEditingOrder(o)}
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        className="btn-delete"
                        title="Cancelar pedido"
                        aria-label={`Cancelar pedido #${o.id}`}
                        onClick={() =>
                          notify(() => changeStatus(o.id, "Cancelado"))
                        }
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </OperationsTable>
        </div>
      </Panel>
      </div>
      {editingOrder && <OrderEditor order={editingOrder} onClose={()=>setEditingOrder(null)} notify={notify}/>}
      {detail && (
        <OrderDetail
          order={data.orders.find((o) => o.id === detail.id) || detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
