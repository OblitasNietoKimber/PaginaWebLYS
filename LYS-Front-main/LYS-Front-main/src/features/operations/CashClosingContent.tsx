import { CashDenominations } from "./CashDenominationCounter";
import { Icon, PaymentMark } from "./OperationsVisuals";
import { money, type Payment, type Shift } from "./operationsStore";

type Props = {
  counts: number[];
  amount: string;
  expected: number;
  payments: Payment[];
  methods: string[];
  shift: Shift | undefined;
  notes: string;
  onCount: (index: number, value: number) => void;
  onAmount: (value: string) => void;
  onUseInitial: () => void;
  onNotes: (value: string) => void;
};

export function CashClosingContent(props: Props) {
  const { payments, shift, amount, expected, notes } = props;
  const difference = Number(amount) - expected;
  return <>
    <section className="cash-closing-count">
      <div className="cash-opening-section-heading"><h2><Icon name="cash" />Conteo de efectivo</h2><button type="button" className="ops-outline" disabled={!shift} onClick={props.onUseInitial}><Icon name="cash" />Usar fondo inicial</button></div>
      <p>Ingresa la cantidad de billetes y monedas al finalizar el turno.</p>
      <div className="cash-opening-scroll" role="region" aria-label="Conteo de efectivo al cierre" tabIndex={0}><CashDenominations counts={props.counts} onCount={props.onCount} /></div>
      <label className="cash-closing-total"><span><Icon name="coins" />Total contado</span><input aria-label="Efectivo contado (S/)" type="number" min="0" step="0.01" required value={amount} onChange={e => props.onAmount(e.target.value)} /></label>
    </section>
    <div className="cash-closing-summary">
      <section>
        <h2><Icon name="chart" />Resumen por método de pago</h2>
        <div className="ops-table-wrap"><table className="cash-closing-methods"><thead><tr><th>Método de pago</th><th>Cantidad de ventas</th><th>Total (S/)</th></tr></thead><tbody>
          {props.methods.map(method => {
            const rows = payments.filter(payment => payment.method === method);
            return <tr key={method}><td><PaymentMark name={method} />{method}</td><td>{rows.length}</td><td>{money(rows.reduce((total, payment) => total + payment.amount, 0))}</td></tr>;
          })}
        </tbody><tfoot><tr><th>Total de ventas</th><td>{payments.length}</td><td>{money(payments.reduce((total, payment) => total + payment.amount, 0))}</td></tr></tfoot></table></div>
      </section>
      <section>
        <h2><Icon name="coins" />Diferencias</h2>
        <div className="cash-closing-differences"><div><span>Efectivo esperado</span><strong>{money(expected)}</strong></div><div><span>Efectivo contado</span><strong>{money(Number(amount))}</strong></div><div data-balanced={Math.abs(difference) < 0.001}><span>Diferencia</span><strong>{money(difference)}</strong></div></div>
      </section>
      <section>
        <label>Observaciones (opcional)<textarea maxLength={300} value={notes} onChange={e => props.onNotes(e.target.value)} placeholder="Sin observaciones. Caja cuadrada." /></label><small>{notes.length}/300</small>
        <details className="cash-closing-movements"><summary>Detalle de movimientos en efectivo</summary><div className="ops-table-wrap"><table><thead><tr><th>Hora</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
          {shift && <tr><td>{new Date(shift.opened).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</td><td>Fondo inicial de caja</td><td>{money(shift.initial)}</td></tr>}
          {payments.filter(payment => payment.method === "Efectivo").map(payment => <tr key={payment.id}><td>{new Date(payment.date).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</td><td>Pedido #{payment.orderId}</td><td>{money(payment.amount)}</td></tr>)}
        </tbody></table></div></details>
      </section>
    </div>
  </>;
}
