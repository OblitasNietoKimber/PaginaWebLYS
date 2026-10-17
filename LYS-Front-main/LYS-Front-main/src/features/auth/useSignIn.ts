import { authService, type AuthService, type Credentials } from '../../services/authService';
import { useAuthRequest } from './useAuthRequest';

export function useSignIn(service: AuthService = authService) {
  const { run, ...state } = useAuthRequest('Sesión iniciada correctamente.', 'No pudimos iniciar sesión. Inténtalo nuevamente.');
  const submit = (credentials?: Credentials) => run(() => credentials ? service.signIn(credentials) : service.signInWithGoogle(), credentials ? 'password' : 'google');
  return { ...state, submit };
}
