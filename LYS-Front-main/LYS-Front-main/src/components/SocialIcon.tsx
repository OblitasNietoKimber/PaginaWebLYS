export type SocialNetwork = 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube';

export function SocialIcon({ name }: { name: SocialNetwork }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    {name === 'Facebook' && <path d="M14 22v-9h3l.5-4H14V6.5c0-1.2.4-2 2-2h2V1.2A24 24 0 0 0 15.1 1C12.2 1 10 2.8 10 6v3H7v4h3v9Z" />}
    {name === 'Instagram' && <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" /></>}
    {name === 'TikTok' && <path d="M15.5 2h-3.6v13.6a2.9 2.9 0 1 1-2.5-2.9V9.1a6.5 6.5 0 1 0 6.1 6.5V8.8a8.4 8.4 0 0 0 5 1.6V6.8c-2.8 0-5-2.1-5-4.8Z" />}
    {name === 'YouTube' && <path fillRule="evenodd" d="M21.7 6.4c-.3-1.1-1.1-1.9-2.2-2.2C17.6 3.7 12 3.7 12 3.7s-5.6 0-7.5.5C3.4 4.5 2.6 5.3 2.3 6.4 1.8 8.3 1.8 12 1.8 12s0 3.7.5 5.6c.3 1.1 1.1 1.9 2.2 2.2 1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.9.5-5.6.5-5.6s0-3.7-.5-5.6ZM10 15.6v-7.2l6.2 3.6Z" clipRule="evenodd" />}
  </svg>;
}
