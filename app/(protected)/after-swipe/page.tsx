'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';

export default function AfterSwipePage() {
  const router = useRouter();

  // Tracking Event (vorbereitet)
  useEffect(() => {
    // TODO: Implement tracking
    console.log('Track: upsell_view');
  }, []);

  // TODO: Get user subscription status from context/API
  const userSubscriptionStatus = 'inactive'; // 'active' | 'inactive' | 'canceled'

  const handleBackToDiscover = () => {
    router.push('/discover');
  };

  return (
    <SubscriptionCard 
      userSubscriptionStatus={userSubscriptionStatus}
      onBack={userSubscriptionStatus === 'active' ? handleBackToDiscover : undefined}
    />
  );
}
