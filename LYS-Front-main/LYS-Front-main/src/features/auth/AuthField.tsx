import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../../components/Icon';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; icon: 'mail' | 'user' | 'phone' | 'lock'; error?: string; help?: string; success?: boolean; suffix?: ReactNode };
export function AuthField({ label, icon, error, help, success, suffix, type = 'text', id, ...input }: Props) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return <div className="field-group">
    <label className="field-label" htmlFor={id}>{label}</label>
    <div className={`input-field${success && !error ? ' field-success' : ''}`}>
      <Icon name={icon} />
      <input {...input} id={id} type={password && visible ? 'text' : type} aria-invalid={!!error} aria-describedby={[error ? `${id}-error` : '', help ? `${id}-help` : ''].filter(Boolean).join(' ') || undefined} />
      {suffix}
      {password && <button type="button" className="password-toggle" disabled={input.disabled} aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}><Icon key={String(visible)} name={visible ? 'eye' : 'eye-off'} /></button>}
    </div>
    {help && <p className="field-help" id={`${id}-help`}>{help}</p>}
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}
