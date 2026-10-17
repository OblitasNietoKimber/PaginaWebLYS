import { Icon } from '../../components/Icon';
import { serviceBenefits, type Benefit } from './homeContent';

function BenefitItem({ item }: { item: Benefit }) {
  return <div className="home-benefit"><Icon name={item.icon} /><div><h3>{item.title}</h3><p>{item.description}</p></div></div>;
}
export function ServiceBenefits() {
  return <section className="service-benefits" aria-label="Servicios"><div className="home-container">{serviceBenefits.map(item => <BenefitItem key={item.title} item={item} />)}</div></section>;
}
