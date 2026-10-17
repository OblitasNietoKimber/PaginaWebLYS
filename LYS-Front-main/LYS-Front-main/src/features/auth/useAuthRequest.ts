import { useRef, useState } from 'react';
import type { AuthResult } from '../../services/authService';

export function useAuthRequest(successMessage: string, errorMessage: string) {
  const inFlight = useRef(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'unavailable' | 'error' | 'success'>('idle');
  const [provider, setProvider] = useState<'password' | 'google'>('password');
  const [message, setMessage] = useState('');
  async function run(request: () => Promise<AuthResult>, nextProvider: 'password' | 'google') {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus('pending'); setProvider(nextProvider); setMessage('');
    try {
      const result = await request();
      setStatus(result.ok ? 'success' : result.reason === 'unavailable' ? 'unavailable' : 'error');
      setMessage(result.ok ? successMessage : result.message);
    } catch {
      setStatus('error'); setMessage(errorMessage);
    } finally { inFlight.current = false; }
  }
  return { pending: status === 'pending', provider, status, message, run };
}
