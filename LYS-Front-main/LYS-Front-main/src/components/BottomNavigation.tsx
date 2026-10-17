import { Icon, type IconName } from './Icon';
const links: { name: string; icon: IconName }[] = [{ name: 'Inicio', icon: 'home' }, { name: 'Carta', icon: 'cutlery' }, { name: 'Promociones', icon: 'tag' }, { name: 'Locales', icon: 'pin' }];
export function BottomNavigation({ active, onAction }: { active: string; onAction: (section: string) => void }) {
  return <nav className="carta-bottom-nav" aria-label="Navegación inferior">{links.map(item => <button key={item.name} type="button" aria-current={item.name === active ? 'page' : undefined} onClick={() => onAction(item.name)}><Icon name={item.icon} /><span>{item.name}</span></button>)}<button type="button" aria-current={active === 'Mi cuenta' ? 'page' : undefined} onClick={() => onAction('Mi cuenta')}><Icon name="user" /><span>Mi cuenta</span></button></nav>;
}
