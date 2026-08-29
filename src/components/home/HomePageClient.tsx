'use client';

import OzzyHome from '@/components/ozzy/OzzyHome';
import type { ShowcaseHomeLocaleData } from '@/types/showcase';

export type HomePageLocaleData = ShowcaseHomeLocaleData;

interface HomePageClientProps {
  data: HomePageLocaleData;
}

export default function HomePageClient({ data }: HomePageClientProps) {
  return <OzzyHome data={data} />;
}
