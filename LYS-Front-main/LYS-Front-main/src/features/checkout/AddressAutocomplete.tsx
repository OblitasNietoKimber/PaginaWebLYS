import { useEffect, useId, useState } from 'react';
import { Icon } from '../../components/Icon';
import { searchAddress, type AddressSuggestion } from './addressSearch';

export function AddressAutocomplete({ label, value, district, onChange, onSelect }: { label: string; value: string; district: string; onChange: (value: string) => void; onSelect: (result: AddressSuggestion) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AddressSuggestion[]>([]);
  const [status, setStatus] = useState('');
  const [index, setIndex] = useState(-1);
  useEffect(() => {
    if (!open || value.trim().length < 3) return;
    const controller = new AbortController(); let cancelled = false;
    const timer = window.setTimeout(async () => {
      setStatus('Buscando calles…');
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      try {
        const results = await searchAddress(value, district, controller.signal);
        if (!cancelled) { setItems(results); setStatus(results.length ? '' : 'Sin coincidencias. Puedes completar la calle manualmente.'); }
      } catch { if (!cancelled) { setItems([]); setStatus('No pudimos buscar. Puedes completar la calle manualmente.'); } }
      finally { window.clearTimeout(timeout); }
    }, 700);
    return () => { cancelled = true; window.clearTimeout(timer); controller.abort(); };
  }, [value, district, open]);
  function choose(item: AddressSuggestion) { setOpen(false); setItems([]); setStatus(''); setIndex(-1); onSelect(item); }
  return <div className="address-autocomplete" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id}>{label} <span>*</span></label>
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? `${id}-options` : undefined} aria-activedescendant={open && index >= 0 && items[index] ? `${id}-option-${index}` : undefined} autoComplete="off" required minLength={5} maxLength={160} value={value} placeholder="Escribe tu calle o avenida" onFocus={() => setOpen(true)} onChange={event => { setItems([]); setStatus(''); setIndex(-1); setOpen(true); onChange(event.target.value); }} onKeyDown={event => {
      if (event.key === 'Escape') { setOpen(false); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setIndex(previous => items.length ? Math.max(0, Math.min(items.length - 1, previous + (event.key === 'ArrowDown' ? 1 : -1))) : -1); }
      if (event.key === 'Enter' && open && items[index]) { event.preventDefault(); choose(items[index]); }
    }} />
    {open && <div className="address-autocomplete-menu"><ul id={`${id}-options`} role="listbox" aria-label="Sugerencias de calles">
      {items.map((item, itemIndex) => <li role="option" aria-selected={index === itemIndex} id={`${id}-option-${itemIndex}`} key={item.id} onMouseDown={event => event.preventDefault()} onClick={() => choose(item)}><Icon name="pin" /><span><strong>{item.title}</strong><small>{item.context}</small></span></li>)}
    </ul><p role="status">{value.trim().length < 3 ? 'Escribe al menos 3 letras para ver sugerencias.' : status}</p><small className="address-search-credit">Datos © OpenStreetMap · búsqueda Photon</small></div>}
  </div>;
}
