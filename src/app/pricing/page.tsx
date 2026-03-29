import React from 'react';
import { Metadata } from 'next';
import PricingPage from '@/components/pages/PricingPage';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the Claude plan that fits how you solve problems. Free, Pro, Team, and Enterprise tiers.',
};

export default function Pricing() {
  return (
    <div className="flex flex-col min-h-screen">
      <PricingPage />
    </div>
  );
}
