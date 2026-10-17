import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { currentUser } from "../../services/localAuth";
import { OperationsPageActions } from "./operationsPageContext";
import {
  useOperations,
  money,
  expectedCash,
  openShift,
  closeShift,
} from "./operationsStore";
import { Icon } from "./OperationsVisuals";
import { Stats, Badge } from "./OperationsUI";
import { downloadExcel } from "./operationsFiles";
import { CashOpeningContent } from "./CashOpeningContent";
import { denominations } from "./cashDenominationValues";
import { CashClosingContent } from "./CashClosingContent";
import "../../styles/operations-cash-shift.css";

export function CashShiftPanel({
  closing,
  notify,
  navigate,
}: {
  closing: boolean;
  notify: (task: () => void) => void;
  navigate: (path: string) => void;
}) {
  const data = useOperations();
  const host = useContext(OperationsPageActions);
  const shift = data.shifts.find((s) => !s.closed);
  const [amount, setAmount] = useState("0");
  const [counts, setCounts] = useState<number[]>(denominations.map(() => 0));
  const [notes, setNotes] = useState("");
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const sum =
    counts.reduce(
      (total, count, i) =>
        total + Math.round(denominations[i][0] * 100) * count,
      0,
    ) / 100;
  const payments = data.payments.filter(
    (p) => p.shiftId === shift?.id && !p.refunded,
  );
  const cash = payments
    .filter((p) => p.method === "Efectivo")
    .reduce((s, p) => s + p.amount, 0);
  const expected = shift ? expectedCash(shift) : 0;
  const difference = Number(amount) - expected;
  const day = new Date().toLocaleDateString("es-PE");
  const cashier = shift?.user || currentUser()?.name || "Sin identificar";
  const exportSummary = () =>
    downloadExcel(
      "resumen-caja",
      ["Concepto", "Monto"],
      [
        ["Fondo inicial", shift?.initial || 0],
        ["Ingresos en efectivo", cash],
        ["Retiros", shift?.withdrawals || 0],
        ["Efectivo esperado", expected],
        ["Efectivo contado", Number(amount)],
        ["Diferencia", difference],
      ],
    );
  const updateCount = (index: number, value: number) => {
    const next = counts.map((count, i) => i === index ? value : count);
    setCounts(next);
    setAmount(String(next.reduce((total, count, i) => total + Math.round(denominations[i][0] * 100) * count, 0) / 100));
  };
  const useInitial = () => {
    let remaining = Math.round((shift?.initial || 0) * 100);
    const next = denominations.map(([value]) => {
      const cents = Math.round(value * 100);
      const count = Math.floor(remaining / cents);
      remaining -= count * cents;
      return count;
    });
    setCounts(next);
    setAmount(String(shift?.initial || 0));
  };
  return (
    <div className={`anchor-shift ${closing ? "is-closing" : "is-opening"}`}>
      {host &&
        createPortal(
          <div className="ops-header-date-pill">
            <Icon name="calendar" />
            {day}
          </div>,
          host,
        )}
      <div className="anchor-shift-meta">
        {!closing && (
          <div>
            <Icon name="cash" />
            <span>
              Estado de caja
              <strong>{shift ? "Caja abierta" : "Caja cerrada"}</strong>
            </span>
            <Badge value={shift ? "Abierta" : "Cerrada"} />
          </div>
        )}
        <div>
          <Icon name="clock" />
          <span>
            Turno<strong>{data.settings.hours}</strong>
          </span>
        </div>
        <div>
          <Icon name="user" />
          <span>
            Cajera<strong>{cashier}</strong>
          </span>
        </div>
        <div>
          <Icon name="calendar" />
          <span>
            Fecha<strong>{day}</strong>
          </span>
        </div>
        {closing && <Badge value={shift ? "Turno activo" : "Sin turno activo"} />}
      </div>
      {closing && (
        <Stats
          entries={[
            {
              label: "Fondo inicial",
              value: money(shift?.initial || 0),
              icon: "cash",
              tone: "blue",
            },
            {
              label: "Ingresos en efectivo",
              value: money(cash),
              icon: "arrow",
              tone: "green",
            },
            {
              label: "Egresos en efectivo",
              value: money(shift?.withdrawals || 0),
              icon: "arrow",
              tone: "red",
            },
            {
              label: "Efectivo esperado",
              value: money(expected),
              icon: "coins",
              tone: "gold",
            },
          ]}
        />
      )}
      <form
        className="anchor-shift-form"
        onSubmit={(e) => {
          e.preventDefault();
          notify(() => {
            if (!closing && !verified) {
              setVerificationError(true);
              throw new Error("Verifica el efectivo disponible.");
            }
            if (!closing && sum > 0 && Math.abs(sum - Number(amount)) > 0.001)
              throw new Error(
                "El desglose debe coincidir con el monto ingresado.",
              );
            if (closing) closeShift(Number(amount), notes);
            else openShift(Number(amount), notes);
            navigate("/caja");
          });
        }}
      >
        {closing ? (
          <CashClosingContent counts={counts} amount={amount} expected={expected}
            payments={payments} methods={data.settings.methods} shift={shift} notes={notes}
            onCount={updateCount} onAmount={setAmount} onNotes={setNotes} onUseInitial={useInitial} />
        ) : (
          <CashOpeningContent
            denominations={denominations}
            counts={counts}
            sum={sum}
            amount={amount}
            verified={verified}
            verificationError={verificationError}
            onCount={updateCount}
            onCalculate={() => setAmount(String(sum))}
            onVerified={(value) => { setVerified(value); setVerificationError(false); }}
          />
        )}
        <footer>
          {closing && <button type="button" className="ops-outline" onClick={() => navigate("/caja")}><Icon name="close" />Cancelar</button>}
          {closing ? (
            <button
              type="button"
              className="ops-outline"
              onClick={exportSummary}
              aria-label="Exportar resumen"
              title="Exportar resumen"
            >
              <Icon name="download" data-ops-action="export"/>
              Exportar
            </button>
          ) : (
            <button
              type="button"
              className="ops-outline"
              onClick={() => navigate("/caja")}
            >
              <Icon name="close" /> Cancelar
            </button>
          )}
          <button className="ops-primary" disabled={closing ? !shift : !!shift}>
            <Icon name="check" />
            {closing ? "Cerrar caja" : "Abrir caja"}
          </button>
        </footer>
      </form>
    </div>
  );
}
