import { useState, type FormEvent } from 'react';
import { Icon, GoogleIcon } from '../../components/Icon';
import { registrationService } from '../../services/registrationService';
import { AuthField } from './AuthField';
import { PhoneCountrySelect } from './PhoneCountrySelect';
import { callingCode, cellphoneStartError, sanitizeCellphone, validateCellphone, type PhoneCountry } from './phoneCountries';
import { useAuthRequest } from './useAuthRequest';
import { initialRegistration, registrationError, type RegistrationField, type RegistrationValues } from './registrationValidation';

type Props = { onLogin: () => void; onLegal: (kind: 'terms' | 'privacy') => void };
const fields: Exclude<RegistrationField, 'terms'>[] = ['name', 'email', 'phone', 'password', 'confirmation'];

export function RegisterCard({ onLogin, onLegal }: Props) {
  const [values, setValues] = useState(initialRegistration);
  const [phoneInputError, setPhoneInputError] = useState('');
  const [country, setCountry] = useState<PhoneCountry>('PE');
  const [touched, setTouched] = useState<Partial<Record<RegistrationField, boolean>>>({});
  const cellphone = validateCellphone(values.phone, country);
  const { pending, provider, status, message, run } = useAuthRequest('Cuenta creada correctamente.', 'No pudimos crear tu cuenta. Inténtalo nuevamente.');
  const error = (field: RegistrationField) => field === 'phone'
    ? phoneInputError || cellphoneStartError(values.phone, country) || (touched.phone ? cellphone.error : '')
    : touched[field] ? registrationError(field, values) : '';
  function change(field: RegistrationField, value: string | boolean) { setValues(current => ({ ...current, [field]: value }) as RegistrationValues); }
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(Object.fromEntries([...fields, 'terms'].map(field => [field, true])));
    const firstInvalid = [...fields, 'terms' as const].find(field => (field === 'phone' ? phoneInputError || cellphone.error : registrationError(field, values)));
    if (firstInvalid) { (event.currentTarget.elements.namedItem(firstInvalid) as HTMLInputElement).focus(); return; }
    void run(() => registrationService.register({ name: values.name.trim().replace(/\s+/g, ' '), email: values.email.trim(), phone: cellphone.number, password: values.password, termsAccepted: values.terms }), 'password');
  }
  const binding = (field: Exclude<RegistrationField, 'terms'>) => ({ id: `register-${field}`, name: field, value: values[field], required: true, disabled: pending, error: error(field), onChange: (event: React.ChangeEvent<HTMLInputElement>) => change(field, event.target.value), onBlur: () => setTouched(current => ({ ...current, [field]: true })) });

  return <section className="sign-in-card compact-auth-card register-card" id="registrarse" aria-labelledby="register-title">
    <header className="auth-heading">
      <h2 id="register-title" tabIndex={-1}><span className="heading-rays" aria-hidden="true" />Crea tu cuenta<span className="heading-rays" aria-hidden="true" /></h2>
      <p className="auth-description">Y sé parte de buenos momentos</p>
    </header>
    <form onSubmit={onSubmit} noValidate aria-busy={pending}>
      <div className="fields">
        <AuthField {...binding('name')} label="Nombres y apellidos" icon="user" placeholder="Tus nombres y apellidos" autoComplete="name" maxLength={120} />
        <AuthField {...binding('email')} label="Correo electrónico" icon="mail" type="email" placeholder="Tu correo electrónico" autoComplete="email" />
        <AuthField {...binding('phone')} label="Celular" icon="phone" type="tel" inputMode="numeric" placeholder="Tu número de celular" onChange={event => {
          const digits = sanitizeCellphone(event.target.value, country);
          if (digits === undefined) { setPhoneInputError(`El prefijo debe ser ${callingCode(country)} para el país seleccionado.`); return; }
          setPhoneInputError(''); change('phone', country === 'PE' ? digits.slice(0, 9) : digits);
        }} autoComplete="tel-national" maxLength={25} suffix={<PhoneCountrySelect country={country} disabled={pending} onChange={next => { setCountry(next); setPhoneInputError(''); if (next === 'PE') change('phone', values.phone.slice(0, 9)); setTouched(current => ({ ...current, phone: !!values.phone.trim() })); }} />} />
        <AuthField {...binding('password')} label="Contraseña" icon="lock" type="password" placeholder="Tu contraseña" autoComplete="new-password" />
        <AuthField {...binding('confirmation')} label="Confirmar contraseña" icon="lock" type="password" placeholder="Confirma tu contraseña" autoComplete="new-password" success={!!values.confirmation && values.confirmation === values.password} help={values.confirmation && values.confirmation === values.password ? 'Las contraseñas coinciden.' : undefined} />
      </div>
      <div className="terms-group">
        <div className="terms-option">
          <label className="remember-option"><input id="register-terms" name="terms" type="checkbox" checked={values.terms} disabled={pending} onChange={event => { change('terms', event.target.checked); setTouched(current => ({ ...current, terms: true })); }} aria-label="Acepto los Términos y Condiciones y la Política de Privacidad" aria-invalid={!!error('terms')} aria-describedby={error('terms') ? 'terms-error' : undefined} /><span className="checkbox-mark" aria-hidden="true"><Icon name="check" /></span></label>
          <span>Acepto los <button className="text-link" type="button" onClick={() => onLegal('terms')}>Términos y Condiciones</button> y la <button className="text-link" type="button" onClick={() => onLegal('privacy')}>Política de Privacidad.</button></span>
        </div>
        {error('terms') && <p className="field-error" id="terms-error">{error('terms')}</p>}
      </div>
      <button className="primary-button sign-in-button" type="submit" disabled={pending}><span>{pending && provider === 'password' ? 'Creando cuenta…' : 'Crear cuenta'}</span>{pending && provider === 'password' ? <span className="spinner" aria-hidden="true" /> : <Icon name={status === 'success' ? 'check' : 'arrow'} />}</button>
    </form>
    <div className="or-divider"><span>o regístrate con</span></div>
    <button className="google-button" type="button" disabled={pending} onClick={() => void run(() => registrationService.registerWithGoogle(), 'google')}>{pending && provider === 'google' ? <span className="spinner" aria-hidden="true" /> : <GoogleIcon />}<span>{pending && provider === 'google' ? 'Conectando con Google…' : 'Continuar con Google'}</span></button>
    <div className="register-divider"><span>¿Ya tienes cuenta?</span><button type="button" className="text-link" onClick={onLogin}>Iniciar sesión</button></div>
    {message && <p className={`auth-message ${status}`} role={status === 'error' ? 'alert' : 'status'}>{status === 'success' && <Icon name="check" />}<span>{message}</span></p>}
  </section>;
}
