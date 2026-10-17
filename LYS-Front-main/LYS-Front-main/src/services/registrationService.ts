import type { AuthResult } from './authService';
import { createLocalUser, loginLocal } from './localAuth';
export type Registration = { name: string; email: string; phone: string; password: string; termsAccepted: boolean };
export interface RegistrationService { register(values: Registration): Promise<AuthResult>; registerWithGoogle(): Promise<AuthResult>; }
export const registrationService: RegistrationService = {
 async register(values) { try { if (!values.termsAccepted) throw new Error('Acepta los términos para continuar.'); await createLocalUser(values); await loginLocal(values.email, values.password); return { ok: true }; } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'No se pudo crear la cuenta.' }; } },
 async registerWithGoogle() { return { ok: false, reason: 'unavailable', message: 'Google requiere conexión OAuth. Puedes crear una cuenta local con el formulario.' }; },
};
