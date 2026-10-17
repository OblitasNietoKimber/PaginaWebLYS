import { SignInCard } from '../features/auth/SignInCard';
import { AuthLayout } from '../components/AuthLayout';

export function SignInPage({ onHelp }: { onHelp: (action: 'register' | 'recover') => void }) {
  return <AuthLayout><SignInCard onHelp={onHelp} /></AuthLayout>;
}
