import HomePageClient from '@/components/home/HomePageClient';
import { getShowcaseHomeData } from '@/lib/showcase';

export default function Home() {
  return <HomePageClient data={getShowcaseHomeData()} />;
}
