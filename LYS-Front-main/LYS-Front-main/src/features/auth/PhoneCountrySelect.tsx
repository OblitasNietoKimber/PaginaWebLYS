import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../../components/Icon';
import { AR, BO, BR, CL, CO, CR, CU, EC, SV, GT, HT, HN, MX, NI, PA, PY, PE, PR, DO, UY, VE } from 'country-flag-icons/react/3x2';
import { callingCode, phoneCountries, type PhoneCountry } from './phoneCountries';

const flags = { AR, BO, BR, CL, CO, CR, CU, EC, SV, GT, HT, HN, MX, NI, PA, PY, PE, PR, DO, UY, VE };
export function PhoneCountrySelect({ country, disabled, onChange }: { country: PhoneCountry; disabled: boolean; onChange: (country: PhoneCountry) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [above, setAbove] = useState(false);
  const [listHeight, setListHeight] = useState(264);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const countries = phoneCountries.filter(([code, name]) => normalize(`${name} ${callingCode(code)}`).includes(normalize(query)));
  const Flag = flags[country];
  const name = phoneCountries.find(([code]) => code === country)![1];
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  function close() { setOpen(false); trigger.current?.focus(); }
  function show() {
    const rect = trigger.current!.getBoundingClientRect();
    const spaceBelow = innerHeight - rect.bottom;
    const upwards = spaceBelow < 320 && rect.top > spaceBelow;
    setAbove(upwards);
    setListHeight(Math.min(264, Math.max(88, (upwards ? rect.top : spaceBelow) - 80)));
    setQuery(''); setOpen(true);
  }
  function choose(code: PhoneCountry) { onChange(code); close(); }
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    const options = [...root.current!.querySelectorAll<HTMLButtonElement>('[role="option"]')];
    const index = options.indexOf(event.target as HTMLButtonElement);
    let next: number | undefined;
    if (event.key === 'ArrowDown') next = Math.min(index + 1, options.length - 1);
    if (event.key === 'ArrowUp') next = index <= 0 ? options.length - 1 : index - 1;
    if (event.key === 'Home' && index >= 0) next = 0;
    if (event.key === 'End' && index >= 0) next = options.length - 1;
    if (next !== undefined) { event.preventDefault(); options[next]?.focus(); }
    if (event.key === 'Enter' && event.target === search.current) { event.preventDefault(); if (countries[0]) choose(countries[0][0]); }
  }
  return <div className="phone-prefix" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} type="button" className="phone-country-trigger" disabled={disabled} aria-label={`País y prefijo del celular: ${name} ${callingCode(country)}`} aria-haspopup="listbox" aria-expanded={open} aria-controls="phone-countries" onClick={() => open ? close() : show()} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); show(); } }}>
      <Flag className="phone-country" aria-hidden="true" />
      <span className="phone-calling-code">{callingCode(country)}</span>
      <svg className="phone-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
    </button>
    {open && <div className={`phone-country-popover${above ? ' opens-above' : ''}`} onKeyDown={keyboard}>
      <label className="country-search"><span className="sr-only">Buscar país</span><input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar país o prefijo" autoComplete="off" /></label>
      <div className="country-list" id="phone-countries" role="listbox" aria-label="Países latinoamericanos" style={{ maxHeight: listHeight }}>
        {countries.map(([code, label]) => { const CountryFlag = flags[code]; return <button key={code} type="button" role="option" aria-selected={country === code} className="country-option" onClick={() => choose(code)}>
          <CountryFlag className="phone-country" aria-hidden="true" /><span>{label}</span><span className="country-option-prefix">{callingCode(code)}</span>{country === code && <Icon name="check" />}
        </button>; })}
      </div>
      {!countries.length && <p className="country-empty" role="status">No encontramos ese país.</p>}
    </div>}
  </div>;
}
