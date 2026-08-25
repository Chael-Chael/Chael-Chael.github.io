import type { Metadata } from 'next';
import AsciiLogoCanvas from '@/components/ascii-logo/AsciiLogoCanvas';

export const metadata: Metadata = {
  title: 'Interactive ASCII Logo',
  description: 'An interactive ASCII particle rendering of the MAIR logo.',
};

export default function AsciiLogoPage() {
  return <AsciiLogoCanvas />;
}
