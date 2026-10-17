import { HomeHero } from '../features/home/HomeHero';
import { HomeCatalog } from '../features/home/HomeCatalog';
import { ServiceBenefits } from '../features/home/HomeBenefits';
import { HomeMembership } from '../features/home/HomeMembership';

export function HomePage({ onAction }: { onAction: (section: string) => void }) {
  return <main id="contenido" className="home-page"><HomeHero onAction={onAction} /><ServiceBenefits /><HomeCatalog onAction={onAction} /><HomeMembership onAction={onAction} /></main>;
}
