import { validateCellphone, type PhoneCountry } from './phoneCountries';

export type RegistrationField = 'name' | 'email' | 'phone' | 'password' | 'confirmation' | 'terms';
export type RegistrationValues = Record<Exclude<RegistrationField, 'terms'>, string> & { terms: boolean };
export const initialRegistration: RegistrationValues = { name: '', email: '', phone: '', password: '', confirmation: '', terms: false };

export function registrationError(field: RegistrationField, values: RegistrationValues, country: PhoneCountry = 'PE'): string {
  switch (field) {
    case 'name': return !values.name.trim() ? 'Ingresa tus nombres y apellidos.' : !/\p{L}/u.test(values.name) || /[\p{N}\p{C}]/u.test(values.name) ? 'Ingresa un nombre válido, sin números.' : '';
    case 'email': return !values.email.trim() ? 'Ingresa tu correo electrónico.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) ? 'Ingresa un correo válido, por ejemplo nombre@correo.com.' : '';
    case 'phone': return validateCellphone(values.phone, country).error;
    case 'password': return !values.password ? 'Crea una contraseña.' : '';
    case 'confirmation': return !values.confirmation ? 'Confirma tu contraseña.' : values.confirmation !== values.password ? 'Las contraseñas no coinciden.' : '';
    case 'terms': return values.terms ? '' : 'Acepta los términos y la política de privacidad para continuar.';
  }
}
