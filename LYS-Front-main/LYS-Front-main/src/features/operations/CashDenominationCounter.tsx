import { money } from "./operationsStore";

import { denominations } from "./cashDenominationValues";

export function CashDenominations({ counts, onCount }: { counts: number[]; onCount: (index: number, value: number) => void }) {
  return <div className="anchor-denominations">
    <div className="anchor-denomination-head"><span>Denominación</span><span>Cantidad</span><span>Subtotal</span></div>
    {denominations.map(([value, image], i) => {
      const name = value >= 1 ? `S/ ${value}` : `${Math.round(value * 100)} céntimos`;
      return <div className="anchor-denomination" key={image}>
        <span><img className="ops-banknote" src={`/images/operations/currency/${image}.webp`} alt="" />{name}</span>
        <div className="cash-opening-stepper">
          <button type="button" aria-label={`Restar ${name}`} disabled={!counts[i]} onClick={() => onCount(i, counts[i] - 1)}>−</button>
          <input type="number" min="0" step="1" aria-label={`Cantidad de denominación ${value}`} value={counts[i]} onChange={e => onCount(i, Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
          <button type="button" aria-label={`Agregar ${name}`} onClick={() => onCount(i, counts[i] + 1)}>+</button>
        </div>
        <strong>{money(counts[i] * value)}</strong>
      </div>;
    })}
  </div>;
}
