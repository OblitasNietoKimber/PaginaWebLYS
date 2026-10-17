import { OperationsPagination } from "./OperationsPagination";
import { OperationsDialog } from "./OperationsDialog";
import { OperationsTable } from "./OperationsTable";
import { SupplySummary, Icon } from "./OperationsVisuals";
import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { OperationsPageActions } from "./operationsPageContext";
import { InitialsAvatar, RoleBadge } from "./AdminViews";
import { downloadExcel, localDateKey } from "./operationsFiles";
import {
  createLocalUser,
  editLocalUser,
  readUsers,
  roleNames,
  useSession,
  type Role,
  type LocalUser,
} from "../../services/localAuth";
import {
  useOperations,
  saveOffer,
  deleteOffer,
  saveSupply,
  deleteSupply,
  moveSupply,
  saveSupplier,
  money,
  type Offer,
  type Supply,
  type Supplier,
} from "./operationsStore";
import { Panel, Stats, Badge, Empty } from "./OperationsUI";
export { ProductManager } from "./ProductManager";
const userCountLabel = (count: number) => `${count} ${count === 1 ? "usuario" : "usuarios"}`;
const blankOffer = (): Offer => ({
  id: crypto.randomUUID(),
  name: "",
  type: "Combo",
  productId: "",
  percent: 10,
  code: "",
  start: localDateKey(new Date().toISOString()),
  end: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  active: true,
  used: 0,
  limit: 100,
});
export function PromotionManager({
  notify,
}: {
  notify: (task: () => void) => void;
}) {
  const actionHost = useContext(OperationsPageActions);
  const data = useOperations();
  const [offer, setOffer] = useState(blankOffer);
  const [deletingOffer, setDeletingOffer] = useState<Offer | null>(null);
  const [offerPage,setOfferPage] = useState(1);
  const [offerSelection,setOfferSelection] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const activeCount = data.offers.filter((o) => o.active && o.start<=localDateKey(new Date().toISOString()) && o.end>=localDateKey(new Date().toISOString())).length;
  const totalUsed = data.offers.reduce((s, o) => s + o.used, 0);

  const action = (
    <button
      className="ops-primary"
      onClick={() => {
        setOffer(blankOffer());
        setEditorOpen(true);
      }}
    >
      <Icon name="circle-plus" />
      Nueva promoción
    </button>
  );

  const filteredOffers = data.offers.filter(
    (o) =>
      (filter === "Todos" || o.type === filter) &&
      (statusFilter === "Todos" ||
        (statusFilter === "Activa" && o.active) ||
        (statusFilter === "Inactiva" && !o.active)) &&
      (o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.code.toLowerCase().includes(search.toLowerCase())),
  );

  const visibleOfferPage=Math.min(offerPage,Math.max(1,Math.ceil(filteredOffers.length/10)));
  const exportPromotions = () =>
    downloadExcel(
      "promociones",
      ["Promoción", "Tipo", "Beneficio", "Vigencia", "Canjes", "Estado"],
      filteredOffers.filter(o=>!offerSelection.length || offerSelection.includes(o.id)).map((o) => [
        o.name,
        o.type,
        `-${o.percent}%`,
        `${o.start} al ${o.end}`,
        `${o.used} / ${o.limit}`,
        o.active ? "Activa" : "Inactiva",
      ]),
    );

  return (
    <>
      {actionHost && createPortal(action, actionHost)}
      <Stats
        entries={[
          {
            label: "Promociones activas",
            value: activeCount,
            icon: "flame",
            tone: "red",
            hint: "Vigentes hoy",
          },
          {
            label: "Programadas",
            value: data.offers.filter(o=>o.active && o.start>localDateKey(new Date().toISOString())).length,
            icon: "clock",
            tone: "blue",
            hint: "Próximas a iniciar",
          },
          {
            label: "Finalizadas",
            value: data.offers.filter(o=>o.end<localDateKey(new Date().toISOString())).length,
            icon: "tag",
            tone: "gold",
            hint: "Histórico",
          },
          {
            label: "Total canjes",
            value: totalUsed,
            icon: "gift",
            tone: "green",
            hint: "Canjes registrados",
          },
        ]}
      />
      <div className="ops-admin-filter-bar" aria-label="Filtros de promociones">
        <div className="ops-admin-search">
          <Icon name="search" />
          <input
            aria-label="Buscar promociones"
            placeholder="Buscar por nombre o código de cupón…"
            value={search}
            onChange={e => { setSearch(e.target.value); setOfferSelection([]); setOfferPage(1); }}
          />
        </div>
        <div className="ops-admin-filter-group">
          <label htmlFor="promo-estado">Estado</label>
          <select
            id="promo-estado"
            aria-label="Estado"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setOfferSelection([]); setOfferPage(1); }}
          >
            <option value="Todos">Todos</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
          </select>
        </div>
        <div className="ops-admin-filter-group">
          <label htmlFor="promo-tipo">Tipo</label>
          <select
            id="promo-tipo"
            aria-label="Tipo"
            value={filter}
            onChange={e => { setFilter(e.target.value); setOfferSelection([]); setOfferPage(1); }}
          >
            {["Todos", "Combo", "Descuento", "Cupón"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button className="ops-btn-export" onClick={exportPromotions}>
          <Icon name="download" data-ops-action="export"/> Exportar
        </button>
        <button
          className="ops-btn-clear-filters"
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("Todos");
            setFilter("Todos");
            setOfferSelection([]);
            setOfferPage(1);
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
                <input
                  type="checkbox"
                  aria-label="Seleccionar todas las promociones"
                  checked={filteredOffers.length>0 && filteredOffers.every(o=>offerSelection.includes(o.id))}
                  onChange={e=>setOfferSelection(e.target.checked ? filteredOffers.map(o=>o.id):[])}
                />
              </th>
              <th>Promoción</th>
              <th>Tipo</th>
              <th>Beneficio</th>
              <th>Vigencia</th>
              <th>Uso / Límite</th>
              <th className="ops-col-center">Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers.slice((visibleOfferPage-1)*10,visibleOfferPage*10).map((o) => (
              <tr key={o.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar promoción ${o.name}`}
                    checked={offerSelection.includes(o.id)}
                    onChange={e=>setOfferSelection(old=>e.target.checked ? [...old,o.id]:old.filter(id=>id!==o.id))}
                  />
                </td>
                <td>
                  <div className="ops-person-cell">
                    <div className="ops-promotion-photo">
                      <img
                        src={
                          data.products.find((p) => p.id === o.productId)
                            ?.image || "/images/promotions/familiar.webp"
                        }
                        alt=""
                      />
                      <span>-{o.percent}%</span>
                    </div>
                    <div>
                      <strong>{o.name}</strong>
                      <small>
                        {o.code
                          ? `Cupón: ${o.code}`
                          : data.products.find((p) => p.id === o.productId)
                              ?.name || "Carta general"}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge value={o.type} />
                </td>
                <td>
                  <strong>-{o.percent}%</strong>
                </td>
                <td>
                  <small style={{ color: "#475569" }}>
                    {o.start} al {o.end}
                  </small>
                </td>
                <td>
                  <strong>{o.used}</strong> / {o.limit}
                </td>
                <td className="ops-col-center">
                  <button
                    type="button"
                    className={`ops-switch ${o.active ? "on" : ""}`}
                    aria-label={`Activar ${o.name}`}
                    title={o.active ? "Activa (clic para desactivar)" : "Inactiva (clic para activar)"}
                    aria-pressed={o.active}
                    onClick={() =>
                      notify(() => saveOffer({ ...o, active: !o.active }))
                    }
                  ><span aria-hidden="true" className="ops-state-track"><span className="ops-state-thumb"/></span></button>
                </td>
                <td>
                  <div className="ops-table-actions">
                    <button
                      className="btn-edit"
                      title="Editar promoción"
                      aria-label={`Editar ${o.name}`}
                      onClick={() => {
                        setOffer({ ...o });
                        setEditorOpen(true);
                      }}
                    >
                      <Icon name="edit" />
                    </button>
                    <button className="btn-delete" title="Eliminar promoción" aria-label={`Eliminar ${o.name}`} onClick={() => setDeletingOffer(o)}>
                      <Icon name="trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </OperationsTable>
        {!filteredOffers.length && (
          <Empty>No se encontraron promociones con los filtros seleccionados.</Empty>
        )}
      </div>

      {deletingOffer && <OperationsDialog title="Eliminar promoción" onClose={() => setDeletingOffer(null)}>
        <p>¿Deseas eliminar la promoción <strong>{deletingOffer.name}</strong>? Esta acción no se puede deshacer.</p>
        <div className="ops-dialog-footer">
          <button onClick={() => setDeletingOffer(null)}>Cancelar</button>
          <button className="ops-primary" onClick={() => notify(() => { deleteOffer(deletingOffer.id); setOfferSelection(ids => ids.filter(id => id !== deletingOffer.id)); setDeletingOffer(null); })}><Icon name="trash"/>Eliminar promoción</button>
        </div>
      </OperationsDialog>}
      <OperationsPagination count={filteredOffers.length} page={visibleOfferPage} onChange={setOfferPage} label="promociones"/>
        {editorOpen && <OperationsDialog onClose={() => setEditorOpen(false)} title="Crear / Editar promoción">
          <form
            className="ops-form"
            onSubmit={(e) => {
              e.preventDefault();
              notify(() => {
                if (offer.type === "Cupón" && !offer.code.trim())
                  throw new Error("Ingresa un código de cupón.");
                if (offer.type !== "Cupón" && !offer.productId)
                  throw new Error("Selecciona un producto.");
                saveOffer(offer);
                setOffer(blankOffer());
                setEditorOpen(false);
              });
            }}
          >
            <label>
              Nombre
              <input
                required
                value={offer.name}
                onChange={(e) => setOffer({ ...offer, name: e.target.value })}
              />
            </label>
            <label>
              Tipo
              <select
                value={offer.type}
                onChange={(e) => setOffer({ ...offer, type: e.target.value })}
              >
                {["Combo", "Descuento", "Cupón"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Producto aplicable
              <select
                value={offer.productId}
                onChange={(e) =>
                  setOffer({ ...offer, productId: e.target.value })
                }
              >
                <option value="">Todos (solo cupón)</option>
                {data.products
                  .filter((p) => p.active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Descuento (%)
              <input
                type="number"
                min="0"
                max="100"
                required
                value={offer.percent}
                onChange={(e) =>
                  setOffer({ ...offer, percent: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Fecha de inicio
              <input
                type="date"
                required
                value={offer.start}
                onChange={(e) => setOffer({ ...offer, start: e.target.value })}
              />
            </label>
            <label>
              Fecha de fin
              <input
                type="date"
                required
                value={offer.end}
                onChange={(e) => setOffer({ ...offer, end: e.target.value })}
              />
            </label>
            <label>
              Código de cupón
              <input
                value={offer.code}
                onChange={(e) =>
                  setOffer({ ...offer, code: e.target.value.toUpperCase() })
                }
              />
            </label>
            <label>
              Límite de usos
              <input
                type="number"
                min="1"
                value={offer.limit}
                onChange={(e) =>
                  setOffer({ ...offer, limit: Number(e.target.value) })
                }
              />
            </label>
            <label className="ops-check">
              <input
                type="checkbox"
                checked={offer.active}
                onChange={(e) =>
                  setOffer({ ...offer, active: e.target.checked })
                }
              />
              Promoción activa
            </label>
            <div className="ops-dialog-footer">
              <button type="button" onClick={() => setEditorOpen(false)}>
                Cancelar
              </button>
              <button className="ops-primary">
                <Icon name="save" /> Guardar promoción
              </button>
            </div>
          </form>
        </OperationsDialog>}
    </>
  );
}
export function UserManager({
  clients = false,
  notify,
}: {
  clients?: boolean;
  notify: (task: () => void) => void;
}) {
  const actionHost = useContext(OperationsPageActions);
  const [userPage,setUserPage] = useState(1);
  const [monthStart] = useState(()=>{const date=new Date();return new Date(date.getFullYear(),date.getMonth(),1).getTime();});
  const [userSelection,setUserSelection] = useState<string[]>([]);
  useSession();
  const data = useOperations();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [editing, setEditing] = useState<LocalUser | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [view, setView] = useState<LocalUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(clients ? "cliente" : "mesera");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const users = readUsers().filter((u) =>
    clients ? u.role === "cliente" : u.role !== "cliente",
  );

  const customerOrders = (u:LocalUser) => data.orders.filter(o=>o.customerId===u.id || (u.email.endsWith("@preview.example") && o.customerId==="kitchen-preview" && o.customer===u.name));

  const select = (u: LocalUser) => {
    setEditorOpen(true);
    setEditing(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setRole(u.role);
  };

  const reset = () => {
    setEditorOpen(false);
    setEditing(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setError("");
  };

  const action = (
    <button
      className="ops-primary"
      onClick={() => {
        reset();
        setEditorOpen(true);
      }}
    >
      <Icon name="circle-plus" />
      {clients ? "Nuevo cliente" : "Nuevo usuario"}
    </button>
  );

  const filteredUsers = users.filter((u) => {
    const matchesSearch = `${u.name} ${u.email} ${u.phone}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = filter === "Todos" || u.role === filter;
    const matchesStatus =
      statusFilter === "Todos" ||
      (statusFilter === "Activos" && u.active) ||
      (statusFilter === "Inactivos" && !u.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const exportUsers = () =>
    downloadExcel(
      clients ? "clientes" : "usuarios",
      clients
        ? ["Nombre", "Email", "Teléfono", "Pedidos", "Gasto Total", "Estado"]
        : ["Nombre", "Email", "Teléfono", "Rol", "Estado"],
      filteredUsers.filter(u=>!userSelection.length || userSelection.includes(u.id)).map((u) => {
        const userOrders = customerOrders(u);
        const totalSpend = userOrders
          .filter((o) => o.paid)
          .reduce(
            (s, o) =>
              s +
              o.items.reduce((sum, line) => sum + line.count * line.product.price, 0),
            0,
          );
        return clients
          ? [
              u.name,
              u.email,
              u.phone,
              userOrders.length,
              money(totalSpend),
              u.active ? "Activo" : "Inactivo",
            ]
          : [u.name, u.email, u.phone, roleNames[u.role], u.active ? "Activo" : "Inactivo"];
      }),
    );

  const visibleUserPage=Math.min(userPage,Math.max(1,Math.ceil(filteredUsers.length/10)));
  const activeCount = users.filter((u) => u.active).length;

  return (
    <>
      {actionHost && createPortal(action, actionHost)}
      {clients ? (
        <Stats
          entries={[
            {
              label: "Total de clientes",
              value: users.length,
              icon: "users",
              tone: "red",
              hint: "Registrados en plataforma",
            },
            {
              label: "Nuevos clientes",
              value: users.filter(u=>Date.parse(u.created)>=monthStart).length,
              icon: "user",
              tone: "green",
              hint: "Registrados este mes",
            },
            {
              label: "Clientes recurrentes",
              value:
                users.filter(
                  (u) =>
                    customerOrders(u).length > 3,
                ).length,
              icon: "clock",
              tone: "blue",
              hint: "Más de 3 pedidos",
            },
          ]}
        />
      ) : (
        <Stats
          entries={[
            {
              label: "Usuarios totales",
              value: users.length,
              icon: "users",
              tone: "red",
              hint: "Cuentas en el sistema",
            },
            {
              label: "Usuarios activos",
              value: activeCount,
              icon: "user",
              tone: "green",
              hint: "Cuentas habilitadas",
            },
            {
              label: "Roles definidos",
              value: 5,
              icon: "shield",
              tone: "blue",
              hint: "Cocina, Caja, Salón, Delivery",
            },
            {
              label: "Usuarios inactivos",
              value: users.length-activeCount,
              icon: "user",
              tone: "gold",
              hint: "Cuentas deshabilitadas",
            },
          ]}
        />
      )}

      <div
        className="ops-admin-filter-bar"
        aria-label={clients ? "Filtros de clientes" : "Filtros de usuarios"}
      >
        <div className="ops-admin-search">
          <Icon name="search" />
          <input
            aria-label="Buscar nombre, correo o teléfono"
            placeholder={
              clients
                ? "Buscar cliente por nombre, correo o teléfono…"
                : "Buscar usuario por nombre o correo…"
            }
            value={search}
            onChange={e => { setSearch(e.target.value); setUserSelection([]); setUserPage(1); }}
          />
        </div>
        {!clients && (
          <div className="ops-admin-filter-group">
            <label htmlFor="user-rol">Rol</label>
            <select
              id="user-rol"
              aria-label="Filtrar resultados"
              value={filter}
              onChange={e => { setFilter(e.target.value); setUserSelection([]); setUserPage(1); }}
            >
              <option value="Todos">Todos los roles</option>
              {Object.entries(roleNames)
                .filter(([r]) => r !== "cliente")
                .map(([r, n]) => (
                  <option key={r} value={r}>
                    {n}
                  </option>
                ))}
            </select>
          </div>
        )}
        <div className="ops-admin-filter-group">
          <label htmlFor="user-estado">Estado</label>
          <select
            id="user-estado"
            aria-label="Estado"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setUserSelection([]); setUserPage(1); }}
          >
            <option value="Todos">Todos</option>
            <option value="Activos">Activos</option>
            <option value="Inactivos">Inactivos</option>
          </select>
        </div>
        <button className="ops-btn-export" onClick={exportUsers}>
          <Icon name="download" data-ops-action="export"/> Exportar
        </button>
        <button
          className="ops-btn-clear-filters"
          type="button"
          onClick={() => {
            setSearch("");
            setFilter("Todos");
            setStatusFilter("Todos");
            setUserSelection([]);
            setUserPage(1);
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
                <input
                  type="checkbox"
                  aria-label={
                    clients
                      ? "Seleccionar todos los clientes"
                      : "Seleccionar todos los usuarios"
                  }
                  checked={filteredUsers.length>0 && filteredUsers.every(u=>userSelection.includes(u.id))}
                  onChange={e=>setUserSelection(e.target.checked ? filteredUsers.map(u=>u.id):[])}
                />
              </th>
              <th>{clients ? "Cliente" : "Usuario"}</th>
              {clients && <th>Teléfono</th>}
              {clients && <th>Pedidos realizados</th>}
              {clients && <th>Total gastado</th>}
              {!clients && <th>Rol</th>}
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice((visibleUserPage-1)*10,visibleUserPage*10).map((u) => {
              const userOrders = customerOrders(u);
              const totalSpend = userOrders
                .filter((o) => o.paid)
                .reduce(
                  (s, o) =>
                    s +
                    o.items.reduce(
                      (sum, line) => sum + line.count * line.product.price,
                      0,
                    ),
                  0,
                );
              return (
                <tr key={u.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${u.name}`}
                      checked={userSelection.includes(u.id)}
                      onChange={e=>setUserSelection(old=>e.target.checked ? [...old,u.id]:old.filter(id=>id!==u.id))}
                    />
                  </td>
                  <td>
                    <div className="ops-person-cell">
                      <InitialsAvatar name={u.name} />
                      <div>
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                        {clients && <small className="anchor-client-phone">{u.phone || "Sin teléfono"}</small>}
                      </div>
                    </div>
                  </td>
                  {clients && <td>{u.phone || "Sin teléfono"}</td>}
                  {clients && (
                    <td>
                      <strong>{userOrders.length} pedidos</strong>
                    </td>
                  )}
                  {clients && (
                    <td>
                      <strong>{money(totalSpend)}</strong>
                    </td>
                  )}
                  {!clients && (
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                  )}
                  <td>
                    <button
                      className={`ops-promotion-state ${u.active ? "on" : ""}`}
                      title={u.active ? "Activo · Pulsar para desactivar" : "Inactivo · Pulsar para activar"}
                      aria-label={`Estado de ${u.name}`}
                      aria-pressed={u.active}
                      onClick={() =>
                        notify(() => editLocalUser(u.id, { active: !u.active }))
                      }
                    ><span aria-hidden="true" className="ops-state-track"><span className="ops-state-thumb"/></span></button>
                  </td>
                  <td>
                    <div className="ops-table-actions">
                      <button
                        className="btn-view"
                        title={clients ? "Ver historial" : "Ver usuario"}
                        aria-label={`Ver ${u.name}`}
                        onClick={() => setView(u)}
                      >
                        <Icon name="eye" />
                      </button>
                      <button
                        className="btn-edit"
                        title="Editar"
                        aria-label={`Editar ${u.name}`}
                        onClick={() => select(u)}
                      >
                        <Icon name="edit" />
                      </button>
                      {!clients && (
                        <button
                          className="btn-delete"
                          title="Desactivar usuario"
                          aria-label={`Desactivar usuario ${u.name}`}
                          onClick={() =>
                            notify(() => editLocalUser(u.id, { active: false }))
                          }
                        >
                          <Icon name="trash" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </OperationsTable>
        {!filteredUsers.length && (
          <Empty>
            {clients
              ? "No se encontraron clientes registrados con los filtros seleccionados."
              : "No se encontraron usuarios con los filtros seleccionados."}
          </Empty>
        )}
      </div>

      <OperationsPagination count={filteredUsers.length} page={visibleUserPage} onChange={setUserPage} label={clients ? "clientes":"usuarios"}/>

      {!clients && (
        <div className="ops-settings-card" style={{ marginTop: "24px" }}>
          <div className="ops-settings-card-header">
            <h3>Roles y permisos del sistema</h3>
            <p>
              Perfiles operativos asignados al personal del restaurante Leña y
              Sabores
            </p>
          </div>
          <div className="ops-roles-summary-grid">
            <div className="ops-role-card">
              <div className="ops-role-card-icon admin">
                <Icon name="shield" />
              </div>
              <div className="ops-role-card-content">
                <strong>Administrador</strong>
                <span>
                  {userCountLabel(users.filter((u) => u.role === "administrador").length)}
                </span>
                <small>Acceso completo y configuración general</small>
              </div>
            </div>
            <div className="ops-role-card">
              <div className="ops-role-card-icon cocina">
                <Icon name="chef" />
              </div>
              <div className="ops-role-card-content">
                <strong>Cocina</strong>
                <span>
                  {userCountLabel(users.filter((u) => u.role === "cocina").length)}
                </span>
                <small>Gestión de comandas y tiempos de preparación</small>
              </div>
            </div>
            <div className="ops-role-card">
              <div className="ops-role-card-icon caja">
                <Icon name="store" />
              </div>
              <div className="ops-role-card-content">
                <strong>Caja</strong>
                <span>
                  {userCountLabel(users.filter((u) => u.role === "caja").length)}
                </span>
                <small>Apertura, cobros y comprobantes</small>
              </div>
            </div>
            <div className="ops-role-card">
              <div className="ops-role-card-icon mesera">
                <Icon name="serve" />
              </div>
              <div className="ops-role-card-content">
                <strong>Mesera</strong>
                <span>
                  {userCountLabel(users.filter((u) => u.role === "mesera").length)}
                </span>
                <small>Control de salón y toma de comandas</small>
              </div>
            </div>
            <div className="ops-role-card">
              <div className="ops-role-card-icon delivery">
                <Icon name="scooter" />
              </div>
              <div className="ops-role-card-content">
                <strong>Delivery</strong>
                <span>
                  {userCountLabel(users.filter((u) => u.role === "delivery").length)}
                </span>
                <small>Despacho y asignación de motorizados</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {editorOpen && (
        <OperationsDialog
          onClose={() => setEditorOpen(false)}
          title={editing ? "Editar cuenta" : "Nueva cuenta"}
        >
          <form
            className="ops-form"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              if (editing)
                notify(() => {
                  editLocalUser(editing.id, { name, email, phone, role });
                  reset();
                });
              else
                void createLocalUser(
                  { name, email, phone, role, password },
                  true,
                )
                  .then(reset)
                  .catch((err) => setError(err.message));
            }}
          >
            <label>
              Nombre completo
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Correo electrónico
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Teléfono
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            {!clients && (
              <label>
                Rol
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {Object.entries(roleNames)
                    .filter(([r]) => r !== "cliente")
                    .map(([r, n]) => (
                      <option key={r} value={r}>
                        {n}
                      </option>
                    ))}
                </select>
              </label>
            )}
            {!editing && (
              <label>
                Contraseña inicial
                <input
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}
            {error && <p role="alert">{error}</p>}
            <div className="ops-dialog-footer">
              <button type="button" onClick={() => setEditorOpen(false)}>
                Cancelar
              </button>
              <button className="ops-primary">
                {editing ? "Guardar cambios" : "Crear cuenta"}
              </button>
            </div>
          </form>
        </OperationsDialog>
      )}

      {view && (
        <OperationsDialog
          title={`Historial de ${view.name}`}
          onClose={() => setView(null)}
        >
          <p>
            {view.email} · {view.phone}
          </p>
          {customerOrders(view)
            .map((o) => (
              <p key={o.id}>
                #{o.id} · <Badge value={o.status} />
              </p>
            ))}
          {!customerOrders(view).length && (
            <Empty>Sin pedidos registrados.</Empty>
          )}
        </OperationsDialog>
      )}
    </>
  );
}
const blankSupply = (): Supply => ({
  id: crypto.randomUUID(),
  name: "",
  category: "Carnes",
  stock: 0,
  min: 0,
  unit: "unidades",
  cost: 0,
});
export function InventoryManager({
  notify,
}: {
  notify: (task: () => void) => void;
}) {
  const actionHost = useContext(OperationsPageActions);
  const data = useOperations();
  const [tab, setTab] = useState("Insumos");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [selectedSupplies, setSelectedSupplies] = useState<string[]>([]);
  const [supply, setSupply] = useState(blankSupply);
  const [editingSupply, setEditingSupply] = useState(false);
  const [movement, setMovement] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [providerOpen, setProviderOpen] = useState(false);
  const [provider, setProvider] = useState<Supplier>({
    id: crypto.randomUUID(),
    name: "",
    phone: "",
    email: "",
  });

  const isEditing = Boolean(
    supply.id && data.supplies.some((s) => s.id === supply.id),
  );

  const action = (
    <div className="ops-header-actions">
      <button
        className="ops-outline"
        onClick={() => {
          setSupply(blankSupply());
          setEditingSupply(true);
        }}
      >
        <Icon name="plus" />
        Nuevo insumo
      </button>
      <button
        className="ops-primary"
        disabled={!data.supplies.length}
        onClick={() => setMovement(data.supplies[0]?.id || "")}
      >
        <Icon name="plus" />
        Registrar movimiento
      </button>
    </div>
  );

  const lowStockCount = data.supplies.filter((s) => s.stock < s.min).length;

  const filteredSupplies = data.supplies.filter(s =>
    (tab !== "Alertas" || s.stock < s.min) && (tab !== "Agotados" || s.stock <= 0) &&
    (category === "Todas" || s.category === category) &&
    `${s.name} ${s.category}`.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const filteredSuppliers = data.suppliers.filter(p =>
    `${p.name} ${p.phone} ${p.email}`.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const exportInventory = () => {
    if (tab === "Proveedores") {
      downloadExcel("proveedores", ["Nombre", "Teléfono", "Correo"], filteredSuppliers.map(p => [p.name, p.phone, p.email]));
      return;
    }
    downloadExcel(
      "inventario",
      ["Insumo", "Categoría", "Stock actual", "Unidad", "Stock mínimo", "Costo", "Estado"],
      filteredSupplies.filter(s => !selectedSupplies.length || selectedSupplies.includes(s.id)).map((s) => [
        s.name,
        s.category,
        s.stock,
        s.unit,
        s.min,
        money(s.cost || 0),
        s.stock < s.min ? "Stock bajo" : "En stock",
      ]),
    );
  };

  return (
    <>
      {actionHost && createPortal(action, actionHost)}
      <Stats entries={[
        {label:"Total de insumos", value:data.supplies.length,icon:"box",tone:"blue",hint:"Insumos registrados"},
        {label:"Stock bajo",value:lowStockCount,icon:"bell",tone:"gold",hint:"Requieren reposición"},
        {label:"Agotados",value:data.supplies.filter(s=>s.stock<=0).length,icon:"close",tone:"red",hint:"Sin existencias"},
      ]}/>

      <div className="ops-admin-filter-bar" aria-label="Filtros de inventario">
        <label className="ops-inventory-search-label">Buscar
        <div className="ops-admin-search">
          <Icon name="search" />
          <input
            aria-label="Buscar insumos"
            placeholder="Buscar insumos por nombre o categoría…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedSupplies([]); }}
          />
        </div>
        </label>
        <label>Categoría<select aria-label="Categoría de insumos" disabled={tab === "Proveedores"} value={category} onChange={e=>{ setCategory(e.target.value); setSelectedSupplies([]); }}><option>Todas</option>{[...new Set(data.supplies.map(s=>s.category))].map(c=><option key={c}>{c}</option>)}</select></label>
        <label>Estado<select aria-label="Estado de insumos" value={tab} onChange={e=>{ setTab(e.target.value); setSelectedSupplies([]); }}><option value="Insumos">Todos</option><option value="Alertas">Stock bajo</option><option value="Agotados">Agotados</option><option value="Proveedores">Proveedores</option></select></label>
        <button className="ops-btn-export" onClick={exportInventory}>
          <Icon name="download" data-ops-action="export"/> Exportar
        </button>
        <button
          className="ops-btn-clear-filters"
          type="button"
          onClick={() => {
            setSearch("");
            setCategory("Todas");
            setTab("Insumos");
            setSelectedSupplies([]);
          }}
        >
          <Icon name="trash" /> Eliminar filtros
        </button>
      </div>

      {tab === "Proveedores" ? (
        <div className="ops-split">
          <Panel
            title="Proveedores"
            action={
              <button
                className="ops-primary"
                onClick={() => {
                  setProvider({
                    id: crypto.randomUUID(),
                    name: "",
                    phone: "",
                    email: "",
                  });
                  setProviderOpen(true);
                }}
              >
                <Icon name="plus" /> Nuevo proveedor
              </button>
            }
          >
            {!filteredSuppliers.length && <Empty>No hay proveedores que coincidan con la búsqueda.</Empty>}
            {filteredSuppliers.map((p) => (
              <p key={p.id}>
                {p.name} · {p.phone} · {p.email}
                <button
                  onClick={() => {
                    setProvider(p);
                    setProviderOpen(true);
                  }}
                >
                  <Icon name="edit" /><span>Editar</span>
                </button>
              </p>
            ))}
          </Panel>
          {providerOpen && (
            <OperationsDialog
              title="Proveedor"
              onClose={() => setProviderOpen(false)}
            >
              <form
                className="ops-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  notify(() => {
                    saveSupplier(provider);
                    setProviderOpen(false);
                    setProvider({
                      id: crypto.randomUUID(),
                      name: "",
                      phone: "",
                      email: "",
                    });
                  });
                }}
              >
                <label>
                  Nombre
                  <input
                    required
                    value={provider.name}
                    onChange={(e) =>
                      setProvider({ ...provider, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  Teléfono
                  <input
                    value={provider.phone}
                    onChange={(e) =>
                      setProvider({ ...provider, phone: e.target.value })
                    }
                  />
                </label>
                <label>
                  Correo
                  <input
                    type="email"
                    value={provider.email}
                    onChange={(e) =>
                      setProvider({ ...provider, email: e.target.value })
                    }
                  />
                </label>
                <div className="ops-dialog-footer">
                  <button type="button" onClick={() => setProviderOpen(false)}>
                    Cancelar
                  </button>
                  <button className="ops-primary">
                    <Icon name="save" /> Guardar proveedor
                  </button>
                </div>
              </form>
            </OperationsDialog>
          )}
        </div>
      ) : (
        <div className="ops-with-sidebar">
          <Panel title={tab === "Alertas" ? "Alertas de stock" : "Insumos"}>
            <div className="ops-table-wrap">
              <OperationsTable>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Seleccionar todos los insumos"
                        checked={filteredSupplies.length > 0 && filteredSupplies.every(s => selectedSupplies.includes(s.id))}
                        onChange={e => setSelectedSupplies(e.target.checked ? filteredSupplies.map(s => s.id) : [])}
                      />
                    </th>
                    {[
                      "Insumo",
                      "Stock actual",
                      "Unidad",
                      "Stock mínimo",
                      "Estado",
                      "Actualizado",
                      "Acciones",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSupplies
                    .map((s) => (
                      <tr key={s.id}>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Seleccionar insumo ${s.name}`}
                            checked={selectedSupplies.includes(s.id)}
                            onChange={e => setSelectedSupplies(e.target.checked ? [...selectedSupplies, s.id] : selectedSupplies.filter(id => id !== s.id))}
                          />
                        </td>
                        <td>
                          <SupplySummary name={s.name} detail={s.category} />
                        </td>
                        <td>
                          <strong>{s.stock}</strong>
                        </td>
                        <td>{s.unit}</td>
                        <td>{s.min}</td>
                        <td>
                          <Badge
                            value={s.stock < s.min ? "Stock bajo" : "En stock"}
                          />
                        </td>
                        <td>{s.updatedAt ? <time dateTime={s.updatedAt}>{new Date(s.updatedAt).toLocaleDateString("es-PE")}<small>{new Date(s.updatedAt).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"})}</small></time>:"—"}</td>
                        <td>
                          <div className="ops-actions">
                            <button
                              onClick={() => {
                                setSupply({ ...s });
                                setEditingSupply(true);
                              }}
                            >
                              <Icon name="edit" /><span>Editar</span>
                            </button>
                            <button onClick={() => setMovement(s.id)}>
                              <Icon name="plus" /><span>Registrar movimiento</span>
                            </button>
                            <button
                              onClick={() => notify(() => { deleteSupply(s.id); setSelectedSupplies(ids => ids.filter(id => id !== s.id)); })}
                            >
                              <Icon name="trash" /><span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </OperationsTable>
            </div>
            {!filteredSupplies.length && <Empty>No hay insumos que coincidan con los filtros.</Empty>}
            {movement && (
              <OperationsDialog
                title="Registrar movimiento"
                onClose={() => setMovement("")}
              >
                <form
                  className="ops-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    notify(() => {
                      moveSupply(movement, quantity, "Movimiento manual");
                      setMovement("");
                    });
                  }}
                >
                  <label>Insumo
                    <select aria-label="Insumo del movimiento" value={movement} onChange={e => setMovement(e.target.value)}>
                      {data.supplies.map(item => <option key={item.id} value={item.id}>{item.name} · {item.stock} {item.unit}</option>)}
                    </select>
                  </label>
                  <label>
                    Entrada (+) o salida (−)
                    <input
                      type="number"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </label>
                  <div className="ops-dialog-footer">
                    <button type="button" onClick={() => setMovement("")}>
                      Cancelar
                    </button>
                    <button className="ops-primary">
                      <Icon name="save" /> Guardar movimiento
                    </button>
                  </div>
                </form>
              </OperationsDialog>
            )}
          </Panel>
          <div>
            <Panel title="Alertas de stock">
              {data.supplies
                .filter((s) => s.stock < s.min)
                .map((s) => (
                  <button
                    className="ops-stock-alert"
                    key={s.id}
                    onClick={() => {
                      setSupply({ ...s });
                      setEditingSupply(true);
                    }}
                  >
                    <SupplySummary
                      name={s.name}
                      detail={`Stock actual: ${s.stock} ${s.unit} | Mín: ${s.min}`}
                    />
                    <Badge value="Stock bajo" />
                    <Icon name="chevron" />
                  </button>
                ))}
              {!data.supplies.some((s) => s.stock < s.min) && (
                <Empty>Todos los insumos tienen stock suficiente.</Empty>
              )}
            </Panel>
            {editingSupply && (
              <OperationsDialog
                title={isEditing ? "Editar insumo" : "Nuevo insumo"}
                onClose={() => setEditingSupply(false)}
              >
                <form
                  className="ops-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    notify(() => {
                      saveSupply(supply);
                      setSupply(blankSupply());
                      setEditingSupply(false);
                    });
                  }}
                >
                  {(["name", "category", "unit"] as const).map((field) => (
                    <label key={field}>
                      {field === "name"
                        ? "Nombre"
                        : field === "category"
                          ? "Categoría"
                          : "Unidad"}
                      <input
                        required
                        value={supply[field]}
                        onChange={(e) =>
                          setSupply({ ...supply, [field]: e.target.value })
                        }
                      />
                    </label>
                  ))}
                  {(["stock", "min", "cost"] as const).map((field) => (
                    <label key={field}>
                      {field === "stock"
                        ? "Stock actual"
                        : field === "min"
                          ? "Stock mínimo"
                          : "Costo unitario (S/)"}
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={supply[field]}
                        onChange={(e) =>
                          setSupply({
                            ...supply,
                            [field]: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  ))}
                  <div className="ops-dialog-footer">
                    <button type="button" onClick={() => setEditingSupply(false)}>
                      Cancelar
                    </button>
                    <button className="ops-primary">
                      <Icon name="save" /> Guardar insumo
                    </button>
                  </div>
                </form>
              </OperationsDialog>
            )}
            <Panel title="Últimos movimientos">
              {data.movements.slice(0, 6).map((m) => (
                <p key={m.id}>
                  <Badge value={m.amount > 0 ? "Entrada" : "Salida"} /> {m.name}{" "}
                  · {m.amount > 0 ? "+" : ""}
                  {m.amount}
                </p>
              ))}
              {!data.movements.length && <Empty />}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
