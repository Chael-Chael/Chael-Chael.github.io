'use client';

import FionaHome from '@/components/fiona/FionaHome';
import type { ShowcaseHomeLocaleData } from '@/types/showcase';

export type HomePageLocaleData = ShowcaseHomeLocaleData;

interface HomePageClientProps {
  data: HomePageLocaleData;
}

export default function HomePageClient({ data }: HomePageClientProps) {
  return <FionaHome data={data} />;
}
