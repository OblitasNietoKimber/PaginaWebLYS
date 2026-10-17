export type Credentials = { email: string; password: string; remember: boolean };
export type AuthResult = { ok: false; message: string; reason?: 'unavailable' } | { ok: true };
export interface AuthService { signIn(credentials: Credentials): Promise<AuthResult>; signInWithGoogle(): Promise<AuthResult>; }
import { loginLocal } from './localAuth';
export const authService: AuthService = {
  async signIn(credentials) { try { await loginLocal(credentials.email, credentials.password); return { ok: true }; } catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'No se pudo iniciar sesión.' }; } },
  async signInWithGoogle() { return { ok: false, reason: 'unavailable', message: 'Google requiere conexión OAuth. Usa tu cuenta local o un acceso de prueba.' }; },
};
