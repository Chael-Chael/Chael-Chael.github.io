'use client';

import PortfolioHome from '@/components/portfolio/PortfolioHome';
import type { ShowcaseHomeLocaleData } from '@/types/showcase';

export type HomePageLocaleData = ShowcaseHomeLocaleData;

interface HomePageClientProps {
  data: HomePageLocaleData;
}

export default function HomePageClient({ data }: HomePageClientProps) {
  return <PortfolioHome data={data} />;
}
