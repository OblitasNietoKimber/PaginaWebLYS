import { CashShiftPanel } from "./CashShiftPanel";
import { OperationsDialog } from "./OperationsDialog";
import { OperationsTable } from "./OperationsTable";
import {
  Icon,
  PaymentMark,
} from "./OperationsVisuals";
import { dateText, localDateKey, downloadExcel, printLocal } from "./operationsFiles";
import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { OperationsPageActions } from "./operationsPageContext";
import { ChannelBadge, InitialsAvatar } from "./AdminViews";
import {
  useOperations,
  money,
  orderTotal,
  paymentMethods,
  processPayment,
  issueVoucher,
  refundPayment,
  type Order,
  type Voucher,
} from "./operationsStore";
import {
  Panel,
  Stats,
  Tabs,
  Badge,
  Empty,
  Donut,
  OrderDetail,
} from "./OperationsUI";
export function CashViews({
  section,
  notify,
  navigate,
}: {
  section: string;
  notify: (task: () => void) => void;
  navigate: (path: string) => void;
}) {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("es-PE", {day:"numeric",month:"long",year:"numeric"});
  const data = useOperations();
  const [downloading, setDownloading] = useState("");
  const downloadPdf = async (voucher: Voucher, preview = false) => {
    const popup = preview ? window.open("", "_blank", "width=850,height=950") : null;
    if (preview && !popup) {
      notify(() => { throw new Error("Permite la ventana del comprobante PDF."); });
      return;
    }
    if (popup) {
      popup.document.title = voucher.id;
      popup.document.body.textContent = "Preparando comprobante PDF...";
    }
    setDownloading(voucher.id);
    try {
      const { downloadVoucherPdf, previewVoucherPdf } = await import("./voucherPdf");
      if (popup) await previewVoucherPdf(voucher, data, popup);
      else await downloadVoucherPdf(voucher, data);
    } catch (error) {
      popup?.close();
      notify(() => { throw error instanceof Error ? error : new Error("No se pudo descargar el PDF."); });
    } finally {
      setDownloading("");
    }
  };
  const actionHost = useContext(OperationsPageActions);
  const [selected, setSelected] = useState(() => new URLSearchParams(location.search).get("pedido") || "");
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [pendingLimit, setPendingLimit] = useState(8);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [from,setFrom] = useState("");
  const [to,setTo] = useState("");
  const [paymentState,setPaymentState] = useState("Todos");
  const [cashierFilter,setCashierFilter] = useState("Todos");
  const [selectedMethod, setMethod] = useState("Efectivo");
  const method = data.settings.methods.includes(selectedMethod) ? selectedMethod : data.settings.methods[0] || "";
  const [received, setReceived] = useState("");
  const [voucherType, setVoucherType] = useState("Boleta");
  const [paymentVoucherType, setPaymentVoucherType] = useState("");
  const [document, setDocument] = useState("");
  const [customer, setCustomer] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const shift = data.shifts.find((s) => !s.closed);
  const payments = data.payments.filter((p) => !p.refunded);
  const pending = data.orders.filter(
    (o) => !o.paid && !o.draft && o.status !== "Cancelado",
  );
  const order = pending.find((o) => o.id === selected) || pending[0];
  const paidOrder =
    data.orders.find((o) => o.id === selected && o.paid) ||
    data.orders.find(
      (o) => o.paid && !data.vouchers.some((v) => v.orderId === o.id),
    );
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const methods = paymentMethods.map((label) => ({
    label,
    value: payments
      .filter((p) => p.method === label)
      .reduce((s, p) => s + p.amount, 0),
  }));
  const filteredPayments = data.payments.filter(p =>
    (!from || localDateKey(p.date) >= from) && (!to || localDateKey(p.date) <= to) &&
    (paymentState === "Todos" || (paymentState === "Pagado" ? !p.refunded : p.refunded)) &&
    (cashierFilter === "Todos" || data.shifts.find(s => s.id === p.shiftId)?.user === cashierFilter) &&
    (filter === "Todos" || p.method === filter) &&
    `${p.orderId} ${data.orders.find(o => o.id === p.orderId)?.customer}`.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const filteredVouchers = data.vouchers.filter(v =>
    (!from || localDateKey(v.date) >= from) && (!to || localDateKey(v.date) <= to) &&
    (filter === "Todos" || v.type === filter) &&
    `${v.id} ${v.customer}`.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const exportPayments = () =>
    downloadExcel(
      "pagos",
      ["Fecha", "Pedido", "Método", "Monto", "Vuelto", "Estado"],
      filteredPayments.map((p) => [
        dateText(p.date),
        p.orderId,
        p.method,
        p.amount,
        p.change,
        p.refunded ? "Reembolsado" : "Pagado",
      ]),
    );
  const printOrder = (o: Order) =>
    printLocal(
      `Cuenta ${o.id}`,
      o.items
        .map(
          (l) =>
            `${l.count} ${l.product.name}: ${money(l.count * l.product.price)}`,
        )
        .concat(`Total: ${money(orderTotal(o))}`),
    );
  const transactions = (
    <div className="ops-table-wrap ops-payment-transactions">
      <OperationsTable>
        <thead>
          <tr>
            {[
              "N° de pago",
              "N° de pedido",
              "Mesa",
              "Cajera",
              "Método de pago",
              "Monto",
              "Fecha y hora",
              "Estado",
              "Acciones",
            ].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredPayments
            .map((p) => {
              const o = data.orders.find((o) => o.id === p.orderId);
              return (
                <tr key={p.id}>
                  <td><strong title={p.id}>{p.id.slice(-10)}</strong></td>
                  <td>#{p.orderId}</td>
                  <td>{o?.table ? String(o.table).padStart(2,"0"):"—"}</td>
                  <td>{data.shifts.find(s=>s.id===p.shiftId)?.user || "—"}</td>
                  <td>
                    <span className="ops-method-label">
                      <PaymentMark name={p.method} />
                      {p.method}
                    </span>
                  </td>
                  <td>{money(p.amount)}</td>
                  <td>{dateText(p.date)}</td>
                  <td>
                    <Badge value={p.refunded ? "Reembolsado" : "Pagado"} />
                  </td>
                  <td>
                    <div className="ops-actions">
                      <button aria-label="Ver detalle" title="Ver detalle" className="ops-payment-view" onClick={() => o && setDetail(o)}>
                        <Icon name="eye" />
                      </button>
                      <button aria-label="Imprimir" title="Imprimir" className="ops-payment-print" onClick={() => notify(() => o && printOrder(o))}>
                        <Icon name="print" />
                      </button>
                      {!p.refunded && shift?.id === p.shiftId && (
                        <button
                          aria-label="Reembolsar" title="Reembolsar" className="ops-payment-refund"
                          onClick={() => notify(() => refundPayment(p.id))}
                        >
                          <Icon name="arrow" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </OperationsTable>
      {!filteredPayments.length && <Empty>No hay pagos que coincidan con los filtros.</Empty>}
    </div>
  );
  let content;
  if (section === "apertura" || section === "cierre")
    content = <CashShiftPanel closing={section === "cierre"} notify={notify} navigate={navigate}/>;
  else if (section === "cobros")
    content = (
      <>
        {actionHost &&
          createPortal(
            <div className="ops-header-actions">
              <div className="ops-header-date-pill">
                <Icon name="calendar" />
                <span>{dateLabel}</span>
              </div>
              <button
                className="ops-outline"
                onClick={() => navigate("/caja/comprobantes")}
              >
                <Icon name="receipt" /> Emitir comprobante
              </button>
            </div>,
            actionHost,
          )}
        <div className="ops-pos-split">
          <Panel title="Pedidos pendientes de cobro">
            <div
              className="ops-admin-filter-bar"
              style={{ margin: "0 0 16px" }}
            >
              <div className="ops-admin-search">
                <Icon name="search" />
                <input
                  aria-label="Buscar pedido, cliente o mesa"
                  placeholder="Buscar por mesa o número de pedido…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Tabs
                options={["Todos", "Salón", "Delivery", "Recojo"]}
                value={filter}
                onChange={setFilter}
              />
            </div>
            {pending.length === 0 ? (
              <Empty>No hay pedidos pendientes de cobro.</Empty>
            ) : (
              <div className="ops-pending-card-list">
                {pending
                  .filter(
                    (o) =>
                      (filter === "Todos" || o.channel === filter) &&
                      `${o.id} ${o.customer} ${o.table || ""}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  )
                  .slice(0, pendingLimit)
                  .map((o) => (
                    <div
                      key={o.id}
                      className={`ops-pending-order-item ${o.id === order?.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelected(o.id);
                        setReceived("");
                      }}
                    >
                      <div className="ops-pending-order-info">
                        <div className="ops-pending-order-top">
                          <ChannelBadge channel={o.table ? "Salón" : o.channel} />
                          {o.table && <strong>Mesa {o.table}</strong>}
                          <small style={{ color: "#64748b" }}>#{o.id}</small>
                        </div>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                          {o.customer} · {o.items.length} productos
                        </div>
                      </div>
                      <div className="ops-pending-order-amount">
                        <strong>{money(orderTotal(o))}</strong>
                        <button
                          className="ops-primary"
                          aria-label="Cobrar"
                          style={{
                            padding: "6px 14px",
                            fontSize: "12.5px",
                            marginTop: "4px",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(o.id);
                            setReceived("");
                          }}
                        >
                          Cobrar
                        </button>
                      </div>
                    </div>
                  ))}
                {pending.length > pendingLimit && (
                  <button
                    className="ops-outline"
                    onClick={() => setPendingLimit(pendingLimit + 8)}
                    style={{ marginTop: "8px" }}
                  >
                    <Icon name="plus" /> Ver más pedidos
                  </button>
                )}
              </div>
            )}
          </Panel>

          <div className="ops-pos-checkout">
            {order && !order.paid ? (
              <>
                <div className="ops-pos-checkout-header">
                  <div>
                    <h3>{order.table ? `Mesa ${order.table}` : order.channel}</h3>
                    <small style={{ color: "#64748b" }}>
                      Pedido #{order.id} · {order.customer}
                    </small>
                  </div>
                  <span
                    className="anchor-pending-payment"

                  >
                    <Icon name="clock" /> Pendiente de cobro
                  </span>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <h4
                    style={{
                      margin: "0 0 10px",
                      fontSize: "14px",
                      color: "#475569",
                    }}
                  >
                    Detalle del pedido
                  </h4>
                  <div className="ops-pos-order-lines">
                    <div className="anchor-pos-line-head" aria-hidden="true"><span>Producto</span><span>Cantidad</span><span>Precio unitario</span><span>Subtotal</span></div>
                    {order.items.map((item) => (
                      <div key={item.product.id} className="ops-pos-line-item">
                        <span className="anchor-pos-product">
                          <img src={item.product.image} alt=""/>{item.product.name}
                        </span>
                        <span>{item.count}</span>
                        <span>{money(item.product.price)}</span>
                        <strong>
                          {money(item.product.price * item.count)}
                        </strong>
                      </div>
                    ))}
                  </div>
                  <div className="ops-pos-total-row">
                    <span>Total del pedido</span>
                    <strong>{money(orderTotal(order))}</strong>
                  </div>
                </div>

                <div className="anchor-payment-options">
                <section className="anchor-payment-method">
                  <h4
                    style={{
                      margin: "0 0 10px",
                      fontSize: "14px",
                      color: "#475569",
                    }}
                  >
                    Método de pago
                  </h4>
                  <div className="ops-method-selector-grid">
                    {data.settings.methods.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`ops-method-button ${method === m ? "active" : ""}`}
                        onClick={() => setMethod(m)}
                      >
                        <PaymentMark name={m} />
                        <span>{m}</span>
                      </button>
                    ))}
                  </div>
                  {!data.settings.methods.length && <Empty>No hay métodos de pago activos. Solicita su activación en Configuración.</Empty>}
                </section>
                <section className="anchor-payment-voucher">
                  <h4>Comprobante</h4>
                  <label>Tipo de comprobante
                    <select value={paymentVoucherType} onChange={(e) => setPaymentVoucherType(e.target.value)}>
                      <option value="">Emitir después</option>
                      <option value="Boleta">Boleta</option>
                      <option value="Factura">Factura</option>
                      <option value="Nota de venta">Nota de venta</option>
                    </select>
                  </label>
                </section>
                </div>

                <form
                  className="ops-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    notify(() => {
                      processPayment(
                        order.id,
                        method,
                        method === "Efectivo"
                          ? Number(received)
                          : orderTotal(order),
                      );
                      setSelected(paymentVoucherType ? order.id : "");
                      setReceived("");
                      if (paymentVoucherType) {
                        setVoucherType(paymentVoucherType);
                        setCustomer(order.customer);
                        setDocument("");
                        setVoucherOpen(true);
                      }
                    });
                  }}
                >
                  {method === "Efectivo" && (
                    <>
                      <div className="ops-cash-presets">
                        <button
                          type="button"
                          className="ops-cash-preset-btn"
                          onClick={() =>
                            setReceived(String(orderTotal(order)))
                          }
                        >
                          Exacto ({money(orderTotal(order))})
                        </button>
                        <button
                          type="button"
                          className="ops-cash-preset-btn"
                          onClick={() => setReceived("50")}
                        >
                          S/ 50
                        </button>
                        <button
                          type="button"
                          className="ops-cash-preset-btn"
                          onClick={() => setReceived("100")}
                        >
                          S/ 100
                        </button>
                        <button
                          type="button"
                          className="ops-cash-preset-btn"
                          onClick={() => setReceived("200")}
                        >
                          S/ 200
                        </button>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                          alignItems: "end",
                        }}
                      >
                        <label style={{ margin: 0 }}>
                          Monto recibido
                          <input
                            required
                            min={orderTotal(order)}
                            type="number"
                            step="0.01"
                            value={received}
                            onChange={(e) => setReceived(e.target.value)}
                          />
                        </label>
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "#ecfdf5",
                            border: "1px solid #a7f3d0",
                            color: "#065f46",
                            fontSize: "14px",
                            fontWeight: "600",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>Vuelto:</span>
                          <strong style={{ fontSize: "16px" }}>
                            {money(
                              Math.max(0, Number(received) - orderTotal(order)),
                            )}
                          </strong>
                        </div>
                      </div>
                    </>
                  )}


                  <button
                    className="ops-primary"
                    aria-label="Procesar pago"
                    disabled={!method}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "14px",
                      fontSize: "15px",
                      fontWeight: 700,
                      marginTop: "16px",
                    }}
                  >
                    <Icon name="cash" /> Confirmar cobro
                  </button>
                </form>
              </>
            ) : (
              <Empty>Selecciona un pedido pendiente para cobrar.</Empty>
            )}
          </div>
        </div>

        <Panel
          title="Pagos recientes"
          action={
            <button onClick={() => navigate("/caja/historial")}>
              <Icon name="arrow" /> Ver todos
            </button>
          }
        >
          {transactions}
        </Panel>
      </>
    );
  else if (section === "comprobantes")
    content = (
      <>
        {actionHost &&
          createPortal(
            <div className="ops-header-actions">
              <div className="ops-header-date-pill">
                <Icon name="calendar" />
                <span>{dateLabel}</span>
              </div>
              <button
                className="ops-primary"
                onClick={() => setVoucherOpen(true)}
              >
                <Icon name="plus" /> Emitir comprobante
              </button>
            </div>,
            actionHost,
          )}
        <Stats
          entries={[
            {
              label: "Emitidos hoy",
              value: data.vouchers.filter(v=>new Date(v.date).toLocaleDateString()===today.toLocaleDateString()).length,
              tone: "red",
              hint: "Total del día",
            },
            {
              label: "Boletas",
              value: data.vouchers.filter((v) => v.type === "Boleta").length,
              tone: "blue",
              hint: "Consumidor final",
            },
            {
              label: "Facturas",
              value: data.vouchers.filter((v) => v.type === "Factura").length,
              tone: "gold",
              hint: "Empresas con RUC",
            },
          ]}
        />
        <Panel
          title="Listado de comprobantes"
          action={
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="ops-outline"
                onClick={() =>
                  downloadExcel(
                    "comprobantes",
                    ["Número", "Pedido", "Cliente", "Tipo", "Fecha", "Monto"],
                    filteredVouchers.map((v) => [
                      v.id,
                      v.orderId,
                      v.customer,
                      v.type,
                      dateText(v.date),
                      v.total,
                    ]),
                  )
                }
              >
                <Icon name="download" data-ops-action="export"/> Exportar
              </button>

            </div>
          }
        >
          <div
            className="ops-admin-filter-bar"
            style={{ margin: "0 0 16px" }}
          >
            <label className="ops-voucher-search-label">Buscar
              <div className="ops-admin-search">
              <Icon name="search" />
              <input
                aria-label="Buscar número o cliente"
                placeholder="Buscar por número o cliente…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            </label>
            <label>Fecha<input type="date" aria-label="Fecha de comprobantes" value={from} onChange={e=>{setFrom(e.target.value);setTo(e.target.value);}}/></label>
            <label>Tipo de comprobante<select aria-label="Filtrar tipo de comprobante" value={filter} onChange={e=>setFilter(e.target.value)}>{["Todos","Boleta","Factura","Nota de venta"].map(type=><option key={type}>{type}</option>)}</select></label>
            <button
              type="button"
              className="ops-btn-clear-filters"
              onClick={() => {
                setSearch("");
                setFrom("");
                setTo("");
                setFilter("Todos");
                setPaymentState("Todos");
                setCashierFilter("Todos");
              }}
            >
              <Icon name="trash" /> Eliminar filtros
            </button>
          </div>
          <div className="ops-table-wrap">
            <OperationsTable>
              <thead>
                <tr>
                  <th>N° Comprobante</th>
                  <th>Fecha y hora</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>N° de pedido</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers
                  .map((v) => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.id}</strong>
                      </td>
                      <td>{dateText(v.date)}</td>
                      <td>
                        <span
                          className={`ops-voucher-badge ${
                            v.type === "Boleta"
                              ? "boleta"
                              : v.type === "Factura"
                                ? "factura"
                                : "nota"
                          }`}
                        >
                          <Icon name="receipt" /> {v.type}
                        </span>
                      </td>
                      <td>
                        <div className="ops-person-cell">
                          <InitialsAvatar name={v.customer} />
                          <strong>{v.customer}</strong>
                        </div>
                      </td>
                      <td>#{v.orderId}</td>
                      <td>
                        <strong style={{ color: "#0f172a" }}>
                          {money(v.total)}
                        </strong>
                      </td>
                      <td>
                        <Badge value="Emitido"/>
                      </td>
                      <td>
                        <div className="ops-actions">
                          <button
                            onClick={() => void downloadPdf(v, true)}
                            disabled={downloading !== ""}
                            title="Ver / Imprimir comprobante" aria-label="Imprimir" className="ops-voucher-print"
                          >
                            <Icon name="print" />
                          </button>
                          <button type="button" aria-label="Descargar PDF" title="Descargar PDF" className="ops-voucher-download" disabled={downloading !== ""} aria-busy={downloading === v.id} onClick={() => void downloadPdf(v)}><Icon name="download" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </OperationsTable>
            {!filteredVouchers.length && (
              <Empty>No hay comprobantes que coincidan con los filtros.</Empty>
            )}
          </div>
        </Panel>

      </>
    );
  else if (section === "historial")
    content = (
      <>
        {actionHost &&
          createPortal(
            <div className="ops-header-actions">
              <div className="ops-header-date-pill">
                <Icon name="calendar" />
                <span>{dateLabel}</span>
              </div>
              <button className="ops-outline" onClick={exportPayments}>
                <Icon name="download" data-ops-action="export"/> Exportar Excel
              </button>
            </div>,
            actionHost,
          )}
        <Stats
          entries={[
            {
              label: "Total cobrado",
              value: money(total),
              tone: "green",
              hint: "Cobrado en el turno",
            },
            {
              label: "Operaciones",
              value: data.payments.length,
              tone: "blue",
              hint: "Pagos registrados",
            },
            {
              label: "Anulaciones",
              value: data.payments.filter((p) => p.refunded).length,
              tone: "red",
              hint: "Reembolsos aprobados",
            },
          ]}
        />
        <div className="ops-with-sidebar">
          <Panel
            title="Historial de pagos"
            action={
              <button className="ops-outline" onClick={exportPayments}>
                <Icon name="download" data-ops-action="export"/> Exportar
              </button>
            }
          >
            <div className="ops-admin-filter-bar anchor-cash-filters">
              <label>Fecha desde<input type="date" aria-label="Pagos desde" value={from} max={to || undefined} onChange={e=>setFrom(e.target.value)}/></label>
              <label>Fecha hasta<input type="date" aria-label="Pagos hasta" value={to} min={from || undefined} onChange={e=>setTo(e.target.value)}/></label>
              <label>Método de pago<select aria-label="Filtrar resultados" value={filter} onChange={e=>setFilter(e.target.value)}>{["Todos",...paymentMethods].map(m=><option key={m}>{m}</option>)}</select></label>
              <label>Cajera<select aria-label="Cajera de los pagos" value={cashierFilter} onChange={e=>setCashierFilter(e.target.value)}>{["Todos",...new Set(data.shifts.map(shift=>shift.user))].map(name=><option key={name}>{name}</option>)}</select></label>
              <label>Estado<select aria-label="Estado del pago" value={paymentState} onChange={e=>setPaymentState(e.target.value)}>{["Todos","Pagado","Anulado"].map(v=><option key={v}>{v}</option>)}</select></label>
              <button type="button" className="ops-btn-export" onClick={exportPayments}><Icon name="download" data-ops-action="export"/>Exportar</button>
              <button
                type="button"
                className="ops-btn-clear-filters"
                onClick={() => {
                  setSearch("");
                  setFrom("");
                  setTo("");
                  setFilter("Todos");
                  setCashierFilter("Todos");
                  setPaymentState("Todos");
                }}
              >
                <Icon name="trash" /> Eliminar filtros
              </button>
            </div>
            {transactions}
          </Panel>
          <Panel title="Resumen por método">
            <Donut values={methods} />
          </Panel>
        </div>
      </>
    );
  else
    content = (
      <>
        {actionHost &&
          createPortal(
            <div className="ops-header-actions">
              <div className="ops-header-date-pill">
                <Icon name="calendar" />
                <span>{dateLabel}</span>
              </div>
              <button
                className="ops-primary"
                onClick={() => navigate("/caja/cobros")}
              >
                <Icon name="card" /> Ir a cobros
              </button>
            </div>,
            actionHost,
          )}
        <Stats
          entries={[
            {
              label: "Caja abierta",
              value: shift ? "En curso" : "Cerrada",
              tone: shift ? "green" : "red",
              hint: `Turno: ${data.settings.hours}`,
            },
            {
              label: "Recaudado",
              value: money(total),
              tone: "green",
              hint: "Total de cobros",
            },
            {
              label: "Cobros",
              value: data.vouchers.length || data.payments.length,
              tone: "blue",
              hint: "Comprobantes emitidos",
            },
            {
              label: "Pendientes",
              value: pending.length,
              tone: "gold",
              hint: "Pagos por cobrar",
            },
            {
              label: "Fondo inicial",
              value: money(shift?.initial || 0),
              tone: "gray",
              hint: "Monto de apertura",
            },
          ]}
        />
        <div className="ops-split">
          <Panel
            title="Pagos pendientes"
            action={
              <button onClick={() => navigate("/caja/cobros")}>
                <Icon name="arrow" /> Ver todos ({pending.length})
              </button>
            }
          >
            <div className="ops-table-wrap">
              <OperationsTable>
                <thead>
                  <tr>
                    <th>Origen</th>
                    <th>Referencia</th>
                    <th>Cliente</th>
                    <th>Monto</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td>
                        <ChannelBadge channel={o.table ? "Salón" : o.channel} />
                      </td>
                      <td>
                        <strong>{o.table ? `Mesa ${o.table}` : `#${o.id}`}</strong>
                      </td>
                      <td>{o.customer}</td>
                      <td>
                        <strong style={{ color: "#dc2626" }}>
                          {money(orderTotal(o))}
                        </strong>
                      </td>
                      <td>
                        <button
                          className="ops-primary"
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                          onClick={() => {
                            setSelected(o.id);
                            navigate(`/caja/cobros?pedido=${encodeURIComponent(o.id)}`);
                          }}
                        >
                          Cobrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </OperationsTable>
              {!pending.length && (
                <Empty>No hay pedidos pendientes de cobro.</Empty>
              )}
            </div>
          </Panel>

          <Panel title="Desglose de recaudación">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {methods.map((m) => {
                const pct =
                  total > 0 ? ((m.value / total) * 100).toFixed(1) : "0.0";
                return (
                  <div
                    key={m.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <PaymentMark name={m.label} />
                      <strong>{m.label}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                        {money(m.value)}
                      </strong>
                      <small
                        style={{
                          display: "block",
                          color: "#64748b",
                          fontSize: "11px",
                        }}
                      >
                        {pct}%
                      </small>
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "2px solid #e2e8f0",
                }}
              >
                <strong>Total recaudado</strong>
                <strong style={{ color: "#dc2626", fontSize: "16px" }}>
                  {money(total)}
                </strong>
              </div>
            </div>
          </Panel>
        </div>

        <Panel
          title="Últimos movimientos"
          action={
            <button onClick={() => navigate("/caja/historial")}>
              <Icon name="arrow" /> Ver historial completo
            </button>
          }
        >
          {transactions}
        </Panel>
      </>
    );
  return (
    <>
      {content}
      {voucherOpen && (
        <OperationsDialog
          title="Emitir comprobante"
          onClose={() => setVoucherOpen(false)}
        >
          <form
            className="ops-form"
            onSubmit={(e) => {
              e.preventDefault();
              notify(() => {
                if (!paidOrder)
                  throw new Error("Selecciona un pedido pagado.");
                issueVoucher(paidOrder.id, voucherType, customer, document);
                setSelected("");
                setVoucherOpen(false);
                setCustomer("");
                setDocument("");
              });
            }}
          >
            <label>
              Pedido pagado
              <select
                value={paidOrder?.id || ""}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Selecciona un pedido</option>
                {data.orders
                  .filter(
                    (o) =>
                      o.paid &&
                      !data.vouchers.some((v) => v.orderId === o.id),
                  )
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} · {o.customer} ({money(orderTotal(o))})
                    </option>
                  ))}
              </select>
            </label>
            <Tabs
              options={["Boleta", "Factura", "Nota de venta"]}
              value={voucherType}
              onChange={setVoucherType}
            />
            <label>
              Nombre / Razón social
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder={paidOrder?.customer}
              />
            </label>
            <label>
              {voucherType === "Factura"
                ? "RUC (11 dígitos)"
                : "Documento (opcional)"}
              <input
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                required={voucherType === "Factura"}
              />
            </label>
            <div className="ops-total">
              Total
              <strong>{money(paidOrder ? orderTotal(paidOrder) : 0)}</strong>
            </div>
            <p>Comprobante de simulación local, sin valor tributario.</p>
            <div className="ops-dialog-footer">
              <button type="button" onClick={() => setSelected("")}>
                Cancelar
              </button>
              <button className="ops-primary">
                <Icon name="receipt" /> Emitir comprobante
              </button>
            </div>
          </form>
        </OperationsDialog>
      )}
      {detail && (
        <OrderDetail
          order={data.orders.find((o) => o.id === detail.id) || detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
