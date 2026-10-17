import { useId, useState } from 'react';
const northDistricts = ['Ancón', 'Carabayllo', 'Comas', 'Independencia', 'Los Olivos', 'Puente Piedra', 'San Martín de Porres', 'Santa Rosa'];
export function DistrictSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  const [other, setOther] = useState(false);
  const custom = other || (!!value && !northDistricts.includes(value));
  return <div className="delivery-district"><label htmlFor={id}>Distrito <span>*</span></label><select id={id} required value={custom ? '__other' : value} onChange={event => { const isOther = event.target.value === '__other'; setOther(isOther); onChange(isOther ? '' : event.target.value); }}><option value="" disabled>Selecciona tu distrito</option><optgroup label="Lima Norte">{northDistricts.map(name => <option key={name}>{name}</option>)}</optgroup><option value="__other">Otro distrito</option></select>{custom && <label className="delivery-other-district">Distrito (otra zona) <span>*</span><input required minLength={2} maxLength={80} value={value} placeholder="Escribe tu distrito" onChange={event => onChange(event.target.value)} /></label>}</div>;
}
